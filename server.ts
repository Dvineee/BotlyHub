import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import dotenv from "dotenv";
import crypto from "crypto";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import { DatabaseService, supabase } from "./services/DatabaseService";
import { createClient } from "@supabase/supabase-js";
import { TonService } from "./services/TonService";
import { SecurityUtils } from "./services/SecurityUtils";
import { SITE_URL } from "./constants";

dotenv.config();

console.log(`[SERVER] Supabase URL: ${process.env.SUPABASE_URL ? 'Configured' : 'Missing'}`);
console.log(`[SERVER] Supabase Key: ${process.env.SUPABASE_ANON_KEY ? 'Configured' : 'Missing'}`);

const __filename = typeof import.meta !== 'undefined' && import.meta.url
  ? fileURLToPath(import.meta.url)
  : (typeof __filename !== 'undefined' ? __filename : '');

const __dirname = typeof import.meta !== 'undefined' && import.meta.url
  ? path.dirname(__filename)
  : (typeof __dirname !== 'undefined' ? __dirname : '');

// --- SECURITY MIDDLEWARE ---

// Global rate limit
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // increased for debugging
  message: { error: "Too many requests, please try again later." }
});

// Stricter rate limit for auth code request
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per 15 minutes
  message: { error: "Too many login attempts. Please try again later." }
});

// --- AUTH STORE ---
const authCodes = new Map<string, { code: string, expires: number }>();

// --- GEMINI AI CLIENT ---
let _aiInstance: GoogleGenAI | null = null;
function getAIInstance() {
  if (!_aiInstance) {
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API key is not configured.");
    }
    _aiInstance = new GoogleGenAI({ apiKey });
  }
  return _aiInstance;
}

// --- ADMIN SESSION STORE ---
export const adminSessions = new Map<string, { expires: number }>();

export function generateAdminToken(): string {
  const expires = Date.now() + 24 * 60 * 60 * 1000;
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || "defaultSecret";
  const signature = crypto.createHmac("sha256", secret).update(expires.toString()).digest("hex");
  const token = `admin_session_${expires}_${signature}`;
  adminSessions.set(token, { expires });
  return token;
}

export function verifyAdminToken(token: string | undefined): boolean {
  if (!token) return false;
  const session = adminSessions.get(token);
  if (session && session.expires > Date.now()) {
    return true;
  }
  if (token.startsWith("admin_session_")) {
    try {
      const parts = token.split("_");
      const expires = parseInt(parts[2], 10);
      const signature = parts[3];
      if (expires > Date.now()) {
        const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || "defaultSecret";
        const expectedSignature = crypto.createHmac("sha256", secret).update(expires.toString()).digest("hex");
        if (signature === expectedSignature) {
          adminSessions.set(token, { expires });
          return true;
        }
      }
    } catch {
      return false;
    }
  }
  return false;
}

export function requireAdminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization || req.get('Authorization');
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Yetkisiz erişim. Lütfen tekrar giriş yapın." });
  }
  const token = authHeader.split(" ")[1];
  if (!verifyAdminToken(token)) {
    return res.status(401).json({ error: "Oturum süreniz dolmuş veya geçersiz. Lütfen tekrar giriş yapın." });
  }
  next();
}

// Stricter rate limit for payment verification
const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // limit each IP to 20 verification attempts per hour
  message: { error: "Too many payment verification attempts. Please contact support if you are having issues." }
});

// --- VALIDATION SCHEMAS ---

const CreateOrderSchema = z.object({
  userId: z.string().min(1),
  itemId: z.string().min(1),
  itemType: z.enum(['bot', 'plan']),
  amount: z.number().positive(),
  currency: z.enum(['STARS', 'TON']),
  senderAddress: z.string().optional() // Required for TON, optional for Stars
});

const VerifyTonSchema = z.object({
  transactionHash: z.string().min(10),
  orderId: z.string().min(1),
  userId: z.string().min(1)
});

console.log(`[SERVER] Starting with NODE_ENV=${process.env.NODE_ENV}`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.set('trust proxy', true);

  // --- MANDATORY CORS ---
  const allowedOrigins = [
    'https://botlyhub.vercel.app',
    'https://botlyhub.com',
    SITE_URL,
    /\.run\.app$/ // Matches AI Studio dev urls
  ];

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      
      const isAllowed = allowedOrigins.some(allowed => {
        if (allowed instanceof RegExp) return allowed.test(origin);
        return allowed === origin;
      });

      if (isAllowed || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
  }));

  app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    console.log(`[REQUEST] ${req.method} ${req.url} - Origin: ${req.get('Origin')}`);
    next();
  });

  app.use(express.json());

  // --- DYNAMIC TON CONNECT MANIFEST ---
  app.get("/tonconnect-manifest.json", (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*'); // CRITICAL: Allow wallets to fetch

    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
    const host = req.get('host');
    
    // Determine the canonical URL for the manifest
    const requestOrigin = req.get('Origin') || '';
    let origin = `${protocol}://${host}`;
    
    try {
      if (SITE_URL) {
        const siteUrlUrl = new URL(SITE_URL);
        if (requestOrigin.includes(siteUrlUrl.hostname) || host?.includes(siteUrlUrl.hostname)) {
            origin = SITE_URL;
        }
      }
    } catch (e) {}
    
    if (origin !== SITE_URL) {
      if (requestOrigin.includes('botlyhub.vercel.app')) {
          origin = 'https://botlyhub.vercel.app';
      } else if (requestOrigin.includes('botlyhub.com')) {
          origin = 'https://botlyhub.com';
      } else if (host?.includes('botlyhub')) {
          origin = `https://${host}`;
      } else if (origin.includes('.run.app')) {
          // If we are on AI Studio runner, use the full current origin
          origin = `${protocol}://${host}`;
      }
    }

    // Ensure origin does not have trailing slash
    origin = origin.replace(/\/$/, "");
    
    res.json({
      url: origin,
      name: "BotlyHub V3",
      iconUrl: `${origin}/logo.svg`,
      termsOfServiceUrl: `${origin}/terms`,
      privacyPolicyUrl: `${origin}/privacy`
    });
  });

  // --- API ROUTES ---
  app.get("/api/health", (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // --- ADMIN LOGIN ENDPOINT ---
  app.post("/api/admin/login", authLimiter, (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { username, password } = req.body;
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (username === adminUsername && password === adminPassword) {
      const token = generateAdminToken();
      return res.json({ success: true, token });
    } else {
      return res.status(401).json({ error: "Geçersiz kullanıcı adı veya şifre." });
    }
  });

  // --- ADMIN DB ACTION ENDPOINT ---
  app.post("/api/admin/db-action", requireAdminAuth, async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { action, args } = req.body;

    try {
      let result: any = null;
      switch (action) {
        case "updateUserStatus":
          result = await DatabaseService.updateUserStatus(args[0], args[1]);
          break;
        case "updateUserRestriction":
          result = await DatabaseService.updateUserRestriction(args[0], args[1]);
          break;
        case "updateUserPublishStatus":
          result = await DatabaseService.updateUserPublishStatus(args[0], args[1]);
          break;
        case "deleteUser":
          result = await DatabaseService.deleteUser(args[0]);
          break;
        case "deleteBot":
          result = await DatabaseService.deleteBot(args[0]);
          break;
        case "updateSettings":
          result = await DatabaseService.updateSettings(args[0]);
          break;
        case "deleteAnnouncement":
          result = await DatabaseService.deleteAnnouncement(args[0]);
          break;
        case "deleteBlog":
          result = await DatabaseService.deleteBlog(args[0]);
          break;
        case "updateReferralSettings":
          result = await DatabaseService.updateReferralSettings(args[0]);
          break;
        case "saveAnnouncement":
          result = await DatabaseService.saveAnnouncement(args[0]);
          break;
        case "saveBlog":
          result = await DatabaseService.saveBlog(args[0]);
          break;
        case "savePromotion":
          result = await DatabaseService.savePromotion(args[0]);
          break;
        case "deletePromotion":
          result = await DatabaseService.deletePromotion(args[0]);
          break;
        case "updatePromotionStatus":
          result = await DatabaseService.updatePromotionStatus(args[0], args[1]);
          break;
        case "confirmReferral":
          result = await DatabaseService.confirmReferral(args[0]);
          break;
        case "deleteNotification":
          result = await DatabaseService.deleteNotification(args[0]);
          break;
        case "sendGlobalNotification":
          result = await DatabaseService.sendGlobalNotification(args[0], args[1], args[2]);
          break;
        case "sendUserNotification":
          result = await DatabaseService.sendUserNotification(args[0], args[1], args[2], args[3]);
          break;
        case "grantPanelAccess":
          result = await DatabaseService.grantPanelAccess(args[0], args[1]);
          break;
        case "updateUserWallet":
          result = await DatabaseService.updateUserWallet(args[0], args[1]);
          break;
        case "updateUserBot":
          result = await DatabaseService.updateUserBot(args[0], args[1]);
          break;
        case "removeUserBotById":
          result = await DatabaseService.removeUserBotById(args[0]);
          break;
        case "logActivity":
          result = await DatabaseService.logActivity(args[0], args[1], args[2], args[3], args[4]);
          break;
        default:
          return res.status(400).json({ error: `Geçersiz admin işlemi: ${action}` });
      }

      return res.json({ success: true, data: result });
    } catch (err: any) {
      console.error(`[DB-ACTION ERROR] Action ${action} failed:`, err);
      return res.status(500).json({ error: err.message || "İşlem yapılırken bir hata oluştu." });
    }
  });

  // --- AI / GEMINI ENDPOINTS ---

  app.post("/api/ai/recommend", async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    try {
      const { query, availableBots } = req.body;
      if (!query || !availableBots) {
        return res.status(400).json({ error: "query and availableBots parameters are required." });
      }

      const ai = getAIInstance();
      const botContext = availableBots.map((bot: any) => 
        `Name: ${bot.name}, Category: ${Array.isArray(bot.category) ? bot.category.join(", ") : bot.category}, Description: ${bot.description}, Price: ${bot.price} TRY`
      ).join("\n");

      const prompt = `
        You are an AI assistant for BotlyHub, a Telegram bot marketplace.
        A user is looking for a bot. Based on their query and the list of available bots below, recommend the most suitable bots.
        Explain why you are recommending them. Be helpful and professional.
        
        User Query: "${query}"
        
        Available Bots:
        ${botContext}
        
        Response format:
        - Start with a friendly greeting.
        - List 1-3 recommended bots with a brief explanation for each.
        - If no bots match perfectly, suggest the closest alternatives or ask for more details.
        - Keep it concise and formatted for a mobile app (use bullet points).
        - Language: Turkish.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: prompt }] }],
      });

      return res.json({ text: response.text || "Üzgünüm, şu anda size yardımcı olamıyorum." });
    } catch (err: any) {
      console.error("[AI Recommend Error]:", err);
      return res.status(500).json({ error: err.message || "AI service error" });
    }
  });

  app.post("/api/ai/analyze", async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    try {
      const { bot } = req.body;
      if (!bot) {
        return res.status(400).json({ error: "bot parameter is required." });
      }

      const ai = getAIInstance();
      const prompt = `
        Sen BotlyHub platformunun AI asistanısın. 
        Aşağıdaki botu analiz et ve kullanıcının neden bu botu seçmesi gerektiğini etkileyici bir dille anlat.
        Bot Adı: ${bot.name}
        Kategori: ${Array.isArray(bot.category) ? bot.category.join(", ") : bot.category}
        Açıklama: ${bot.description}
        
        Yanıtın:
        - Botun en güçlü yanlarını vurgula.
        - Kullanıcıya sağlayacağı faydaları belirt.
        - Profesyonel, ikna edici ve samimi bir ton kullan.
        - Maksimum 3-4 kısa paragraf olsun.
        - Emoji kullan.
        - Dil: Türkçe.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: prompt }] }],
      });

      return res.json({ text: response.text || "Analiz şu anda yapılamıyor." });
    } catch (err: any) {
      console.error("[AI Analyze Error]:", err);
      return res.status(500).json({ error: err.message || "AI service error" });
    }
  });

  app.post("/api/ai/generate-ad", async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    try {
      const { prompt, generateImage = true } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "prompt parameter is required." });
      }

      const ai = getAIInstance();
      
      const textResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Create a compelling advertisement for: ${prompt}. 
        Return a JSON object with:
        - title: A catchy short title (max 40 chars)
        - content: Engaging ad copy (max 200 chars)
        - button_text: Short call to action (max 15 chars)
        All text should be in Turkish.`,
        config: {
          responseMimeType: "application/json",
        }
      });

      if (!textResponse.text) {
        throw new Error("Yapay zeka metin içeriği üretemedi.");
      }

      const adData = JSON.parse(textResponse.text);

      let imageUrl = '';
      if (generateImage) {
        try {
          const imageResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: {
              parts: [{ text: `A high-quality, professional advertisement visual for: ${prompt}. Modern, vibrant, and eye-catching.` }]
            },
            config: {
              imageConfig: {
                aspectRatio: "16:9"
              }
            }
          });

          const parts = imageResponse.candidates?.[0]?.content?.parts;
          if (parts) {
            for (const part of parts) {
              if (part.inlineData) {
                imageUrl = `data:image/png;base64,${part.inlineData.data}`;
                break;
              }
            }
          }
        } catch (imgError) {
          console.warn("Gemini Image Generation failed (likely quota), using fallback:", imgError);
        }
      }

      if (!imageUrl) {
        imageUrl = `https://picsum.photos/seed/${encodeURIComponent(prompt)}/1280/720`;
      }

      return res.json({
        title: adData.title || '',
        content: adData.content || '',
        button_text: adData.button_text || 'İNCELE',
        image_url: imageUrl
      });
    } catch (err: any) {
      console.error("[AI Generate Ad Error]:", err);
      return res.status(500).json({ error: err.message || "AI service error" });
    }
  });

  app.post("/api/ai/generate-description", async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    try {
      const { botName, category } = req.body;
      if (!botName || !category) {
        return res.status(400).json({ error: "botName and category are required parameters" });
      }

      const ai = getAIInstance();
      const prompt = `
        Create a professional and catchy description for a Telegram bot named "${botName}" in the "${category}" category.
        The description should highlight potential features and benefits for users.
        Keep it under 200 characters.
        Language: Turkish.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: prompt }] }],
      });

      return res.json({ text: response.text || "" });
    } catch (err: any) {
      console.error("[AI Generate Description Error]:", err);
      return res.status(200).json({ text: "" }); // return empty gracefully to not crash UI flow
    }
  });

  app.post("/api/ai/generate-slug", async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    try {
      const { title } = req.body;
      if (!title) {
        return res.status(400).json({ error: "title parameter is required." });
      }

      const ai = getAIInstance();
      const prompt = `
        Create a highly SEO-friendly, clean URL slug for this blog post title: "${title}".
        Requirements:
        - Language: Turkish (but convert Turkish characters to English equivalents, e.g., ö -> o, ş -> s).
        - Use only lowercase letters, numbers, and hyphens.
        - Remove all special characters, punctuation, and extra spaces.
        - Keep it descriptive but concise.
        - Do NOT add any suffixes or numbers unless necessary for the title's meaning.
        - Return ONLY the slug string, nothing else.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: prompt }] }],
      });

      return res.json({ slug: response.text?.trim().toLowerCase() || title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') });
    } catch (err: any) {
      console.error("[AI Generate Slug Error]:", err);
      return res.json({ slug: title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') }); // fallback
    }
  });

  // --- DYNAMIC SITEMAP ENDPOINT ---
  app.get("/sitemap.xml", async (req, res) => {
    res.setHeader('Content-Type', 'application/xml');
    try {
      const { data: bots } = await supabase.from('bots').select('id, slug, updated_at');
      const { data: blogs } = await supabase.from('blogs').select('slug, updated_at, created_at');

      const cleanSiteUrl = SITE_URL.replace(/\/$/, "");

      const staticUrls = [
        "",
        "/search",
        "/blog",
        "/profile",
        "/my-bots",
        "/channels",
        "/premium",
        "/referral",
        "/stats",
        "/qa"
      ];

      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

      // Static pages
      for (const sUrl of staticUrls) {
        xml += `  <url>\n`;
        xml += `    <loc>${cleanSiteUrl}${sUrl}</loc>\n`;
        xml += `    <changefreq>daily</changefreq>\n`;
        xml += `    <priority>${sUrl === "" ? "1.0" : "0.8"}</priority>\n`;
        xml += `  </url>\n`;
      }

      // Dynamic Bots
      if (bots) {
        for (const bot of bots) {
          const botSlug = bot.slug || bot.id;
          if (!botSlug) continue;
          xml += `  <url>\n`;
          xml += `    <loc>${cleanSiteUrl}/bot/${botSlug}</loc>\n`;
          xml += `    <changefreq>weekly</changefreq>\n`;
          xml += `    <priority>0.7</priority>\n`;
          if (bot.updated_at) {
            xml += `    <lastmod>${new Date(bot.updated_at).toISOString().split('T')[0]}</lastmod>\n`;
          }
          xml += `  </url>\n`;
        }
      }

      // Dynamic Blog posts
      if (blogs) {
        for (const blog of blogs) {
          if (!blog.slug) continue;
          xml += `  <url>\n`;
          xml += `    <loc>${cleanSiteUrl}/blog/${blog.slug}</loc>\n`;
          xml += `    <changefreq>monthly</changefreq>\n`;
          xml += `    <priority>0.6</priority>\n`;
          const blogDate = blog.updated_at || blog.created_at;
          if (blogDate) {
            xml += `    <lastmod>${new Date(blogDate).toISOString().split('T')[0]}</lastmod>\n`;
          }
          xml += `  </url>\n`;
        }
      }

      xml += `</urlset>\n`;
      return res.status(200).send(xml);
    } catch (err) {
      console.error("[SITEMAP GENERATION ERROR]:", err);
      // Fallback Sitemap if DB query errors
      const cleanSiteUrl = SITE_URL.replace(/\/$/, "");
      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
      xml += `  <url>\n`;
      xml += `    <loc>${cleanSiteUrl}</loc>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>1.0</priority>\n`;
      xml += `  </url>\n`;
      xml += `</urlset>\n`;
      return res.status(200).send(xml);
    }
  });

  // --- CHAT PHOTO PROXY CACHE ---
  const chatPhotoCache: Record<string, { buffer: Buffer; contentType: string; expiresAt: number }> = {};

  app.get("/api/telegram/user-info", async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: "userId query parameter is required" });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      return res.status(500).json({ error: "Telegram bot token is not configured on the server." });
    }

    try {
      const getChatUrl = `https://api.telegram.org/bot${botToken}/getChat?chat_id=${encodeURIComponent(userId.toString().trim())}`;
      const response = await fetch(getChatUrl);
      if (!response.ok) {
        throw new Error(`getChat returned status ${response.status}`);
      }
      const data = await response.json() as any;
      if (data.ok && data.result) {
        return res.json({
          id: data.result.id,
          first_name: data.result.first_name || '',
          last_name: data.result.last_name || '',
          username: data.result.username || '',
          photo: data.result.photo || null
        });
      } else {
        return res.status(404).json({ error: "User info not found or not visible" });
      }
    } catch (err: any) {
      console.error(`[SERVER] Error looking up Telegram user ${userId}:`, err.message);
      return res.status(500).json({ error: "Failed to fetch user details from Telegram", details: err.message });
    }
  });

  app.get("/api/telegram/chat-photo", async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    const chatId = req.query.chatId;
    if (!chatId) {
      return res.status(400).json({ error: "chatId query parameter is required" });
    }

    const cacheKey = chatId.toString().trim();
    const now = Date.now();

    // 1. Check Cache
    if (chatPhotoCache[cacheKey] && chatPhotoCache[cacheKey].expiresAt > now) {
      const cached = chatPhotoCache[cacheKey];
      res.setHeader('Content-Type', cached.contentType);
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.send(cached.buffer);
    }

    // fallback check for bot token
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.warn("[SERVER CHAT-PHOTO] TELEGRAM_BOT_TOKEN is not configured.");
      return res.status(500).json({ error: "Telegram bot token is not configured on the server." });
    }

    try {
      let fileId: string | null = null;
      const isGroup = cacheKey.startsWith('-');

      if (isGroup) {
        // 2a. Retrieve Chat Info for Groups/Channels
        const getChatUrl = `https://api.telegram.org/bot${botToken}/getChat?chat_id=${encodeURIComponent(cacheKey)}`;
        const getChatRes = await fetch(getChatUrl);
        if (getChatRes.ok) {
          const getChatData = await getChatRes.json() as any;
          if (getChatData.ok && getChatData.result && getChatData.result.photo) {
            fileId = getChatData.result.photo.small_file_id;
          }
        }
      } else {
        // 2b. Retrieve User Profile Photo via getUserProfilePhotos
        const getUserPhotosUrl = `https://api.telegram.org/bot${botToken}/getUserProfilePhotos?user_id=${encodeURIComponent(cacheKey)}&limit=1`;
        const getUserPhotosRes = await fetch(getUserPhotosUrl);
        if (getUserPhotosRes.ok) {
          const userData = await getUserPhotosRes.json() as any;
          if (userData.ok && userData.result && userData.result.photos && userData.result.photos.length > 0) {
            const firstPhotoSet = userData.result.photos[0];
            if (firstPhotoSet && firstPhotoSet.length > 0) {
              fileId = firstPhotoSet[0].file_id;
            }
          }
        }

        // 2c. If the user profile photo retrieval yielded nothing, fallback to getChat as a retry
        if (!fileId) {
          const getChatUrl = `https://api.telegram.org/bot${botToken}/getChat?chat_id=${encodeURIComponent(cacheKey)}`;
          const getChatRes = await fetch(getChatUrl);
          if (getChatRes.ok) {
            const getChatData = await getChatRes.json() as any;
            if (getChatData.ok && getChatData.result && getChatData.result.photo) {
              fileId = getChatData.result.photo.small_file_id;
            }
          }
        }
      }

      if (!fileId) {
        return res.status(404).json({ error: "Profile photo not found." });
      }

      // 3. Retrieve File Path
      const getFileUrl = `https://api.telegram.org/bot${botToken}/getFile?file_id=${encodeURIComponent(fileId)}`;
      const getFileRes = await fetch(getFileUrl);
      if (!getFileRes.ok) {
        throw new Error(`getFile API returned status ${getFileRes.status}`);
      }

      const getFileData = await getFileRes.json() as any;
      if (!getFileData.ok || !getFileData.result || !getFileData.result.file_path) {
        return res.status(404).json({ error: "Could not retrieve file path for Telegram photo." });
      }

      const filePath = getFileData.result.file_path;

      // 4. Download file bytes
      const downloadUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;
      const downloadRes = await fetch(downloadUrl);
      if (!downloadRes.ok) {
        throw new Error(`Failed to download Telegram file with status ${downloadRes.status}`);
      }

      const arrayBuffer = await downloadRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const contentType = downloadRes.headers.get('content-type') || 'image/jpeg';

      // 5. Store in cache (valid for 10 minutes)
      chatPhotoCache[cacheKey] = {
        buffer,
        contentType,
        expiresAt: now + 10 * 60 * 1000,
      };

      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.send(buffer);
    } catch (err: any) {
      console.error(`[SERVER] Error proxying Telegram photo for ${chatId}:`, err.message);
      return res.status(200).send(Buffer.from([])); // Return empty/fallback gracefully on error to prevent layout breakages
    }
  });

  // --- GET CHAT ADMINISTRATORS FROM BOT API ---
  app.get("/api/telegram/chat-admins", async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    const chatId = req.query.chatId;
    if (!chatId) {
      return res.status(400).json({ error: "chatId query parameter is required" });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.warn("[SERVER CHAT-ADMINS] TELEGRAM_BOT_TOKEN is not configured.");
      // Provide fallback mock admin data if token is missing so app remains functional in development
      return res.json([
        { user: { id: 210944655, first_name: "BotlyHub", username: "botlyhub", is_bot: true }, status: "administrator", custom_title: "Sistem Botu" },
        { user: { id: 842614237, first_name: "KAJU", username: "kajju66", is_bot: false }, status: "creator", custom_title: "Kurucu" }
      ]);
    }

    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/getChatAdministrators?chat_id=${encodeURIComponent(chatId.toString().trim())}`);
      const data = await response.json() as any;
      if (data.ok) {
        return res.json(data.result);
      } else {
        console.error("[SERVER CHAT-ADMINS] Telegram API returned error:", data.description);
        // Fallback to sample data for local preview when bot is not in the group/channel
        return res.json([
          { user: { id: 210944655, first_name: "BotlyHub", username: "botlyhub", is_bot: true }, status: "administrator", custom_title: "Sistem Botu" },
          { user: { id: 842614237, first_name: "KAJU", username: "kajju66", is_bot: false }, status: "creator", custom_title: "Kurucu" }
        ]);
      }
    } catch (err: any) {
      console.error(`[SERVER] Error calling getChatAdministrators for ${chatId}:`, err.message);
      return res.status(500).json({ error: "Telegram API request failed", details: err.message });
    }
  });

  app.get("/api/group-users/:channelId", async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    try {
      const { channelId } = req.params;
      if (!channelId) {
        return res.status(400).json({ error: "channelId is required" });
      }

      let targetTelegramId = channelId.toString();

      // If channelId is a UUID, look up the corresponding telegram_id
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(channelId) || (channelId.length >= 32 && channelId.includes('-'));
      if (isUuid) {
        const { data: channelData } = await supabaseAdmin
          .from('channels')
          .select('telegram_id')
          .eq('id', channelId)
          .maybeSingle();
        if (channelData?.telegram_id) {
          targetTelegramId = channelData.telegram_id.toString();
        }
      }

      const { data, error } = await supabaseAdmin
        .from('group_users')
        .select('*')
        .eq('channel_id', targetTelegramId);

      if (error) {
        console.error("[SERVER] Error fetching group users via admin:", error);
        return res.status(500).json({ error: error.message });
      }
      return res.json(data || []);
    } catch (err: any) {
      console.error("[SERVER] Error in group-users endpoint:", err);
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/group-users/:channelId/seed", async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    try {
      const { channelId } = req.params;
      if (!channelId) {
        return res.status(400).json({ error: "channelId is required" });
      }

      let targetTelegramId = channelId.toString();

      // If channelId is a UUID, look up the corresponding telegram_id
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(channelId) || (channelId.length >= 32 && channelId.includes('-'));
      if (isUuid) {
        const { data: channelData } = await supabaseAdmin
          .from('channels')
          .select('telegram_id')
          .eq('id', channelId)
          .maybeSingle();
        if (channelData?.telegram_id) {
          targetTelegramId = channelData.telegram_id.toString();
        }
      }

      // Check if group already has users
      const { data: existingUsers } = await supabaseAdmin
        .from('group_users')
        .select('user_id')
        .eq('channel_id', targetTelegramId)
        .limit(1);

      if (existingUsers && existingUsers.length > 0) {
        return res.json({ message: "Bu grup için zaten kullanıcı bulunuyor.", count: existingUsers.length });
      }

      // Insert 5 beautiful sample users
      const sampleUsers = [
        {
          channel_id: targetTelegramId,
          user_id: "8099071818",
          name: "Kaju",
          username: "Kajusoft",
          mes: 42,
          xp: 420,
          total_messages: 42,
          last_message: "BotlyHub v3 gerçekten çok stabil olmuş!",
          last_message_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          joined_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          language: "tr",
          updated_at: new Date().toISOString()
        },
        {
          channel_id: targetTelegramId,
          user_id: "8426134237",
          name: "KAJU TEST",
          username: "kajju66",
          mes: 28,
          xp: 280,
          total_messages: 28,
          last_message: "Admin paneli hızı mükemmel.",
          last_message_at: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
          joined_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          language: "tr",
          updated_at: new Date().toISOString()
        },
        {
          channel_id: targetTelegramId,
          user_id: "1092837482",
          name: "Selin Yılmaz",
          username: "selin_ylmz",
          mes: 15,
          xp: 150,
          total_messages: 15,
          last_message: "Ben de yeni katıldım gruba, merhabalar.",
          last_message_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          joined_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          language: "tr",
          updated_at: new Date().toISOString()
        },
        {
          channel_id: targetTelegramId,
          user_id: "542389104",
          name: "Seyyid Ahmed",
          username: "seyyidahmed",
          mes: 9,
          xp: 90,
          total_messages: 9,
          last_message: "Herkese hayırlı akşamlar dostlar.",
          last_message_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
          joined_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          language: "en",
          updated_at: new Date().toISOString()
        },
        {
          channel_id: targetTelegramId,
          user_id: "671239841",
          name: "Michael Chen",
          username: "mikechen",
          mes: 3,
          xp: 35,
          total_messages: 3,
          last_message: "How does the referral system work inside Telegram groups?",
          last_message_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
          joined_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
          language: "en",
          updated_at: new Date().toISOString()
        }
      ];

      const { error: insErr } = await supabaseAdmin
        .from('group_users')
        .insert(sampleUsers);

      if (insErr) {
        console.error("[SERVER] Error seeding group users:", insErr);
        return res.status(500).json({ error: insErr.message });
      }

      return res.json({ status: "success", message: "Grup için 5 adet örnek kullanıcı başarıyla üretildi!" });
    } catch (err: any) {
      console.error("[SERVER] Error in group-users seed endpoint:", err);
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/admin/add-admin", requireAdminAuth, async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    try {
      const { channelId, userId, action = "promote" } = req.body;

      if (!channelId || !userId) {
        return res.status(400).json({ error: "channelId and userId are required parameters" });
      }

      let targetTelegramId = channelId.toString();

      // If channelId is a UUID, look up the corresponding telegram_id
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(channelId) || (channelId.length >= 32 && channelId.includes('-'));
      if (isUuid) {
        const { data: channelData } = await supabaseAdmin
          .from("channels")
          .select("telegram_id")
          .eq("id", channelId)
          .maybeSingle();
        if (channelData?.telegram_id) {
          targetTelegramId = channelData.telegram_id.toString();
        }
      }

      // Insert action into `pending_admin_actions` table
      const { data, error } = await supabaseAdmin
        .from("pending_admin_actions")
        .insert([
          {
            channel_id: targetTelegramId,
            user_id: userId.toString(),
            action: action,
            status: "pending",
            permissions: req.body.permissions || null,
            created_at: new Date().toISOString(),
          }
        ])
        .select();

      if (error) {
        console.error("[SERVER] Error inserting pending admin action:", error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({
        success: true,
        message: "Yönetici yapma talebi başarıyla oluşturuldu.",
        data: data?.[0] || null,
      });
    } catch (err: any) {
      console.error("[SERVER] Unexpected error in add-admin endpoint:", err);
      return res.status(500).json({ error: err.message });
    }
  });

  // --- DISCUSSION FORUM FILE PERSISTENCE ---
  const DISCUSSIONS_FILE = path.join(process.cwd(), "discussions.json");

  function readDiscussions(): any[] {
    try {
      if (!fs.existsSync(DISCUSSIONS_FILE)) {
        const initialSeed = [
          {
            id: "discussion-1",
            title: "BotlyHub bugün neden bu kadar hızlı işlem yapıyor?",
            content: "Özellikle bugün BotlyHub bayağı kanalda mükemmel hızda çalışıyor. Başlattım ve anında yanıtlar veren kanalda bu harika hızı yaşayan başka kimse var mı? Sadece bende olup olmadığını merak ediyorum.",
            author_id: "user-seyyid",
            author_name: "Seyyid Ahmed Şah",
            author_avatar: "https://ui-avatars.com/api/?name=Seyyid+Ahmed+Sah&background=020617&color=fff",
            author_bio: "Merhaba, ben Ahmer. Yazılım Mühendisliği öğrencisi ve tam yığın geliştiriciyim.",
            created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
            tags: [
              { type: "bot", id: "botlyhub", name: "BotlyHub" },
              { type: "general", id: "giriş", name: "giriş" }
            ],
            upvotes_count: 25,
            upvoted_users: ["user-demo1", "user-demo2"],
            comments_count: 57,
            comments: [
              {
                id: "comment-1",
                topic_id: "discussion-1",
                author_id: "user-amrit",
                author_name: "Amrit Raj",
                author_avatar: "https://ui-avatars.com/api/?name=Amrit+Raj&background=6d28d9&color=fff",
                author_bio: "Kod, düşünmenin görünür kalıntısından başka bir şey değildir.",
                content: "Ben de aynı şekilde yaşıyorum, BotlyHub sunucularında harika bir optimizasyon var sanırım. Tüm kanallarda anlık hızlı yanıtlar alınıyor.",
                created_at: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
                likes_count: 12
              }
            ]
          },
          {
            id: "discussion-2",
            title: "İlk programlama diliniz neydi?",
            content: "HTML ve CSS ile başladım ama dürüst olmak gerekirse JavaScript'i çözmeye çalışırken kendimi aptal gibi hissettim. Ekrana bakarak çok fazla zaman harcadım. Peki siz ilk olarak neyi öğrenmeye çalıştınız? Devam ettiniz mi yoksa bir hafta sonra bıraktınız mı?",
            author_id: "user-seyyid",
            author_name: "Seyyid Ahmed Şah",
            author_avatar: "https://ui-avatars.com/api/?name=Seyyid+Ahmed+Sah&background=020617&color=fff",
            author_bio: "Merhaba, ben Ahmer. Yazılım Mühendisliği öğrencisi ve tam yığın geliştiriciyim.",
            created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
            tags: [
              { type: "general", id: "programlama", name: "programlama" },
              { type: "bot", id: "botlyhub", name: "BotlyHub" }
            ],
            upvotes_count: 14,
            upvoted_users: ["user-demo1"],
            comments_count: 1,
            comments: [
              {
                id: "comment-2",
                topic_id: "discussion-2",
                author_id: "user-amrit",
                author_name: "Amrit Raj",
                author_avatar: "https://ui-avatars.com/api/?name=Amrit+Raj&background=6d28d9&color=fff",
                author_bio: "Kod, düşünmenin görünür kalıntısından başka bir şey değildir.",
                content: "Ben de aynı şekilde, HTML ve CSS ile başladım ama JS öğrenmeye başlayınca asıl sorunlar ortaya çıktı ve bakış açım tamamen değişti.",
                created_at: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
                likes_count: 5
              }
            ]
          }
        ];
        fs.writeFileSync(DISCUSSIONS_FILE, JSON.stringify(initialSeed, null, 2), "utf8");
        return initialSeed;
      }
      const data = fs.readFileSync(DISCUSSIONS_FILE, "utf8");
      return JSON.parse(data);
    } catch (error) {
      console.error("Error reading discussions file:", error);
      return [];
    }
  }

  function writeDiscussions(discussions: any[]) {
    try {
      fs.writeFileSync(DISCUSSIONS_FILE, JSON.stringify(discussions, null, 2), "utf8");
    } catch (error) {
      console.error("Error writing discussions file:", error);
    }
  }

  // --- SUPABASE ADMIN CLIENT FOR Q&A DATABASE ACCESS ---
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_h9QTmZjwi0pH_JX6i4xfWg_LJFY86GP';
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn("[WARNING] SUPABASE_SERVICE_ROLE_KEY is missing in Express server environment! Falling back to anon key. Admin features and moderation saving will be restricted by RLS.");
  }
  const supabaseAdmin = createClient(process.env.SUPABASE_URL || 'https://yrbnzyvbhitlquaxnruc.supabase.co', SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  // Q&A GET Discussions
  app.get("/api/qa/discussions", async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    try {
      const filter = req.query.filter || 'all'; // 'son', 'week', 'month', 'all'
      const tagFilter = req.query.tag; // hashtag filter

      // 1. Fetch from Supabase
      let dbDiscussions = [];
      const { data: dbBlogs, error } = await supabaseAdmin
        .from('qa_discussions')
        .select('*');

      if (error) {
        // Fallback to blogs table if qa_discussions is missing
        if (error.message.includes('relation "public.qa_discussions" does not exist') || error.message.includes('not found')) {
          console.warn("[SERVER] qa_discussions table does not exist. Falling back to blogs.");
          const { data: fallbackBlogs, error: fbError } = await supabaseAdmin
            .from('blogs')
            .select('*')
            .eq('category', 'qa_forum');
          if (fbError) throw fbError;
          dbDiscussions = fallbackBlogs || [];
        } else {
          throw error;
        }
      } else {
        dbDiscussions = dbBlogs || [];
      }

      // If empty in DB or fallback, we can pre-populate with discussions.json seed!
      if (dbDiscussions.length === 0) {
        console.log("[SERVER] QA DB empty, seeding from discussions.json...");
        const jsonDiscussions = readDiscussions();
        for (const disc of jsonDiscussions) {
          try {
            const newQaEntry = {
              id: disc.id,
              title: disc.title,
              content: disc.content,
              author_id: disc.author_id || "user-anon",
              author_name: disc.author_name || "Anonim Kaşif",
              author_avatar: disc.author_avatar,
              author_bio: disc.author_bio || "BotlyHub Forum Kaşifi",
              tags: disc.tags?.map((t: any) => typeof t === 'string' ? t : t.name) || [],
              views_count: disc.upvotes_count || 0,
              created_at: disc.created_at || new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            const { error: insErr } = await supabaseAdmin.from('qa_discussions').insert([newQaEntry]);
            if (insErr && (insErr.message.includes('relation') || insErr.message.includes('not found'))) {
              // Fallback seed to blogs
              const newBlogEntry = {
                id: disc.id,
                title: disc.title,
                content: disc.content,
                author: disc.author_name,
                author_avatar: disc.author_avatar,
                category: "qa_forum",
                read_time: disc.author_bio || "BotlyHub Forum Kaşifi",
                is_featured: false,
                slug: disc.author_id,
                created_at: disc.created_at || new Date().toISOString(),
                updated_at: new Date().toISOString(),
                views_count: disc.upvotes_count || 0,
                hashtags: disc.tags?.map((t: any) => typeof t === 'string' ? t : t.name) || []
              };
              await supabaseAdmin.from('blogs').insert([newBlogEntry]);
              
              if (disc.comments && disc.comments.length > 0) {
                for (const comm of disc.comments) {
                  await supabaseAdmin.from('blog_comments').insert([{
                    blog_id: disc.id,
                    user_id: comm.author_id,
                    user_name: comm.author_name,
                    user_avatar: comm.author_avatar,
                    content: JSON.stringify({
                      parent_id: comm.parent_id || null,
                      author_bio: comm.author_bio || "BotlyHub Forum Kaşifi",
                      text: comm.content
                    }),
                    is_approved: true,
                    created_at: comm.created_at || new Date().toISOString()
                  }]);
                }
              }

              if (disc.upvoted_users && disc.upvoted_users.length > 0) {
                for (const upvUser of disc.upvoted_users) {
                  await supabaseAdmin.from('blog_likes').insert([{
                    blog_id: disc.id,
                    user_id: upvUser
                  }]);
                }
              }
            } else {
              // Successfully seeded to qa_discussions, seed comments and upvotes
              if (disc.comments && disc.comments.length > 0) {
                for (const comm of disc.comments) {
                  await supabaseAdmin.from('qa_comments').insert([{
                    topic_id: disc.id,
                    author_id: comm.author_id,
                    author_name: comm.author_name,
                    author_avatar: comm.author_avatar,
                    author_bio: comm.author_bio || "BotlyHub Forum Kaşifi",
                    content: comm.content,
                    parent_id: comm.parent_id || null,
                    created_at: comm.created_at || new Date().toISOString()
                  }]);
                }
              }

              if (disc.upvoted_users && disc.upvoted_users.length > 0) {
                for (const upvUser of disc.upvoted_users) {
                  await supabaseAdmin.from('qa_upvotes').insert([{
                    discussion_id: disc.id,
                    user_id: upvUser
                  }]);
                }
              }
            }
          } catch (seedErr) {
            console.error("Seeding item error:", seedErr);
          }
        }
        
        // Re-fetch
        const { data: reFetched } = await supabaseAdmin.from('qa_discussions').select('*');
        if (reFetched && reFetched.length > 0) {
          dbDiscussions = reFetched;
        } else {
          const { data: reFetchedBlogs } = await supabaseAdmin.from('blogs').select('*').eq('category', 'qa_forum');
          dbDiscussions = reFetchedBlogs || [];
        }
      }

      // 2. Fetch all comments
      let allComments = [];
      const { data: dbComs, error: comsError } = await supabaseAdmin.from('qa_comments').select('*');
      if (comsError && (comsError.message.includes('relation') || comsError.message.includes('not found'))) {
        const { data: blogComs } = await supabaseAdmin.from('blog_comments').select('*');
        allComments = (blogComs || []).map((c: any) => {
          let parent_id = null;
          let author_bio = "BotlyHub Forum Kaşifi";
          let text = c.content;

          if (c.content && c.content.startsWith('{')) {
            try {
              const parsed = JSON.parse(c.content);
              parent_id = parsed.parent_id || null;
              author_bio = parsed.author_bio || "BotlyHub Forum Kaşifi";
              text = parsed.text || c.content;
            } catch (e) {}
          }

          return {
            id: String(c.id),
            topic_id: c.blog_id,
            author_id: c.user_id,
            author_name: c.user_name,
            author_avatar: c.user_avatar,
            author_bio,
            content: text,
            created_at: c.created_at,
            likes_count: 0,
            parent_id
          };
        });
      } else if (dbComs) {
        allComments = dbComs;
      }

      // 3. Fetch all upvotes
      let allLikes = [];
      const { data: dbLikes, error: likesError } = await supabaseAdmin.from('qa_upvotes').select('*');
      if (likesError && (likesError.message.includes('relation') || likesError.message.includes('not found'))) {
        const { data: blogLikes } = await supabaseAdmin.from('blog_likes').select('*');
        allLikes = (blogLikes || []).map((l: any) => ({
          discussion_id: l.blog_id,
          user_id: l.user_id
        }));
      } else if (dbLikes) {
        allLikes = dbLikes;
      }

      // 4. Map to frontend Discussion structure
      let discussions = dbDiscussions.map((item: any) => {
        const topicId = item.id;
        // Match by new topic_id or fallback blog_id
        const topicComments = allComments.filter((c: any) => c.topic_id === topicId || c.blog_id === topicId);
        const topicLikes = allLikes.filter((l: any) => l.discussion_id === topicId || l.blog_id === topicId);
        const upvoted_users = topicLikes.map((l: any) => l.user_id);
        const upvotes_count = upvoted_users.length;

        const rawTags = item.tags || item.hashtags || [];
        const tags = rawTags.map((t: string) => ({
          type: 'general',
          id: t.toLowerCase(),
          name: t
        }));

        return {
          id: item.id,
          title: item.title,
          content: item.content,
          author_id: item.author_id || item.slug || 'user-anon',
          author_name: item.author_name || item.author || 'Anonim Kaşif',
          author_avatar: item.author_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.author_name || item.author || 'Anon')}`,
          author_bio: item.author_bio || item.read_time || 'BotlyHub Forum Kaşifi',
          created_at: item.created_at,
          tags,
          upvotes_count,
          upvoted_users,
          comments_count: topicComments.length,
          comments: topicComments
        };
      });

      let filtered = [...discussions];

      // Tag filter
      if (tagFilter) {
        const tagLower = String(tagFilter).toLowerCase().replace('#', '').trim();
        filtered = filtered.filter(d => 
          d.tags?.some((t: any) => t.name.toLowerCase() === tagLower || t.id.toLowerCase() === tagLower)
        );
      }

      const now = Date.now();
      // Date filter
      if (filter === 'week') {
        const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
        filtered = filtered.filter(d => new Date(d.created_at).getTime() >= weekAgo);
      } else if (filter === 'month') {
        const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
        filtered = filtered.filter(d => new Date(d.created_at).getTime() >= monthAgo);
      }

      // Sort
      if (filter === 'son') {
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      } else {
        filtered.sort((a, b) => b.upvotes_count - a.upvotes_count || new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }

      res.json(filtered);
    } catch (err: any) {
      console.error("[GET /api/qa/discussions ERR]", err);
      // Fallback
      return res.json(readDiscussions());
    }
  });

  // GET Single Discussion
  app.get("/api/qa/discussions/:id", async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    try {
      const { id } = req.params;

      // 1. Fetch discussion
      let item;
      const { data: dbDisc, error } = await supabaseAdmin
        .from('qa_discussions')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error && (error.message.includes('relation "public.qa_discussions" does not exist') || error.message.includes('not found'))) {
        const { data: blog, error: blogErr } = await supabaseAdmin
          .from('blogs')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (blogErr || !blog) return res.status(404).json({ error: "Discussion not found" });
        item = blog;
      } else if (!dbDisc) {
        return res.status(404).json({ error: "Discussion not found" });
      } else {
        item = dbDisc;
      }

      // 2. Fetch comments and upvotes
      let topicComments = [];
      const { data: dbComs, error: comsError } = await supabaseAdmin.from('qa_comments').select('*').eq('topic_id', id);
      if (comsError && (comsError.message.includes('relation "public.qa_comments" does not exist') || comsError.message.includes('not found'))) {
        const { data: blogComs } = await supabaseAdmin.from('blog_comments').select('*').eq('blog_id', id);
        topicComments = (blogComs || []).map((c: any) => {
          let parent_id = null;
          let author_bio = "BotlyHub Forum Kaşifi";
          let text = c.content;

          if (c.content && c.content.startsWith('{')) {
            try {
              const parsed = JSON.parse(c.content);
              parent_id = parsed.parent_id || null;
              author_bio = parsed.author_bio || "BotlyHub Forum Kaşifi";
              text = parsed.text || c.content;
            } catch (e) {}
          }

          return {
            id: String(c.id),
            topic_id: id,
            author_id: c.user_id,
            author_name: c.user_name,
            author_avatar: c.user_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.user_name)}`,
            author_bio,
            content: text,
            created_at: c.created_at,
            likes_count: 0,
            parent_id
          };
        });
      } else if (dbComs) {
        topicComments = dbComs;
      }

      let topicLikes = [];
      const { data: dbLikes, error: likesError } = await supabaseAdmin.from('qa_upvotes').select('*').eq('discussion_id', id);
      if (likesError && (likesError.message.includes('relation "public.qa_upvotes" does not exist') || likesError.message.includes('not found'))) {
        const { data: blogLikes } = await supabaseAdmin.from('blog_likes').select('*').eq('blog_id', id);
        topicLikes = (blogLikes || []).map((l: any) => ({
          discussion_id: l.blog_id,
          user_id: l.user_id
        }));
      } else if (dbLikes) {
        topicLikes = dbLikes;
      }

      const upvoted_users = topicLikes.map((l: any) => l.user_id);
      const upvotes_count = upvoted_users.length;
      
      const rawTags = item.tags || item.hashtags || [];
      const tags = rawTags.map((t: string) => ({
        type: 'general',
        id: t.toLowerCase(),
        name: t
      }));

      const discussion = {
        id: item.id,
        title: item.title,
        content: item.content,
        author_id: item.author_id || item.slug || 'user-anon',
        author_name: item.author_name || item.author || 'Anonim Kaşif',
        author_avatar: item.author_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.author_name || item.author || 'Anon')}`,
        author_bio: item.author_bio || item.read_time || 'BotlyHub Forum Kaşifi',
        created_at: item.created_at,
        tags,
        upvotes_count,
        upvoted_users,
        comments_count: topicComments.length,
        comments: topicComments
      };

      res.json(discussion);
    } catch (err: any) {
      console.error("[GET /api/qa/discussions/:id ERR]", err);
      // Fallback
      const discussions = readDiscussions();
      const disc = discussions.find(d => d.id === req.params.id);
      if (disc) {
        return res.json(disc);
      }
      res.status(404).json({ error: "Discussion not found" });
    }
  });

  // POST New Discussion
  app.post("/api/qa/discussions", async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    try {
      const { title, content, author_id, author_name, author_avatar, author_bio, tags } = req.body;
      if (!title || !content) {
        return res.status(400).json({ error: "Yorum başlığı ve içeriği gereklidir." });
      }

      const discId = `qa-${Date.now()}`;
      const hashtagsList = tags?.map((t: any) => typeof t === 'string' ? t : t.name) || [];

      // 1. Try to insert to qa_discussions
      const newQaEntry = {
        id: discId,
        title,
        content,
        author_id: author_id || "user-anon",
        author_name: author_name || "Anonim Kaşif",
        author_avatar: author_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(author_name || 'Anon')}&background=random&color=fff`,
        author_bio: author_bio || "BotlyHub Forum Kaşifi",
        tags: hashtagsList,
        views_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabaseAdmin.from('qa_discussions').insert([newQaEntry]);
      if (error) {
        if (error.message.includes('relation "public.qa_discussions" does not exist') || error.message.includes('not found')) {
          // Fallback to blogs
          const newBlogEntry = {
            id: discId,
            title,
            content,
            author: author_name || "Anonim Kaşif",
            author_avatar: author_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(author_name || 'Anon')}&background=random&color=fff`,
            category: "qa_forum",
            read_time: author_bio || "BotlyHub Forum Kaşifi",
            is_featured: false,
            slug: author_id || "user-anon",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            views_count: 0,
            hashtags: hashtagsList
          };
          const { error: blogErr } = await supabaseAdmin.from('blogs').insert([newBlogEntry]);
          if (blogErr) throw blogErr;
        } else {
          throw error;
        }
      }

      const returnedDiscussion = {
        id: discId,
        title,
        content,
        author_id: author_id || "user-anon",
        author_name: author_name || "Anonim Kaşif",
        author_avatar: author_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(author_name || 'Anon')}&background=random&color=fff`,
        author_bio: author_bio || "BotlyHub Forum Kaşifi",
        created_at: newQaEntry.created_at,
        tags: hashtagsList.map((h: string) => ({ type: 'general', id: h.toLowerCase(), name: h })),
        upvotes_count: 0,
        upvoted_users: [],
        comments_count: 0,
        comments: []
      };

      res.status(201).json(returnedDiscussion);
    } catch (err: any) {
      console.error("[POST /api/qa/discussions ERR]", err);
      res.status(500).json({ error: err.message });
    }
  });

  // POST Add Comment
  app.post("/api/qa/discussions/:id/comments", async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    try {
      const { author_id, author_name, author_avatar, author_bio, content, parent_id } = req.body;
      if (!content) {
        return res.status(400).json({ error: "Cevap içeriği gereklidir." });
      }

      const topic_id = req.params.id;

      // Try inserting to qa_comments first
      const qaCommentPayload = {
        topic_id,
        author_id: author_id || "user-anon",
        author_name: author_name || "Anonim Kaşif",
        author_avatar: author_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(author_name || 'Anon')}&background=random&color=fff`,
        author_bio: author_bio || "Kod, düşünmenin görünür kalıntısından başka bir şey değildir.",
        content,
        parent_id: parent_id || null,
        created_at: new Date().toISOString()
      };

      let returnComment;
      const { data: dbQaComment, error } = await supabaseAdmin
        .from('qa_comments')
        .insert([qaCommentPayload])
        .select()
        .maybeSingle();

      if (error && (error.message.includes('relation "public.qa_comments" does not exist') || error.message.includes('not found'))) {
        // Fallback to blog_comments
        const blogCommentPayload = {
          blog_id: topic_id,
          user_id: author_id || "user-anon",
          user_name: author_name || "Anonim Kaşif",
          user_avatar: author_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(author_name || 'Anon')}&background=random&color=fff`,
          content: JSON.stringify({
            parent_id: parent_id || null,
            author_bio: author_bio || "Kod, düşünmenin görünür kalıntısından Threaded.",
            text: content
          }),
          is_approved: true,
          created_at: new Date().toISOString()
        };
        const { data: dbBlogComment, error: blogErr } = await supabaseAdmin
          .from('blog_comments')
          .insert([blogCommentPayload])
          .select()
          .single();

        if (blogErr) throw blogErr;
        
        returnComment = {
          id: String(dbBlogComment.id),
          topic_id,
          author_id: dbBlogComment.user_id,
          author_name: dbBlogComment.user_name,
          author_avatar: dbBlogComment.user_avatar,
          author_bio: author_bio || "Kod, düşünmenin görünür kalıntısından başka bir şey değildir.",
          content,
          created_at: dbBlogComment.created_at,
          likes_count: 0,
          parent_id: parent_id || null
        };
      } else if (error) {
        throw error;
      } else {
        const comment = dbQaComment || qaCommentPayload;
        returnComment = {
          id: String(comment.id),
          topic_id,
          author_id: comment.author_id,
          author_name: comment.author_name,
          author_avatar: comment.author_avatar,
          author_bio: comment.author_bio,
          content: comment.content,
          created_at: comment.created_at,
          likes_count: 0,
          parent_id: comment.parent_id
        };
      }

      res.status(201).json(returnComment);
    } catch (err: any) {
      console.error("[POST /api/qa/discussions/:id/comments ERR]", err);
      res.status(500).json({ error: err.message });
    }
  });

  // POST Upvote Discussion
  app.post("/api/qa/discussions/:id/upvote", async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    try {
      const { userId } = req.body;
      const discussionId = req.params.id;
      if (!userId) {
        return res.status(400).json({ error: "User ID required" });
      }

      let upvoted = false;
      let upvotes_count = 0;

      // Try with qa_upvotes table first
      const { data: existingQaLike, error: qaFetchError } = await supabaseAdmin
        .from('qa_upvotes')
        .select('*')
        .eq('discussion_id', discussionId)
        .eq('user_id', userId)
        .maybeSingle();

      if (qaFetchError && (qaFetchError.message.includes('relation "public.qa_upvotes" does not exist') || qaFetchError.message.includes('not found'))) {
        // Fallback to blog_likes
        const { data: existingBlogLike } = await supabaseAdmin
          .from('blog_likes')
          .select('*')
          .eq('blog_id', discussionId)
          .eq('user_id', userId)
          .maybeSingle();

        if (existingBlogLike) {
          const { error: deleteError } = await supabaseAdmin
            .from('blog_likes')
            .delete()
            .eq('id', existingBlogLike.id);
          if (deleteError) throw deleteError;
          upvoted = false;
        } else {
          const { error: insertError } = await supabaseAdmin
            .from('blog_likes')
            .insert([{
              blog_id: discussionId,
              user_id: userId
            }]);
          if (insertError) throw insertError;
          upvoted = true;
        }

        const { data: allBlogLikes } = await supabaseAdmin
          .from('blog_likes')
          .select('id')
          .eq('blog_id', discussionId);

        upvotes_count = allBlogLikes ? allBlogLikes.length : 0;
      } else if (qaFetchError) {
        throw qaFetchError;
      } else {
        if (existingQaLike) {
          const { error: deleteError } = await supabaseAdmin
            .from('qa_upvotes')
            .delete()
            .eq('id', existingQaLike.id);
          if (deleteError) throw deleteError;
          upvoted = false;
        } else {
          const { error: insertError } = await supabaseAdmin
            .from('qa_upvotes')
            .insert([{
              discussion_id: discussionId,
              user_id: userId
            }]);
          if (insertError) throw insertError;
          upvoted = true;
        }

        const { data: allQaLikes } = await supabaseAdmin
          .from('qa_upvotes')
          .select('id')
          .eq('discussion_id', discussionId);

        upvotes_count = allQaLikes ? allQaLikes.length : 0;
      }

      res.json({ upvotes_count, upvoted });
    } catch (err: any) {
      console.error("[POST /api/qa/discussions/:id/upvote ERR]", err);
      res.status(500).json({ error: err.message });
    }
  });

  // 0. Telegram Auth Code Request
  app.post("/api/auth/telegram/request-code", authLimiter, async (req, res) => {
    let { identifier } = req.body;
    if (!identifier) return res.status(400).json({ error: "Identifier required" });

    identifier = identifier.trim();
    let chatId = identifier;

    // Resolve username to chat_id if necessary
    if (identifier.startsWith('@') || isNaN(Number(identifier))) {
      const user = await DatabaseService.getUserByUsername(identifier);
      if (user) {
        chatId = user.id;
      } else {
        return res.status(400).json({ 
          error: "Kullanıcı bulunamadı. Lütfen önce botumuza (@BotlyHubBOT) /start komutunu gönderin.",
          detail: "Username not found in database. User must interact with the bot first."
        });
      }
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    authCodes.set(identifier, { code, expires: Date.now() + 5 * 60 * 1000, chatId });

    const botToken = process.env.TELEGRAM_AUTH_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      return res.status(500).json({ error: "Bot token not configured" });
    }

    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: `🔐 *BotlyHub Giriş Doğrulama*\n\nDoğrulama kodunuz: \`${code}\` \n\nBu kod 5 dakika geçerlidir. Lütfen kimseyle paylaşmayın.`,
          parse_mode: "Markdown"
        })
      });

      const result = await response.json() as any;
      if (result.ok) {
        res.json({ success: true, message: "Code sent via Telegram" });
      } else {
        console.error("[AUTH] Telegram error:", result);
        let errorMsg = `Kod gönderilemedi. Lütfen Telegram botumuzu (@${process.env.TELEGRAM_AUTH_BOT_USERNAME || 'BotlyHubBot'}) başlattığınızdan emin olun.`;
        
        if (result.description?.includes('chat not found')) {
            errorMsg = "Bot sizinle iletişim kuramıyor. Lütfen önce Telegram botumuzu (@BotlyHubBOT) başlatın.";
        }

        res.status(400).json({ 
          error: errorMsg,
          detail: result.description 
        });
      }
    } catch (err: any) {
      console.error("[AUTH] Request code error:", err);
      res.status(500).json({ error: "Sunucu hatası, lütfen tekrar deneyin." });
    }
  });

  // 0.1 Telegram Auth Code Verify
  app.post("/api/auth/telegram/verify-code", async (req, res) => {
    const { identifier, code } = req.body;
    if (!identifier || !code) return res.status(400).json({ error: "Missing fields" });

    const stored = authCodes.get(identifier);

    if (!stored) {
        return res.status(400).json({ error: "Geçerli bir kod talebi bulunamadı." });
    }

    if (stored.expires < Date.now()) {
        authCodes.delete(identifier);
        return res.status(400).json({ error: "Kodun süresi dolmuş." });
    }

    if (stored.code === code) {
        authCodes.delete(identifier);
        
        try {
            const finalUserId = (stored as any).chatId || identifier;
            const user = await DatabaseService.getUser(finalUserId);
            
            if (user) {
                res.json({ success: true, user });
            } else {
                // If user not in DB, sync them minimally
                await DatabaseService.syncUser({
                    id: finalUserId,
                    name: `Telegram User ${identifier}`,
                    username: identifier.startsWith('@') ? identifier.slice(1) : identifier
                });
                const syncedUser = await DatabaseService.getUser(finalUserId);
                res.json({ success: true, user: syncedUser });
            }
        } catch (err) {
            console.error("[AUTH] Sync user error:", err);
            res.json({ success: true, user: { id: identifier, username: identifier } });
        }
    } else {
        res.status(400).json({ error: "Hatalı kod. Lütfen tekrar deneyin." });
    }
  });

  // 1. Telegram initData Verification
  app.post("/api/verify-telegram", (req, res) => {
    // ... (existing logic is fine for now)
    const { initData } = req.body;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      return res.status(500).json({ error: "Bot token not configured" });
    }

    try {
      const urlParams = new URLSearchParams(initData);
      const hash = urlParams.get("hash");
      urlParams.delete("hash");

      const dataCheckString = Array.from(urlParams.entries())
        .map(([key, value]) => `${key}=${value}`)
        .sort()
        .join("\n");

      const secretKey = crypto
        .createHmac("sha256", "WebAppData")
        .update(botToken)
        .digest();

      const calculatedHash = crypto
        .createHmac("sha256", secretKey)
        .update(dataCheckString)
        .digest("hex");

      if (calculatedHash === hash) {
        return res.json({ success: true, user: JSON.parse(urlParams.get("user") || "{}") });
      } else {
        return res.status(401).json({ error: "Invalid hash" });
      }
    } catch (err) {
      return res.status(400).json({ error: "Verification failed" });
    }
  });

  // 2. Create Payment Order
  app.post("/api/payments/create-order", async (req, res) => {
    console.log(`[API] Received create-order request:`, req.body);
    try {
      const validated = CreateOrderSchema.parse(req.body);
      const { userId, itemId, itemType, amount, currency, senderAddress } = validated;
      
      const orderId = `order_${crypto.randomBytes(8).toString("hex")}`;
      
      // Generate SIGNED payload for TON transactions
      let signedPayload = null;
      if (currency === 'TON') {
          signedPayload = SecurityUtils.createSignedPaymentString(orderId, userId);
      }
      
      // Save to DB as 'pending'
      await DatabaseService.createTransaction(userId, itemId, itemType, amount, currency, orderId, senderAddress);
      
      console.log(`[PAYMENT] Order created: ${orderId} for user ${userId} (Wallet: ${senderAddress || 'N/A'})`);
      
      if (currency === "STARS") {
        return res.json({ 
          orderId, 
          invoiceUrl: `https://t.me/BotlyHubBot/pay?order=${orderId}` 
        });
      }

      res.json({ orderId, signedPayload, status: "pending" });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("[PAYMENT] Order Creation Error:", error);
      res.status(500).json({ error: "Internal server error: " + (error.message || "Unknown error") });
    }
  });

  // 3. Verify TON Transaction
  app.post("/api/payments/verify-ton", paymentLimiter, async (req, res) => {
    // ... logic remains same
    try {
      const validated = VerifyTonSchema.parse(req.body);
      const { transactionHash, orderId, userId } = validated;
      
      console.log(`[PAYMENT] Verifying tx: ${transactionHash} for order: ${orderId} by user: ${userId}`);

      // 1. Check if transaction hash has already been used (REPLAY PROTECTION)
      const { data: existingTx } = await supabase
        .from('transactions')
        .select('id, status')
        .eq('tx_hash', transactionHash)
        .maybeSingle();

      if (existingTx) {
        console.warn(`[SECURITY] Replay attempt detected! txHash: ${transactionHash}`);
        return res.status(400).json({ success: false, error: "Transaction already used" });
      }

      // 2. Fetch order from DB to get expected amount (DO NOT TRUST FRONTEND AMOUNT)
      const { data: order } = await supabase
        .from('transactions')
        .select('*')
        .eq('order_id', orderId)
        .maybeSingle();

      if (!order) {
        return res.status(404).json({ success: false, error: "Order not found" });
      }

      if (order.status === 'completed') {
        return res.json({ success: true, message: "Order already completed" });
      }

      if (order.user_id !== userId) {
        console.warn(`[SECURITY] User mismatch! Order user: ${order.user_id}, Request user: ${userId}`);
        return res.status(403).json({ success: false, error: "Unauthorized" });
      }

      // 3. Wallet Binding Check
      if (!order.sender_address) {
        console.warn(`[SECURITY] Order ${orderId} missing sender address for TON payment.`);
        return res.status(400).json({ success: false, error: "Order missing wallet binding" });
      }

      // 4. Perform Blockchain Verification
      const result = await TonService.verifyTransaction(
        transactionHash, 
        order.amount, 
        orderId, 
        userId,
        order.sender_address
      );
      
      if (result.success) {
        // 5. Update database (IDEMPOTENT UPDATE)
        const tx = await DatabaseService.updateTransactionStatus(orderId, 'completed', transactionHash);
        
        if (tx) {
          // If it was a bot purchase, add it to user's library
          if (tx.item_type === 'bot') {
            const bot = await DatabaseService.getBotById(tx.item_id);
            if (bot) {
              await DatabaseService.addUserBot(tx.user_id, bot, bot.is_premium);
              await DatabaseService.sendUserNotification(
                tx.user_id,
                "Ödeme Başarılı!",
                `${bot.name} botu kütüphanenize eklendi.`,
                'success'
              );
            }
          }
        }
        
        return res.json({ success: true, message: "Transaction verified and order completed" });
      } else {
        console.warn(`[PAYMENT] Verification failed for ${orderId}: ${result.error}`);
        return res.status(400).json({ success: false, error: result.error });
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Verification endpoint error:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  // Alias for verify-payment
  app.post("/verify-payment", paymentLimiter, async (req, res) => {
    // Map txHash to transactionHash for consistency
    if (req.body.txHash) req.body.transactionHash = req.body.txHash;
    return app._router.handle(req, res, () => {});
  });

  // --- WELCOME & MODERATION SETTINGS API ---
  app.get(["/api/groups/:groupId/moderation-settings", "/api/groups/:groupId/moderation"], async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    try {
      const { groupId } = req.params;
      if (!groupId) {
        return res.status(400).json({ error: "groupId is required" });
      }

      let targetTelegramId = groupId.toString();
      // If groupId is a UUID, look up the corresponding telegram_id
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(groupId);
      if (isUuid) {
        const { data: channelData } = await supabaseAdmin
          .from('channels')
          .select('telegram_id')
          .eq('id', groupId)
          .maybeSingle();
        if (channelData?.telegram_id) {
          targetTelegramId = channelData.telegram_id.toString();
        }
      }

      // Fetch welcome settings from pending_admin_actions
      const { data: rows, error } = await supabaseAdmin
        .from('pending_admin_actions')
        .select('*')
        .eq('channel_id', targetTelegramId)
        .eq('user_id', 'system')
        .eq('action', 'welcome_settings');

      if (error) {
        console.error("[SERVER] Error fetching welcome settings:", error);
        return res.status(500).json({ error: error.message });
      }

      const data = rows && rows.length > 0 ? rows[0] : null;

      // Clean up extra duplicate rows in the background if they exist
      if (rows && rows.length > 1) {
        (async () => {
          try {
            const deleteIds = rows.slice(1).map(r => r.id);
            console.log(`[CLEANUP] Deleting duplicate welcome settings IDs: ${deleteIds.join(', ')}`);
            await supabaseAdmin.from('pending_admin_actions').delete().in('id', deleteIds);
          } catch (cleanupErr) {
            console.error("[CLEANUP] Error deleting duplicate welcome settings:", cleanupErr);
          }
        })();
      }

      // Standard defaults if not configured
      const defaultSettings = {
        welcome_enabled: false,
        welcome_message: "Doğu ve Batı'nın eşsiz buluşma noktası grubumuza hoş geldin, {fullname}! 🎉",
        delete_old_welcome: true,
        delete_old: true,
        welcome_delay: 0,
        delay_seconds: 0,
        last_welcome_message_id: null
      };

      if (!data) {
        return res.json(defaultSettings);
      }

      const perms = data.permissions || {};
      const actualDeleteOld = typeof perms.delete_old === 'boolean' ? perms.delete_old : 
                               (typeof perms.delete_old_welcome === 'boolean' ? perms.delete_old_welcome : true);
      const actualDelay = typeof perms.delay_seconds === 'number' ? perms.delay_seconds : 
                          (typeof perms.welcome_delay === 'number' ? perms.welcome_delay : 0);

      return res.json({
        ...defaultSettings,
        ...perms,
        delete_old: actualDeleteOld,
        delete_old_welcome: actualDeleteOld,
        delay_seconds: actualDelay,
        welcome_delay: actualDelay
      });
    } catch (err: any) {
      console.error("[SERVER] Error in GET welcome settings:", err);
      return res.status(500).json({ error: err.message });
    }
  });

  app.post(["/api/groups/:groupId/moderation-settings", "/api/groups/:groupId/moderation"], async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    try {
      const { groupId } = req.params;
      if (!groupId) {
        return res.status(400).json({ error: "groupId is required" });
      }

      let targetTelegramId = groupId.toString();
      // If groupId is a UUID, look up the corresponding telegram_id
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(groupId) || (groupId.length >= 32 && groupId.includes('-'));
      if (isUuid) {
        try {
          const { data: channelData } = await supabaseAdmin
            .from('channels')
            .select('telegram_id')
            .eq('id', groupId)
            .maybeSingle();
          if (channelData?.telegram_id) {
            targetTelegramId = channelData.telegram_id.toString();
          }
        } catch (err) {
          console.warn("[SERVER] UUID channel resolution failed, fallback to raw groupId:", err);
        }
      }

      const { welcome_enabled, welcome_message, delete_old_welcome, delete_old, welcome_delay, delay_seconds, last_welcome_message_id } = req.body;

      // Extract existing settings to avoid overwriting nested properties like last_welcome_message_id if not supplied
      let existing = null;
      try {
        const { data: rows, error: selectError } = await supabaseAdmin
          .from('pending_admin_actions')
          .select('*')
          .eq('channel_id', targetTelegramId)
          .eq('user_id', 'system')
          .eq('action', 'welcome_settings');

        if (selectError) {
          throw new Error(selectError.message);
        }

        if (rows && rows.length > 0) {
          existing = rows[0];
          // Clean up extra duplicate rows in the background if they exist
          if (rows.length > 1) {
            (async () => {
              try {
                const deleteIds = rows.slice(1).map(r => r.id);
                console.log(`[POST CLEANUP] Deleting duplicate welcome settings IDs: ${deleteIds.join(', ')}`);
                await supabaseAdmin.from('pending_admin_actions').delete().in('id', deleteIds);
              } catch (cleanupErr) {
                console.error("[POST CLEANUP] Error deleting duplicate welcome settings:", cleanupErr);
              }
            })();
          }
        }
      } catch (err: any) {
        console.warn("[SERVER] Error querying pending_admin_actions list, trying standard client fallback:", err.message);
        try {
          const { data: rowsFallback } = await supabase
            .from('pending_admin_actions')
            .select('*')
            .eq('channel_id', targetTelegramId)
            .eq('user_id', 'system')
            .eq('action', 'welcome_settings');
          
          if (rowsFallback && rowsFallback.length > 0) {
            existing = rowsFallback[0];
          }
        } catch (fail) {
          console.error("[SERVER] Both database clients failed to select from pending_admin_actions table:", fail);
        }
      }

      const existingPermissions = existing?.permissions || {};
      
      const isWelcomeEnabled = typeof welcome_enabled === 'boolean' ? welcome_enabled : !!existingPermissions.welcome_enabled;
      const finalWelcomeMsg = welcome_message !== undefined ? welcome_message : (existingPermissions.welcome_message || "Doğu ve Batı'nın eşsiz buluşma noktası grubumuza hoş geldin, {fullname}! 🎉");
      
      const isDeleteOld = typeof delete_old === 'boolean' ? delete_old : 
                          (typeof delete_old_welcome === 'boolean' ? delete_old_welcome : (existingPermissions.delete_old !== false));
                          
      const finalDelay = typeof delay_seconds === 'number' ? delay_seconds : 
                         (typeof welcome_delay === 'number' ? welcome_delay : (existingPermissions.delay_seconds || 0));

      const newPermissions = {
        welcome_enabled: isWelcomeEnabled,
        welcome_message: finalWelcomeMsg,
        delete_old_welcome: isDeleteOld,
        delete_old: isDeleteOld,
        welcome_delay: finalDelay,
        delay_seconds: finalDelay,
        last_welcome_message_id: last_welcome_message_id !== undefined ? last_welcome_message_id : (existingPermissions.last_welcome_message_id || null)
      };

      let saveResult: { error: any } = { error: null };
      
      try {
        if (existing) {
          const resFromDb = await supabaseAdmin
            .from('pending_admin_actions')
            .update({
              permissions: newPermissions,
              updated_at: new Date().toISOString()
            })
            .eq('id', existing.id);
          saveResult = { error: resFromDb.error };
        } else {
          const resFromDb = await supabaseAdmin
            .from('pending_admin_actions')
            .insert({
              channel_id: targetTelegramId,
              user_id: 'system',
              action: 'welcome_settings',
              status: 'active',
              permissions: newPermissions,
              created_at: new Date().toISOString()
            });
          saveResult = { error: resFromDb.error };
        }
      } catch (err: any) {
        console.warn("[SERVER] Primary db client failed to write, falling back to standard client:", err.message);
        try {
          if (existing) {
            const resFromDb = await supabase
              .from('pending_admin_actions')
              .update({
                permissions: newPermissions,
                updated_at: new Date().toISOString()
              })
              .eq('id', existing.id);
            saveResult = { error: resFromDb.error };
          } else {
            const resFromDb = await supabase
              .from('pending_admin_actions')
              .insert({
                channel_id: targetTelegramId,
                user_id: 'system',
                action: 'welcome_settings',
                status: 'active',
                permissions: newPermissions,
                created_at: new Date().toISOString()
              });
            saveResult = { error: resFromDb.error };
          }
        } catch (subErr: any) {
          console.error("[SERVER] Both db write clients failed:", subErr);
          return res.status(500).json({ error: "Veritabanı bağlantı hatası: " + subErr.message });
        }
      }

      if (saveResult && saveResult.error) {
        console.error("[SERVER] Error saving welcome settings via database result:", saveResult.error);
        return res.status(500).json({ error: saveResult.error.message || "Kaydetme başarısız." });
      }

      return res.json({ success: true, settings: newPermissions });
    } catch (err: any) {
      console.error("[SERVER] Error in POST welcome settings:", err);
      return res.status(500).json({ error: err.message || "Beklenmeyen sunucu hatası." });
    }
  });

  // --- TELEGRAM BOT WEBHOOK (REAL-TIME JOINS HANDLING) ---
  app.post("/api/telegram/webhook", async (req, res) => {
    // Acknowledge receipt of update immediately to avoid Telegram retrying
    res.status(200).json({ ok: true });

    const update = req.body;
    if (!update || !update.message) return;

    const message = update.message;
    const chat = message.chat;
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!chat || !botToken) return;

    // A. Sync new member joins on webhook
    if (message.new_chat_members && message.new_chat_members.length > 0) {
      const chatIdStr = chat.id.toString();

      // 1. Log and fetch welcome settings for this group
      try {
        const { data: configRows } = await supabaseAdmin
          .from('pending_admin_actions')
          .select('*')
          .eq('channel_id', chatIdStr)
          .eq('user_id', 'system')
          .eq('action', 'welcome_settings');

        const configRow = configRows && configRows.length > 0 ? configRows[0] : null;

        const config = configRow?.permissions || {};

        for (const member of message.new_chat_members) {
          if (member.is_bot) continue;

          // Sync joined user directly into `group_users` table
          try {
            await supabaseAdmin.from('group_users').upsert({
              channel_id: chatIdStr,
              user_id: member.id.toString(),
              name: member.first_name + (member.last_name ? ' ' + member.last_name : ''),
              username: member.username || '',
              joined_at: new Date().toISOString(),
              total_messages: 0,
              last_message: 'Gruba yeni katıldı 🎉',
              last_message_at: new Date().toISOString(),
              xp: 0,
              mes: 0,
              language: member.language_code || 'tr',
              updated_at: new Date().toISOString()
            }, { onConflict: 'channel_id,user_id' });
            console.log(`[WEBHOOK] synced new member ${member.id} into group_users table.`);
          } catch (syncErr: any) {
            console.warn(`[WEBHOOK] failed to sync group user ${member.id}:`, syncErr.message);
          }

          // If Welcome Message is enabled, trigger greeting!
          if (config.welcome_enabled) {
            const delayMs = (config.welcome_delay || config.delay_seconds || 0) * 1000;
            
            setTimeout(async () => {
              try {
                // Formatting message variables
                const name = member.first_name + (member.last_name ? ' ' + member.last_name : '');
                const username = member.username ? `@${member.username}` : `[${member.first_name}](tg://user?id=${member.id})`;
                const group_name = chat.title || 'grup';
                const user_id = member.id.toString();

                let formattedMessage = config.welcome_message || "Selam {name}! Grubumuza hoş geldin! 🎉";
                formattedMessage = formattedMessage
                  .replace(/{name}/g, name)
                  .replace(/{fullname}/g, name)
                  .replace(/{username}/g, username)
                  .replace(/{group_name}/g, group_name)
                  .replace(/{userId}/g, user_id)
                  .replace(/{userid}/g, user_id)
                  .replace(/{userId}/gi, user_id);

                // Delete old welcome message if requested
                const shouldDeleteOld = config.delete_old_welcome !== false || config.delete_old === true;
                if (shouldDeleteOld && config.last_welcome_message_id) {
                  try {
                    await fetch(`https://api.telegram.org/bot${botToken}/deleteMessage`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        chat_id: chatIdStr,
                        message_id: config.last_welcome_message_id
                      })
                    });
                  } catch (delErr: any) {
                    // Suppress error if already deleted or expired
                    console.log("[WEBHOOK] Suppressed deleteMessage error:", delErr.message);
                  }
                }

                // Send the new welcome message
                const sendRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    chat_id: chatIdStr,
                    text: formattedMessage,
                    parse_mode: "Markdown"
                  })
                });

                if (sendRes.ok) {
                  const sendData = await sendRes.json() as any;
                  if (sendData.ok && sendData.result) {
                    const newMsgId = sendData.result.message_id;

                    // Save new last_welcome_message_id
                    const updatedPermissions = {
                      ...config,
                      last_welcome_message_id: newMsgId
                    };

                    await supabaseAdmin
                      .from('pending_admin_actions')
                      .update({
                        permissions: updatedPermissions,
                        updated_at: new Date().toISOString()
                      })
                      .eq('id', configRow.id);
                  }
                }
              } catch (greetErr: any) {
                console.error("[WEBHOOK] Welcome message greeting failed:", greetErr.message);
              }
            }, delayMs);
          }
        }
      } catch (err: any) {
        console.error("[WEBHOOK] error processing joinees list:", err.message);
      }
    }

    // B. Normal chat text synchronization (optional but keeps DB active!)
    if (message.text && message.from && !message.from.is_bot) {
      const chatIdStr = chat.id.toString();
      const sender = message.from;
      
      try {
        // Find existing user message counts
        const { data: existingUser } = await supabaseAdmin
          .from('group_users')
          .select('total_messages, xp, mes')
          .eq('channel_id', chatIdStr)
          .eq('user_id', sender.id.toString())
          .maybeSingle();

        const current_msgs = Number(existingUser?.total_messages || 0) + 1;
        const current_xp = Number(existingUser?.xp || 0) + 10;
        const current_mes = Number(existingUser?.mes || 0) + 1;

        await supabaseAdmin.from('group_users').upsert({
          channel_id: chatIdStr,
          user_id: sender.id.toString(),
          name: sender.first_name + (sender.last_name ? ' ' + sender.last_name : ''),
          username: sender.username || '',
          total_messages: current_msgs,
          last_message: message.text.substring(0, 100),
          last_message_at: new Date().toISOString(),
          xp: current_xp,
          mes: current_mes,
          language: sender.language_code || 'tr',
          updated_at: new Date().toISOString()
        }, { onConflict: 'channel_id,user_id' });
      } catch (syncTextErr: any) {
        // Silent catch to prevent logs spamming
      }
    }
  });

  // Global Error Handler - Moved to end of API section
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[SERVER ERROR]', err);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  if (process.env.VERCEL || process.env.VERCEL_ENV) {
    console.log("[SERVER] Running in Vercel Serverless environment. Skipping app.listen.");
    startBackgroundPaymentChecker();
  } else {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
      startBackgroundPaymentChecker();
    });
  }

  return app;
}

// --- BACKGROUND JOB ---
async function startBackgroundPaymentChecker() {
    console.log("[JOB] Starting background payment checker...");
    
    setInterval(async () => {
        try {
            const pendingTxs = await DatabaseService.getPendingTransactions();
            if (pendingTxs.length === 0) return;

            console.log(`[JOB] Checking ${pendingTxs.length} pending transactions...`);

            for (const tx of pendingTxs) {
                // We only re-verify if we have a hash (user tried to verify but it was pending/indexing)
                if (tx.tx_hash && tx.sender_address) {
                    console.log(`[JOB] Re-verifying order ${tx.order_id} with hash ${tx.tx_hash}`);
                    const result = await TonService.verifyTransaction(
                        tx.tx_hash,
                        tx.amount,
                        tx.order_id,
                        tx.user_id,
                        tx.sender_address
                    );

                    if (result.success) {
                        await DatabaseService.updateTransactionStatus(tx.order_id, 'completed', tx.tx_hash);
                        console.log(`[JOB] Order ${tx.order_id} successfully verified in background.`);
                        
                        // Handle post-verification logic (e.g. adding bot to library)
                        if (tx.item_type === 'bot') {
                            const bot = await DatabaseService.getBotById(tx.item_id);
                            if (bot) {
                                await DatabaseService.addUserBot(tx.user_id, bot, bot.is_premium);
                                await DatabaseService.sendUserNotification(
                                    tx.user_id,
                                    "Ödeme Başarılı!",
                                    `${bot.name} botu kütüphanenize eklendi.`,
                                    'success'
                                );
                            }
                        }
                    } else {
                        // If it's been pending for more than 30 minutes, mark as failed
                        const createdAt = new Date(tx.created_at).getTime();
                        const now = Date.now();
                        if (now - createdAt > 30 * 60 * 1000) {
                            await DatabaseService.updateTransactionStatus(tx.order_id, 'failed');
                            console.warn(`[JOB] Order ${tx.order_id} marked as FAILED (timeout).`);
                        }
                    }
                }
            }
        } catch (error: any) {
            console.error("[JOB] Background checker error:", error.message);
        }
    }, 20000); // Every 20 seconds
}

const appPromise = startServer();
export default appPromise;

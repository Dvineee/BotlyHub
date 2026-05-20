import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import dotenv from "dotenv";
import crypto from "crypto";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import fs from "fs";
import { DatabaseService, supabase } from "./services/DatabaseService";
import { createClient } from "@supabase/supabase-js";
import { TonService } from "./services/TonService";
import { SecurityUtils } from "./services/SecurityUtils";

dotenv.config();

console.log(`[SERVER] Supabase URL: ${process.env.SUPABASE_URL ? 'Configured' : 'Missing'}`);
console.log(`[SERVER] Supabase Key: ${process.env.SUPABASE_ANON_KEY ? 'Configured' : 'Missing'}`);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

  // --- DISCUSSION FORUM FILE PERSISTENCE ---
  const DISCUSSIONS_FILE = path.join(process.cwd(), "discussions.json");

  function readDiscussions(): any[] {
    try {
      if (!fs.existsSync(DISCUSSIONS_FILE)) {
        const initialSeed = [
          {
            id: "discussion-1",
            title: "Combot bugün neden bu kadar geçiş işlemleri yapıyor?",
            content: "Özellikle bugün kombo bayağı kanalda geçmeye çalışıyor. Başlattım ama yine de yanıtlar geç veren kanalda bu sorun yaşayan başka kimse var mı? Sadece bende olup olmadığını merak ediyorum.",
            author_id: "user-seyyid",
            author_name: "Seyyid Ahmed Şah",
            author_avatar: "https://ui-avatars.com/api/?name=Seyyid+Ahmed+Sah&background=020617&color=fff",
            author_bio: "Merhaba, ben Ahmer. Yazılım Mühendisliği öğrencisi ve tam yığın geliştiriciyim.",
            created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
            tags: [
              { type: "bot", id: "combot", name: "Combot" },
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
                content: "Ben de aynı şekilde yaşıyorum, Combot sunucularında yoğunluk var sanırım. Bazı kanallarda gecikmeler yaşanıyor.",
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
              { type: "bot", id: "combot", name: "Combot" }
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
      const { data: dbBlogs, error } = await supabaseAdmin
        .from('blogs')
        .select('*')
        .eq('category', 'qa_forum');

      if (error) {
        throw error;
      }

      // If empty in DB, we can optionally pre-populate with discussions.json seed!
      if (!dbBlogs || dbBlogs.length === 0) {
        console.log("[SERVER] QA DB empty, seeding from discussions.json...");
        const jsonDiscussions = readDiscussions();
        for (const disc of jsonDiscussions) {
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
          
          // Seed comments too
          if (disc.comments && disc.comments.length > 0) {
            for (const comm of disc.comments) {
              const commentPayload = {
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
              };
              await supabaseAdmin.from('blog_comments').insert([commentPayload]);
            }
          }
          
          // Seed upvotes too
          if (disc.upvoted_users && disc.upvoted_users.length > 0) {
            for (const upvUser of disc.upvoted_users) {
              await supabaseAdmin.from('blog_likes').insert([{
                blog_id: disc.id,
                user_id: upvUser
              }]);
            }
          }
        }
        
        // Fetch again after seed
        const { data: reFetched } = await supabaseAdmin.from('blogs').select('*').eq('category', 'qa_forum');
        return res.json(reFetched || []);
      }

      // 2. Fetch all comments and upvotes for Q&As to map them
      const { data: allComments } = await supabaseAdmin.from('blog_comments').select('*');
      const { data: allLikes } = await supabaseAdmin.from('blog_likes').select('*');

      // 3. Map to frontend Discussion structure
      let discussions = dbBlogs.map(blog => {
        // Find comments for this blog
        const dbComments = (allComments || []).filter(c => c.blog_id === blog.id);
        const comments = dbComments.map(c => {
          let parent_id = null;
          let author_bio = "BotlyHub Forum Kaşifi";
          let text = c.content;

          if (c.content && c.content.startsWith('{')) {
            try {
              const parsed = JSON.parse(c.content);
              parent_id = parsed.parent_id || null;
              author_bio = parsed.author_bio || "BotlyHub Forum Kaşifi";
              text = parsed.text || c.content;
            } catch (e) {
              // fallback if parse fails
            }
          }

          return {
            id: String(c.id),
            topic_id: blog.id,
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

        // Find upvoted users for this blog
        const dbLikes = (allLikes || []).filter(l => l.blog_id === blog.id);
        const upvoted_users = dbLikes.map(l => l.user_id);
        const upvotes_count = upvoted_users.length;

        // Extract hashtags as standard Q&A tags
        const tags = (blog.hashtags || []).map((t: string) => ({
          type: 'general',
          id: t.toLowerCase(),
          name: t
        }));

        return {
          id: blog.id,
          title: blog.title,
          content: blog.content,
          author_id: blog.slug || 'user-anon',
          author_name: blog.author || 'Anonim Kaşif',
          author_avatar: blog.author_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(blog.author || 'Anon')}`,
          author_bio: blog.read_time || 'BotlyHub Forum Kaşifi',
          created_at: blog.created_at,
          tags,
          upvotes_count,
          upvoted_users,
          comments_count: comments.length,
          comments
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

      // Fetch the single discussion
      const { data: blog, error } = await supabaseAdmin
        .from('blogs')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error || !blog) {
        return res.status(404).json({ error: "Discussion not found" });
      }

      // Fetch comments for this discussion
      const { data: dbComments } = await supabaseAdmin
        .from('blog_comments')
        .select('*')
        .eq('blog_id', id);

      // Fetch upvotes/likes for this discussion
      const { data: dbLikes } = await supabaseAdmin
        .from('blog_likes')
        .select('*')
        .eq('blog_id', id);

      const comments = (dbComments || []).map(c => {
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

      const upvoted_users = (dbLikes || []).map(l => l.user_id);
      const upvotes_count = upvoted_users.length;
      const tags = (blog.hashtags || []).map((t: string) => ({
        type: 'general',
        id: t.toLowerCase(),
        name: t
      }));

      const discussion = {
        id: blog.id,
        title: blog.title,
        content: blog.content,
        author_id: blog.slug || 'user-anon',
        author_name: blog.author || 'Anonim Kaşif',
        author_avatar: blog.author_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(blog.author || 'Anon')}`,
        author_bio: blog.read_time || 'BotlyHub Forum Kaşifi',
        created_at: blog.created_at,
        tags,
        upvotes_count,
        upvoted_users,
        comments_count: comments.length,
        comments
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

      const { error } = await supabaseAdmin.from('blogs').insert([newBlogEntry]);
      if (error) {
        throw error;
      }

      const returnedDiscussion = {
        id: discId,
        title,
        content,
        author_id: author_id || "user-anon",
        author_name: author_name || "Anonim Kaşif",
        author_avatar: author_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(author_name || 'Anon')}&background=random&color=fff`,
        author_bio: author_bio || "BotlyHub Forum Kaşifi",
        created_at: newBlogEntry.created_at,
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

      const commentPayload = {
        blog_id: topic_id,
        user_id: author_id || "user-anon",
        user_name: author_name || "Anonim Kaşif",
        user_avatar: author_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(author_name || 'Anon')}&background=random&color=fff`,
        content: JSON.stringify({
          parent_id: parent_id || null,
          author_bio: author_bio || "Kod, düşünmenin görünür kalıntısından başka bir şey değildir.",
          text: content
        }),
        is_approved: true,
        created_at: new Date().toISOString()
      };

      const { data: dbComment, error } = await supabaseAdmin
        .from('blog_comments')
        .insert([commentPayload])
        .select()
        .single();

      if (error) {
        throw error;
      }

      const returnComment = {
        id: String(dbComment.id),
        topic_id,
        author_id: dbComment.user_id,
        author_name: dbComment.user_name,
        author_avatar: dbComment.user_avatar,
        author_bio: author_bio || "Kod, düşünmenin görünür kalıntısından başka bir şey değildir.",
        content,
        created_at: dbComment.created_at,
        likes_count: 0,
        parent_id: parent_id || null
      };

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

      // Check if upvote exists of this user
      const { data: existingLike } = await supabaseAdmin
        .from('blog_likes')
        .select('*')
        .eq('blog_id', discussionId)
        .eq('user_id', userId)
        .maybeSingle();

      let upvoted = false;
      if (existingLike) {
        // Remove upvote
        const { error: deleteError } = await supabaseAdmin
          .from('blog_likes')
          .delete()
          .eq('id', existingLike.id);
          
        if (deleteError) throw deleteError;
        upvoted = false;
      } else {
        // Add upvote
        const { error: insertError } = await supabaseAdmin
          .from('blog_likes')
          .insert([{
            blog_id: discussionId,
            user_id: userId
          }]);

        if (insertError) throw insertError;
        upvoted = true;
      }

      // Query current list of upvotes count
      const { data: allLikes } = await supabaseAdmin
        .from('blog_likes')
        .select('id')
        .eq('blog_id', discussionId);

      const upvotes_count = allLikes ? allLikes.length : 0;

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
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    startBackgroundPaymentChecker();
  });

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

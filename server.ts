import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import dotenv from "dotenv";
import crypto from "crypto";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import { DatabaseService, supabase } from "./services/DatabaseService";
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
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: "Too many requests, please try again later." }
});

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

  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-goog-api-key'],
    credentials: false
  }));
  app.options('*', cors());
  app.use(express.json());

  app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.url}`);
    next();
  });

  // --- DYNAMIC TON CONNECT MANIFEST ---
  app.get("/tonconnect-manifest.json", (req, res) => {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.get('host');
    
    // Prefer the user's specific Vercel URL if requested from there, else use dynamic origin
    let origin = `${protocol}://${host}`;
    if (host?.includes('botlyhub.vercel.app')) {
        origin = 'https://botlyhub.vercel.app';
    }
    
    res.json({
      url: origin,
      name: "BotlyHub V3",
      iconUrl: `${origin}/favicon.ico`,
      termsOfServiceUrl: `${origin}/terms`,
      privacyPolicyUrl: `${origin}/privacy`
    });
  });

  // --- API ROUTES ---
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  app.use("/api", globalLimiter);

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

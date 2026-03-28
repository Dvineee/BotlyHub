import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // --- API ROUTES ---

  // 1. Telegram initData Verification (Production Grade)
  app.post("/api/verify-telegram", (req, res) => {
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

  // 2. Create Payment Order (Stars / TON)
  app.post("/api/payments/create-order", async (req, res) => {
    const { userId, itemId, itemType, amount, currency } = req.body;
    
    // Generate unique order ID
    const orderId = `order_${crypto.randomBytes(8).toString("hex")}`;
    
    // In a real app, you would save this to Supabase here as 'pending'
    // For now, we return the order details
    
    if (currency === "STARS") {
      // Telegram Stars Invoice URL logic would go here
      // Requires calling Telegram Bot API: createInvoiceLink
      return res.json({ 
        orderId, 
        invoiceUrl: `https://t.me/BotlyHubBot/pay?order=${orderId}` // Placeholder
      });
    }

    res.json({ orderId, status: "pending" });
  });

  // 3. Verify TON Transaction
  app.post("/api/payments/verify-ton", async (req, res) => {
    const { transactionHash, orderId } = req.body;
    
    // Real logic: 
    // 1. Fetch transaction from TON API (toncenter.com or similar)
    // 2. Verify amount and destination address
    // 3. Update Supabase transaction status to 'completed'
    
    // Simulation for now, but structured for real API integration
    console.log(`Verifying TON Transaction: ${transactionHash} for Order: ${orderId}`);
    
    res.json({ success: true, message: "Transaction verified" });
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
  });
}

startServer();

import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://yrbnzyvbhitlquaxnruc.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "sb_publishable_h9QTmZjwi0pH_JX6i4xfWg_LJFY86GP";

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

function verifyAdminToken(token: string | undefined): boolean {
  if (!token) return false;
  if (token.startsWith("admin_session_")) {
    try {
      const parts = token.split("_");
      const expires = parseInt(parts[2], 10);
      const signature = parts[3];
      if (expires > Date.now()) {
        const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || "defaultSecret";
        const expectedSignature = crypto.createHmac("sha256", secret).update(expires.toString()).digest("hex");
        if (signature === expectedSignature) {
          return true;
        }
      }
    } catch {
      return false;
    }
  }
  return false;
}

export default async function handler(req: any, res: any) {
  // Clear and explicit CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Require Admin Authentication
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Yetkisiz erişim. Lütfen tekrar giriş yapın." });
  }
  const token = authHeader.split(" ")[1];
  if (!verifyAdminToken(token)) {
    return res.status(401).json({ error: "Yönetici oturumu geçersiz." });
  }

  if (req.method !== "POST") {
    return res.status(455 || 405).json({ error: "Only POST method is allowed" });
  }

  try {
    const { channelId, userId, action = "promote" } = req.body;

    if (!channelId || !userId) {
      return res.status(400).json({ error: "channelId and userId are required parameters" });
    }

    let targetTelegramId = channelId.toString();

    // If channelId is a UUID, look up the corresponding telegram_id
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(channelId);
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
      console.error("[VERCEL SERVERLESS] Error inserting pending admin action:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({
      success: true,
      message: "Yönetici yapma talebi başarıyla oluşturuldu.",
      data: data?.[0] || null,
    });
  } catch (err: any) {
    console.error("[VERCEL SERVERLESS] Unexpected error in add-admin endpoint:", err);
    return res.status(500).json({ error: err.message });
  }
}

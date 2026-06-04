import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://yrbnzyvbhitlquaxnruc.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "sb_publishable_h9QTmZjwi0pH_JX6i4xfWg_LJFY86GP";

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export default async function handler(req: any, res: any) {
  // Clear and explicit CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Allow either method (for easy testing/seeding)
  try {
    const { channelId, groupId } = req.query;
    const targetId = channelId || groupId;

    if (!targetId) {
      return res.status(400).json({ error: "channelId is required" });
    }

    let targetTelegramId = targetId.toString();

    // If channelId is a UUID, look up the corresponding telegram_id
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId);
    if (isUuid) {
      const { data: channelData } = await supabaseAdmin
        .from("channels")
        .select("telegram_id")
        .eq("id", targetId)
        .maybeSingle();
      if (channelData?.telegram_id) {
        targetTelegramId = channelData.telegram_id.toString();
      }
    }

    // Check if group already has users
    const { data: existingUsers } = await supabaseAdmin
      .from("group_users")
      .select("user_id")
      .eq("channel_id", targetTelegramId)
      .limit(1);

    if (existingUsers && existingUsers.length > 0) {
      return res.status(200).json({
        message: "Bu grup için zaten kullanıcı bulunuyor.",
        count: existingUsers.length,
      });
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
        updated_at: new Date().toISOString(),
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
        updated_at: new Date().toISOString(),
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
        updated_at: new Date().toISOString(),
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
        updated_at: new Date().toISOString(),
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
        updated_at: new Date().toISOString(),
      },
    ];

    const { error: insErr } = await supabaseAdmin.from("group_users").insert(sampleUsers);

    if (insErr) {
      console.error("[VERCEL SERVERLESS] Error seeding group users:", insErr);
      return res.status(500).json({ error: insErr.message });
    }

    return res.status(200).json({
      status: "success",
      message: "Grup için 5 adet örnek kullanıcı başarıyla üretildi!",
    });
  } catch (err: any) {
    console.error("[VERCEL SERVERLESS] Error in group-users seed endpoint:", err);
    return res.status(500).json({ error: err.message });
  }
}

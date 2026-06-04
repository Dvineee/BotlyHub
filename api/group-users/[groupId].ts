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

  try {
    const { groupId, channelId: queryChannelId } = req.query;
    const channelId = groupId || queryChannelId;

    if (!channelId) {
      return res.status(400).json({ error: "channelId is required" });
    }

    let targetTelegramId = channelId.toString();

    // If channelId is a UUID, look up the corresponding telegram_id from the 'channels' table
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

    // Fetch group users from Supabase 'group_users' table
    const { data, error } = await supabaseAdmin
      .from("group_users")
      .select("*")
      .eq("channel_id", targetTelegramId);

    if (error) {
      console.error("[VERCEL SERVERLESS] Error fetching group users via admin:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data || []);
  } catch (err: any) {
    console.error("[VERCEL SERVERLESS] Error in group-users endpoint:", err);
    return res.status(500).json({ error: err.message });
  }
}

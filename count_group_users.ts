import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://yrbnzyvbhitlquaxnruc.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  const { data, error } = await supabase.from('group_users').select('channel_id, count()', { count: 'exact', head: false });
  // let's do standard group by if possible or select some columns
  const { data: allUsers, error: err2 } = await supabase.from('group_users').select('channel_id, user_id, name');
  if (err2) {
    console.error("Error fetching group_users:", err2);
  } else {
    console.log("Total group_users records:", allUsers.length);
    const groups: Record<string, number> = {};
    allUsers.forEach(u => {
      groups[u.channel_id] = (groups[u.channel_id] || 0) + 1;
    });
    console.log("Channels in group_users & counts:", groups);
  }
}

run();

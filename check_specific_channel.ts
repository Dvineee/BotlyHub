import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://yrbnzyvbhitlquaxnruc.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  const { data, error } = await supabase.from('channels').select('*').eq('telegram_id', '-1003360909133');
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Channel with telegram_id -1003360909133:", data);
  }
}

run();

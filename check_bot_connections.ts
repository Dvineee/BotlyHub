import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yrbnzyvbhitlquaxnruc.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_h9QTmZjwi0pH_JX6i4xfWg_LJFY86GP'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function check() {
    const { data, error } = await supabase.from('bot_connections').select('*').limit(1);
    if (data && data.length > 0) {
        console.log("bot_connections columns:", Object.keys(data[0]));
    } else {
        console.log("No data in bot_connections. error:", error?.message);
    }
}

check();

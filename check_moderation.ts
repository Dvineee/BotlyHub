import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yrbnzyvbhitlquaxnruc.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_h9QTmZjwi0pH_JX6i4xfWg_LJFY86GP'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function check() {
    console.log("Checking tables...");
    const { data: mData, error: mError } = await supabase.from('channel_moderation_settings').select('*').limit(1);
    console.log("channel_moderation_settings error:", mError?.message || "No error (EXISTS!)");
    
    const { data: cData, error: cError } = await supabase.from('channels').select('*').limit(1);
    if (cData && cData.length > 0) {
        console.log("Channels columns:", Object.keys(cData[0]));
    } else {
        console.log("No channels found. error:", cError?.message);
    }
}

check();

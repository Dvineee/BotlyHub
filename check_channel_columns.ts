
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yrbnzyvbhitlquaxnruc.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_h9QTmZjwi0pH_JX6i4xfWg_LJFY86GP'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkChannelColumns() {
    console.log("Checking channels table columns...");
    try {
        const { data, error } = await supabase.from('channels').select('*').limit(1);
        if (error) {
            console.error("Fetch failed:", error.message);
        } else if (data && data.length > 0) {
            console.log("Columns in channels table:", Object.keys(data[0]));
        } else {
            console.log("No channels found to check columns.");
        }
    } catch (e) {
        console.error("Unexpected error:", e);
    }
}

checkChannelColumns();

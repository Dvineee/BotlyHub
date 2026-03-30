
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yrbnzyvbhitlquaxnruc.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_h9QTmZjwi0pH_JX6i4xfWg_LJFY86GP'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkUserLogs() {
    console.log("Checking user logs in bot_logs...");
    const { data, error } = await supabase
        .from('bot_logs')
        .select('*')
        .neq('user_id', 'admin')
        .limit(10);
    
    if (error) {
        console.error("Error:", error.message);
    } else {
        console.log("User logs found:", data.length);
        if (data.length > 0) {
            console.log("Sample user log:", data[0]);
        }
    }
}

checkUserLogs();

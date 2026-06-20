
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yrbnzyvbhitlquaxnruc.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_h9QTmZjwi0pH_JX6i4xfWg_LJFY86GP'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function listLogs() {
    console.log("Listing recent activity logs...");
    const { data, error } = await supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(20);
    if (error) {
        console.error("Error fetching logs:", error.message);
    } else {
        console.log("Logs found:", data.length);
        console.log(JSON.stringify(data, null, 2));
    }
}

listLogs();

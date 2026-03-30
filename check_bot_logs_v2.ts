
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yrbnzyvbhitlquaxnruc.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_h9QTmZjwi0pH_JX6i4xfWg_LJFY86GP'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkBotLogs() {
    console.log("Checking bot_logs table...");
    const { data, error } = await supabase.from('bot_logs').select('*').limit(1);
    if (error) {
        console.error("Error fetching bot_logs:", error.message);
    } else {
        console.log("bot_logs table exists and is accessible. Data sample:", data);
        const { data: columns, error: colError } = await supabase.rpc('get_column_names', { table_name: 'bot_logs' });
        if (colError) {
            console.log("RPC get_column_names failed, but table is accessible.");
        } else {
            console.log("Columns:", columns);
        }
    }
}

checkBotLogs();

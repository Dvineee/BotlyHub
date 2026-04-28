
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yrbnzyvbhitlquaxnruc.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_h9QTmZjwi0pH_JX6i4xfWg_LJFY86GP'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkBotsTable() {
    console.log("Fetching one bot to check columns...");
    const { data, error } = await supabase.from('bots').select('*').limit(1);
    
    if (error) {
        console.error("Error fetching bots:", error);
    } else if (data && data.length > 0) {
        console.log("Columns found in 'bots' table:", Object.keys(data[0]));
        console.log("Example bot data:", data[0]);
    } else {
        console.log("No bots found in table or table doesn't exist.");
    }
}

checkBotsTable();

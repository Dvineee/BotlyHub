
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yrbnzyvbhitlquaxnruc.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_h9QTmZjwi0pH_JX6i4xfWg_LJFY86GP'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkForeignKey() {
    console.log("Testing join query...");
    const { data, error } = await supabase
        .from('bot_logs')
        .select('*, user:users(name)')
        .limit(1);
    
    if (error) {
        console.error("Join failed:", error.message);
        console.log("Trying without explicit join...");
        const { data: data2, error: error2 } = await supabase
            .from('bot_logs')
            .select('*')
            .limit(1);
        if (error2) {
            console.error("Simple select failed:", error2.message);
        } else {
            console.log("Simple select success.");
        }
    } else {
        console.log("Join success!");
    }
}

checkForeignKey();

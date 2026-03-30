
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yrbnzyvbhitlquaxnruc.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_h9QTmZjwi0pH_JX6i4xfWg_LJFY86GP'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkUserBotsJoin() {
    console.log("Testing user_bots join...");
    const { data, error } = await supabase
        .from('user_bots')
        .select('*, users(name)')
        .limit(1);
    
    if (error) {
        console.error("Join failed:", error.message);
    } else {
        console.log("Join success!");
    }
}

checkUserBotsJoin();

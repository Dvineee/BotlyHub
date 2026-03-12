
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yrbnzyvbhitlquaxnruc.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_h9QTmZjwi0pH_JX6i4xfWg_LJFY86GP'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkSchema() {
    console.log("Testing explicit column selection...");
    try {
        const { error } = await supabase.from('user_bots').select('acquired_at').limit(1);
        if (error) {
            console.error("Selection of 'acquired_at' failed:", error.message);
        } else {
            console.log("'acquired_at' column exists!");
        }
    } catch (e) {
        console.error("Unexpected error:", e);
    }
}

checkSchema();

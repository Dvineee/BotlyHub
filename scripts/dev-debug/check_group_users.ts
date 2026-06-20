import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yrbnzyvbhitlquaxnruc.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_h9QTmZjwi0pH_JX6i4xfWg_LJFY86GP'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function check() {
    console.log("Checking columns via postgrest trick...");
    // Let's try to query an invalid column in a select.
    // If we select a non-existent column, PosgREST might fail with the list of valid columns or just an error about that specific column.
    // Let's select something we know is wrong.
    const { error } = await supabase.from('group_users').select('non_existent_col_123').limit(1);
    if (error) {
        console.log("Error selecting wrong column:", error.message);
    }
    
    // Let's also try to insert a row with a wrong column name and see the error.
    const { error: insertErr } = await supabase.from('group_users').insert([{ xyz_non_existent: 1 }]);
    if (insertErr) {
        console.log("Error inserting wrong column:", insertErr.message);
    }
}

check();

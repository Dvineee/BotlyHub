
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yrbnzyvbhitlquaxnruc.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_h9QTmZjwi0pH_JX6i4xfWg_LJFY86GP'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkUserColumns() {
    console.log("Checking users table columns...");
    try {
        const { data, error } = await supabase.from('users').select('*').limit(1);
        if (error) {
            console.error("Fetch failed:", error.message);
        } else if (data && data.length > 0) {
            console.log("Columns in users table:", Object.keys(data[0]));
        } else {
            // If no data, we can try to get the schema via a different way if possible, 
            // but usually select('*') on an empty table still returns the columns in some clients.
            // In Supabase JS, if it's empty, data is [].
            console.log("No users found to check columns.");
        }
    } catch (e) {
        console.error("Unexpected error:", e);
    }
}

checkUserColumns();

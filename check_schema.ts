
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yrbnzyvbhitlquaxnruc.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_h9QTmZjwi0pH_JX6i4xfWg_LJFY86GP'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkSchema() {
    console.log("Checking users table columns...");
    try {
        // Try to select a single row to see what columns come back
        const { data, error } = await supabase.from('users').select('*').limit(1);
        if (error) {
            console.error("Error selecting from users:", error.message);
        } else {
            console.log("Columns in users table:", data.length > 0 ? Object.keys(data[0]) : "Table is empty, can't determine columns via select *");
        }

        // Try to insert a test user with the 'role' column to confirm the error
        const testUser = {
            id: 'schema-test-' + Date.now(),
            name: 'Test',
            role: 'User'
        };
        const { error: insError } = await supabase.from('users').insert([testUser]);
        if (insError) {
            console.error("Insert with 'role' failed:", insError.message);
        } else {
            console.log("Insert with 'role' successful!");
            await supabase.from('users').delete().eq('id', testUser.id);
        }
    } catch (e) {
        console.error("Unexpected error:", e);
    }
}

checkSchema();

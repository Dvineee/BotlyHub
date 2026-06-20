
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yrbnzyvbhitlquaxnruc.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_h9QTmZjwi0pH_JX6i4xfWg_LJFY86GP'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function inspectTables() {
    const tables = ['blog_comments', 'blog_likes'];
    for (const table of tables) {
        console.log(`--- Inspecting ${table} ---`);
        // Try to insert a row that will likely fail validation but might reveal columns
        const { data, error } = await supabase.from(table).insert([{ invalid_column: 'test' }]);
        if (error) {
            console.log(`Error message for ${table} (check for column names):`, error.message);
        }
    }
}

inspectTables();

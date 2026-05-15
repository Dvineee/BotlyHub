
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yrbnzyvbhitlquaxnruc.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_h9QTmZjwi0pH_JX6i4xfWg_LJFY86GP'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkBlogTables() {
    console.log("Checking blog-related tables...");
    const tables = ['blogs', 'blog_likes', 'blog_comments'];
    for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
            console.log(`Table ${table}: ERROR (${error.message})`);
        } else {
            console.log(`Table ${table}: EXISTS`);
            if (data && data.length > 0) {
                console.log(`Columns for ${table}:`, Object.keys(data[0]));
            } else {
                console.log(`Table ${table} is empty, checking columns via another method...`);
                // Try to insert a dummy row and rollback or just use a generic select
                const { error: columnError } = await supabase.from(table).select('*').limit(0);
                if (columnError) {
                     console.log(`Could not get columns for ${table}`);
                }
            }
        }
    }
}

checkBlogTables();

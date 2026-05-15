
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yrbnzyvbhitlquaxnruc.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_h9QTmZjwi0pH_JX6i4xfWg_LJFY86GP'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkCommentColumns() {
    const table = 'blog_comments';
    // Try to induce error with '*' and see if we can get columns from a valid row if it exists
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
        console.error("Error:", error);
    } else if (data && data.length > 0) {
        console.log("Columns:", Object.keys(data[0]));
    } else {
        console.log("Table is empty.");
        // Test individual known columns
        const known = ['id', 'blog_id', 'user_id', 'user_name', 'user_avatar', 'content', 'created_at', 'is_approved'];
        for (const col of known) {
            const { error: colError } = await supabase.from(table).select(col).limit(1);
            if (colError && colError.message.includes('does not exist')) {
                console.log(`Column ${col}: MISSING`);
            } else {
                console.log(`Column ${col}: EXISTS`);
            }
        }
    }
}

checkCommentColumns();

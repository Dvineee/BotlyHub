
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yrbnzyvbhitlquaxnruc.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_h9QTmZjwi0pH_JX6i4xfWg_LJFY86GP'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkColumns() {
    const table = 'blog_comments';
    const { error } = await supabase.from(table).select('is_approved').limit(1);
    if (error) {
        if (error.message.includes('column blog_comments.is_approved does not exist')) {
            console.log("Column 'is_approved' does NOT exist.");
        } else if (error.code === '42501') {
            console.log("RLS policy is blocking the select, but the column might exist.");
        } else {
             console.log("Error checking column:", error);
        }
    } else {
        console.log("Column 'is_approved' EXISTS.");
    }
}

checkColumns();

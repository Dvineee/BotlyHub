
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://yrbnzyvbhitlquaxnruc.supabase.co'; 
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_h9QTmZjwi0pH_JX6i4xfWg_LJFY86GP'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkQATables() {
    const tables = ['qa_discussions', 'qa_comments', 'discussions', 'comments', 'forum_topics', 'forum_posts'];
    for (const table of tables) {
        const { error } = await supabase.from(table).select('*').limit(1);
        if (error) {
            console.log(`Table ${table}: MISSING (${error.message})`);
        } else {
            console.log(`Table ${table}: EXISTS`);
        }
    }
}

checkQATables();

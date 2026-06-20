
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yrbnzyvbhitlquaxnruc.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_h9QTmZjwi0pH_JX6i4xfWg_LJFY86GP'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testBlogsWrite() {
    console.log("Testing blog update...");
    const { data: blogs, error: fetchError } = await supabase.from('blogs').select('id, likes_count').limit(1);
    if (fetchError) {
        console.error("Fetch error:", fetchError);
        return;
    }
    if (!blogs || blogs.length === 0) {
        console.log("No blogs found.");
        return;
    }
    
    const blogId = blogs[0].id;
    const currentLikes = blogs[0].likes_count || 0;
    console.log(`Found blog ${blogId} with ${currentLikes} likes. Attempting update...`);
    
    const { error } = await supabase.from('blogs').update({ likes_count: currentLikes }).eq('id', blogId);
    if (error) {
        console.error("Blogs update error:", error);
    } else {
        console.log("Blogs update SUCCESS");
    }
}

testBlogsWrite();

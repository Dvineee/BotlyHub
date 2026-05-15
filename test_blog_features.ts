
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yrbnzyvbhitlquaxnruc.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_h9QTmZjwi0pH_JX6i4xfWg_LJFY86GP'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testBlogFeatures() {
    console.log("Testing blog comment and like...");
    
    // 1. Get a blog ID
    const { data: blogs } = await supabase.from('blogs').select('id').limit(1);
    if (!blogs || blogs.length === 0) {
        console.error("No blogs found to test with.");
        return;
    }
    const blogId = blogs[0].id;
    const userId = "test_user_666";

    console.log(`Testing with Blog ID: ${blogId}`);

    // 0. Check blogs read
    console.log("Checking blog read...");
    const { data: blogRead, error: readError } = await supabase.from('blogs').select('*').eq('id', blogId).maybeSingle();
    if (readError) {
        console.error("Blog read error (possible RLS):", readError);
    } else {
        console.log("Blog read SUCCESS");
    }

    // 1. Test Like
    console.log("Adding like...");
    const { error: likeError } = await supabase.from('blog_likes').insert([{ blog_id: blogId, user_id: userId }]);
    if (likeError) {
        console.error("Like insert error:", likeError);
    } else {
        console.log("Like insert SUCCESS");
        // Verify columns
        const { data: likeData } = await supabase.from('blog_likes').select('*').eq('blog_id', blogId).eq('user_id', userId).limit(1);
        if (likeData) console.log("Like columns:", Object.keys(likeData[0]));
        // Cleanup
        await supabase.from('blog_likes').delete().eq('blog_id', blogId).eq('user_id', userId);
    }

    // 3. Test Comment
    console.log("Adding comment...");
    const commentPayload = {
        blog_id: blogId,
        user_id: userId,
        user_name: 'Tester',
        user_avatar: '',
        content: 'Test comment ' + new Date().toISOString(),
        created_at: new Date().toISOString()
    };
    const { error: commentError } = await supabase.from('blog_comments').insert([commentPayload]);
    if (commentError) {
        console.error("Comment insert error:", commentError);
    } else {
        console.log("Comment insert SUCCESS");
        // Verify columns and default values
        const { data: commentData } = await supabase.from('blog_comments').select('*').eq('content', commentPayload.content).limit(1);
        if (commentData && commentData.length > 0) {
            console.log("Comment columns:", Object.keys(commentData[0]));
            console.log("Comment data (checking is_approved):", commentData[0]);
        }
        // Cleanup
        await supabase.from('blog_comments').delete().eq('content', commentPayload.content);
    }
}

testBlogFeatures();

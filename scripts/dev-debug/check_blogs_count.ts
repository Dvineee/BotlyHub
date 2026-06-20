
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yrbnzyvbhitlquaxnruc.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_h9QTmZjwi0pH_JX6i4xfWg_LJFY86GP'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkBlogs() {
    console.log("Checking blogs count...");
    const { count, error } = await supabase.from('blogs').select('*', { count: 'exact', head: true });
    if (error) {
        console.error("Error counting blogs:", error);
    } else {
        console.log("Total blogs:", count);
    }
}

checkBlogs();


import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yrbnzyvbhitlquaxnruc.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_h9QTmZjwi0pH_JX6i4xfWg_LJFY86GP'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkReferralColumns() {
    console.log("Checking referrals table columns...");
    const { data, error } = await supabase.from('referrals').select('*').limit(1);
    if (error) {
        console.error("Fetch failed:", error.message);
    } else if (data) {
        // Even if empty, we can try to get columns if we had some data.
        // If empty, we can't easily see columns this way.
        // Let's try to insert a dummy and see if it fails or what columns it expects.
        console.log("Referrals table exists. Checking if we can get schema...");
    }
}

checkReferralColumns();

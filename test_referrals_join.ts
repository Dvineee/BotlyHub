
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yrbnzyvbhitlquaxnruc.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_h9QTmZjwi0pH_JX6i4xfWg_LJFY86GP'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkReferralsJoin() {
    console.log("Testing referrals join...");
    const { data, error } = await supabase
        .from('referrals')
        .select('*, referred_user:users!referred_id(name)')
        .limit(1);
    
    if (error) {
        console.error("Join failed:", error.message);
    } else {
        console.log("Join success!");
    }
}

checkReferralsJoin();

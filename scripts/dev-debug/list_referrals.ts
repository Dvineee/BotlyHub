
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yrbnzyvbhitlquaxnruc.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_h9QTmZjwi0pH_JX6i4xfWg_LJFY86GP'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function listReferrals() {
    console.log("Listing all referrals...");
    const { data, error } = await supabase.from('referrals').select('*');
    if (error) {
        console.error("Error fetching referrals:", error.message);
    } else {
        console.log("Referrals found:", data.length);
        console.log(JSON.stringify(data, null, 2));
    }
}

listReferrals();

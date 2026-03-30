
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yrbnzyvbhitlquaxnruc.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_h9QTmZjwi0pH_JX6i4xfWg_LJFY86GP'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkReferralTables() {
    console.log("Checking for referral tables...");
    const { data: referrals, error: refError } = await supabase.from('referrals').select('id').limit(1);
    const { data: settings, error: setError } = await supabase.from('referral_settings').select('id').limit(1);
    const { data: users, error: userError } = await supabase.from('users').select('*').limit(1);

    if (refError) console.log("referrals table MISSING:", refError.message);
    else console.log("referrals table EXISTS");

    if (setError) console.log("referral_settings table MISSING:", setError.message);
    else console.log("referral_settings table EXISTS");

    if (users && users.length > 0) {
        const columns = Object.keys(users[0]);
        console.log("referred_by column exists:", columns.includes('referred_by'));
        console.log("referral_count column exists:", columns.includes('referral_count'));
    }
}

checkReferralTables();

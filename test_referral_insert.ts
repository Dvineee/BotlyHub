
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yrbnzyvbhitlquaxnruc.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_h9QTmZjwi0pH_JX6i4xfWg_LJFY86GP'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testInsert() {
    console.log("Testing insert into referrals...");
    const { error } = await supabase.from('referrals').insert({
        referrer_id: 'test_referrer',
        referred_id: 'test_referred',
        status: 'pending',
        reward_amount: 10,
        ip_address: '1.1.1.1',
        device_fingerprint: 'test_fingerprint',
        is_premium_referral: false,
        created_at: new Date().toISOString()
    });
    if (error) {
        console.log("Insert FAILED:", error.message);
    } else {
        console.log("Insert SUCCESS!");
    }
}

testInsert();

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yrbnzyvbhitlquaxnruc.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_h9QTmZjwi0pH_JX6i4xfWg_LJFY86GP'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function check() {
    console.log("Checking tables...");
    const { data: mData, error: mError } = await supabase
        .from('pending_admin_actions')
        .select('*')
        .eq('channel_id', '-1003360909133')
        .eq('user_id', 'system')
        .eq('action', 'welcome_settings');
    console.log("All matching rows count:", mData ? mData.length : 0);
    console.log("Rows:", mData);
    
    // Test write with anonym client
    console.log("Testing write with anonym client...");
    const testChannelId = "-1003360909133";
    const { data: writeData, error: writeError } = await supabase
        .from('pending_admin_actions')
        .insert({
            channel_id: testChannelId,
            user_id: 'system',
            action: 'welcome_settings',
            status: 'active',
            permissions: { welcome_enabled: true }
        })
        .select();
    if (writeError) {
        console.error("Anonym write failed:", writeError);
    } else {
        console.log("Anonym write success:", writeData);
    }
    
    const { data: cData, error: cError } = await supabase.from('channels').select('*').limit(1);
    if (cData && cData.length > 0) {
        console.log("Channels columns:", Object.keys(cData[0]));
    } else {
        console.log("No channels found. error:", cError?.message);
    }
}

check();

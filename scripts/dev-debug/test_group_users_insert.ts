import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yrbnzyvbhitlquaxnruc.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_h9QTmZjwi0pH_JX6i4xfWg_LJFY86GP'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testInsert() {
    console.log("Testing insert into group_users...");
    
    // Get a channel to reference
    const { data: channels } = await supabase.from('channels').select('*').limit(1);
    if (!channels || channels.length === 0) {
        console.log("No channels found to reference!");
        return;
    }
    const channel = channels[0];
    console.log("Found channel to test:", channel);
    
    // Let's see if we can insert with channels.id (UUID)
    const { data: res1, error: err1 } = await supabase.from('group_users').insert({
        channel_id: channel.id,
        user_id: '123456789',
        username: 'test_user',
        name: 'Test Name',
        xp: 100,
        joined_at: new Date().toISOString()
    }).select();
    
    if (err1) {
        console.log("Insert with UUID failed:", err1.message);
        
        // Let's see if it works with telegram_id
        const { data: res2, error: err2 } = await supabase.from('group_users').insert({
            channel_id: String(channel.telegram_id),
            user_id: '123456789',
            username: 'test_user',
            name: 'Test Name',
            xp: 100,
            joined_at: new Date().toISOString()
        }).select();
        
        if (err2) {
            console.log("Insert with telegram_id failed as well:", err2.message);
        } else {
            console.log("Insert with telegram_id SUCCEEDED:", res2);
            // Clean up
            await supabase.from('group_users').delete().eq('channel_id', String(channel.telegram_id)).eq('user_id', '123456789');
        }
    } else {
        console.log("Insert with UUID SUCCEEDED:", res1);
        // Clean up
        await supabase.from('group_users').delete().eq('channel_id', channel.id).eq('user_id', '123456789');
    }
}

testInsert();

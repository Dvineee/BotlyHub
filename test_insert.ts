
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yrbnzyvbhitlquaxnruc.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_h9QTmZjwi0pH_JX6i4xfWg_LJFY86GP'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testInsert() {
    console.log("Testing insert into bot_logs...");
    const { error } = await supabase.from('bot_logs').insert({
        user_id: 'admin',
        type: 'system',
        action_key: 'test_insert',
        title: 'Test Log',
        description: 'This is a test log from debug script.',
        created_at: new Date().toISOString()
    });
    
    if (error) {
        console.error("Insert failed:", error.message);
    } else {
        console.log("Insert success!");
    }
}

testInsert();

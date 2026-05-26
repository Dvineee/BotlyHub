import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yrbnzyvbhitlquaxnruc.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_h9QTmZjwi0pH_JX6i4xfWg_LJFY86GP'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testMore() {
    const list = ['id', 'messages', 'avatar', 'role', 'status', 'last_seen'];
    for (const c of list) {
        const { error } = await supabase.from('group_users').select(c).limit(1);
        if (!error) {
            console.log(`Column '${c}': EXISTS!`);
        }
    }
}

testMore();

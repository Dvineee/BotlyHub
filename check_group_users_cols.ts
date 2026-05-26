import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yrbnzyvbhitlquaxnruc.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_h9QTmZjwi0pH_JX6i4xfWg_LJFY86GP'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testColumns() {
    const candidates = [
        'id', 'channel_id', 'group_id', 'telegram_group_id', 'user_id', 
        'username', 'first_name', 'name', 'role', 'joined_at', 'created_at', 
        'karma', 'xp', 'messages_count', 'message_count', 'status', 'last_seen'
    ];
    
    console.log("Testing columns of group_users...");
    
    for (const col of candidates) {
        const { error } = await supabase.from('group_users').select(col).limit(1);
        if (error) {
            // If it complains about non_existent, it doesn't exist.
            if (error.message.includes('does not exist')) {
                // Not present
            } else {
                console.log(`Column '${col}': ERROR other than non-existence -> ${error.message}`);
            }
        } else {
            console.log(`Column '${col}': EXISTS!`);
        }
    }
}

testColumns();

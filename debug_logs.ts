
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yrbnzyvbhitlquaxnruc.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_h9QTmZjwi0pH_JX6i4xfWg_LJFY86GP'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkBotLogs() {
    console.log("Checking bot_logs table...");
    const { data, error } = await supabase.from('bot_logs').select('*').limit(1);
    
    if (error) {
        console.error("Error accessing bot_logs:", error.message);
        console.log("Checking if activity_logs exists instead...");
        const { data: data2, error: error2 } = await supabase.from('activity_logs').select('*').limit(1);
        if (error2) {
            console.error("Error accessing activity_logs:", error2.message);
        } else {
            console.log("activity_logs table exists!");
            if (data2 && data2.length > 0) {
                console.log("Columns in activity_logs:", Object.keys(data2[0]));
            }
        }
    } else {
        console.log("bot_logs table exists!");
        if (data && data.length > 0) {
            console.log("Columns in bot_logs:", Object.keys(data[0]));
        } else {
            console.log("bot_logs is empty, checking schema via another method...");
            // Try to insert a dummy log to see if it fails
            const { error: insertError } = await supabase.from('bot_logs').insert({
                user_id: 'test',
                type: 'system',
                action_key: 'test',
                title: 'test',
                description: 'test',
                created_at: new Date().toISOString()
            });
            if (insertError) {
                console.error("Insert failed:", insertError.message);
            } else {
                console.log("Insert success! Table is working.");
            }
        }
    }
}

checkBotLogs();

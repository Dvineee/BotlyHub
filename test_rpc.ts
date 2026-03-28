
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yrbnzyvbhitlquaxnruc.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_h9QTmZjwi0pH_JX6i4xfWg_LJFY86GP'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testExecSql() {
    console.log("Testing if exec_sql RPC exists...");
    try {
        const { data, error } = await supabase.rpc('exec_sql', { sql: 'SELECT 1' });
        if (error) {
            console.log("exec_sql RPC NOT found or failed:", error.message);
        } else {
            console.log("exec_sql RPC FOUND!");
        }
    } catch (e) {
        console.log("Unexpected error:", e);
    }
}

testExecSql();

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yrbnzyvbhitlquaxnruc.supabase.co'; 
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; 

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const list = ['exec_sql', 'run_sql', 'sql', 'query', 'execute_sql', 'exec', 'execute'];
    for (const name of list) {
        const { data, error } = await supabase.rpc(name, { query: 'SELECT 1;' });
        console.log(`RPC '${name}' with query parameter:`, error ? error.message : "SUCCESS!");
        
        const { data: data2, error: error2 } = await supabase.rpc(name, { sql: 'SELECT 1;' });
        console.log(`RPC '${name}' with sql parameter:`, error2 ? error2.message : "SUCCESS!");
    }
}

check();

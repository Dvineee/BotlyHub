
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yrbnzyvbhitlquaxnruc.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_h9QTmZjwi0pH_JX6i4xfWg_LJFY86GP'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkRPCs() {
    console.log("Checking for blog-related RPCs...");
    const rpcs = ['add_blog_columns', 'setup_blog_tables', 'fix_blog_rls', 'create_blog_tables'];
    for (const rpc of rpcs) {
        const { error } = await supabase.rpc(rpc);
        if (error) {
            if (error.message.includes('Could not find the function')) {
                console.log(`RPC ${rpc}: NOT FOUND`);
            } else {
                console.log(`RPC ${rpc}: ERROR (${error.message})`);
            }
        } else {
            console.log(`RPC ${rpc}: SUCCESS!`);
        }
    }
}

checkRPCs();

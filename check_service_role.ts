
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://yrbnzyvbhitlquaxnruc.supabase.co'; 
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; 

console.log("SUPABASE_URL:", SUPABASE_URL);
console.log("SUPABASE_SERVICE_ROLE_KEY exists:", !!SUPABASE_SERVICE_ROLE_KEY);

if (SUPABASE_SERVICE_ROLE_KEY) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  async function check() {
    // Let's see if we can query pg_tables through a view or RPC, or if we can run query on user_bots etc.
    const { data, error } = await supabase.from('users').select('*').limit(1);
    console.log("Users fetch error:", error);
    console.log("Users data:", data);
  }
  check();
} else {
  console.log("No SERVICE ROLE KEY");
}

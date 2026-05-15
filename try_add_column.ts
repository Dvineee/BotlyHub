
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yrbnzyvbhitlquaxnruc.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_h9QTmZjwi0pH_JX6i4xfWg_LJFY86GP'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function addSlugColumn() {
    console.log("Attempting to add 'slug' column to 'bots' table...");
    const { error } = await supabase.rpc('add_slug_column');
    if (error) {
        console.error("RPC failed (as expected):", error);
        console.log("Trying raw SQL if possible (unlikely)...");
        // Supabase doesn't allow raw SQL via client
    } else {
        console.log("Success adding slug column via RPC!");
    }
}

addSlugColumn();

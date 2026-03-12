
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yrbnzyvbhitlquaxnruc.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_h9QTmZjwi0pH_JX6i4xfWg_LJFY86GP'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkSchema() {
    console.log("Testing minimal insert...");
    try {
        const testId = 'test-' + Date.now();
        const { error: insError } = await supabase.from('users').insert([{ id: testId, name: 'Test User' }]);
        
        if (insError) {
            console.error("Minimal insert failed:", insError.message);
        } else {
            console.log("Minimal insert successful!");
            
            // Now select it back to see columns
            const { data, error: selError } = await supabase.from('users').select('*').eq('id', testId);
            if (selError) {
                console.error("Select after insert failed:", selError.message);
            } else {
                console.log("Columns found:", Object.keys(data[0]));
            }
            
            // Clean up
            await supabase.from('users').delete().eq('id', testId);
        }
    } catch (e) {
        console.error("Unexpected error:", e);
    }
}

checkSchema();

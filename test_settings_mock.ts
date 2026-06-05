import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yrbnzyvbhitlquaxnruc.supabase.co'; 
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_publishable_h9QTmZjwi0pH_JX6i4xfWg_LJFY86GP';

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function testSettings() {
    console.log("Testing welcome settings persistence using pending_admin_actions table...");
    const testChannelId = "-1003360909133";
    
    // 1. Try to upsert settings row
    const settingsPayload = {
        channel_id: testChannelId,
        user_id: 'system',
        action: 'welcome_settings',
        status: 'active',
        permissions: {
            welcome_enabled: true,
            welcome_message: "Selâm {name}, grubumuza hoş geldin! 🎉",
            delete_old_welcome: true
        }
    };
    
    // Check if it already exists
    const { data: existing } = await supabaseAdmin
        .from('pending_admin_actions')
        .select('id')
        .eq('channel_id', testChannelId)
        .eq('user_id', 'system')
        .eq('action', 'welcome_settings')
        .maybeSingle();
        
    let result;
    if (existing) {
        console.log("Record exists, updating...");
        const { data, error } = await supabaseAdmin
            .from('pending_admin_actions')
            .update({
                permissions: settingsPayload.permissions,
                updated_at: new Date().toISOString()
            })
            .eq('id', existing.id)
            .select();
        result = { data, error };
    } else {
        console.log("No record, inserting...");
        const { data, error } = await supabaseAdmin
            .from('pending_admin_actions')
            .insert({
                ...settingsPayload,
                created_at: new Date().toISOString()
            })
            .select();
        result = { data, error };
    }
    
    if (result.error) {
        console.error("FAILED to save welcome settings:", result.error.message);
    } else {
        console.log("SUCCESSFULLY saved welcome settings!", result.data);
        
        // 2. Read it back
        const { data: fetched, error: fetchErr } = await supabaseAdmin
            .from('pending_admin_actions')
            .select('*')
            .eq('channel_id', testChannelId)
            .eq('user_id', 'system')
            .eq('action', 'welcome_settings')
            .maybeSingle();
            
        if (fetchErr) {
            console.error("FAILED to read back welcome settings:", fetchErr.message);
        } else {
            console.log("SUCCESSFULLY read back welcome settings:", fetched);
        }
    }
}

testSettings();

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yrbnzyvbhitlquaxnruc.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_h9QTmZjwi0pH_JX6i4xfWg_LJFY86GP'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function findConflictingUrls() {
  const { data, error } = await supabase.from('bots').select('id, name, slug, app_url, telegram_group, bot_link');
  if (error) {
    console.error(error);
    return;
  }
  
  const identical = data.filter(b => b.app_url && b.telegram_group && b.app_url === b.telegram_group);
  console.log(`Found ${identical.length} bots where app_url equals telegram_group:`);
  console.log(JSON.stringify(identical, null, 2));
}

findConflictingUrls();

import { createClient } from '@supabase/supabase-js';
import { realBotsData } from './bots_data';

const SUPABASE_URL = 'https://yrbnzyvbhitlquaxnruc.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_h9QTmZjwi0pH_JX6i4xfWg_LJFY86GP'; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function generateSlug(text: string): string {
  return text.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function seed100Bots() {
  console.log(`Starting to seed ${realBotsData.length} bots into Supabase...`);

  for (let i = 0; i < realBotsData.length; i++) {
    const bot = realBotsData[i];
    
    // Ensure accurate uppercase ID standard as database can have custom keys
    const botId = `BOT-REAL-${(1000 + i).toString()}`;
    
    const payload = { 
      id: botId, 
      name: bot.name, 
      slug: bot.slug || generateSlug(bot.name),
      description: bot.description || '', 
      price: Number(bot.price) || 0, 
      category: JSON.stringify(Array.isArray(bot.category) ? bot.category : [bot.category || 'utilities']), 
      bot_link: bot.bot_link, 
      screenshots: bot.screenshots || [], 
      icon: bot.icon || '', 
      is_official: Boolean(bot.is_official),
      promoted_type: bot.promoted_type || 'none',
      languages: bot.languages || [],
      telegram_group: bot.telegram_group || null,
      website_url: bot.website_url || null,
      app_url: bot.app_url || null,
      social_url: bot.social_url || null,
      views: bot.views || 0
    };

    try {
      const { error } = await supabase.from('bots').upsert(payload, { onConflict: 'id' });
      if (error) {
        console.error(`Error seeding bot ${bot.name} (ID: ${botId}):`, error.message);
      } else {
        console.log(`[${i + 1}/100] Successfully seeded: ${bot.name} (${botId})`);
      }
    } catch (err: any) {
      console.error(`Failed to upsert bot ${bot.name}:`, err.message || err);
    }
  }

  console.log("Seeding process completed!");
}

seed100Bots();

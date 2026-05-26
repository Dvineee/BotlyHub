import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://yrbnzyvbhitlquaxnruc.supabase.co'; 
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.log("No SERVICE ROLE KEY found. Cannot seed database.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function seed() {
  console.log("Starting DB seeding for group_users...");
  
  // 1. Fetch all channels in the DB
  const { data: channels, error: channelsError } = await supabase.from('channels').select('id, name, telegram_id');
  if (channelsError) {
    console.error("Failed to fetch channels:", channelsError);
    return;
  }
  
  console.log(`Found ${channels?.length || 0} channels in the database.`);
  if (!channels || channels.length === 0) {
    return;
  }
  
  const seedMembers = [
    { name: 'Kenan Ekinci', username: 'kajju66', user_id: '842614237', xp: 1420, joined_at: '2026-05-16T23:09:00Z' },
    { name: 'Elif Yılmaz', username: 'elif_y', user_id: '712398412', xp: 950, joined_at: '2026-05-15T12:44:00Z' },
    { name: 'Can Demir', username: 'candemir', user_id: '623948712', xp: 620, joined_at: '2026-05-14T18:21:00Z' },
    { name: 'Zeynep Kaya', username: 'zey_kaya', user_id: '501984234', xp: 410, joined_at: '2026-05-12T09:30:00Z' },
    { name: 'Hasan Şahin', username: 'hsnsahin', user_id: '492837412', xp: 120, joined_at: '2026-05-10T15:12:00Z' },
    { name: 'Murat Doğan', username: 'murat_d', user_id: '302948123', xp: 85, joined_at: '2026-05-09T11:45:00Z' },
    { name: 'Ayşe Yıldız', username: 'ayse_yildiz', user_id: '209485123', xp: 210, joined_at: '2026-05-08T14:22:00Z' }
  ];

  for (const channel of channels) {
    console.log(`Checking group_users for channel: ${channel.name} (${channel.telegram_id})...`);
    
    const { data: existingUsers, error: usersError } = await supabase
      .from('group_users')
      .select('*')
      .eq('channel_id', String(channel.telegram_id));
      
    if (usersError) {
      console.error(`Error checking users for channel ${channel.telegram_id}:`, usersError);
      continue;
    }
    
    if (existingUsers && existingUsers.length > 0) {
      console.log(`Channel ${channel.name} already has ${existingUsers.length} group users. Skipping seed.`);
      continue;
    }
    
    console.log(`Seeding 7 users for channel: ${channel.name}...`);
    
    const rowsToInsert = seedMembers.map(member => ({
      channel_id: String(channel.telegram_id),
      user_id: member.user_id,
      name: member.name,
      username: member.username,
      xp: member.xp,
      joined_at: member.joined_at
    }));
    
    const { error: insertError } = await supabase
      .from('group_users')
      .insert(rowsToInsert);
      
    if (insertError) {
      console.error(`Failed to seed channel ${channel.name}:`, insertError.message);
    } else {
      console.log(`Successfully seeded ${rowsToInsert.length} users into ${channel.name}!`);
    }
  }
  
  console.log("DB seeding completed successfully.");
}

seed();


import { createClient } from '@supabase/supabase-js';
import { Bot, User, Channel, Announcement, Notification, UserBot, ActivityLog, Promotion, Referral, ReferralSettings, BlogPost, BlogComment } from '../types';
import { API_BASE_URL } from '../constants';

const SUPABASE_URL = (typeof process !== 'undefined' && process.env?.SUPABASE_URL) || 
                    (import.meta.env?.VITE_SUPABASE_URL) || 
                    'https://yrbnzyvbhitlquaxnruc.supabase.co'; 
const SUPABASE_ANON_KEY = (typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY) || 
                         (import.meta.env?.VITE_SUPABASE_ANON_KEY) || 
                         'sb_publishable_h9QTmZjwi0pH_JX6i4xfWg_LJFY86GP'; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export class DatabaseService {
  private static blogsCache: BlogPost[] | null = null;
  private static blogsCacheTime: number = 0;
  private static BLOGS_CACHE_TTL = 1000 * 60 * 5; // 5 minutes
  
  // --- PROMOTIONS ---
  static async getPromotions(): Promise<Promotion[]> {
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
        console.error("Promotions Fetch Error:", error);
        return [];
    }
    return (data || []).map(p => ({
        ...p,
        click_count: Number(p.click_count || 0),
        total_reach: Number(p.total_reach || 0),
        channel_count: Number(p.channel_count || 0),
        price_per_view: Number(p.price_per_view || 0),
        source_channel: p.source_channel || '',
        source_message_id: p.source_message_id ? Number(p.source_message_id) : undefined,
        processed_channels: p.processed_channels || []
    }));
  }

  static async incrementPromotionClick(promoId: string) {
    // RPC kullanımı yerine mevcut değeri çekip artırma (RPC daha sağlıklıdır ancak bu yapı için yeterli)
    const { data } = await supabase.from('promotions').select('click_count').eq('id', promoId).maybeSingle();
    if (data) {
        await supabase.from('promotions').update({ click_count: Number(data.click_count || 0) + 1 }).eq('id', promoId);
    }
  }

  static async savePromotion(promo: Partial<Promotion>) {
    const payload: any = {
        title: promo.title,
        content: promo.content,
        image_url: promo.image_url || null,
        button_text: promo.button_text || 'İNCELE',
        button_link: promo.button_link || null,
        status: promo.status || 'pending',
        click_count: Number(promo.click_count || 0),
        total_reach: Number(promo.total_reach || 0),
        channel_count: Number(promo.channel_count || 0),
        price_per_view: Number(promo.price_per_view || 0),
        source_channel: promo.source_channel || null,
        source_message_id: promo.source_message_id || null
    };

    if (promo.id && promo.id !== '') {
        const { error } = await supabase
            .from('promotions')
            .update(payload)
            .eq('id', promo.id);
            
        if (error) throw new Error(`Güncelleme başarısız: ${error.message}`);
    } else {
        payload.created_at = new Date().toISOString();
        const { error } = await supabase
            .from('promotions')
            .insert([payload]);
            
        if (error) throw new Error(`Ekleme başarısız: ${error.message}`);
    }
  }

  static async updatePromotionStatus(id: string, status: Promotion['status']) {
      const { error } = await supabase
        .from('promotions')
        .update({ status: status })
        .eq('id', id);
      if (error) throw error;

      // SİSTEMSEL SİMÜLASYON: BotlyHub Reklam Ağı (Forward Sistemi)
      if (status === 'sending') {
          console.log(`[BOT] -1003826684282 üzerinden dağıtım başlatıldı: ${id}`);
          
          // Simülasyon: 5 saniye sonra durumu 'sent'e çek
          setTimeout(async () => {
              // Gerçek bot arka planda source_message_id'yi güncelleyecektir.
              await supabase.from('promotions').update({ 
                  status: 'sent', 
                  sent_at: new Date().toISOString() 
              }).eq('id', id);
          }, 5000);
      }

      return true;
  }

  static async deletePromotion(id: string) {
    const { error } = await supabase.from('promotions').delete().eq('id', id);
    if (error) throw error;
  }

  static async getPromotionChannelStats(userId: string): Promise<any[]> {
    const uId = userId.toString();
    // Kullanıcının kanallarını al
    const { data: channels } = await supabase
      .from('channels')
      .select('telegram_id, name')
      .eq('user_id', uId);
    
    if (!channels || channels.length === 0) {
        console.log("No channels found for user:", uId);
        return [];
    }

    const channelIds = channels.map(c => String(c.telegram_id));
    console.log("Fetching stats for channels:", channelIds);

    // Bu kanallara ait istatistikleri çek
    const { data, error } = await supabase
      .from('promotion_channel_stats')
      .select('*, promotions(*)')
      .in('channel_id', channelIds)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error("Promotion Stats Fetch Error:", error);
      return [];
    }

    console.log("RAW STATS DATA:", data);
    
    // Kanal isimlerini istatistiklere ekle
    return (data || []).map(stat => {
        const channel = channels.find(c => String(c.telegram_id) === String(stat.channel_id));
        console.log(`Matching stat for channel ${stat.channel_id}:`, channel ? "Found" : "Not Found");
        
        // Supabase returns the joined table as an object or array with the table name
        // We map it to 'promotion' (singular) as expected by the frontend
        const promotion = Array.isArray(stat.promotions) ? stat.promotions[0] : stat.promotions;
        
        return {
            ...stat,
            channel_name: channel ? channel.name : 'Bilinmeyen Kanal',
            promotion: promotion
        };
    });
  }

  // --- USERS ---
  static async syncUser(user: Partial<User>) {
    if (!user.id) return;
    
    // Check if user exists
    const { data: existing } = await supabase.from('users').select('*').eq('id', user.id.toString()).maybeSingle();
    
    const payload: any = {
        id: user.id.toString(), 
        name: user.name, 
        username: user.username, 
        avatar: user.avatar, 
        email: user.email || existing?.email, 
        role: existing?.role || user.role || 'User', 
        status: existing?.status || user.status || 'Active' 
    };

    if (!existing) {
        payload.joindate = new Date().toISOString();
    }

    const { error } = await supabase.from('users').upsert(payload, { onConflict: 'id' });
    
    if (error) throw error;

    if (!existing) {
        await this.logActivity(user.id.toString(), 'auth', 'user_registered', 'Yeni Üye Kaydı', `${user.username} platforma katıldı.`);
    } else {
        await this.logActivity(user.id.toString(), 'auth', 'user_login', 'Kullanıcı Girişi', `${user.username} sisteme giriş yaptı.`);
    }
  }

  static async getUser(userId: string): Promise<User | null> {
    const { data } = await supabase.from('users').select('*').eq('id', userId.toString()).maybeSingle();
    if (!data) return null;
    return {
        ...data,
        joinDate: data.joindate,
        canPublishPromos: data.can_publish_promos,
        isRestricted: data.is_restricted
    };
  }

  static async getUserByUsername(username: string): Promise<User | null> {
    const cleanUsername = username.startsWith('@') ? username.slice(1) : username;
    // Use ilike for case-insensitive search
    const { data } = await supabase.from('users').select('*').ilike('username', cleanUsername).maybeSingle();
    if (!data) return null;
    return {
        ...data,
        joinDate: data.joindate,
        canPublishPromos: data.can_publish_promos,
        isRestricted: data.is_restricted
    };
  }

  static async getUsers(): Promise<User[]> {
      const { data } = await supabase.from('users').select('*').order('joindate', { ascending: false });
      return (data || []).map(u => ({ 
          ...u, 
          joinDate: u.joindate,
          isRestricted: u.is_restricted,
          canPublishPromos: u.can_publish_promos
      }));
  }

  static async updateUserStatus(userId: string, status: 'Active' | 'Passive') {
      const { error } = await supabase.from('users').update({ status }).eq('id', userId);
      if (error) throw error;
  }

  static async updateUserRestriction(userId: string, isRestricted: boolean) {
      const { error } = await supabase.from('users').update({ is_restricted: isRestricted }).eq('id', userId);
      if (error) throw error;
  }

  static async updateUserPublishStatus(userId: string, canPublish: boolean) {
      const { error } = await supabase.from('users').update({ can_publish_promos: canPublish }).eq('id', userId);
      if (error) throw error;
  }

  static async deleteUser(userId: string) {
      const userIdStr = userId.toString();
      console.log(`[DatabaseService] Deleting user ${userIdStr}...`);
      
      try {
          // 1. Get user's channels to delete related data
          const { data: channels, error: fetchChannelsError } = await supabase
              .from('channels')
              .select('id, telegram_id')
              .eq('user_id', userIdStr);
          
          if (fetchChannelsError) throw fetchChannelsError;
          
          const channelIds = (channels || []).map(c => String(c.id));
          const telegramIds = (channels || []).map(c => String(c.telegram_id));

          // 2. Delete data that references channels (must be done before deleting channels)
          if (telegramIds.length > 0) {
              // promotion_channel_stats uses telegram_id as channel_id
              const { error: statsError } = await supabase.from('promotion_channel_stats').delete().in('channel_id', telegramIds);
              if (statsError) console.warn("[DatabaseService] Warning: Could not delete from promotion_channel_stats:", statsError.message);
          }
          
          if (channelIds.length > 0) {
              // bot_connections uses channel UUID as channel_id
              const { error: connError1 } = await supabase.from('bot_connections').delete().in('channel_id', channelIds);
              if (connError1) console.warn("[DatabaseService] Warning: Could not delete from bot_connections by channel_id:", connError1.message);
          }

          // Also delete from bot_connections by user_id directly
          const { error: connError2 } = await supabase.from('bot_connections').delete().eq('user_id', userIdStr);
          if (connError2) console.warn("[DatabaseService] Warning: Could not delete from bot_connections by user_id:", connError2.message);

          // 3. Nullify referrals in users table (if this user was a referrer)
          const { error: refUpdateError } = await supabase.from('users').update({ referred_by: null }).eq('referred_by', userIdStr);
          if (refUpdateError) {
              // If column doesn't exist, we skip it
              if (refUpdateError.code === 'PGRST204') {
                  console.warn("[DatabaseService] Warning: 'referred_by' column not found in 'users' table. Skipping referral nullification.");
              } else {
                  console.warn("[DatabaseService] Warning: Could not nullify 'referred_by':", refUpdateError.message);
              }
          }

          // 4. Delete other related data
          const tablesToDelete = [
              { name: 'user_wallets', field: 'user_id' },
              { name: 'user_bots', field: 'user_id' },
              { name: 'bot_discovery_logs', field: 'owner_id' },
              { name: 'bot_logs', field: 'user_id' },
              { name: 'notifications', field: 'user_id' },
              { name: 'transactions', field: 'user_id' }
          ];

          for (const table of tablesToDelete) {
              const { error } = await supabase.from(table.name).delete().eq(table.field, userIdStr);
              if (error) console.warn(`[DatabaseService] Warning: Could not delete from ${table.name}:`, error.message);
          }

          // Special case for referrals (OR condition)
          const { error: referralsError } = await supabase.from('referrals').delete().or(`referrer_id.eq.${userIdStr},referred_id.eq.${userIdStr}`);
          if (referralsError) console.warn("[DatabaseService] Warning: Could not delete from referrals:", referralsError.message);

          // 5. Delete channels (now that all references are gone)
          const { error: channelsDeleteError } = await supabase.from('channels').delete().eq('user_id', userIdStr);
          if (channelsDeleteError) {
              console.error("[DatabaseService] CRITICAL: Failed to delete channels:", channelsDeleteError);
              throw channelsDeleteError;
          }

          // 6. Finally delete the user record
          const { error: userDeleteError } = await supabase.from('users').delete().eq('id', userIdStr);
          if (userDeleteError) {
              console.error("[DatabaseService] CRITICAL: Failed to delete user record:", userDeleteError);
              throw userDeleteError;
          }
          
          console.log(`[DatabaseService] User ${userIdStr} and all associated data deleted successfully.`);
      } catch (error) {
          console.error("Delete User Error:", error);
          throw error;
      }
  }

  // --- WALLETS ---
  static async getUserWallet(userId: string) {
      const { data, error } = await supabase
          .from('user_wallets')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
      
      if (error) throw error;
      
      if (!data) {
          // Create wallet if it doesn't exist
          const { data: newWallet, error: createError } = await supabase
              .from('user_wallets')
              .insert({ user_id: userId, balance: 0, total_earned: 0 })
              .select()
              .single();
          
          if (createError) throw createError;
          return newWallet;
      }
      
      return data;
  }

  static async updateUserWallet(userId: string, updates: { balance?: number, total_earned?: number }) {
      const { error } = await supabase
          .from('user_wallets')
          .update({ 
              ...updates,
              updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
      
      if (error) throw error;
  }

  // --- CHANNELS & DISCOVERY ---
  static async getChannels(userId: string): Promise<Channel[]> {
    const { data } = await supabase.from('channels').select('*').eq('user_id', userId.toString()).order('created_at', { ascending: false });
    return (data || []).map(c => ({ 
        id: String(c.id), 
        user_id: String(c.user_id), 
        telegram_id: String(c.telegram_id), 
        name: c.name, 
        memberCount: Number(c.member_count || 0), 
        icon: c.icon || (c.telegram_id ? `${API_BASE_URL}/api/telegram/chat-photo?chatId=${encodeURIComponent(c.telegram_id)}` : ''), 
        revenueEnabled: c.revenue_enabled, 
        connectedBotIds: c.connected_bot_ids || [], 
        revenue: Number(c.revenue || 0) 
    }));
  }

  static async updateUserBot(ownershipId: string, updates: any) {
    const { error } = await supabase.from('user_bots').update(updates).eq('id', ownershipId);
    if (error) throw error;
  }

  static async removeUserBotById(ownershipId: string) {
    const { error } = await supabase.from('user_bots').delete().eq('id', ownershipId);
    if (error) throw error;
  }

  static async syncChannelsFromBotActivity(userId: string): Promise<number> {
      try {
          const uIdStr = String(userId).trim();
          const { data: logs } = await supabase
            .from('bot_discovery_logs')
            .select('*')
            .eq('owner_id', uIdStr)
            .eq('is_synced', false);

          if (!logs || logs.length === 0) return 0;

          let count = 0;
          for (const log of logs) {
              const telegramId = String(log.chat_id).trim();
              const { data: existing } = await supabase
                .from('channels')
                .select('*')
                .eq('user_id', uIdStr)
                .eq('telegram_id', telegramId)
                .maybeSingle();

              if (existing) {
                  await supabase.from('channels').update({ 
                      member_count: log.member_count,
                      name: log.channel_name
                  }).eq('id', existing.id);
              } else {
                  await supabase.from('channels').insert({ 
                      user_id: uIdStr, 
                      telegram_id: telegramId, 
                      name: log.channel_name, 
                      member_count: log.member_count, 
                      revenue_enabled: true, 
                      revenue: 0,
                      archived: false
                  });
                  await this.logActivity(uIdStr, 'channel_sync', 'channel_added', 'Yeni Kanal Eklendi', `${log.channel_name} kanalı kütüphaneye eklendi.`);
              }
              await supabase.from('bot_discovery_logs').update({ is_synced: true }).eq('id', log.id);
              count++;
          }
          return count;
      } catch (e) {
          console.error("Discovery Sync Error:", e);
          return 0;
      }
  }

  static async getChatAdministrators(chatId: string): Promise<any[]> {
    try {
      const fetchUrl = `${API_BASE_URL}/api/telegram/chat-admins?chatId=${encodeURIComponent(chatId)}`;
      const res = await fetch(fetchUrl);
      if (!res.ok) throw new Error("Chat administrators request failed");
      return await res.json();
    } catch (e) {
      console.error("Error fetching chat admins from DatabaseService:", e);
      return [
        { user: { id: 210944655, first_name: "BotlyHub", username: "botlyhub", is_bot: true }, status: "administrator", custom_title: "Sistem Botu" },
        { user: { id: 842614237, first_name: "KAJU", username: "kajju66", is_bot: false }, status: "creator", custom_title: "Kurucu" }
      ];
    }
  }

  static async updateChannelAdStatus(channelId: string, status: boolean) {
      const { error } = await supabase.from('channels').update({ revenue_enabled: status }).eq('id', channelId);
      if (error) throw error;
  }

  static async getGroupUsers(channelId: string): Promise<any[]> {
    try {
      const fetchUrl = `${API_BASE_URL}/api/group-users/${encodeURIComponent(channelId)}`;
      console.log(`[DatabaseService] Fetching group users from: ${fetchUrl}`);
      const res = await fetch(fetchUrl);
      if (!res.ok) {
        throw new Error(`API error: ${res.statusText}`);
      }
      const data = await res.json();
      return data || [];
    } catch (e) {
      console.error("[DatabaseService] Error fetching group users via proxy API, falling back to direct client query:", e);
      try {
        let targetId = channelId.toString();
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId) || (targetId.length >= 32 && targetId.includes('-'));
        if (isUuid) {
          const { data: channelData } = await supabase
            .from('channels')
            .select('telegram_id')
            .eq('id', targetId)
            .maybeSingle();
          if (channelData?.telegram_id) {
            targetId = channelData.telegram_id.toString();
          }
        }

        const { data, error } = await supabase
          .from('group_users')
          .select('*')
          .eq('channel_id', targetId);
        
        if (error) {
          console.error("[DatabaseService] Anonymous query fallback error:", error);
          return [];
        }
        return data || [];
      } catch (fallbackErr) {
        console.error("[DatabaseService] Supabase direct query fallback exception:", fallbackErr);
        return [];
      }
    }
  }

  static async seedGroupUsers(channelId: string): Promise<{ status: string; message: string }> {
    const fetchUrl = `${API_BASE_URL}/api/group-users/${encodeURIComponent(channelId)}/seed`;
    const res = await fetch(fetchUrl, { method: 'POST' });
    if (!res.ok) {
      throw new Error(`Seed API error: ${res.statusText}`);
    }
    return res.json();
  }

  // --- BOTS ---
  static parseCategory(cat: any): string[] {
    if (Array.isArray(cat)) return cat;
    if (typeof cat !== 'string') return ['utilities'];
    
    // Check if it's a JSON stringified array
    if (cat.startsWith('[') && cat.endsWith(']')) {
      try {
        const parsed = JSON.parse(cat);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        // Fall through to comma split
      }
    }
    
    return cat.split(',').map((s: string) => s.trim()).filter(Boolean);
  }

  static generateSlug(text: string): string {
    return text.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  static async getBots(): Promise<Bot[]> {
    const { data: bots } = await supabase.from('bots').select('*').order('id', { ascending: false });
    const { data: ratings } = await supabase.from('bot_ratings').select('bot_id, rating');
    const { data: userBots } = await supabase.from('user_bots').select('bot_id');

    return (bots || []).map(bot => {
        const botRatings = (ratings || []).filter(r => r.bot_id === bot.id);
        const avgRating = botRatings.length > 0 
            ? botRatings.reduce((acc, curr) => acc + curr.rating, 0) / botRatings.length 
            : 0;
        const userCount = (userBots || []).filter(ub => ub.bot_id === bot.id).length;

        const slug = bot.slug || this.generateSlug(bot.name);

        return {
            ...bot,
            slug,
            category: this.parseCategory(bot.category),
            languages: (bot.languages || (bot.name.toLowerCase().includes('botlyhub') ? ['🇬🇧', '🇹🇷'] : [])).map((l: string) => l === 'İng' ? '🇬🇧' : l),
            rating: Number(avgRating.toFixed(1)),
            rating_count: botRatings.length,
            user_count: userCount
        };
    });
  }

  static async getBotById(id: string): Promise<Bot | null> {
    try {
      // Robustly check if id is a UUID or integer to avoid Postgres error 22P02
      // Supabase default IDs are often UUIDs or bigints
      const isPotentialId = id.length >= 1 && (
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) || // UUID
        /^\d+$/.test(id) // integer
      );
      
      if (!isPotentialId) return null;

      const { data, error } = await supabase.from('bots').select('*').eq('id', id).maybeSingle();
      if (error || !data) return null;
      
      return this.mapBotData(data);
    } catch (e) {
      return null;
    }
  }

  static async getBotBySlug(slug: string): Promise<Bot | null> {
    if (!slug) return null;

    // 1. Try finding by ID first if it looks like an ID
    const botById = await this.getBotById(slug);
    if (botById) return botById;

    // 2. Try direct slug column match (in case it exists)
    try {
        const { data: slugBot, error: slugError } = await supabase.from('bots').select('*').eq('slug', slug).maybeSingle();
        if (slugBot && !slugError) return this.mapBotData(slugBot);
    } catch (e) {
        // Fall through
    }

    // 3. Try finding by name using ilike (approximate slug match)
    const searchTerm = slug.replace(/-/g, ' ');
    const { data: bots } = await supabase
        .from('bots')
        .select('*')
        .ilike('name', `%${searchTerm}%`);
    
    if (bots && bots.length > 0) {
        // Find the exact slug match in the filtered results
        const exactMatch = bots.find(b => this.generateSlug(b.name) === slug);
        if (exactMatch) return this.mapBotData(exactMatch);
    }
    
    // 4. Fallback search
    try {
        const allBots = await this.getBots();
        const match = allBots.find(b => (b as any).slug === slug || this.generateSlug(b.name) === slug);
        if (match) return match;
    } catch (e) {
        console.error("Slug fallback failed:", e);
    }
    
    return null;
  }

  private static async mapBotData(data: any): Promise<Bot> {
    const id = data.id;
    let user_count = 0;
    let rating = 0;
    let rating_count = 0;

    try {
        const { count } = await supabase
            .from('user_bots')
            .select('*', { count: 'exact', head: true })
            .eq('bot_id', id);
        user_count = count || 0;

        const { data: ratings } = await supabase
            .from('bot_ratings')
            .select('rating')
            .eq('bot_id', id);
        
        if (ratings && ratings.length > 0) {
            rating_count = ratings.length;
            rating = ratings.reduce((acc, curr) => acc + curr.rating, 0) / rating_count;
        }
    } catch (e) {
        console.warn("Stats fetch error (maybe table missing):", e);
    }

    return {
        ...data,
        slug: data.slug || this.generateSlug(data.name),
        category: this.parseCategory(data.category),
        languages: (data.languages || (data.name.toLowerCase().includes('botlyhub') ? ['🇬🇧', '🇹🇷'] : [])).map((l: string) => l === 'İng' ? '🇬🇧' : l),
        user_count,
        rating: Number(rating.toFixed(1)) || 0,
        rating_count
    };
  }

  static async incrementBotView(botId: string) {
    try {
        const { data: bot } = await supabase.from('bots').select('views').eq('id', botId).single();
        if (bot) {
            await supabase.from('bots').update({ views: (bot.views || 0) + 1 }).eq('id', botId);
        }
    } catch (e) {
        console.error("Increment view error:", e);
    }
  }

  static async rateBot(userId: string, botId: string, rating: number) {
    try {
        // Önce mevcut puanı kontrol etmeye gerek yok, upsert otomatik halleder
        const { error } = await supabase.from('bot_ratings').upsert({
            user_id: userId,
            bot_id: botId,
            rating: rating,
            created_at: new Date().toISOString()
        }, { 
            onConflict: 'user_id,bot_id'
        });
        
        if (error) {
            console.error("Supabase Upsert Error:", error);
            throw new Error(error.message);
        }
    } catch (e: any) {
        console.error("rateBot Exception:", e);
        throw e;
    }
  }

  static async getUserBotRating(userId: string, botId: string): Promise<number | null> {
    try {
        const { data } = await supabase.from('bot_ratings').select('rating').eq('user_id', userId).eq('bot_id', botId).maybeSingle();
        return data?.rating || null;
    } catch (e) {
        console.warn("User rating fetch error:", e);
        return null;
    }
  }

  static async saveBot(bot: any) {
    if (!bot.id) throw new Error("Bot ID eksik. Lütfen sayfayı yenileyip tekrar deneyin.");
    if (!bot.name) throw new Error("Bot ismi boş bırakılamaz.");
    if (!bot.bot_link) throw new Error("Kullanıcı adı (@) boş bırakılamaz.");

    const payload = { 
        id: bot.id, 
        name: bot.name, 
        slug: bot.slug || this.generateSlug(bot.name),
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
        social_url: bot.social_url || null
    };

    const { error } = await supabase.from('bots').upsert(payload, { onConflict: 'id' });
    if (error) {
        console.error("Supabase upsert error:", error);
        throw error;
    }
  }

  static async deleteBot(id: string) {
    const { error } = await supabase.from('bots').delete().eq('id', id);
    if (error) throw error;
  }

  static async getBotsWithStats(): Promise<any[]> {
    const { data: bots } = await supabase.from('bots').select('*').order('id', { ascending: false });
    const { data: userBots } = await supabase.from('user_bots').select('bot_id');
    
    let ratings: any[] = [];
    try {
        const { data: ratingsData } = await supabase.from('bot_ratings').select('bot_id, rating');
        ratings = ratingsData || [];
    } catch (e) {
        console.warn("Could not fetch ratings, table might be missing:", e);
    }

    return (bots || []).map(bot => {
        const botRatings = ratings.filter(r => r.bot_id === bot.id);
        const avgRating = botRatings.length > 0 
            ? botRatings.reduce((acc, curr) => acc + curr.rating, 0) / botRatings.length 
            : 0;

        return { 
            ...bot, 
            category: this.parseCategory(bot.category),
            ownerCount: (userBots || []).filter((ub: any) => ub.bot_id === bot.id).length,
            rating: Number(avgRating.toFixed(1)),
            ratingCount: botRatings.length
        };
    });
  }

  // --- USER BOTS ---
  static async getUserBots(userId: string): Promise<UserBot[]> {
    try {
      // Join yerine iki aşamalı sorgu yaparak ilişki hatalarını ekarte ediyoruz
      const { data: userBots, error: ubError } = await supabase
        .from('user_bots')
        .select('*')
        .eq('user_id', userId.toString());

      if (ubError) {
        console.error("UserBots Fetch Error:", ubError);
        return [];
      }

      if (!userBots || userBots.length === 0) return [];

      const botIds = userBots.map(ub => ub.bot_id);
      const { data: bots, error: bError } = await supabase
        .from('bots')
        .select('*')
        .in('id', botIds);

      if (bError) {
        console.error("Bots Fetch Error for UserBots:", bError);
        return [];
      }

      if (!bots) return [];

      return userBots.map((ub: any) => {
          const botData = bots.find(b => b.id === ub.bot_id);
          if (!botData) return null;

          return { 
              ...botData, 
              category: this.parseCategory(botData.category),
              expiryDate: ub.expiry_date || ub.expiryDate, 
              ownership_id: ub.id, 
              is_premium: ub.is_premium, 
              isActive: ub.is_active, 
              revenueEnabled: ub.revenue_enabled 
          } as UserBot;
      }).filter((b): b is UserBot => b !== null);
    } catch (e) {
      console.error("getUserBots Exception:", e);
      return [];
    }
  }

  static async addUserBot(userData: any, botData: Bot, isPremium: boolean = false) {
    const userId = (userData.id || userData).toString();
    
    // Önce kullanıcının bu bota zaten sahip olup olmadığını kontrol et (Upsert yerine manuel kontrol daha güvenli olabilir)
    const { data: existing } = await supabase
        .from('user_bots')
        .select('id')
        .eq('user_id', userId)
        .eq('bot_id', botData.id)
        .maybeSingle();

    let error;
    if (existing) {
        // Zaten varsa güncelle
        const { error: updateError } = await supabase
            .from('user_bots')
            .update({
                is_active: true,
                is_premium: isPremium,
                acquired_at: new Date().toISOString()
            })
            .eq('id', existing.id);
        error = updateError;
    } else {
        // Yoksa yeni ekle
        const { error: insertError } = await supabase
            .from('user_bots')
            .insert({ 
                user_id: userId, 
                bot_id: botData.id, 
                is_active: true, 
                is_premium: isPremium, 
                acquired_at: new Date().toISOString() 
            });
        error = insertError;
    }

    if (error) {
        console.error("AddUserBot Error:", error);
        throw error;
    }
    
    await this.logActivity(userId, 'bot_manage', 'bot_acquired', 'Bot Kütüphaneye Eklendi', `${botData.name} botu kütüphaneye eklendi.`);
    
    return true;
  }

  static async isBotOwnedByUser(userId: string, botId: string): Promise<boolean> {
    const { data } = await supabase.from('user_bots').select('id').eq('user_id', userId.toString()).eq('bot_id', botId.toString()).maybeSingle();
    return !!data;
  }

  static async removeUserBot(userId: string, botId: string) {
    const { error } = await supabase.from('user_bots').delete().eq('user_id', userId.toString()).eq('bot_id', botId.toString());
    if (error) throw error;
  }

  // --- NOTIFICATIONS ---
  static async getNotifications(userId?: string): Promise<Notification[]> {
    const query = supabase.from('notifications').select('*').order('date', { ascending: false });
    if (userId) query.or(`user_id.eq.${userId},target_type.eq.global`);
    const { data } = await query;
    return (data || []).map(n => ({ ...n, isRead: n.is_read }));
  }

  static async markNotificationRead(id: string) { 
      const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id); 
      if (error) throw error;
  }

  static async sendUserNotification(userId: string, title: string, message: string, type: Notification['type'] = 'system') {
      const { error } = await supabase.from('notifications').insert([{ 
          id: Math.floor(Math.random() * 999999999).toString(), 
          user_id: userId.toString(),
          title, message, type, 
          date: new Date().toISOString(), 
          is_read: false, 
          target_type: 'user'
      }]);
      if (error) throw error;
  }

  static async sendGlobalNotification(title: string, message: string, type: Notification['type'] = 'system') {
      const { error } = await supabase.from('notifications').insert([{ 
          id: Math.floor(Math.random() * 999999999).toString(), 
          title, message, type, 
          date: new Date().toISOString(), 
          is_read: false, 
          target_type: 'global'
      }]);
      if (error) throw error;
  }

  static async deleteNotification(id: string) {
      const { error } = await supabase.from('notifications').delete().eq('id', id);
      if (error) throw error;
  }

  static async incrementNotificationView(id: string) {
      const { data } = await supabase.from('notifications').select('view_count').eq('id', id).maybeSingle();
      if (data) {
          await supabase.from('notifications').update({ view_count: Number(data.view_count || 0) + 1 }).eq('id', id);
      }
  }

  // --- STATS & ADMIN ---
  static async getAdminStats() {
    try {
        const [u, b, l, t] = await Promise.all([
            supabase.from('users').select('*', { count: 'exact', head: true }),
            supabase.from('bots').select('*', { count: 'exact', head: true }),
            supabase.from('bot_logs').select('*', { count: 'exact', head: true }),
            supabase.from('transactions').select('amount, currency, status').eq('status', 'completed')
        ]);

        const totalRevenue = (t.data || []).reduce((acc, curr) => {
            if (curr.currency === 'TRY') return acc + Number(curr.amount);
            if (curr.currency === 'TON') return acc + (Number(curr.amount) * 250); // Örnek kur
            if (curr.currency === 'STARS') return acc + (Number(curr.amount) * 0.5); // Örnek kur
            return acc;
        }, 0);

        return { 
            userCount: u.count || 0, 
            botCount: b.count || 0, 
            logCount: l.count || 0, 
            salesCount: (t.data || []).length, 
            totalRevenue 
        };
    } catch (e) {
        console.error(e);
        return { userCount: 0, botCount: 0, logCount: 0, salesCount: 0, totalRevenue: 0 };
    }
  }

  static async getSettings() {
    const { data } = await supabase.from('settings').select('*').eq('id', 1).maybeSingle();
    return data ? { 
        ...data, 
        maintenanceMode: Boolean(data.maintenance_mode),
        marqueeText: data.marquee_text,
        version: data.version
    } : null;
  }

  static async updateSettings(updates: any) {
    const { error } = await supabase.from('settings').update(updates).eq('id', 1);
    if (error) throw error;
  }

  static async grantPanelAccess(userId: string, password: string) {
    const { error } = await supabase
      .from('users')
      .update({ 
        has_panel_access: true, 
        panel_password: password 
      })
      .eq('id', userId);
    if (error) throw error;
  }

  static async loginPanel(username: string, password: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username.replace('@', ''))
      .eq('panel_password', password)
      .eq('has_panel_access', true)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  }

  static async logActivity(userId: string, type: ActivityLog['type'], actionKey: string, title: string, description: string) {
      await supabase.from('bot_logs').insert({ 
          user_id: String(userId), 
          type, 
          action_key: actionKey, 
          title, 
          description, 
          created_at: new Date().toISOString() 
      });
  }

  static async getActivityLogs(userId?: string): Promise<ActivityLog[]> {
    let query = supabase
        .from('bot_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
    
    if (userId) {
        query = query.eq('user_id', userId);
    }

    const { data: logs, error: logsError } = await query;
    
    if (logsError || !logs) return [];

    // Manually fetch user details for the logs
    const userIds = Array.from(new Set(logs.map(l => l.user_id).filter(id => id !== 'admin')));
    
    if (userIds.length > 0) {
        const { data: users } = await supabase
            .from('users')
            .select('id, name, username, avatar')
            .in('id', userIds);
        
        if (users) {
            return logs.map(log => ({
                ...log,
                user: users.find(u => u.id === log.user_id)
            }));
        }
    }

    return logs as any || [];
  }

  static async getAllPurchases(): Promise<any[]> {
    const { data } = await supabase.from('user_bots').select('*, users(*), bots(*)').order('acquired_at', { ascending: false });
    return data || [];
  }

  // --- ANNOUNCEMENTS ---
  static async getAnnouncements(): Promise<Announcement[]> {
    const { data } = await supabase.from('announcements').select('*').order('id', { ascending: false });
    return data || [];
  }

  static async saveAnnouncement(ann: any) {
    const { error } = await supabase.from('announcements').upsert({ ...ann, id: ann.id || Math.floor(Math.random() * 999999).toString() });
    if (error) throw error;
  }

  static async deleteAnnouncement(id: string) {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) throw error;
  }
  
   // --- BLOGS ---
  static async getBlogs(limit?: number, offset?: number): Promise<BlogPost[]> {
    // Check cache (only if no special limit/offset is used for simplicity, or we store the first page)
    const isFirstPage = !offset || offset === 0;
    if (isFirstPage && !limit && this.blogsCache && Date.now() - this.blogsCacheTime < this.BLOGS_CACHE_TTL) {
        console.log("[DatabaseService] Returning blogs from cache");
        return this.blogsCache;
    }

    try {
        let query = supabase
          .from('blogs')
          .select('*')
          .neq('category', 'qa_forum')
          .order('created_at', { ascending: false });
          
        if (limit) query = query.limit(limit);
        if (offset) query = query.range(offset, offset + (limit || 10) - 1);

        const { data, error } = await query;
          
        if (error) {
            console.error("Blogs Fetch Error:", error);
            return this.blogsCache || []; // Return cache if error occurs
        }

        const mappedData = (data || []).map(b => ({
            ...b,
            readTime: b.read_time,
            isFeatured: b.is_featured,
            authorAvatar: b.author_avatar,
            likes_count: b.likes_count || 0,
            views_count: b.views_count || 0,
            hashtags: Array.isArray(b.hashtags) ? b.hashtags : (typeof b.hashtags === 'string' ? JSON.parse(b.hashtags) : [])
        }));

        // Cache the first page/default fetch
        if (isFirstPage && !limit) {
            this.blogsCache = mappedData;
            this.blogsCacheTime = Date.now();
        }

        return mappedData;
    } catch (e) {
        console.error("getBlogs Error:", e);
        return this.blogsCache || [];
    }
  }

  static async getSimilarBlogs(excludeId: string, category?: string, limit: number = 3): Promise<BlogPost[]> {
    try {
      let query = supabase
        .from('blogs')
        .select('*')
        .neq('id', excludeId)
        .neq('category', 'qa_forum')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) return [];

      return (data || []).map(b => ({
          ...b,
          readTime: b.read_time,
          isFeatured: b.is_featured,
          authorAvatar: b.author_avatar,
          hashtags: Array.isArray(b.hashtags) ? b.hashtags : (typeof b.hashtags === 'string' ? JSON.parse(b.hashtags) : [])
      }));
    } catch (e) {
      return [];
    }
  }

  static async getTrendingHashtags(): Promise<string[]> {
    try {
      let data: any[] | null = null;
      
      // Use cache if available
      if (this.blogsCache && this.blogsCache.length > 0) {
        data = this.blogsCache.slice(0, 20);
      } else {
        const { data: remoteData } = await supabase.from('blogs').select('hashtags').limit(20);
        data = remoteData;
      }

      if (!data || data.length === 0) return ['TON', 'PassiveIncome', 'AIBots', 'MiniApps', 'Web3'];
      
      const tagCounts: { [key: string]: number } = {};
      data.forEach(blog => {
        const hashtags = Array.isArray(blog.hashtags) ? blog.hashtags : (typeof blog.hashtags === 'string' ? JSON.parse(blog.hashtags) : []);
        hashtags?.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });
      
      const sortedTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(entry => entry[0]);
        
      return sortedTags.length > 0 ? sortedTags : ['TON', 'PassiveIncome', 'AIBots', 'MiniApps', 'Web3'];
    } catch (e) {
      return ['TON', 'PassiveIncome', 'AIBots', 'MiniApps', 'Web3'];
    }
  }

  static async getBlogById(id: string): Promise<BlogPost | null> {
    // Try by ID first
    let { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('id', id)
      .maybeSingle();
      
    // If not found by ID, try by slug
    if (!data && !error) {
      const { data: slugData, error: slugError } = await supabase
        .from('blogs')
        .select('*')
        .eq('slug', id)
        .maybeSingle();
        
      if (slugData) data = slugData;
    }
      
    if (error) {
        console.error("Blog Fetch Error:", error);
        return null;
    }
    if (!data) return null;
    
    // Fetch actual likes count
    const likesCount = await this.getBlogLikes(data.id);
    
    return {
        ...data,
        readTime: data.read_time,
        isFeatured: data.is_featured,
        authorAvatar: data.author_avatar,
        likes_count: likesCount || data.likes_count || 0,
        views_count: data.views_count || 0,
        hashtags: Array.isArray(data.hashtags) ? data.hashtags : (typeof data.hashtags === 'string' ? JSON.parse(data.hashtags) : [])
    };
  }

  static async incrementBlogView(id: string) {
    try {
        const { data: current, error: fetchError } = await supabase.from('blogs').select('views_count').eq('id', id).single();
        if (fetchError) {
          // If column is missing, we can't update it, but we don't want to throw
          if (fetchError.message.includes('column blogs.views_count does not exist')) {
            console.warn("Table 'blogs' is missing 'views_count' column.");
            return;
          }
          throw fetchError;
        }
        await supabase.from('blogs').update({ views_count: (current?.views_count || 0) + 1 }).eq('id', id);
    } catch(e) {
      console.error("incrementBlogView Error:", e);
    }
  }

  static async getBlogLikes(blogId: string): Promise<number> {
    const { count, error } = await supabase
        .from('blog_likes')
        .select('*', { count: 'exact', head: true })
        .eq('blog_id', blogId);
    if (error) {
        console.error("getBlogLikes Error:", error);
        return 0;
    }
    return count || 0;
  }

  static async toggleBlogLike(blogId: string, userId: string): Promise<boolean> {
    // Check if liked
    const { data, error: selectError } = await supabase.from('blog_likes').select('id').eq('blog_id', blogId).eq('user_id', userId).maybeSingle();
    
    if (data) {
        // Unlike
        const { error: deleteError } = await supabase.from('blog_likes').delete().eq('id', data.id);
        if (deleteError) {
            console.error("Unlike Error:", deleteError);
            throw deleteError;
        }
        
        // Try to update denormalized count if exists
        try {
            const { data: current } = await supabase.from('blogs').select('likes_count').eq('id', blogId).single();
            if (current) {
                await supabase.from('blogs').update({ likes_count: Math.max(0, (current?.likes_count || 0) - 1) }).eq('id', blogId);
            }
        } catch(e) {
            console.warn("Could not update likes_count (unlike):", e);
        }
        
        // Clear cache
        this.blogsCache = null;
        return false;
    } else {
        // Like
        const { error: insertError } = await supabase.from('blog_likes').insert([{ blog_id: blogId, user_id: userId }]);
        if (insertError) {
            console.error("Like Insert Error:", insertError);
            throw insertError;
        }
        
        // Try to update denormalized count if exists
        try {
            const { data: current } = await supabase.from('blogs').select('likes_count').eq('id', blogId).single();
            if (current) {
                await supabase.from('blogs').update({ likes_count: (current?.likes_count || 0) + 1 }).eq('id', blogId);
            }
        } catch(e) {
            console.warn("Could not update likes_count (like):", e);
        }
        
        // Clear cache
        this.blogsCache = null;
        return true;
    }
  }

  static async isBlogLikedByUser(blogId: string, userId: string): Promise<boolean> {
    const { data } = await supabase.from('blog_likes').select('id').eq('blog_id', blogId).eq('user_id', userId).maybeSingle();
    return !!data;
  }

  static async getBlogComments(blogId: string): Promise<BlogComment[]> {
    const { data, error } = await supabase
        .from('blog_comments')
        .select('*')
        .eq('blog_id', blogId)
        .order('created_at', { ascending: false });
    if (error) {
        console.error("getBlogComments Error:", error);
        return [];
    }
    return data || [];
  }

  static async getUserBlogComments(userId: string): Promise<BlogComment[]> {
    try {
      const { data, error } = await supabase
          .from('blog_comments')
          .select('*')
          .eq('user_id', userId.toString())
          .order('created_at', { ascending: false });
      if (error) {
          console.error("getUserBlogComments Error:", error);
          return [];
      }
      return data || [];
    } catch (e) {
      console.error("getUserBlogComments e:", e);
      return [];
    }
  }

  static async addBlogComment(comment: Partial<BlogComment>) {
    const { error } = await supabase.from('blog_comments').insert([comment]);
    if (error) throw error;
  }

  static async saveBlog(blog: Partial<BlogPost>) {
    const payload: any = {
        title: blog.title,
        content: blog.content,
        excerpt: blog.excerpt,
        image: blog.image,
        author: blog.author,
        author_avatar: blog.authorAvatar,
        category: blog.category,
        read_time: blog.readTime,
        slug: blog.slug,
        hashtags: blog.hashtags || [],
        is_featured: blog.isFeatured || false,
        updated_at: new Date().toISOString()
    };

    if (blog.id && blog.id !== '') {
        const { error } = await supabase
            .from('blogs')
            .update(payload)
            .eq('id', blog.id);
            
        if (error) throw new Error(`Güncelleme başarısız: ${error.message}`);
    } else {
        payload.id = Math.floor(Math.random() * 999999).toString();
        payload.created_at = new Date().toISOString();
        const { error } = await supabase
            .from('blogs')
            .insert([payload]);
            
        if (error) throw new Error(`Ekleme başarısız: ${error.message}`);
    }
  }

  static async deleteBlog(id: string) {
    const { error } = await supabase.from('blogs').delete().eq('id', id);
    if (error) throw error;
  }

  // --- ADMIN SESSION ---
  static setAdminSession(token: string) { localStorage.setItem('admin_v3_session', token); }
  static isAdminLoggedIn(): boolean { return !!localStorage.getItem('admin_v3_session'); }
  static logoutAdmin() { localStorage.removeItem('admin_v3_session'); }
  
  static async init() { }

  // --- REFERRALS ---
  static async getReferralSettings(): Promise<ReferralSettings> {
    const { data } = await supabase.from('referral_settings').select('*').eq('id', 1).maybeSingle();
    return data || {
        id: '1',
        standard_reward: 10,
        premium_reward: 25,
        min_days_active: 0,
        require_group_join: true,
        group_id: '-1003826684282',
        pending_duration_hours: 24
    };
  }

  static async createReferral(referrerId: string, referredId: string, ip: string, fingerprint: string, isPremium: boolean) {
    const settings = await this.getReferralSettings();
    const reward = isPremium ? settings.premium_reward : settings.standard_reward;

    // Check if already referred
    const { data: existing } = await supabase
        .from('referrals')
        .select('id')
        .eq('referred_id', referredId)
        .maybeSingle();
    
    if (existing) return;

    // Check if referrer exists in users table to avoid foreign key error
    const { data: referrerExists } = await supabase.from('users').select('id').eq('id', referrerId).maybeSingle();
    if (!referrerExists) {
        console.warn(`Referrer ${referrerId} not found. Referral cannot be created.`);
        await this.logActivity(referredId, 'security', 'referral_failed', 'Referans Başarısız', `Davet eden kullanıcı (${referrerId}) sistemde bulunamadı.`);
        return;
    }

    const { error } = await supabase.from('referrals').insert({
        referrer_id: referrerId,
        referred_id: referredId,
        status: 'pending',
        reward_amount: reward,
        ip_address: ip,
        device_fingerprint: fingerprint,
        is_premium_referral: isPremium,
        created_at: new Date().toISOString()
    });

    if (error) throw error;

    // Update user's referred_by
    await supabase.from('users').update({ referred_by: referrerId }).eq('id', referredId);
    
    // Increment referrer's referral_count
    const { data: referrerData } = await supabase.from('users').select('referral_count').eq('id', referrerId).maybeSingle();
    const currentCount = referrerData?.referral_count || 0;
    await supabase.from('users').update({ referral_count: currentCount + 1 }).eq('id', referrerId);
    
    await this.logActivity(referrerId, 'system', 'referral_pending', 'Yeni Referans (Beklemede)', `Bir kullanıcı davet linkinizle katıldı. Onay bekleniyor.`);
  }

  static async getUserReferrals(userId: string): Promise<Referral[]> {
    const { data } = await supabase
        .from('referrals')
        .select('*, referred_user:users!referred_id(name, avatar, username)')
        .eq('referrer_id', userId)
        .order('created_at', { ascending: false });
    return data as any || [];
  }

  static async getReferralStats(userId: string) {
    const referrals = await this.getUserReferrals(userId);
    const confirmed = referrals.filter(r => r.status === 'confirmed');
    const pending = referrals.filter(r => r.status === 'pending');
    const totalEarnings = confirmed.reduce((acc, curr) => acc + curr.reward_amount, 0);

    return {
        total: referrals.length,
        confirmed: confirmed.length,
        pending: pending.length,
        earnings: totalEarnings
    };
  }

  static async getAllReferrals(): Promise<any[]> {
    const { data, error } = await supabase
        .from('referrals')
        .select(`
            *,
            referrer:users!referrer_id(username, avatar),
            referred:users!referred_id(username, avatar)
        `)
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error("Error fetching all referrals:", error);
        return [];
    }
    return data || [];
  }

  static async updateReferralSettings(settings: Partial<ReferralSettings>) {
    const { error } = await supabase
        .from('referral_settings')
        .update(settings)
        .eq('id', 1);
    
    if (error) throw error;
  }

  /**
   * Grubun katılımını kontrol eder (SİMÜLASYON)
   * Gerçekte bir Telegram Bot API çağrısı veya Supabase Edge Function gerektirir.
   */
  static async checkGroupJoin(userId: string, groupId: string): Promise<boolean> {
    // Simülasyon: %80 ihtimalle grupta varsayalım (Test için)
    return Math.random() > 0.2;
  }

  static async confirmReferral(referralId: string) {
    const { data: referral } = await supabase.from('referrals').select('*').eq('id', referralId).maybeSingle();
    if (!referral || referral.status !== 'pending') return;

    // Update referral status
    await supabase.from('referrals').update({ 
        status: 'confirmed', 
        confirmed_at: new Date().toISOString() 
    }).eq('id', referralId);

    // Update referrer's wallet and referral count
    const { data: wallet } = await this.getUserWallet(referral.referrer_id);
    await this.updateUserWallet(referral.referrer_id, {
        balance: (wallet.balance || 0) + referral.reward_amount,
        total_earned: (wallet.total_earned || 0) + referral.reward_amount
    });

    // Update referral count in user profile
    const { data: user } = await supabase.from('users').select('referral_count').eq('id', referral.referrer_id).maybeSingle();
    await supabase.from('users').update({ 
        referral_count: (user?.referral_count || 0) + 1 
    }).eq('id', referral.referrer_id);

    await this.logActivity(referral.referrer_id, 'payment', 'referral_confirmed', 'Referans Ödülü Onaylandı', `${referral.reward_amount} Hub Puanı hesabınıza eklendi.`);
  }

  // --- PAYMENTS ---
  static async createTransaction(userId: string, itemId: string, itemType: 'bot' | 'plan', amount: number, currency: string, orderId: string, senderAddress?: string) {
    const { error } = await supabase.from('transactions').insert({
        user_id: userId,
        item_id: itemId,
        item_type: itemType,
        amount,
        currency,
        order_id: orderId,
        sender_address: senderAddress,
        status: 'pending',
        created_at: new Date().toISOString()
    });
    if (error) throw error;
  }

  static async getPendingTransactions() {
    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('status', 'pending')
        .eq('currency', 'TON')
        .order('created_at', { ascending: true })
        .limit(10);
    
    if (error) throw error;
    return data || [];
  }

  static async getAllTransactions() {
    const { data, error } = await supabase
        .from('transactions')
        .select(`
            *,
            user:users(username, avatar)
        `)
        .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async getTransactionByOrderId(orderId: string) {
    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('order_id', orderId)
        .maybeSingle();
    
    if (error) throw error;
    return data;
  }

  static async getTransactionByHash(txHash: string) {
    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('tx_hash', txHash)
        .maybeSingle();
    
    if (error) throw error;
    return data;
  }

  static async updateTransactionStatus(orderId: string, status: 'completed' | 'failed', txHash?: string) {
    const { data: tx } = await supabase.from('transactions').select('*').eq('order_id', orderId).maybeSingle();
    if (!tx) return;

    const { error } = await supabase.from('transactions').update({ 
        status, 
        tx_hash: txHash,
        updated_at: new Date().toISOString() 
    }).eq('order_id', orderId);

    if (error) throw error;
    return tx;
  }

  // --- Q&A DISCUSSIONS (DIRECT CLIENT-SIDE ACCESS) ---
  static async getQADiscussions(filter: string = 'all', tag?: string) {
    try {
      let dbDiscussions = [];
      const { data: dbBlogs, error } = await supabase
        .from('qa_discussions')
        .select('*');

      if (error) {
        if (error.message.includes('relation "public.qa_discussions" does not exist') || error.message.includes('not found')) {
          console.warn("qa_discussions table missing. Fallback to blogs.");
          const { data: fallbackBlogs, error: fbError } = await supabase
            .from('blogs')
            .select('*')
            .eq('category', 'qa_forum');
          if (fbError) throw fbError;
          dbDiscussions = fallbackBlogs || [];
        } else {
          throw error;
        }
      } else {
        dbDiscussions = dbBlogs || [];
      }

      // 2. Fetch comments with broad-field structure
      let allComments: any[] = [];
      const { data: dbComs, error: comsError } = await supabase.from('qa_comments').select('*');
      if (comsError) {
        const { data: blogComs } = await supabase.from('blog_comments').select('*');
        allComments = (blogComs || []).map((c: any) => {
          let parent_id = null;
          let author_bio = "BotlyHub Forum Kaşifi";
          let text = c.content;

          if (c.content && c.content.startsWith('{')) {
            try {
              const parsed = JSON.parse(c.content);
              parent_id = parsed.parent_id || null;
              author_bio = parsed.author_bio || "BotlyHub Forum Kaşifi";
              text = parsed.text || c.content;
            } catch (e) {}
          }

          return {
            id: String(c.id),
            topic_id: c.blog_id,
            author_id: c.user_id,
            author_name: c.user_name,
            author_avatar: c.user_avatar,
            author_bio,
            content: text,
            created_at: c.created_at,
            parent_id
          };
        });
      } else if (dbComs) {
        allComments = dbComs.map((c: any) => ({
          ...c,
          id: String(c.id),
          parent_id: c.parent_id ? String(c.parent_id) : null
        }));
      }

      // 3. Fetch upvotes
      let allLikes = [];
      const { data: dbLikes, error: likesError } = await supabase.from('qa_upvotes').select('*');
      if (likesError) {
        const { data: blogLikes } = await supabase.from('blog_likes').select('*');
        allLikes = (blogLikes || []).map((l: any) => ({
          discussion_id: l.blog_id,
          user_id: l.user_id
        }));
      } else if (dbLikes) {
        allLikes = dbLikes;
      }

      // 4. Map to final structure
      let discussions = dbDiscussions.map((item: any) => {
        const topicId = item.id;
        const topicComments = allComments.filter((c: any) => c.topic_id === topicId || c.blog_id === topicId);
        const topicLikes = allLikes.filter((l: any) => l.discussion_id === topicId || l.blog_id === topicId);
        const upvoted_users = topicLikes.map((l: any) => l.user_id);
        const upvotes_count = upvoted_users.length;

        const rawTags = item.tags || item.hashtags || [];
        const tags = rawTags.map((t: string) => ({
          type: 'general',
          id: t.toLowerCase(),
          name: t
        }));

        return {
          id: item.id,
          title: item.title,
          content: item.content,
          author_id: item.author_id || item.slug || 'user-anon',
          author_name: item.author_name || item.author || 'Anonim Kaşif',
          author_avatar: item.author_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.author_name || item.author || 'Anon')}`,
          author_bio: item.author_bio || item.read_time || 'BotlyHub Forum Kaşifi',
          created_at: item.created_at,
          tags,
          upvotes_count,
          upvoted_users,
          comments_count: topicComments.length,
          comments: topicComments
        };
      });

      let filtered = [...discussions];

      if (tag) {
        const tagLower = String(tag).toLowerCase().replace('#', '').trim();
        filtered = filtered.filter(d => 
          d.tags?.some((t: any) => t.name.toLowerCase() === tagLower || t.id.toLowerCase() === tagLower)
        );
      }

      const now = Date.now();
      if (filter === 'week') {
        const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
        filtered = filtered.filter(d => new Date(d.created_at).getTime() >= weekAgo);
      } else if (filter === 'month') {
        const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
        filtered = filtered.filter(d => new Date(d.created_at).getTime() >= monthAgo);
      }

      if (filter === 'son') {
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      } else {
        filtered.sort((a, b) => b.upvotes_count - a.upvotes_count || new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }

      return filtered;
    } catch (e) {
      console.error("getQADiscussions error:", e);
      return [];
    }
  }

  static async createQADiscussion(topic: {
    title: string;
    content: string;
    author_id: any;
    author_name: string;
    author_avatar?: string;
    author_bio?: string;
    tags: any[];
  }) {
    const discId = `qa-${Date.now()}`;
    const hashtagsList = (topic.tags || []).map((t: any) => typeof t === 'string' ? t : (t?.name || t?.id || ''));

    const newQaEntry = {
      id: discId,
      title: topic.title,
      content: topic.content,
      author_id: topic.author_id ? topic.author_id.toString() : "user-anon",
      author_name: topic.author_name || "Anonim Kaşif",
      author_avatar: topic.author_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(topic.author_name || 'Anon')}&background=random&color=fff`,
      author_bio: topic.author_bio || "BotlyHub Forum Kaşifi",
      tags: hashtagsList,
      views_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from('qa_discussions').insert([newQaEntry]);
    if (error) {
      if (error.message.includes('relation "public.qa_discussions" does not exist') || error.message.includes('not found')) {
        const newBlogEntry = {
          id: discId,
          title: topic.title,
          content: topic.content,
          author: topic.author_name || "Anonim Kaşif",
          author_avatar: topic.author_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(topic.author_name || 'Anon')}&background=random&color=fff`,
          category: "qa_forum",
          read_time: topic.author_bio || "BotlyHub Forum Kaşifi",
          is_featured: false,
          slug: topic.author_id ? topic.author_id.toString() : "user-anon",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          views_count: 0,
          hashtags: hashtagsList
        };
        const { error: blogErr } = await supabase.from('blogs').insert([newBlogEntry]);
        if (blogErr) throw blogErr;
      } else {
        throw error;
      }
    }

    return {
      id: discId,
      title: topic.title,
      content: topic.content,
      author_id: newQaEntry.author_id,
      author_name: newQaEntry.author_name,
      author_avatar: newQaEntry.author_avatar,
      author_bio: newQaEntry.author_bio,
      created_at: newQaEntry.created_at,
      tags: hashtagsList.map((h: string) => ({ type: 'general', id: h.toLowerCase(), name: h })),
      upvotes_count: 0,
      upvoted_users: [],
      comments_count: 0,
      comments: []
    };
  }

  static async submitQAComment(topicId: string, comment: {
    author_id: any;
    author_name: string;
    author_avatar?: string;
    author_bio?: string;
    content: string;
    parent_id?: string | null;
  }) {
    const qaCommentPayload = {
      topic_id: topicId,
      author_id: comment.author_id ? comment.author_id.toString() : "user-anon",
      author_name: comment.author_name || "Anonim Kaşif",
      author_avatar: comment.author_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author_name || 'Anon')}&background=random&color=fff`,
      author_bio: comment.author_bio || "Kod, düşünmenin görünür kalıntısından başka bir şey değildir.",
      content: comment.content,
      parent_id: comment.parent_id || null,
      created_at: new Date().toISOString()
    };

    const { data: dbQaComment, error } = await supabase
      .from('qa_comments')
      .insert([qaCommentPayload])
      .select()
      .maybeSingle();

    if (error && (error.message.includes('relation "public.qa_comments" does not exist') || error.message.includes('not found'))) {
      const blogCommentPayload = {
        blog_id: topicId,
        user_id: comment.author_id ? comment.author_id.toString() : "user-anon",
        user_name: comment.author_name || "Anonim Kaşif",
        user_avatar: comment.author_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author_name || 'Anon')}&background=random&color=fff`,
        content: JSON.stringify({
          parent_id: comment.parent_id || null,
          author_bio: comment.author_bio || "Kod, düşünmenin görünür kalıntısından Threaded.",
          text: comment.content
        }),
        is_approved: true,
        created_at: new Date().toISOString()
      };
      const { data: dbBlogComment, error: blogErr } = await supabase
        .from('blog_comments')
        .insert([blogCommentPayload])
        .select()
        .single();

      if (blogErr) throw blogErr;

      return {
        id: String(dbBlogComment.id),
        topic_id: topicId,
        author_id: dbBlogComment.user_id,
        author_name: dbBlogComment.user_name,
        author_avatar: dbBlogComment.user_avatar,
        author_bio: comment.author_bio || "Kod, düşünmenin görünür kalıntısından başka bir şey değildir.",
        content: comment.content,
        created_at: dbBlogComment.created_at,
        likes_count: 0,
        parent_id: comment.parent_id || null
      };
    } else if (error) {
      throw error;
    } else {
      const inserted = dbQaComment || qaCommentPayload;
      return {
        id: String(inserted.id || `comment-${Date.now()}`),
        topic_id: topicId,
        author_id: inserted.author_id,
        author_name: inserted.author_name,
        author_avatar: inserted.author_avatar,
        author_bio: inserted.author_bio,
        content: inserted.content,
        created_at: inserted.created_at,
        likes_count: 0,
        parent_id: inserted.parent_id ? String(inserted.parent_id) : null
      };
    }
  }

  static async toggleQAUpvote(discussionId: string, userId: string) {
    const { data: existingQaLike, error: qaFetchError } = await supabase
      .from('qa_upvotes')
      .select('*')
      .eq('discussion_id', discussionId)
      .eq('user_id', userId)
      .maybeSingle();

    let upvoted = false;
    let upvotes_count = 0;

    if (qaFetchError && (qaFetchError.message.includes('relation "public.qa_upvotes" does not exist') || qaFetchError.message.includes('not found'))) {
      const { data: existingBlogLike } = await supabase
        .from('blog_likes')
        .select('*')
        .eq('blog_id', discussionId)
        .eq('user_id', userId)
        .maybeSingle();

      if (existingBlogLike) {
        const { error: deleteError } = await supabase
          .from('blog_likes')
          .delete()
          .eq('id', existingBlogLike.id);
        if (deleteError) throw deleteError;
        upvoted = false;
      } else {
        const { error: insertError } = await supabase
          .from('blog_likes')
          .insert([{
            blog_id: discussionId,
            user_id: userId
          }]);
        if (insertError) throw insertError;
        upvoted = true;
      }

      const { data: allBlogLikes } = await supabase
        .from('blog_likes')
        .select('id')
        .eq('blog_id', discussionId);

      upvotes_count = allBlogLikes ? allBlogLikes.length : 0;
    } else {
      if (existingQaLike) {
        const { error: deleteError } = await supabase
          .from('qa_upvotes')
          .delete()
          .eq('id', existingQaLike.id);
        if (deleteError) throw deleteError;
        upvoted = false;
      } else {
        const { error: insertError } = await supabase
          .from('qa_upvotes')
          .insert([{
            discussion_id: discussionId,
            user_id: userId
          }]);
        if (insertError) throw insertError;
        upvoted = true;
      }

      const { data: allQaLikes } = await supabase
        .from('qa_upvotes')
        .select('id')
        .eq('discussion_id', discussionId);

      upvotes_count = allQaLikes ? allQaLikes.length : 0;
    }

    return { upvotes_count, upvoted };
  }
}

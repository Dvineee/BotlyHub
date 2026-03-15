
import { createClient } from '@supabase/supabase-js';
import { Bot, User, Channel, Announcement, Notification, UserBot, ActivityLog, Promotion } from '../types';

const SUPABASE_URL = 'https://yrbnzyvbhitlquaxnruc.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_h9QTmZjwi0pH_JX6i4xfWg_LJFY86GP'; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export class DatabaseService {
  
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
    
    // Check if user exists to log registration
    const { data: existing } = await supabase.from('users').select('id').eq('id', user.id.toString()).maybeSingle();
    
    const { error } = await supabase.from('users').upsert({ 
        id: user.id.toString(), 
        name: user.name, 
        username: user.username, 
        avatar: user.avatar, 
        email: user.email, 
        joindate: new Date().toISOString(), 
        role: user.role || 'User', 
        status: user.status || 'Active' 
    }, { onConflict: 'id' });
    
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
        icon: c.icon || '', 
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

  static async updateChannelAdStatus(channelId: string, status: boolean) {
      const { error } = await supabase.from('channels').update({ revenue_enabled: status }).eq('id', channelId);
      if (error) throw error;
  }

  // --- BOTS ---
  static async getBots(): Promise<Bot[]> {
    const { data } = await supabase.from('bots').select('*').order('id', { ascending: false });
    return data || [];
  }

  static async getBotById(id: string): Promise<Bot | null> {
    const { data } = await supabase.from('bots').select('*').eq('id', id).maybeSingle();
    return data;
  }

  static async saveBot(bot: any) {
    const { error } = await supabase.from('bots').upsert({ 
        id: bot.id, 
        name: bot.name, 
        description: bot.description, 
        price: Number(bot.price), 
        category: bot.category, 
        bot_link: bot.bot_link, 
        screenshots: bot.screenshots || [], 
        icon: bot.icon, 
        is_premium: Boolean(bot.is_premium) 
    });
    if (error) throw error;
  }

  static async deleteBot(id: string) {
    const { error } = await supabase.from('bots').delete().eq('id', id);
    if (error) throw error;
  }

  static async getBotsWithStats(): Promise<any[]> {
    const { data: bots } = await supabase.from('bots').select('*').order('id', { ascending: false });
    const { data: userBots } = await supabase.from('user_bots').select('bot_id');
    return (bots || []).map(bot => ({ 
        ...bot, 
        ownerCount: (userBots || []).filter((ub: any) => ub.bot_id === bot.id).length 
    }));
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
    const [u, b, l, s, c] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('bots').select('*', { count: 'exact', head: true }),
        supabase.from('bot_logs').select('*', { count: 'exact', head: true }),
        supabase.from('user_bots').select('*', { count: 'exact', head: true }),
        supabase.from('channels').select('revenue')
    ]);
    const totalRevenue = (c.data || []).reduce((acc, curr) => acc + (Number(curr.revenue) || 0), 0);
    return { userCount: u.count || 0, botCount: b.count || 0, logCount: l.count || 0, salesCount: s.count || 0, totalRevenue };
  }

  static async getSettings() {
    const { data } = await supabase.from('settings').select('*').eq('id', 1).maybeSingle();
    return data ? { ...data, maintenanceMode: Boolean(data.maintenance_mode) } : null;
  }

  static async updateSettings(updates: { maintenance_mode?: boolean }) {
    const { error } = await supabase.from('settings').update(updates).eq('id', 1);
    if (error) throw error;
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

  static async getActivityLogs(): Promise<ActivityLog[]> {
    const { data } = await supabase.from('bot_logs').select('*').order('created_at', { ascending: false }).limit(200);
    return data || [];
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

  // --- ADMIN SESSION ---
  static setAdminSession(token: string) { localStorage.setItem('admin_v3_session', token); }
  static isAdminLoggedIn(): boolean { return !!localStorage.getItem('admin_v3_session'); }
  static logoutAdmin() { localStorage.removeItem('admin_v3_session'); }
  
  static async init() { }
}

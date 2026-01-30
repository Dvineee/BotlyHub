
import { createClient } from '@supabase/supabase-js';
import { Bot, User, Channel, Announcement, Notification, UserBot, ActivityLog, Promotion } from '../types';

const SUPABASE_URL = 'https://ybnxfwqrduuinzgnbymc.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_VeYQ304ZpUpj3ymB3ihpjw_jt49W1G-'; 

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
        processed_channels: p.processed_channels || []
    }));
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
        channel_count: Number(promo.channel_count || 0)
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
      return true;
  }

  static async deletePromotion(id: string) {
    const { error } = await supabase.from('promotions').delete().eq('id', id);
    if (error) throw error;
  }

  // --- USERS ---
  static async syncUser(user: Partial<User>) {
    if (!user.id) return;
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
  }

  static async getUserById(userId: string): Promise<User | null> {
    const { data } = await supabase.from('users').select('*').eq('id', userId.toString()).maybeSingle();
    if (!data) return null;
    return {
        ...data,
        joinDate: data.joindate,
        canPublishPromos: data.can_publish_promos
    };
  }

  static async getUsers(): Promise<User[]> {
      const { data } = await supabase.from('users').select('*').order('joindate', { ascending: false });
      return (data || []).map(u => ({ ...u, joinDate: u.joindate }));
  }

  static async updateUserStatus(userId: string, status: 'Active' | 'Passive') {
      const { error } = await supabase.from('users').update({ status }).eq('id', userId);
      if (error) throw error;
  }

  // --- CHANNELS & DISCOVERY ---
  static async getChannels(userId: string): Promise<Channel[]> {
    const { data } = await supabase.from('channels').select('*').eq('user_id', userId.toString()).order('created_at', { ascending: false });
    // Fix: Correct property mapping from connected_bot_ids to connectedBotIds to match Channel interface
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
                      revenue: 0 
                  });
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
    const { data } = await supabase.from('user_bots').select('*, bots(*)').eq('user_id', userId.toString());
    return (data || []).map((item: any) => ({ 
        ...item.bots, 
        expiryDate: item.expiryDate, 
        ownership_id: item.id, 
        is_premium: item.is_premium, 
        isActive: item.is_active, 
        revenueEnabled: false 
    })).filter(b => b.id);
  }

  static async addUserBot(userData: any, botData: Bot, isPremium: boolean = false) {
    const userId = (userData.id || userData).toString();
    const { error } = await supabase.from('user_bots').upsert({ 
        user_id: userId, 
        bot_id: botData.id, 
        is_active: true, 
        is_premium: isPremium, 
        acquired_at: new Date().toISOString() 
    });
    if (error) throw error;
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
        supabase.from('activity_logs').select('*', { count: 'exact', head: true }),
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

  static async logActivity(userId: string, type: ActivityLog['type'], actionKey: string, title: string, description: string) {
      await supabase.from('activity_logs').insert({ 
          user_id: String(userId), 
          type, 
          action_key: actionKey, 
          title, 
          description, 
          created_at: new Date().toISOString() 
      });
  }

  static async getActivityLogs(): Promise<ActivityLog[]> {
    const { data } = await supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(50);
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

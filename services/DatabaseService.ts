
import { createClient } from '@supabase/supabase-js';
import { Bot, User, Channel, Announcement, Notification, UserBot, ActivityLog, Promotion } from '../types';

const SUPABASE_URL = 'https://ybnxfwqrduuinzgnbymc.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_VeYQ304ZpUpj3ymB3ihpjw_jt49W1G-'; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// UUID v4 üretici (Veritabanı UUID beklediği için standart formatta üretim yapar)
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export class DatabaseService {
  
  // --- PROMOTIONS ---
  static async getPromotions(): Promise<Promotion[]> {
    try {
        const { data, error } = await supabase.from('promotions').select('*').order('created_at', { ascending: false });
        if (error) {
            console.error("Fetch Promotions Error:", error);
            return [];
        }
        return data || [];
    } catch (e) {
        return [];
    }
  }

  /**
   * Reklam kaydını veritabanına kaydeder.
   * UUID HATASI ÇÖZÜMÜ: Geçersiz string ID yerine gerçek UUID v4 kullanılır.
   */
  static async savePromotion(promo: Partial<Promotion>) {
    try {
        // Eğer promo.id bir UUID değilse veya boşsa yeni bir UUID oluştur
        const isUUID = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
        
        const payload: any = {
            id: (promo.id && isUUID(promo.id)) ? promo.id : generateUUID(),
            title: promo.title || '',
            content: promo.content || '',
            image_url: promo.image_url || '',
            button_text: promo.button_text || 'İNCELE',
            button_link: promo.button_link || '',
            status: promo.status || 'pending',
            created_at: promo.created_at || new Date().toISOString()
        };

        const { error } = await supabase
            .from('promotions')
            .upsert(payload, { onConflict: 'id' });

        if (error) {
            console.error("Supabase Persistence Error:", error);
            throw new Error(`Veritabanı Hatası: ${error.message}`);
        }
        
        return true;
    } catch (err: any) {
        console.error("DatabaseService.savePromotion Exception:", err);
        throw err;
    }
  }

  static async deletePromotion(id: string) {
    const { error } = await supabase.from('promotions').delete().eq('id', id);
    if (error) throw error;
  }

  static async updatePromotionStatus(id: string, status: Promotion['status']) {
      const { error } = await supabase.from('promotions').update({ status }).eq('id', id);
      if (error) throw error;
  }

  // --- USERS ---
  static async getUsers(): Promise<User[]> {
    const { data, error } = await supabase.from('users').select('*').order('joindate', { ascending: false });
    if (error) return [];
    return (data || []).map(u => ({ 
        id: u.id, 
        name: u.name, 
        username: u.username, 
        avatar: u.avatar, 
        role: (u.role || 'User') as any, 
        status: (u.status || 'Active') as any, 
        badges: u.badges || [], 
        joinDate: u.joindate, 
        email: u.email,
        canPublishPromos: u.can_publish_promos 
    }));
  }

  static async getUserById(userId: string): Promise<User | null> {
    const { data, error } = await supabase.from('users').select('*').eq('id', userId.toString()).maybeSingle();
    if (error || !data) return null;
    return { 
        id: data.id, 
        name: data.name, 
        username: data.username, 
        avatar: data.avatar, 
        role: (data.role || 'User') as any, 
        status: (data.status || 'Active') as any, 
        badges: data.badges || [], 
        joinDate: data.joindate, 
        email: data.email,
        canPublishPromos: data.can_publish_promos 
    };
  }

  static async updateUserStatus(userId: string, status: 'Active' | 'Passive') {
    const { error } = await supabase.from('users').update({ status }).eq('id', userId.toString());
    if (error) throw error;
  }

  // --- NOTIFICATIONS ---
  static async sendGlobalNotification(title: string, message: string, type: Notification['type'] = 'system') {
      const { error } = await supabase.from('notifications').insert([{ 
          id: Math.floor(Math.random() * 999999999).toString(), 
          title, 
          message, 
          type, 
          date: new Date().toISOString(), 
          isRead: false, 
          target_type: 'global',
          view_count: 0
      }]);
      if (error) throw error;
  }

  static async sendUserNotification(userId: string, title: string, message: string, type: Notification['type'] = 'system') {
      const { error } = await supabase.from('notifications').insert([{ 
          id: Math.floor(Math.random() * 999999999).toString(), 
          user_id: userId.toString(),
          title, 
          message, 
          type, 
          date: new Date().toISOString(), 
          isRead: false, 
          target_type: 'user',
          view_count: 0
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
          const current = Number(data.view_count || 0);
          await supabase.from('notifications').update({ view_count: current + 1 }).eq('id', id);
      }
  }

  // --- LOGS ---
  static async getActivityLogs(): Promise<ActivityLog[]> {
    const { data, error } = await supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(50);
    if (error) return [];
    return data || [];
  }

  // --- BOT MANAGEMENT ---
  static async getBotsWithStats(): Promise<any[]> {
    const { data: bots } = await supabase.from('bots').select('*').order('id', { ascending: false });
    const { data: userBots } = await supabase.from('user_bots').select('bot_id');
    return (bots || []).map(bot => ({ 
        ...bot, 
        ownerCount: (userBots || []).filter((ub: any) => ub.bot_id === bot.id).length 
    }));
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

  // --- FINANCE ---
  static async getAllPurchases() {
    const { data } = await supabase.from('user_bots').select('*, users(*), bots(*)').order('acquired_at', { ascending: false });
    return data || [];
  }

  // --- STATS ---
  static async getAdminStats() {
    const [u, b, l, s, c] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('bots').select('*', { count: 'exact', head: true }),
        supabase.from('activity_logs').select('*', { count: 'exact', head: true }),
        supabase.from('user_bots').select('*', { count: 'exact', head: true }),
        supabase.from('channels').select('revenue', { head: false })
    ]);
    const totalRevenue = (c.data || []).reduce((acc, curr) => acc + (curr.revenue || 0), 0);
    return { userCount: u.count || 0, botCount: b.count || 0, logCount: l.count || 0, salesCount: s.count || 0, totalRevenue };
  }

  // --- ANNOUNCEMENTS ---
  static async saveAnnouncement(ann: any) {
    const { error } = await supabase.from('announcements').upsert({ 
        id: ann.id || Math.floor(Math.random() * 999999).toString(), 
        title: ann.title, 
        description: ann.description, 
        button_text: ann.button_text, 
        button_link: ann.button_link, 
        icon_name: ann.icon_name, 
        color_scheme: ann.color_scheme, 
        is_active: Boolean(ann.is_active), 
        action_type: ann.action_type, 
        content_detail: ann.content_detail || '' 
    });
    if (error) throw error;
  }

  static async deleteAnnouncement(id: string) {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) throw error;
  }

  // --- BOT DATA ---
  static async getUserBots(userId: string): Promise<UserBot[]> {
    const { data } = await supabase.from('user_bots').select('*, bots(*)').eq('user_id', userId.toString());
    return (data || []).map((item: any) => ({ ...item.bots, expiryDate: item.expiryDate, ownership_id: item.id, is_premium: item.is_premium, isActive: item.is_active, revenueEnabled: false })).filter(b => b.id);
  }

  static async getBots(): Promise<Bot[]> {
    const { data } = await supabase.from('bots').select('*').order('id', { ascending: false });
    return data || [];
  }

  static async getBotById(id: string): Promise<Bot | null> {
    const { data } = await supabase.from('bots').select('*').eq('id', id).maybeSingle();
    return data;
  }

  static async isBotOwnedByUser(userId: string, botId: string): Promise<boolean> {
    const { data } = await supabase.from('user_bots').select('id').eq('user_id', userId.toString()).eq('bot_id', botId.toString()).maybeSingle();
    return !!data;
  }

  static async addUserBot(userData: any, botData: Bot, isPremium: boolean = false) {
    const userId = (userData.id || userData).toString();
    const { error } = await supabase.from('user_bots').upsert({ user_id: userId, bot_id: botData.id, is_active: true, is_premium: isPremium, acquired_at: new Date().toISOString() });
    return !error;
  }

  static async removeUserBot(userId: string, botId: string) {
    await supabase.from('user_bots').delete().eq('user_id', userId.toString()).eq('bot_id', botId.toString());
  }

  // --- CHANNELS ---
  static async getChannels(userId: string): Promise<Channel[]> {
    const { data } = await supabase.from('channels').select('*').eq('user_id', userId.toString()).order('created_at', { ascending: false });
    return (data || []).map(c => ({ id: String(c.id), user_id: String(c.user_id), telegram_id: String(c.telegram_id), name: c.name, memberCount: c.member_count || 0, icon: c.icon || '', revenueEnabled: c.revenue_enabled, connectedBotIds: c.connected_bot_ids || [], revenue: Number(c.revenue || 0) }));
  }

  static async updateChannelAdStatus(channelId: string, status: boolean) {
      await supabase.from('channels').update({ revenue_enabled: status }).eq('id', channelId);
  }

  static async syncChannelsFromBotActivity(userId: string): Promise<number> {
      try {
          const uIdStr = String(userId).trim();
          const { data: logs } = await supabase.from('bot_discovery_logs').select('*').eq('owner_id', uIdStr).eq('is_synced', false);
          if (!logs || logs.length === 0) return 0;
          let count = 0;
          for (const log of logs) {
              const telegramId = String(log.chat_id || log.telegram_id || '').trim();
              if (!telegramId) continue;
              const { data: existing } = await supabase.from('channels').select('*').eq('user_id', uIdStr).eq('telegram_id', telegramId).maybeSingle();
              if (existing) {
                  await supabase.from('channels').update({ member_count: log.member_count, revenue_enabled: true }).eq('id', existing.id);
              } else {
                  await supabase.from('channels').insert({ user_id: uIdStr, telegram_id: telegramId, name: log.channel_name, member_count: log.member_count, revenue_enabled: true, revenue: 0 });
              }
              await supabase.from('bot_discovery_logs').update({ is_synced: true }).eq('id', log.id);
              count++;
          }
          return count;
      } catch (e) { return 0; }
  }

  static async syncUser(user: Partial<User>) {
    if (!user.id) return;
    await supabase.from('users').upsert({ id: user.id.toString(), name: user.name, username: user.username, avatar: user.avatar, email: user.email, joindate: new Date().toISOString(), role: user.role || 'User', status: user.status || 'Active' }, { onConflict: 'id' });
  }

  static async logActivity(userId: string, type: ActivityLog['type'], actionKey: string, title: string, description: string, metadata: any = {}) {
      try { await supabase.from('activity_logs').insert({ user_id: String(userId), type, action_key: actionKey, title, description, metadata, created_at: new Date().toISOString() }); } catch (e) {}
  }

  static async getAnnouncements(): Promise<Announcement[]> {
    const { data } = await supabase.from('announcements').select('*').order('id', { ascending: false });
    return data || [];
  }

  static async getNotifications(userId?: string): Promise<Notification[]> {
    const query = supabase.from('notifications').select('*').order('date', { ascending: false });
    if (userId) query.or(`user_id.eq.${userId},target_type.eq.global`);
    const { data } = await query;
    return (data || []).map(n => ({ 
        id: String(n.id), 
        type: n.type, 
        title: n.title, 
        message: n.message, 
        date: n.date, 
        isRead: n.isRead, 
        user_id: n.user_id, 
        target_type: n.target_type,
        view_count: Number(n.view_count || 0)
    }));
  }

  static markNotificationRead(id: string) { return supabase.from('notifications').update({ isRead: true }).eq('id', id); }

  static async getSettings() {
    const { data } = await supabase.from('settings').select('*').maybeSingle();
    return data ? { ...data, maintenanceMode: Boolean(data.MaintenanceMode) } : null;
  }

  static setAdminSession(token: string) { localStorage.setItem('admin_v3_session', token); }
  static isAdminLoggedIn(): boolean { return !!localStorage.getItem('admin_v3_session'); }
  static logoutAdmin() { localStorage.removeItem('admin_v3_session'); }
  static async init() {}
}

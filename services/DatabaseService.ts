
import { createClient } from '@supabase/supabase-js';
import { Bot, User, Channel, Announcement, Notification, UserBot, ActivityLog, Ad } from '../types';

const SUPABASE_URL = 'https://ybnxfwqrduuinzgnbymc.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_VeYQ304ZpUpj3ymB3ihpjw_jt49W1G-'; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export class DatabaseService {
  
  // --- BİLDİRİM YÖNETİMİ ---
  static async sendGlobalNotification(title: string, message: string, type: Notification['type'] = 'system') {
      const { data, error } = await supabase.from('notifications').insert([
        {
          title: title.trim(),
          message: message.trim(),
          type: type,
          date: new Date().toISOString(),
          isRead: false,
          target_type: 'global'
        }
      ]).select();
      
      if (error) {
          console.error("Supabase Notification Error:", error);
          throw error;
      }
      return data;
  }

  static async getNotifications(userId?: string): Promise<Notification[]> {
    if (!userId) return [];
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .or(`user_id.eq.${userId},target_type.eq.global`)
        .order('date', { ascending: false });
        
    if (error) return [];
    return (data || []).map(n => ({ 
        id: String(n.id), 
        type: n.type, 
        title: n.title, 
        message: n.message, 
        date: n.date, 
        isRead: n.isRead, 
        user_id: n.user_id, 
        target_type: n.target_type 
    }));
  }

  static async markNotificationRead(id: string) {
    await supabase.from('notifications').update({ isRead: true }).eq('id', id);
  }

  // --- REKLAM YÖNETİMİ ---
  static async getAds(): Promise<Ad[]> {
      const { data } = await supabase.from('ads').select('*').order('created_at', { ascending: false });
      return data || [];
  }

  static async createAd(ad: Partial<Ad>) {
      const { error } = await supabase.from('ads').insert({
          title: ad.title,
          content: ad.content,
          image_url: ad.image_url,
          button_text: ad.button_text,
          button_link: ad.button_link,
          status: 'pending',
          total_reach: 0,
          channel_count: 0,
          created_at: new Date().toISOString()
      });
      if (error) throw error;
  }

  static async deleteAd(id: string) {
      await supabase.from('ads').delete().eq('id', id);
  }

  // --- KANAL VE LOG YÖNETİMİ ---
  static async logActivity(userId: string, type: ActivityLog['type'], actionKey: string, title: string, description: string, metadata: any = {}) {
      try {
          const uIdStr = String(userId).trim();
          await supabase.from('activity_logs').insert({
              user_id: uIdStr,
              type,
              action_key: actionKey,
              title,
              description,
              metadata: { ...metadata, client_time: new Date().toISOString(), platform: 'Telegram_Web' },
              created_at: new Date().toISOString()
          });
      } catch (e) { console.error(e); }
  }

  static async updateChannelAdStatus(channelId: string, status: boolean) {
      const { error } = await supabase.from('channels').update({ is_ad_enabled: status }).eq('id', channelId);
      if (error) throw error;
  }

  static async syncChannelsFromBotActivity(userId: string): Promise<number> {
      try {
          const uIdStr = String(userId).trim();
          const { data: logs, error: logErr } = await supabase.from('bot_discovery_logs').select('*').eq('owner_id', uIdStr).eq('is_synced', false);
          
          if (logErr || !logs || logs.length === 0) return 0;
          
          let successCount = 0;
          for (const log of logs) {
              const botId = String(log.bot_id);
              const telegramId = String(log.chat_id || log.telegram_id || '').trim();

              if (!telegramId) continue;

              const { data: existing } = await supabase.from('channels').select('*').eq('user_id', uIdStr).eq('telegram_id', telegramId).maybeSingle();
              
              let syncOk = false;
              if (existing) {
                  const bots = Array.from(new Set([...(existing.connected_bot_ids || []), botId]));
                  const { error: upErr } = await supabase.from('channels').update({ 
                      member_count: log.member_count || existing.member_count, 
                      connected_bot_ids: bots, 
                      icon: log.channel_icon || existing.icon,
                      name: log.channel_name || existing.name,
                      is_ad_enabled: true 
                  }).eq('id', existing.id);
                  if (!upErr) syncOk = true;
              } else {
                  const { error: insErr } = await supabase.from('channels').insert({ 
                      user_id: uIdStr, 
                      telegram_id: telegramId, 
                      name: log.channel_name || 'İsimsiz Kanal', 
                      member_count: log.member_count || 0, 
                      icon: log.channel_icon || `https://ui-avatars.com/api/?name=${encodeURIComponent(log.channel_name || 'CH')}`, 
                      connected_bot_ids: [botId], 
                      revenue: 0,
                      is_ad_enabled: true
                  });
                  if (!insErr) syncOk = true;
              }
              
              if (syncOk) {
                  await supabase.from('bot_discovery_logs').update({ is_synced: true }).eq('id', log.id);
                  successCount++;
              }
          }
          return successCount;
      } catch (e) { 
          console.error("SyncChannels Error:", e);
          return 0; 
      }
  }

  static async getChannels(userId: string): Promise<Channel[]> {
    const uIdStr = String(userId).trim();
    const { data } = await supabase.from('channels').select('*').eq('user_id', uIdStr).order('created_at', { ascending: false });
    return (data || []).map(c => ({ 
        id: String(c.id), 
        user_id: String(c.user_id), 
        telegram_id: String(c.telegram_id || ''),
        name: c.name, 
        memberCount: c.member_count || 0, 
        icon: c.icon || '', 
        isAdEnabled: c.is_ad_enabled || false, 
        connectedBotIds: c.connected_bot_ids || [], 
        revenue: Number(c.revenue || 0) 
    }));
  }

  static async removeUserBot(userId: string, botId: string) {
    await supabase.from('user_bots').delete().eq('user_id', userId.toString()).eq('bot_id', botId.toString());
  }

  static async getBotById(id: string): Promise<Bot | null> {
    const { data } = await supabase.from('bots').select('*').eq('id', id).maybeSingle();
    return data;
  }

  static async getBots(category?: string): Promise<Bot[]> {
    let query = supabase.from('bots').select('*').order('id', { ascending: false });
    if (category && category !== 'all') query = query.eq('category', category);
    const { data } = await query;
    return data || [];
  }

  static async getBotsWithStats(): Promise<any[]> {
      const { data: bots } = await supabase.from('bots').select('*').order('id', { ascending: false });
      const { data: owners } = await supabase.from('user_bots').select('bot_id');
      return (bots || []).map(bot => ({ ...bot, ownerCount: (owners || []).filter(o => o.bot_id === bot.id).length }));
  }

  static async getUserBots(userId: string): Promise<UserBot[]> {
    const { data } = await supabase.from('user_bots').select('*, bots(*)').eq('user_id', userId.toString());
    if (!data) return [];
    return data.map((item: any) => ({ ...item.bots, expiryDate: item.expiryDate, ownership_id: item.id, is_premium: item.is_premium, is_active: item.is_active })).filter(b => b.id);
  }

  static async addUserBot(userData: any, botData: Bot, isPremium: boolean = false) {
    const userId = (userData.id || userData).toString();
    const { error } = await supabase.from('user_bots').upsert({ user_id: userId, bot_id: botData.id, is_active: true, is_premium: isPremium, acquired_at: new Date().toISOString() });
    if (error) throw error;
    return true;
  }

  static async syncUser(user: Partial<User>) {
    if (!user.id) return;
    await supabase.from('users').upsert({ id: user.id.toString(), name: user.name, username: user.username, avatar: user.avatar, email: user.email, joindate: new Date().toISOString(), joinDate: new Date().toISOString() }, { onConflict: 'id' });
  }

  static async getUserById(userId: string): Promise<User | null> {
    const { data } = await supabase.from('users').select('*').eq('id', userId.toString()).maybeSingle();
    if (!data) return null;
    return { id: data.id, name: data.name, username: data.username, avatar: data.avatar, role: data.role || 'User', status: data.status || 'Active', badges: data.badges || [], joinDate: data.joindate, email: data.email };
  }

  static async getSettings() {
    const { data } = await supabase.from('settings').select('*').maybeSingle();
    if (data) {
        return {
            ...data,
            maintenanceMode: Boolean(data.MaintenanceMode)
        };
    }
    return data;
  }

  static async getAnnouncements(): Promise<Announcement[]> {
    const { data } = await supabase.from('announcements').select('*').order('id', { ascending: false });
    return data || [];
  }

  static async getUsers(): Promise<User[]> {
    const { data } = await supabase.from('users').select('*').order('joindate', { ascending: false });
    return (data || []).map(u => ({ id: u.id, name: u.name, username: u.username, avatar: u.avatar, role: u.role || 'User', status: u.status || 'Active', badges: u.badges || [], joinDate: u.joindate, email: u.email }));
  }

  static async updateUserStatus(userId: string, status: string) {
    await supabase.from('users').update({ status }).eq('id', userId);
  }

  static async getAdminStats() {
    const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { count: botCount } = await supabase.from('bots').select('*', { count: 'exact', head: true });
    const { count: logCount } = await supabase.from('activity_logs').select('*', { count: 'exact', head: true });
    const { count: salesCount } = await supabase.from('user_bots').select('*', { count: 'exact', head: true });
    return { userCount: userCount || 0, botCount: botCount || 0, logCount: logCount || 0, salesCount: salesCount || 0 };
  }

  static async getAllPurchases() {
    const { data } = await supabase.from('user_bots').select('*, users(*), bots(*)').order('acquired_at', { ascending: false });
    return data || [];
  }

  static async saveBot(bot: any) {
    const screenshots = Array.isArray(bot.screenshots) 
      ? bot.screenshots 
      : String(bot.screenshots || '').split(',').map((s: string) => s.trim()).filter(Boolean);

    const dbPayload = { 
        id: String(bot.id), 
        name: String(bot.name), 
        description: String(bot.description), 
        short_desc: String(bot.short_desc || ''),
        price: Number(bot.price), 
        category: String(bot.category), 
        bot_link: String(bot.bot_link), 
        is_premium: Boolean(bot.is_premium),
        screenshots: screenshots, 
        icon: String(bot.icon || '') 
    };
    const { error } = await supabase.from('bots').upsert(dbPayload, { onConflict: 'id' });
    if (error) throw error;
  }

  static async deleteBot(id: string) {
    const { error } = await supabase.from('bots').delete().eq('id', id);
    if (error) throw error;
  }

  static async saveSettings(settings: any) {
    const { error } = await supabase.from('settings').upsert({ 
        id: 1, 
        appName: settings.appName, 
        MaintenanceMode: Boolean(settings.maintenanceMode),
        commissionRate: Number(settings.commissionRate),
        supportLink: String(settings.supportLink),
        termsUrl: String(settings.termsUrl),
        instagramUrl: String(settings.instagramUrl),
        telegramChannelUrl: String(settings.telegramChannelUrl)
    });
    if (error) throw error;
  }

  static setAdminSession(token: string) { localStorage.setItem('admin_v3_session', token); }
  static isAdminLoggedIn(): boolean { return !!localStorage.getItem('admin_v3_session'); }
  static logoutAdmin() { localStorage.removeItem('admin_v3_session'); }
  static async init() {}
}

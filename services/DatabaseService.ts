
import { createClient } from '@supabase/supabase-js';
import { Bot, User, Channel, Announcement, Notification, UserBot, ActivityLog } from '../types';

const SUPABASE_URL = 'https://ybnxfwqrduuinzgnbymc.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_VeYQ304ZpUpj3ymB3ihpjw_jt49W1G-'; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export class DatabaseService {
  
  static async logActivity(
      userId: string, 
      type: ActivityLog['type'], 
      actionKey: string, 
      title: string, 
      description: string,
      metadata: any = {}
  ) {
      try {
          const uIdStr = String(userId).trim();
          await supabase.from('activity_logs').insert({
              user_id: uIdStr,
              type,
              action_key: actionKey,
              title,
              description,
              metadata: {
                  ...metadata,
                  client_time: new Date().toISOString(),
                  platform: 'Telegram_Web'
              },
              created_at: new Date().toISOString()
          });
      } catch (e) {
          console.error("[AUDIT-LOG-FAIL]", e);
      }
  }

  static async syncChannelsFromBotActivity(userId: string): Promise<number> {
      try {
          const uIdStr = String(userId).trim();
          const { data: logs, error: logErr } = await supabase
              .from('bot_discovery_logs')
              .select('*')
              .eq('owner_id', uIdStr)
              .eq('is_synced', false);

          if (logErr || !logs || logs.length === 0) return 0;

          let successCount = 0;
          for (const log of logs) {
              const botId = String(log.bot_id);
              
              const { data: existing } = await supabase
                  .from('channels')
                  .select('*')
                  .eq('user_id', uIdStr)
                  .eq('name', log.channel_name)
                  .maybeSingle();

              let syncOk = false;
              if (existing) {
                  const bots = Array.from(new Set([...(existing.connected_bot_ids || []), botId]));
                  const { error: upErr } = await supabase
                      .from('channels')
                      .update({
                          member_count: log.member_count,
                          connected_bot_ids: bots,
                          icon: log.channel_icon || existing.icon 
                      })
                      .eq('id', existing.id);
                  if (!upErr) syncOk = true;
              } else {
                  const { error: insErr } = await supabase
                      .from('channels')
                      .insert({
                          user_id: uIdStr,
                          name: log.channel_name,
                          member_count: log.member_count || 0,
                          icon: log.channel_icon || `https://ui-avatars.com/api/?name=${encodeURIComponent(log.channel_name)}`,
                          connected_bot_ids: [botId],
                          revenue: 0
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
          console.error("[SYNC] Error:", e);
          return 0;
      }
  }

  static async getChannels(userId: string): Promise<Channel[]> {
    const uIdStr = String(userId).trim();
    const { data } = await supabase.from('channels').select('*').eq('user_id', uIdStr).order('created_at', { ascending: false });
    return (data || []).map(c => ({
        id: String(c.id),
        user_id: String(c.user_id),
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
      return (bots || []).map(bot => ({
          ...bot,
          ownerCount: (owners || []).filter(o => o.bot_id === bot.id).length
      }));
  }

  static async getUserBots(userId: string): Promise<UserBot[]> {
    const { data } = await supabase.from('user_bots').select('*, bots(*)').eq('user_id', userId.toString());
    if (!data) return [];
    return data.map((item: any) => ({ 
        ...item.bots, 
        expiryDate: item.expiryDate, 
        ownership_id: item.id,
        is_premium: item.is_premium,
        is_active: item.is_active
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

  static async syncUser(user: Partial<User>) {
    if (!user.id) return;
    await supabase.from('users').upsert({ 
        id: user.id.toString(), 
        name: user.name, 
        username: user.username, 
        avatar: user.avatar, 
        email: user.email, 
        joindate: new Date().toISOString(),
        joinDate: new Date().toISOString() 
    }, { onConflict: 'id' });
  }

  static async getUserById(userId: string): Promise<User | null> {
    const { data } = await supabase.from('users').select('*').eq('id', userId.toString()).maybeSingle();
    if (!data) return null;
    return { id: data.id, name: data.name, username: data.username, avatar: data.avatar, role: data.role || 'User', status: data.status || 'Active', badges: data.badges || [], joinDate: data.joindate, email: data.email };
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
    const { error } = await supabase
        .from('notifications')
        .update({ isRead: true })
        .eq('id', id);
    if (error) throw error;
  }

  static async getSettings() {
    const { data } = await supabase.from('settings').select('*').maybeSingle();
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
    // Sadece veritabanı şemasında bulunan kolonları gönder (Strict Pick)
    // ownerCount, isNew, features gibi UI-only alanları temizler
    const dbPayload = {
        id: bot.id,
        name: bot.name,
        description: bot.description,
        icon: bot.icon,
        price: bot.price,
        category: bot.category,
        bot_link: bot.bot_link,
        screenshots: bot.screenshots
    };

    const { error } = await supabase.from('bots').upsert(dbPayload);
    if (error) {
        console.error("Supabase Save Bot Detail Error:", error);
        throw error;
    }
  }

  static async deleteBot(id: string) {
    const { error } = await supabase.from('bots').delete().eq('id', id);
    if (error) throw error;
  }

  static async sendNotification(notification: any) {
    const uniqueId = Math.random().toString(36).substring(2, 15);
    const payload = {
        id: uniqueId, 
        title: notification.title,
        message: notification.message,
        type: notification.type || 'system',
        target_type: 'global', 
        user_id: null, 
        date: new Date().toISOString(),
        isRead: false 
    };

    const { error } = await supabase.from('notifications').insert(payload);
    if (error) {
        console.error("DB Notification Insert Error:", error);
        throw error;
    }
  }

  static async saveSettings(settings: any) {
    await supabase.from('settings').upsert({ 
        id: 1, 
        appName: settings.appName,
        MaintenanceMode: settings.maintenanceMode 
    });
  }

  static setAdminSession(token: string) { localStorage.setItem('admin_v3_session', token); }
  static isAdminLoggedIn(): boolean { return !!localStorage.getItem('admin_v3_session'); }
  static logoutAdmin() { localStorage.removeItem('admin_v3_session'); }
  static async init() {}
}

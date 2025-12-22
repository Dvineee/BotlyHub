
import { createClient } from '@supabase/supabase-js';
import { Bot, User, Channel, Announcement, Notification, UserBot } from '../types';

const SUPABASE_URL = 'https://ybnxfwqrduuinzgnbymc.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_VeYQ304ZpUpj3ymB3ihpjw_jt49W1G-'; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export class DatabaseService {
  
  static async syncChannelsFromBotActivity(userId: string): Promise<number> {
      try {
          // ID'yi temizle ve string'e zorla
          const uIdStr = String(userId).trim();
          console.log("[SYNC] İşlem Başladı. UserID:", uIdStr);
          
          // 1. İşlenmemiş logları al
          const { data: logs, error: logErr } = await supabase
              .from('bot_discovery_logs')
              .select('*')
              .eq('owner_id', uIdStr)
              .eq('is_synced', false);

          if (logErr) {
              console.error("[SYNC] Log çekme hatası:", logErr.message);
              return 0;
          }

          if (!logs || logs.length === 0) {
              console.log("[SYNC] Bekleyen log bulunamadı.");
              return 0;
          }

          let syncedCount = 0;
          for (const log of logs) {
              console.log(`[SYNC] İşleniyor: ${log.channel_name}`);
              
              // 2. Mevcut kanal kontrolü (user_id ve name ile)
              const { data: existing } = await supabase
                  .from('channels')
                  .select('*')
                  .eq('user_id', uIdStr)
                  .eq('name', log.channel_name)
                  .maybeSingle();

              let dbSuccess = false;

              if (existing) {
                  const currentBots = existing.connected_bot_ids || [];
                  const updatedBots = Array.from(new Set([...currentBots, log.bot_id]));
                  
                  const { error: updErr } = await supabase
                      .from('channels')
                      .update({
                          member_count: log.member_count || existing.member_count,
                          connected_bot_ids: updatedBots
                      })
                      .eq('id', existing.id);
                  
                  if (!updErr) dbSuccess = true;
                  else console.error("[SYNC] Update Hatası:", updErr.message);
              } else {
                  const { error: insErr } = await supabase
                      .from('channels')
                      .insert({
                          user_id: uIdStr,
                          name: log.channel_name,
                          member_count: log.member_count || 0,
                          icon: log.channel_icon || `https://ui-avatars.com/api/?name=${encodeURIComponent(log.channel_name)}`,
                          connected_bot_ids: [log.bot_id],
                          is_ad_enabled: false,
                          revenue: 0
                      });
                  
                  if (!insErr) dbSuccess = true;
                  else console.error("[SYNC] Insert Hatası:", insErr.message);
              }

              if (dbSuccess) {
                  const { error: finalErr } = await supabase
                      .from('bot_discovery_logs')
                      .update({ is_synced: true })
                      .eq('id', log.id);
                  
                  if (!finalErr) syncedCount++;
              }
          }
          
          // Supabase'in veriyi indekslemesi için çok kısa bir bekleme
          if (syncedCount > 0) {
              await new Promise(r => setTimeout(r, 800));
          }

          return syncedCount;
      } catch (e: any) {
          console.error("[SYNC] Kritik Hata:", e);
          return 0;
      }
  }

  static async getChannels(userId: string): Promise<Channel[]> {
    const uIdStr = String(userId).trim();
    console.log("[DB-GET] Kanallar isteniyor. ID:", uIdStr);

    const { data, error } = await supabase
        .from('channels')
        .select('*')
        .eq('user_id', uIdStr)
        .order('id', { ascending: false });
    
    if (error) {
        console.error("[DB-GET] Hata:", error.message);
        return [];
    }
    
    console.log("[DB-GET] Bulunan kanal sayısı:", data?.length || 0);

    return (data || []).map(c => ({
        id: c.id,
        user_id: String(c.user_id),
        name: c.name,
        memberCount: c.member_count,
        icon: c.icon,
        isAdEnabled: c.is_ad_enabled,
        connectedBotIds: c.connected_bot_ids,
        revenue: c.revenue
    }));
  }

  static async getBots(category?: string): Promise<Bot[]> {
    let query = supabase.from('bots').select('*').order('id', { ascending: false });
    if (category && category !== 'all') query = query.eq('category', category);
    const { data } = await query;
    return data || [];
  }

  static async getBotById(id: string): Promise<Bot | null> {
    const { data } = await supabase.from('bots').select('*').eq('id', id).maybeSingle();
    return data;
  }

  static async getUserBots(userId: string): Promise<UserBot[]> {
    const { data } = await supabase.from('user_bots').select('*, bots(*)').eq('user_id', userId.toString());
    if (!data) return [];
    return data.map((item: any) => ({ ...item.bots, expiryDate: item.expiry_date, ownership_id: item.id })).filter(b => b.id);
  }

  static async addUserBot(userData: any, botData: Bot, isPremium: boolean = false) {
    const userId = (userData.id || userData).toString();
    await this.syncUser({ id: userId, name: userData.first_name || 'User', username: userData.username || 'user' });
    const { error } = await supabase.from('user_bots').upsert({ user_id: userId, bot_id: botData.id, is_active: true, is_premium: isPremium, acquired_at: new Date().toISOString() });
    if (error) throw error;
    return true;
  }

  static async removeUserBot(userId: string, botId: string) {
    await supabase.from('user_bots').delete().eq('user_id', userId.toString()).eq('bot_id', botId.toString());
  }

  static async syncUser(user: Partial<User>) {
    if (!user.id) return;
    await supabase.from('users').upsert({ id: user.id.toString(), name: user.name, username: user.username, avatar: user.avatar, joindate: new Date().toISOString() }, { onConflict: 'id' });
  }

  static async getUserById(userId: string): Promise<User | null> {
    const { data } = await supabase.from('users').select('*').eq('id', userId.toString()).maybeSingle();
    if (!data) return null;
    return { id: data.id, name: data.name, username: data.username, avatar: data.avatar, role: data.role || 'User', status: data.status || 'Active', badges: [], joinDate: data.joindate };
  }

  static async getNotifications(userId?: string): Promise<Notification[]> {
    let query = supabase.from('notifications').select('*').order('date', { ascending: false });
    if (userId) query = query.or(`user_id.eq.${userId},target_type.eq.global`);
    const { data } = await query;
    return data || [];
  }

  static async markNotificationRead(id: string) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  }

  static async getSettings() {
    const { data } = await supabase.from('settings').select('*').maybeSingle();
    return data;
  }

  static async getAnnouncements(): Promise<Announcement[]> {
    const { data } = await supabase.from('announcements').select('*').order('id', { ascending: false });
    return data || [];
  }

  static async getUserDetailedAssets(userId: string) {
    const [channels, notifications, userBotsRaw] = await Promise.all([
      this.getChannels(userId),
      this.getNotifications(userId),
      supabase.from('user_bots').select('*, bots(*)').eq('user_id', userId.toString())
    ]);
    return { channels, logs: notifications, userBots: (userBotsRaw.data || []).map((ub: any) => ({ ownership: ub, bot: ub.bots })) };
  }

  static async getUsers(): Promise<User[]> {
    const { data } = await supabase.from('users').select('*').order('joindate', { ascending: false });
    return (data || []).map(u => ({ id: u.id, name: u.name, username: u.username, avatar: u.avatar, role: u.role || 'User', status: u.status || 'Active', badges: [], joinDate: u.joindate }));
  }

  static async updateUserStatus(userId: string, status: string) {
    await supabase.from('users').update({ status }).eq('id', userId);
  }

  static async getAdminStats() {
    const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { count: botCount } = await supabase.from('bots').select('*', { count: 'exact', head: true });
    const { count: notifCount } = await supabase.from('notifications').select('*', { count: 'exact', head: true });
    const { count: annCount } = await supabase.from('announcements').select('*', { count: 'exact', head: true });
    const { count: salesCount } = await supabase.from('user_bots').select('*', { count: 'exact', head: true });
    return { userCount: userCount || 0, botCount: botCount || 0, notifCount: notifCount || 0, annCount: annCount || 0, salesCount: salesCount || 0 };
  }

  static async getAllPurchases() {
    const { data, error } = await supabase.from('user_bots').select('*, users(*), bots(*)').order('acquired_at', { ascending: false });
    return data || [];
  }

  static async saveBot(bot: Partial<Bot>) {
    const { error } = await supabase.from('bots').upsert(bot);
    if (error) throw error;
  }

  static async deleteBot(id: string) {
    const { error } = await supabase.from('bots').delete().eq('id', id);
    if (error) throw error;
  }

  static async sendNotification(notification: any) {
    const { error } = await supabase.from('notifications').insert({ title: notification.title, message: notification.message, type: notification.type || 'system', target_type: notification.target_type || 'global', user_id: notification.user_id || null, date: new Date().toISOString(), is_read: false });
    if (error) throw error;
  }

  static async saveAnnouncement(ann: Partial<Announcement>) {
    const { error } = await supabase.from('announcements').upsert(ann);
    if (error) throw error;
  }

  static async deleteAnnouncement(id: string) {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) throw error;
  }

  static async saveSettings(settings: any) {
    const { error } = await supabase.from('settings').upsert({ id: 1, ...settings });
    if (error) throw error;
  }

  static setAdminSession(token: string) { localStorage.setItem('admin_v3_session', token); }
  static isAdminLoggedIn(): boolean { return !!localStorage.getItem('admin_v3_session'); }
  static logoutAdmin() { localStorage.removeItem('admin_v3_session'); }
  static async init() {}
}

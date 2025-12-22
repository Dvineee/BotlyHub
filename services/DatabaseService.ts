
import { createClient } from '@supabase/supabase-js';
import { Bot, User, Channel, Announcement, Notification, UserBot } from '../types';

const SUPABASE_URL = 'https://ybnxfwqrduuinzgnbymc.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_VeYQ304ZpUpj3ymB3ihpjw_jt49W1G-'; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export class DatabaseService {
  
  /**
   * Bot loglarını tarayarak yeni kanalları senkronize eder.
   */
  static async syncChannelsFromBotActivity(userId: string): Promise<number> {
      try {
          const uIdStr = userId.toString();
          
          // 1. Python botunun gönderdiği logları ara
          // Hem owner_id'si kullanıcının ID'sine eşit olan, hem de henüz senkronize edilmemiş kayıtlar
          const { data: logs, error: logErr } = await supabase
              .from('bot_discovery_logs')
              .select('*')
              .eq('owner_id', uIdStr)
              .eq('is_synced', false);

          if (logErr) throw logErr;
          if (!logs || logs.length === 0) return 0;

          let syncedCount = 0;
          for (const log of logs) {
              // 2. Kanal daha önce eklenmiş mi?
              const { data: existing } = await supabase
                  .from('channels')
                  .select('*')
                  .eq('user_id', uIdStr)
                  .eq('name', log.channel_name)
                  .maybeSingle();

              if (existing) {
                  // Mevcut kanalı güncelle
                  const updatedBots = Array.from(new Set([...(existing.connected_bot_ids || []), log.bot_id]));
                  await supabase.from('channels').update({
                      member_count: log.member_count || existing.member_count,
                      connected_bot_ids: updatedBots
                  }).eq('id', existing.id);
              } else {
                  // Yeni kanal oluştur
                  await supabase.from('channels').insert({
                      user_id: uIdStr,
                      name: log.channel_name,
                      member_count: log.member_count || 0,
                      icon: log.channel_icon,
                      connected_bot_ids: [log.bot_id],
                      is_ad_enabled: false,
                      revenue: 0
                  });
              }

              // 3. Log'u "İşlendi" olarak işaretle
              await supabase.from('bot_discovery_logs').update({ is_synced: true }).eq('id', log.id);
              syncedCount++;
          }
          return syncedCount;
      } catch (e) {
          console.error("Sync Process Error:", e);
          return 0;
      }
  }

  /**
   * Kullanıcının bağlı kanallarını getirir.
   */
  static async getChannels(userId: string): Promise<Channel[]> {
    const { data } = await supabase
        .from('channels')
        .select('*')
        .eq('user_id', userId.toString())
        .order('id', { ascending: false });
        
    return (data || []).map(c => ({
        id: c.id,
        user_id: c.user_id,
        name: c.name,
        memberCount: c.member_count,
        icon: c.icon,
        isAdEnabled: c.is_ad_enabled,
        connectedBotIds: c.connected_bot_ids,
        revenue: c.revenue
    }));
  }

  /**
   * Market botlarını kategoriye göre getirir.
   */
  static async getBots(category?: string): Promise<Bot[]> {
    let query = supabase.from('bots').select('*').order('id', { ascending: false });
    if (category && category !== 'all') query = query.eq('category', category);
    const { data } = await query;
    return data || [];
  }

  /**
   * Bot detayını ID ile getirir.
   */
  static async getBotById(id: string): Promise<Bot | null> {
    const { data } = await supabase.from('bots').select('*').eq('id', id).maybeSingle();
    return data;
  }

  /**
   * Kullanıcının kütüphanesindeki botları getirir.
   */
  static async getUserBots(userId: string): Promise<UserBot[]> {
    const { data } = await supabase.from('user_bots').select('*, bots(*)').eq('user_id', userId.toString());
    if (!data) return [];
    return data.map((item: any) => ({ ...item.bots, expiryDate: item.expiry_date, ownership_id: item.id })).filter(b => b.id);
  }

  /**
   * Kullanıcı kütüphanesine yeni bot ekler.
   */
  static async addUserBot(userData: any, botData: Bot, isPremium: boolean = false) {
    const userId = (userData.id || userData).toString();
    await this.syncUser({ id: userId, name: userData.first_name || 'User', username: userData.username || 'user' });
    const { error } = await supabase.from('user_bots').upsert({ user_id: userId, bot_id: botData.id, is_active: true, is_premium: isPremium, acquired_at: new Date().toISOString() });
    if (error) throw error;
    return true;
  }

  /**
   * Botu kullanıcı kütüphanesinden kaldırır.
   */
  static async removeUserBot(userId: string, botId: string) {
    await supabase.from('user_bots').delete().eq('user_id', userId.toString()).eq('bot_id', botId.toString());
  }

  /**
   * Kullanıcı verilerini senkronize eder.
   */
  static async syncUser(user: Partial<User>) {
    if (!user.id) return;
    await supabase.from('users').upsert({ id: user.id.toString(), name: user.name, username: user.username, avatar: user.avatar, joindate: new Date().toISOString() }, { onConflict: 'id' });
  }

  /**
   * Kullanıcı verisini ID ile getirir.
   */
  static async getUserById(userId: string): Promise<User | null> {
    const { data } = await supabase.from('users').select('*').eq('id', userId.toString()).maybeSingle();
    if (!data) return null;
    return { id: data.id, name: data.name, username: data.username, avatar: data.avatar, role: data.role || 'User', status: data.status || 'Active', badges: [], joinDate: data.joindate };
  }

  /**
   * Bildirimleri getirir.
   */
  static async getNotifications(userId?: string): Promise<Notification[]> {
    let query = supabase.from('notifications').select('*').order('date', { ascending: false });
    if (userId) query = query.or(`user_id.eq.${userId},target_type.eq.global`);
    const { data } = await query;
    return data || [];
  }

  /**
   * Bildirimi okundu olarak işaretler.
   */
  static async markNotificationRead(id: string) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  }

  /**
   * Sistem ayarlarını getirir.
   */
  static async getSettings() {
    const { data } = await supabase.from('settings').select('*').maybeSingle();
    return data;
  }

  /**
   * Tüm duyuruları/kampanyaları getirir.
   */
  static async getAnnouncements(): Promise<Announcement[]> {
    const { data } = await supabase.from('announcements').select('*').order('id', { ascending: false });
    return data || [];
  }

  /**
   * Kullanıcının detaylı varlıklarını (kanallar, botlar, loglar) getirir.
   */
  static async getUserDetailedAssets(userId: string) {
    const [channels, notifications, userBotsRaw] = await Promise.all([
      this.getChannels(userId),
      this.getNotifications(userId),
      supabase.from('user_bots').select('*, bots(*)').eq('user_id', userId.toString())
    ]);
    return { channels, logs: notifications, userBots: (userBotsRaw.data || []).map((ub: any) => ({ ownership: ub, bot: ub.bots })) };
  }

  /**
   * Tüm platform kullanıcılarını getirir.
   */
  static async getUsers(): Promise<User[]> {
    const { data } = await supabase.from('users').select('*').order('joindate', { ascending: false });
    return (data || []).map(u => ({ id: u.id, name: u.name, username: u.username, avatar: u.avatar, role: u.role || 'User', status: u.status || 'Active', badges: [], joinDate: u.joindate }));
  }

  /**
   * Kullanıcı durumunu günceller.
   */
  static async updateUserStatus(userId: string, status: string) {
    await supabase.from('users').update({ status }).eq('id', userId);
  }

  // --- Admin Methods ---

  /**
   * Admin paneli için genel istatistikleri getirir.
   */
  static async getAdminStats() {
    const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { count: botCount } = await supabase.from('bots').select('*', { count: 'exact', head: true });
    const { count: notifCount } = await supabase.from('notifications').select('*', { count: 'exact', head: true });
    const { count: annCount } = await supabase.from('announcements').select('*', { count: 'exact', head: true });
    const { count: salesCount } = await supabase.from('user_bots').select('*', { count: 'exact', head: true });
    
    return {
      userCount: userCount || 0,
      botCount: botCount || 0,
      notifCount: notifCount || 0,
      annCount: annCount || 0,
      salesCount: salesCount || 0
    };
  }

  /**
   * Tüm kullanıcı bot edinme kayıtlarını getirir.
   */
  static async getAllPurchases() {
    const { data, error } = await supabase
      .from('user_bots')
      .select('*, users(*), bots(*)')
      .order('acquired_at', { ascending: false });
    
    if (error) console.error("Error fetching purchases:", error);
    return data || [];
  }

  /**
   * Market botunu kaydeder veya günceller.
   */
  static async saveBot(bot: Partial<Bot>) {
    const { error } = await supabase.from('bots').upsert(bot);
    if (error) throw error;
  }

  /**
   * Market botunu siler.
   */
  static async deleteBot(id: string) {
    const { error } = await supabase.from('bots').delete().eq('id', id);
    if (error) throw error;
  }

  /**
   * Sistemsel bildirim gönderir.
   */
  static async sendNotification(notification: any) {
    const { error } = await supabase.from('notifications').insert({
      title: notification.title,
      message: notification.message,
      type: notification.type || 'system',
      target_type: notification.target_type || 'global',
      user_id: notification.user_id || null,
      date: new Date().toISOString(),
      is_read: false
    });
    if (error) throw error;
  }

  /**
   * Duyuru kartını kaydeder veya günceller.
   */
  static async saveAnnouncement(ann: Partial<Announcement>) {
    const { error } = await supabase.from('announcements').upsert(ann);
    if (error) throw error;
  }

  /**
   * Duyuruyu siler.
   */
  static async deleteAnnouncement(id: string) {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) throw error;
  }

  /**
   * Sistem ayarlarını kaydeder.
   */
  static async saveSettings(settings: any) {
    // Settings tablosunda tek satır (id:1) olduğunu varsayıyoruz.
    const { error } = await supabase.from('settings').upsert({ id: 1, ...settings });
    if (error) throw error;
  }

  static setAdminSession(token: string) { localStorage.setItem('admin_v3_session', token); }
  static isAdminLoggedIn(): boolean { return !!localStorage.getItem('admin_v3_session'); }
  static logoutAdmin() { localStorage.removeItem('admin_v3_session'); }
  static async init() {}
}

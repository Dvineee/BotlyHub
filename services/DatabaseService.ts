
import { createClient } from '@supabase/supabase-js';
import { Bot, User, Channel, Announcement, Notification, UserBot, ActivityLog } from '../types';

const SUPABASE_URL = 'https://ybnxfwqrduuinzgnbymc.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_VeYQ304ZpUpj3ymB3ihpjw_jt49W1G-'; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export class DatabaseService {
  
  /**
   * Merkezi Loglama Sistemi
   */
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
              metadata,
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
          
          if (successCount > 0) {
              await this.logActivity(uIdStr, 'channel_sync', 'channels_updated', 'Kanal Verileri Senkronize Edildi', `${successCount} kanal bot sinyalleriyle güncellendi.`, { count: successCount });
          }
          
          return successCount;
      } catch (e) {
          console.error("[SYNC] Error:", e);
          return 0;
      }
  }

  static async getChannels(userId: string): Promise<Channel[]> {
    const uIdStr = String(userId).trim();
    const { data, error } = await supabase.from('channels').select('*').eq('user_id', uIdStr).order('created_at', { ascending: false });
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

    await this.logActivity(userId, 'bot_manage', 'bot_acquired', 'Bot Kütüphaneye Eklendi', `'${botData.name}' botu başarıyla edinildi.`, { bot_id: botData.id, is_premium: isPremium });
    return true;
  }

  /**
   * Bot Silme ve İlişkili Kanalları Temizleme
   */
  static async removeUserBot(userId: string, botId: string) {
    const uIdStr = userId.toString();
    const bIdStr = botId.toString();
    
    // 1. Bot bilgisini al (Log için)
    const { data: botInfo } = await supabase.from('bots').select('name').eq('id', bIdStr).maybeSingle();
    
    // 2. Bu botla ilişkili kanalları bul
    const { data: userChannels } = await supabase
        .from('channels')
        .select('*')
        .eq('user_id', uIdStr);

    if (userChannels && userChannels.length > 0) {
        for (const channel of userChannels) {
            const botIds = channel.connected_bot_ids || [];
            
            if (botIds.includes(bIdStr)) {
                const updatedBotIds = botIds.filter((id: string) => id !== bIdStr);
                
                if (updatedBotIds.length === 0) {
                    // Kanalın başka bot bağı kalmadıysa KANALI SİL
                    await supabase.from('channels').delete().eq('id', channel.id);
                    await this.logActivity(uIdStr, 'channel_sync', 'channel_auto_deleted', 'Kanal Otomatik Silindi', `'${channel.name}' kanalı, bağlı olduğu son bot (${botInfo?.name || bIdStr}) silindiği için kaldırıldı.`, { channel_id: channel.id, bot_id: bIdStr });
                } else {
                    // Sadece bot bağını kopar
                    await supabase.from('channels').update({ connected_bot_ids: updatedBotIds }).eq('id', channel.id);
                    await this.logActivity(uIdStr, 'channel_sync', 'channel_bot_unlinked', 'Kanal Bot Bağı Kesildi', `'${channel.name}' kanalının '${botInfo?.name || bIdStr}' botu ile ilişkisi kesildi.`, { channel_id: channel.id, bot_id: bIdStr });
                }
            }
        }
    }
    
    // 3. Bot mülkiyetini sil
    const { error } = await supabase.from('user_bots').delete().eq('user_id', uIdStr).eq('bot_id', bIdStr);
    
    if (!error) {
        await this.logActivity(uIdStr, 'bot_manage', 'bot_removed', 'Bot Kütüphaneden Kaldırıldı', `'${botInfo?.name || bIdStr}' botu ve tüm kullanım hakları iptal edildi.`, { bot_id: bIdStr });
    }
  }

  static async syncUser(user: Partial<User>) {
    if (!user.id) return;
    const { error } = await supabase.from('users').upsert({ id: user.id.toString(), name: user.name, username: user.username, avatar: user.avatar, email: user.email, phone: user.phone, joindate: new Date().toISOString() }, { onConflict: 'id' });
    
    if (!error && (user.email || user.phone)) {
        await this.logActivity(user.id.toString(), 'security', 'profile_updated', 'Profil Güvenlik Bilgileri Güncellendi', 'E-posta veya telefon verisi sisteme işlendi.');
    }
  }

  static async getUserById(userId: string): Promise<User | null> {
    const { data } = await supabase.from('users').select('*').eq('id', userId.toString()).maybeSingle();
    if (!data) return null;
    return { id: data.id, name: data.name, username: data.username, avatar: data.avatar, role: data.role || 'User', status: data.status || 'Active', badges: [], joinDate: data.joindate, email: data.email, phone: data.phone };
  }

  static async getUserActivityLogs(userId: string): Promise<ActivityLog[]> {
      const { data } = await supabase.from('activity_logs').select('*').eq('user_id', userId.toString()).order('created_at', { ascending: false });
      return data || [];
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
    const [channels, logs, userBotsRaw] = await Promise.all([
      this.getChannels(userId),
      this.getUserActivityLogs(userId),
      supabase.from('user_bots').select('*, bots(*)').eq('user_id', userId.toString())
    ]);
    return { channels, logs, userBots: (userBotsRaw.data || []).map((ub: any) => ({ ownership: ub, bot: ub.bots })) };
  }

  static async getUsers(): Promise<User[]> {
    const { data } = await supabase.from('users').select('*').order('joindate', { ascending: false });
    return (data || []).map(u => ({ id: u.id, name: u.name, username: u.username, avatar: u.avatar, role: u.role || 'User', status: u.status || 'Active', badges: [], joinDate: u.joindate, email: u.email, phone: u.phone }));
  }

  static async updateUserStatus(userId: string, status: string) {
    await supabase.from('users').update({ status }).eq('id', userId);
    await this.logActivity(userId, 'security', 'account_status_changed', 'Hesap Durumu Değiştirildi', `Admin hesabı '${status}' moduna aldı.`);
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

  static async saveBot(bot: Partial<Bot>) {
    await supabase.from('bots').upsert(bot);
  }

  static async deleteBot(id: string) {
    await supabase.from('bots').delete().eq('id', id);
  }

  static async sendNotification(notification: any) {
    await supabase.from('notifications').insert({ title: notification.title, message: notification.message, type: notification.type || 'system', target_type: notification.target_type || 'global', user_id: notification.user_id || null, date: new Date().toISOString(), is_read: false });
  }

  static async saveAnnouncement(ann: Partial<Announcement>) {
    await supabase.from('announcements').upsert(ann);
  }

  static async deleteAnnouncement(id: string) {
    await supabase.from('announcements').delete().eq('id', id);
  }

  static async saveSettings(settings: any) {
    await supabase.from('settings').upsert({ id: 1, ...settings });
  }

  static setAdminSession(token: string) { localStorage.setItem('admin_v3_session', token); }
  static isAdminLoggedIn(): boolean { return !!localStorage.getItem('admin_v3_session'); }
  static logoutAdmin() { localStorage.removeItem('admin_v3_session'); }
  static async init() {}
}

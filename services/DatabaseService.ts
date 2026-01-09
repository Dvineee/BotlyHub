
import { createClient } from '@supabase/supabase-js';
import { Bot, User, Channel, Announcement, Notification, UserBot, ActivityLog, Ad } from '../types';

const SUPABASE_URL = 'https://ybnxfwqrduuinzgnbymc.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_VeYQ304ZpUpj3ymB3ihpjw_jt49W1G-'; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export class DatabaseService {
  
  // --- AD MANAGEMENT (REKLAM MERKEZİ) ---
  static async getAds(): Promise<Ad[]> {
    const { data, error } = await supabase.from('ads').select('*').order('created_at', { ascending: false });
    if (error) return [];
    return data || [];
  }

  static async saveAd(ad: Partial<Ad>) {
    const payload = {
        id: ad.id || Math.floor(Math.random() * 999999).toString(),
        title: ad.title,
        content: ad.content,
        image_url: ad.image_url,
        button_text: ad.button_text,
        button_link: ad.button_link,
        status: ad.status || 'pending',
        total_reach: ad.total_reach || 0,
        channel_count: ad.channel_count || 0,
        created_at: ad.created_at || new Date().toISOString()
    };
    const { error } = await supabase.from('ads').upsert(payload, { onConflict: 'id' });
    if (error) throw error;
  }

  static async deleteAd(id: string) {
    const { error } = await supabase.from('ads').delete().eq('id', id);
    if (error) throw error;
  }

  static async updateAdStatus(id: string, status: Ad['status']) {
      await supabase.from('ads').update({ status }).eq('id', id);
  }

  // Reklamı test olarak adminin kendisine gönderilmesi için bir log oluşturur
  static async requestTestAd(adId: string, adminTelegramId: string) {
      await supabase.from('activity_logs').insert({
          user_id: adminTelegramId,
          type: 'system',
          action_key: 'TEST_AD_REQUEST',
          title: 'Reklam Test İsteği',
          description: `Reklam ID: ${adId}`,
          metadata: { adId, adminTelegramId }
      });
  }

  // --- KANAL VE LOG YÖNETİMİ ---
  static async getChannelsCount(onlyActive: boolean = true): Promise<number> {
      let query = supabase.from('channels').select('*', { count: 'exact', head: true });
      if (onlyActive) query = query.eq('is_ad_enabled', true);
      const { count } = await query;
      return count || 0;
  }

  static async logActivity(userId: string, type: ActivityLog['type'], actionKey: string, title: string, description: string, metadata: any = {}) {
      try {
          await supabase.from('activity_logs').insert({
              user_id: String(userId),
              type,
              action_key: actionKey,
              title,
              description,
              metadata: { ...metadata, client_time: new Date().toISOString() },
              created_at: new Date().toISOString()
          });
      } catch (e) { console.error(e); }
  }

  static async updateChannelAdStatus(channelId: string, status: boolean) {
      await supabase.from('channels').update({ is_ad_enabled: status }).eq('id', channelId);
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
                  await supabase.from('channels').update({ member_count: log.member_count, is_ad_enabled: true }).eq('id', existing.id);
              } else {
                  await supabase.from('channels').insert({ user_id: uIdStr, telegram_id: telegramId, name: log.channel_name, member_count: log.member_count, is_ad_enabled: true, revenue: 0 });
              }
              await supabase.from('bot_discovery_logs').update({ is_synced: true }).eq('id', log.id);
              count++;
          }
          return count;
      } catch (e) { return 0; }
  }

  static async getChannels(userId: string): Promise<Channel[]> {
    const { data } = await supabase.from('channels').select('*').eq('user_id', userId.toString()).order('created_at', { ascending: false });
    return (data || []).map(c => ({ id: String(c.id), user_id: String(c.user_id), telegram_id: String(c.telegram_id), name: c.name, memberCount: c.member_count || 0, icon: c.icon || '', isAdEnabled: c.is_ad_enabled, connectedBotIds: c.connected_bot_ids || [], revenue: Number(c.revenue || 0) }));
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
    const { data: userBots } = await supabase.from('user_bots').select('bot_id');
    return (bots || []).map(bot => ({ ...bot, ownerCount: (userBots || []).filter((ub: any) => ub.bot_id === bot.id).length }));
  }

  static async deleteBot(id: string) {
    await supabase.from('bots').delete().eq('id', id);
  }

  static async saveBot(bot: any) {
    await supabase.from('bots').upsert({ id: bot.id, name: bot.name, description: bot.description, price: Number(bot.price), category: bot.category, bot_link: bot.bot_link, screenshots: bot.screenshots || [], icon: bot.icon, is_premium: Boolean(bot.is_premium) });
  }

  static async getUserBots(userId: string): Promise<UserBot[]> {
    const { data } = await supabase.from('user_bots').select('*, bots(*)').eq('user_id', userId.toString());
    return (data || []).map((item: any) => ({ ...item.bots, expiryDate: item.expiryDate, ownership_id: item.id, is_premium: item.is_premium, is_active: item.is_active })).filter(b => b.id);
  }

  // Fix: Added isBotOwnedByUser to resolve errors in BotDetail.tsx regarding missing method on DatabaseService.
  static async isBotOwnedByUser(userId: string, botId: string): Promise<boolean> {
    const { data } = await supabase.from('user_bots').select('id').eq('user_id', userId.toString()).eq('bot_id', botId.toString()).maybeSingle();
    return !!data;
  }

  static async addUserBot(userData: any, botData: Bot, isPremium: boolean = false) {
    const userId = (userData.id || userData).toString();
    await supabase.from('user_bots').upsert({ user_id: userId, bot_id: botData.id, is_active: true, is_premium: isPremium, acquired_at: new Date().toISOString() });
    return true;
  }

  static async syncUser(user: Partial<User>) {
    if (!user.id) return;
    await supabase.from('users').upsert({ id: user.id.toString(), name: user.name, username: user.username, avatar: user.avatar, email: user.email, joindate: new Date().toISOString() }, { onConflict: 'id' });
  }

  static async getUserById(userId: string): Promise<User | null> {
    const { data } = await supabase.from('users').select('*').eq('id', userId.toString()).maybeSingle();
    if (!data) return null;
    return { id: data.id, name: data.name, username: data.username, avatar: data.avatar, role: data.role || 'User', status: data.status || 'Active', badges: data.badges || [], joinDate: data.joindate, email: data.email };
  }

  static async updateUserStatus(userId: string, status: 'Active' | 'Passive') {
    await supabase.from('users').update({ status }).eq('id', userId.toString());
  }

  static async getSettings() {
    const { data } = await supabase.from('settings').select('*').maybeSingle();
    return data ? { ...data, maintenanceMode: Boolean(data.MaintenanceMode) } : data;
  }

  static async getUsers(): Promise<User[]> {
    const { data } = await supabase.from('users').select('*').order('joindate', { ascending: false });
    return (data || []).map(u => ({ id: u.id, name: u.name, username: u.username, avatar: u.avatar, role: u.role || 'User', status: u.status || 'Active', badges: u.badges || [], joinDate: u.joindate, email: u.email }));
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

  static async sendGlobalNotification(title: string, message: string, type: Notification['type'] = 'system') {
      await supabase.from('notifications').insert([{ id: Math.floor(Math.random() * 999999999).toString(), title: title.trim(), message: message.trim(), type: type, date: new Date().toISOString(), isRead: false, target_type: 'global' }]);
  }

  static async sendUserNotification(userId: string, title: string, message: string, type: Notification['type'] = 'system') {
      await supabase.from('notifications').insert([{ id: Math.floor(Math.random() * 999999999).toString(), title: title.trim(), message: message.trim(), type: type, date: new Date().toISOString(), isRead: false, user_id: userId, target_type: 'user' }]);
  }

  static async getNotifications(userId?: string): Promise<Notification[]> {
    if (!userId) return [];
    const { data } = await supabase.from('notifications').select('*').or(`user_id.eq.${userId},target_type.eq.global`).order('date', { ascending: false });
    return (data || []).map(n => ({ id: String(n.id), type: n.type, title: n.title, message: n.message, date: n.date, isRead: n.isRead, user_id: n.user_id, target_type: n.target_type }));
  }

  static async markNotificationRead(id: string) {
    await supabase.from('notifications').update({ isRead: true }).eq('id', id);
  }

  static async getAnnouncements(): Promise<Announcement[]> {
    const { data } = await supabase.from('announcements').select('*').order('id', { ascending: false });
    return data || [];
  }

  static async saveAnnouncement(ann: any) {
    await supabase.from('announcements').upsert({ id: ann.id || Math.floor(Math.random() * 999999).toString(), title: String(ann.title), description: String(ann.description), button_text: String(ann.button_text), button_link: String(ann.button_link), icon_name: String(ann.icon_name), color_scheme: String(ann.color_scheme), is_active: Boolean(ann.is_active), action_type: String(ann.action_type), content_detail: String(ann.content_detail || '') });
  }

  static async deleteAnnouncement(id: string) {
    await supabase.from('announcements').delete().eq('id', id);
  }

  static setAdminSession(token: string) { localStorage.setItem('admin_v3_session', token); }
  static isAdminLoggedIn(): boolean { return !!localStorage.getItem('admin_v3_session'); }
  static logoutAdmin() { localStorage.removeItem('admin_v3_session'); }
  static async init() {}
}


import { createClient } from '@supabase/supabase-js';
import { User, Bot, Announcement, Promotion, ActivityLog, Notification, Channel } from '../types';

// Supabase Yapılandırması
const SUPABASE_URL = 'https://ybnxfwqrduuinzgnbymc.supabase.co';
const SUPABASE_KEY = 'YOUR_SUPABASE_SERVICE_ROLE_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export class DatabaseService {
  static init() { 
    console.log("DatabaseService V3.5 initialized"); 
  }

  // --- Genel Ayarlar ---
  static async getSettings() { 
    const { data } = await supabase.from('settings').select('*').single();
    return data || { maintenanceMode: false }; 
  }

  // --- Kullanıcı İşlemleri ---
  static async syncUser(userData: Partial<User>) {
    const { error } = await supabase.from('users').upsert(userData);
    if (error) throw error;
  }

  static async getUsers(): Promise<User[]> {
    const { data, error } = await supabase.from('users').select('*').order('joinDate', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  static async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
    if (error) return null;
    return data;
  }

  // --- Bot İşlemleri ---
  static async getBots(): Promise<Bot[]> {
    const { data, error } = await supabase.from('bots').select('*');
    if (error) throw error;
    return data || [];
  }

  static async getBotById(id: string): Promise<Bot | null> {
    const { data, error } = await supabase.from('bots').select('*').eq('id', id).single();
    if (error) return null;
    return data;
  }

  static async saveBot(bot: Bot) {
    const { error } = await supabase.from('bots').upsert(bot);
    if (error) throw error;
  }

  static async deleteBot(id: string) {
    const { error } = await supabase.from('bots').delete().eq('id', id);
    if (error) throw error;
  }

  // --- Bildirim ve Duyuru ---
  static async getAnnouncements(): Promise<Announcement[]> {
    const { data, error } = await supabase.from('announcements').select('*');
    if (error) throw error;
    return data || [];
  }

  static async getNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase.from('notifications').select('*').or(`user_id.eq.${userId},target_type.eq.global`).order('date', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  static async markNotificationRead(id: string) {
    await supabase.from('notifications').update({ isRead: true }).eq('id', id);
  }

  static async incrementNotificationView(id: string) {
    await supabase.rpc('increment_notification_view', { notification_id: id });
  }

  // --- Kullanıcı Kütüphanesi ---
  static async isBotOwnedByUser(userId: string, botId: string): Promise<boolean> {
    const { data } = await supabase.from('user_bots').select('id').eq('user_id', userId).eq('id', botId).single();
    return !!data;
  }

  static async addUserBot(userData: any, bot: Bot, isPremium: boolean) {
    const { error } = await supabase.from('user_bots').insert({
      id: bot.id, user_id: userData.id, name: bot.name, description: bot.description, icon: bot.icon, price: bot.price, category: bot.category, bot_link: bot.bot_link, isPremium, isActive: true, revenueEnabled: false
    });
    if (error) throw error;
  }

  static async getUserBots(userId: string): Promise<any[]> {
    const { data, error } = await supabase.from('user_bots').select('*').eq('user_id', userId);
    if (error) throw error;
    return data || [];
  }

  static async removeUserBot(userId: string, botId: string) {
    const { error } = await supabase.from('user_bots').delete().eq('user_id', userId).eq('id', botId);
    if (error) throw error;
  }

  // --- Kanal Yönetimi ---
  static async getChannels(userId: string): Promise<Channel[]> {
    const { data, error } = await supabase.from('channels').select('*').eq('user_id', userId);
    if (error) throw error;
    return data || [];
  }

  static async syncChannelsFromBotActivity(userId: string): Promise<number> { return 0; }

  static async updateChannelAdStatus(channelId: string, status: boolean) {
    const { error } = await supabase.from('channels').update({ revenueEnabled: status }).eq('id', channelId);
    if (error) throw error;
  }

  // --- Aktivite Logları ---
  static async logActivity(userId: string, type: string, action_key: string, title: string, description: string) {
    await supabase.from('activity_logs').insert({ user_id: userId, type, action_key, title, description, created_at: new Date().toISOString() });
  }

  static async sendUserNotification(userId: string, title: string, message: string, type: 'system' | 'payment' | 'security' | 'bot') {
    await supabase.from('notifications').insert({ user_id: userId, title, message, type, isRead: false, date: new Date().toISOString() });
  }

  // --- Admin Oturum ---
  static setAdminSession(token: string) { 
    localStorage.setItem('admin_token', token); 
  }

  // --- REKLAM MOTORU (PROMOTIONS) ---
  static async getPromotions(): Promise<Promotion[]> {
    const { data, error } = await supabase.from('promotions').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  static async updatePromotionStatus(id: string, status: Promotion['status']) {
    const { error } = await supabase.from('promotions').update({ status }).eq('id', id);
    if (error) throw error;
  }

  static async deletePromotion(id: string) {
    const { error } = await supabase.from('promotions').delete().eq('id', id);
    if (error) throw error;
  }

  static async savePromotion(promo: Promotion) {
    const { error } = await supabase.from('promotions').upsert({
        ...promo,
        created_at: promo.created_at || new Date().toISOString()
    });
    if (error) throw error;
  }
}

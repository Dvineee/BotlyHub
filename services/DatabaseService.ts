
import { createClient } from '@supabase/supabase-js';
import { User, Bot, Announcement, Promotion, ActivityLog, Notification, Channel } from '../types';

// Supabase configuration - replace with actual credentials if needed
const SUPABASE_URL = 'https://ybnxfwqrduuinzgnbymc.supabase.co';
const SUPABASE_KEY = 'YOUR_SUPABASE_SERVICE_ROLE_KEY';

/**
 * supabase client instance exported for direct usage in components if needed.
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * DatabaseService: Handles all backend operations via Supabase.
 */
export class DatabaseService {
  /**
   * Initializes the database service.
   */
  static init() {
    console.log("DatabaseService initialized");
  }

  /**
   * Fetches global application settings.
   */
  static async getSettings() {
    // Mock settings, typically fetched from a 'settings' table
    return { maintenanceMode: false };
  }

  /**
   * Synchronizes user data with the database.
   */
  static async syncUser(userData: Partial<User>) {
    const { error } = await supabase.from('users').upsert(userData);
    if (error) throw error;
  }

  /**
   * Fetches a single user by ID.
   */
  static async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
    if (error) return null;
    return data;
  }

  /**
   * Fetches all available bots.
   */
  static async getBots(): Promise<Bot[]> {
    const { data, error } = await supabase.from('bots').select('*');
    if (error) throw error;
    return data || [];
  }

  /**
   * Fetches a single bot by ID.
   */
  static async getBotById(id: string): Promise<Bot | null> {
    const { data, error } = await supabase.from('bots').select('*').eq('id', id).single();
    if (error) return null;
    return data;
  }

  /**
   * Fetches active announcements.
   */
  static async getAnnouncements(): Promise<Announcement[]> {
    const { data, error } = await supabase.from('announcements').select('*');
    if (error) throw error;
    return data || [];
  }

  /**
   * Fetches notifications for a specific user.
   */
  static async getNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase.from('notifications')
      .select('*')
      .or(`user_id.eq.${userId},target_type.eq.global`)
      .order('date', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  /**
   * Marks a notification as read.
   */
  static async markNotificationRead(id: string) {
    await supabase.from('notifications').update({ isRead: true }).eq('id', id);
  }

  /**
   * Increments the view count for a notification.
   */
  static async incrementNotificationView(id: string) {
    // Mock RPC call for atomic increment
    await supabase.rpc('increment_notification_view', { notification_id: id });
  }

  /**
   * Checks if a bot is owned by a specific user.
   */
  static async isBotOwnedByUser(userId: string, botId: string): Promise<boolean> {
    const { data } = await supabase.from('user_bots').select('id').eq('user_id', userId).eq('id', botId).single();
    return !!data;
  }

  /**
   * Adds a bot to a user's library.
   */
  static async addUserBot(userData: any, bot: Bot, isPremium: boolean) {
    const { error } = await supabase.from('user_bots').insert({
      id: bot.id,
      user_id: userData.id,
      name: bot.name,
      description: bot.description,
      icon: bot.icon,
      price: bot.price,
      category: bot.category,
      bot_link: bot.bot_link,
      isPremium,
      isActive: true,
      revenueEnabled: false
    });
    if (error) throw error;
  }

  /**
   * Fetches all bots owned by a user.
   */
  static async getUserBots(userId: string): Promise<any[]> {
    const { data, error } = await supabase.from('user_bots').select('*').eq('user_id', userId);
    if (error) throw error;
    return data || [];
  }

  /**
   * Removes a bot from a user's library.
   */
  static async removeUserBot(userId: string, botId: string) {
    const { error } = await supabase.from('user_bots').delete().eq('user_id', userId).eq('id', botId);
    if (error) throw error;
  }

  /**
   * Fetches channels managed by a user.
   */
  static async getChannels(userId: string): Promise<Channel[]> {
    const { data, error } = await supabase.from('channels').select('*').eq('user_id', userId);
    if (error) throw error;
    return data || [];
  }

  /**
   * Discovers new channels based on bot activity logs.
   */
  static async syncChannelsFromBotActivity(userId: string): Promise<number> {
    // Mock logic to simulate channel discovery from activity logs
    return 0;
  }

  /**
   * Updates the revenue/ad status for a channel.
   */
  static async updateChannelAdStatus(channelId: string, status: boolean) {
    const { error } = await supabase.from('channels').update({ revenueEnabled: status }).eq('id', channelId);
    if (error) throw error;
  }

  /**
   * Sends a targeted notification to a user.
   */
  static async sendUserNotification(userId: string, title: string, message: string, type: 'system' | 'payment' | 'security' | 'bot') {
    await supabase.from('notifications').insert({
      user_id: userId,
      title,
      message,
      type,
      isRead: false,
      date: new Date().toISOString()
    });
  }

  /**
   * Logs administrative or user activities.
   */
  static async logActivity(userId: string, type: string, action_key: string, title: string, description: string) {
    await supabase.from('activity_logs').insert({
      user_id: userId,
      type,
      action_key,
      title,
      description,
      created_at: new Date().toISOString()
    });
  }

  /**
   * Sets the admin session token.
   */
  static setAdminSession(token: string) {
    localStorage.setItem('admin_token', token);
  }

  /**
   * Fetches all promotion campaigns for the admin dashboard.
   */
  static async getPromotions(): Promise<Promotion[]> {
    const { data, error } = await supabase.from('promotions').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  /**
   * Updates the status of a promotion.
   */
  static async updatePromotionStatus(id: string, status: Promotion['status']) {
    const { error } = await supabase.from('promotions').update({ status }).eq('id', id);
    if (error) throw error;
  }

  /**
   * Deletes a promotion campaign.
   */
  static async deletePromotion(id: string) {
    const { error } = await supabase.from('promotions').delete().eq('id', id);
    if (error) throw error;
  }

  /**
   * Saves or updates a promotion campaign.
   */
  static async savePromotion(promo: Promotion) {
    const { error } = await supabase.from('promotions').upsert(promo);
    if (error) throw error;
  }
}

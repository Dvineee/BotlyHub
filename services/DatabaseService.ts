
import { createClient } from '@supabase/supabase-js';
import { Bot, User, Channel, Announcement, Notification, UserBot } from '../types';

const SUPABASE_URL = 'https://ybnxfwqrduuinzgnbymc.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_VeYQ304ZpUpj3ymB3ihpjw_jt49W1G-'; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export class DatabaseService {
  
  // --- Dashboard Stats ---
  static async getAdminStats() {
    try {
      const [users, bots, notifications, anns] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('bots').select('id', { count: 'exact', head: true }),
        supabase.from('notifications').select('id', { count: 'exact', head: true }),
        supabase.from('announcements').select('id', { count: 'exact', head: true })
      ]);

      return {
        userCount: users.count || 0,
        botCount: bots.count || 0,
        notifCount: notifications.count || 0,
        annCount: anns.count || 0
      };
    } catch (e) {
      console.error("Stats Error:", e);
      return { userCount: 0, botCount: 0, notifCount: 0, annCount: 0 };
    }
  }

  // --- Bot Management ---
  static async getBots(category?: string): Promise<Bot[]> {
    try {
      let query = supabase.from('bots').select('*').order('id', { ascending: false });
      if (category && category !== 'all') {
        query = query.eq('category', category);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (e) {
      return [];
    }
  }

  static async getBotById(id: string): Promise<Bot | null> {
    try {
      const { data, error } = await supabase.from('bots').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    } catch (e) {
      return null;
    }
  }

  static async saveBot(bot: Partial<Bot>) {
    const { error } = await supabase.from('bots').upsert({
      ...bot,
      id: bot.id || Math.random().toString(36).substr(2, 9),
      screenshots: bot.screenshots || []
    }, { onConflict: 'id' });
    if (error) throw error;
  }

  static async deleteBot(id: string) {
    const { error } = await supabase.from('bots').delete().eq('id', id);
    if (error) throw error;
  }

  // --- Notification System ---
  static async getNotifications(userId?: string): Promise<Notification[]> {
    try {
      let query = supabase.from('notifications').select('*').order('date', { ascending: false });
      if (userId) {
          query = query.or(`user_id.eq.${userId},target_type.eq.global`);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (e) {
      return [];
    }
  }

  static async sendNotification(notification: Partial<Notification>) {
    const { error } = await supabase.from('notifications').insert({
        ...notification,
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString(),
        isRead: false
    });
    if (error) throw error;
  }

  static async markNotificationRead(id: string) {
    const { error } = await supabase.from('notifications').update({ isRead: true }).eq('id', id);
    if (error) throw error;
  }

  // --- Announcement Management ---
  static async getAnnouncements(): Promise<Announcement[]> {
    try {
      const { data, error } = await supabase.from('announcements').select('*').order('id', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) {
      return [];
    }
  }

  static async saveAnnouncement(ann: Partial<Announcement>) {
    const { error } = await supabase.from('announcements').upsert({
        ...ann,
        id: ann.id || Math.random().toString(36).substr(2, 9),
        is_active: ann.is_active ?? true
    }, { onConflict: 'id' });
    if (error) throw error;
  }

  static async deleteAnnouncement(id: string) {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) throw error;
  }

  // --- Settings Management ---
  static async getSettings() {
    try {
        const { data, error } = await supabase.from('settings').select('*').eq('id', 1).single();
        if (error) return null;
        return data;
    } catch (e) {
        return null;
    }
  }

  static async saveSettings(settings: any) {
    const { error } = await supabase.from('settings').upsert({ id: 1, ...settings }, { onConflict: 'id' });
    if (error) throw error;
  }

  // --- User Management ---
  static async getUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase.from('users').select('*').order('id', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) {
      return [];
    }
  }

  static async updateUserStatus(userId: string, status: string) {
      const { error } = await supabase.from('users').update({ status }).eq('id', userId);
      if (error) throw error;
  }

  static async syncUser(user: Partial<User>) {
    const { error } = await supabase.from('users').upsert(user, { onConflict: 'id' });
    if (error) throw error;
  }

  // --- User Assets (FOR ADMIN ONLY) ---
  static async getUserDetailedAssets(userId: string) {
      const [channels, notifications] = await Promise.all([
          supabase.from('channels').select('*').eq('user_id', userId),
          supabase.from('notifications').select('*').eq('user_id', userId).order('date', { ascending: false })
      ]);
      
      // Bots are usually stored in local storage for this demo architecture, 
      // but in a production system we'd query a 'user_bots' table.
      // For now, return these real DB results.
      return {
          channels: channels.data || [],
          logs: notifications.data || []
      };
  }

  // --- Channel Management ---
  static async getChannels(userId: string): Promise<Channel[]> {
    try {
      const { data, error } = await supabase.from('channels').select('*').eq('user_id', userId);
      if (error) throw error;
      return data || [];
    } catch (e) {
      return [];
    }
  }

  static async saveChannel(channel: Partial<Channel>) {
    const { error } = await supabase.from('channels').upsert({
      ...channel,
      id: channel.id || Math.random().toString(36).substr(2, 9)
    }, { onConflict: 'id' });
    if (error) throw error;
  }

  // --- Admin Session ---
  static setAdminSession(token: string) { localStorage.setItem('admin_v3_session', token); }
  static isAdminLoggedIn(): boolean { return !!localStorage.getItem('admin_v3_session'); }
  static logoutAdmin() { localStorage.removeItem('admin_v3_session'); }

  static async init() {
    console.log("Database Sync Service v4.0 - User Assets Enabled");
  }
}

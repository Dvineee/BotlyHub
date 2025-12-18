
import { createClient } from '@supabase/supabase-js';
import { Bot, User, Channel, Announcement, Notification } from '../types';

const SUPABASE_URL = 'https://ybnxfwqrduuinzgnbymc.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_VeYQ304ZpUpj3ymB3ihpjw_jt49W1G-'; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export class DatabaseService {
  
  // --- Bot Management ---
  static async getBots(category?: string): Promise<Bot[]> {
    try {
      let query = supabase.from('bots').select('*').order('created_at', { ascending: false });
      if (category && category !== 'all') {
        query = query.eq('category', category);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error("getBots error:", e);
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

  // --- Notification System (ACTIVE) ---
  static async getNotifications(userId?: string): Promise<Notification[]> {
    try {
      let query = supabase.from('notifications').select('*').order('date', { ascending: false });
      if (userId) {
          // Global bildirimler + kullanıcıya özel bildirimler
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
      const { data, error } = await supabase.from('announcements').select('*').eq('is_active', true);
      if (error) throw error;
      return data || [];
    } catch (e) {
      return [];
    }
  }

  static async saveAnnouncement(ann: Partial<Announcement>) {
    const { error } = await supabase.from('announcements').upsert(ann);
    if (error) throw error;
  }

  static async deleteAnnouncement(id: string) {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) throw error;
  }

  // --- User & Channel Management ---
  static async syncUser(user: Partial<User>) {
    const payload: any = {
      id: user.id.toString(),
      name: user.name || '',
      username: user.username || '',
      avatar: user.avatar || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'User',
      status: user.status || 'Active',
      badges: user.badges || []
    };
    if (user.joinDate) payload.joinDate = user.joinDate;
    const { data, error } = await supabase.from('users').upsert(payload, { onConflict: 'id' }).select();
    if (error) throw error;
    return data;
  }

  static async getUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase.from('users').select('*').order('id', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) {
      return [];
    }
  }

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
    const { error } = await supabase.from('channels').upsert(channel);
    if (error) throw error;
  }

  // --- Admin Session ---
  static setAdminSession(token: string) { localStorage.setItem('admin_v3_session', token); }
  static isAdminLoggedIn(): boolean { return !!localStorage.getItem('admin_v3_session'); }
  static logoutAdmin() { localStorage.removeItem('admin_v3_session'); }

  static async init() {
    console.log("Database Sync Service v3.2 Ready with Notification Support.");
  }
}

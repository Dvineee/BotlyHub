
import { createClient } from '@supabase/supabase-js';
import { Bot, User, Channel, CryptoTransaction } from '../types';

const SUPABASE_URL = 'https://ybnxfwqrduuinzgnbymc.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_VeYQ304ZpUpj3ymB3ihpjw_jt49W1G-'; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export class DatabaseService {
  
  // --- Bot Metodları ---
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
      console.error('Error fetching bots:', e);
      return [];
    }
  }

  static async getBotById(id: string): Promise<Bot | null> {
    const { data, error } = await supabase.from('bots').select('*').eq('id', id).single();
    if (error) return null;
    return data;
  }

  static async saveBot(bot: Partial<Bot>) {
    const { error } = await supabase.from('bots').upsert({
      ...bot,
      id: bot.id || Math.random().toString(36).substr(2, 9),
      screenshots: bot.screenshots || []
    });
    if (error) throw error;
  }

  static async deleteBot(id: string) {
    const { error } = await supabase.from('bots').delete().eq('id', id);
    if (error) throw error;
  }

  // --- Kullanıcı Metodları ---
  static async syncUser(user: Partial<User>) {
    if (!user.id) return;
    const { error } = await supabase.from('users').upsert({
      ...user,
      joinDate: user.joinDate || new Date().toISOString()
    });
    if (error) throw error;
  }

  static async getUsers(): Promise<User[]> {
    const { data, error } = await supabase.from('users').select('*').order('joinDate', { ascending: false });
    if (error) return [];
    return data || [];
  }

  // --- Kanal Metodları ---
  static async getChannels(userId: string): Promise<Channel[]> {
    const { data, error } = await supabase.from('channels').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) return [];
    return data || [];
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
    console.log("BotlyHub V3 Live Sync Ready.");
  }
}

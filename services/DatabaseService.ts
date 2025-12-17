
import { createClient } from '@supabase/supabase-js';
import { Bot, User, CryptoTransaction, Channel } from '../types';

const SUPABASE_URL = 'https://ybnxfwqrduuinzgnbymc.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_VeYQ304ZpUpj3ymB3ihpjw_jt49W1G-'; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const STORAGE_KEYS = {
  ADMIN_AUTH: 'db_admin_session_v3'
};

export class DatabaseService {
  
  // --- Bot Yönetimi ---
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
      console.error('Botlar yüklenirken hata oluştu:', e);
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
    const botId = bot.id || Math.random().toString(36).substr(2, 9);
    const { error } = await supabase.from('bots').upsert({ 
      ...bot, 
      id: botId,
      screenshots: bot.screenshots || []
    });
    if (error) throw error;
  }

  static async deleteBot(id: string) {
    const { error } = await supabase.from('bots').delete().eq('id', id);
    if (error) throw error;
  }

  // --- Kanal Yönetimi ---
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

  // --- Kullanıcı Yönetimi ---
  static async getUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase.from('users').select('*').order('joinDate', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) {
      return [];
    }
  }

  static async syncUser(user: Partial<User>) {
    const { error } = await supabase.from('users').upsert(user);
    if (error) throw error;
  }

  static setAdminSession(token: string) {
    localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, token);
  }

  static isAdminLoggedIn(): boolean {
    return !!localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH);
  }

  static logoutAdmin() {
    localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
  }

  static async init() {
    console.log("BotlyHub V3 Engine Connected.");
  }
}

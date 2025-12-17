
import { createClient } from '@supabase/supabase-js';
import { Bot, User, Channel, CryptoTransaction } from '../types';

// These should be configured in your environment variables for production.
const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const STORAGE_KEYS = {
  ADMIN_AUTH: 'db_admin_session_v3'
};

export class DatabaseService {
  /**
   * IMPORTANT: Ensure your Supabase database has 'bots', 'users', 'transactions', and 'channels' tables.
   */

  // --- Bots ---
  static async getBots(): Promise<Bot[]> {
    try {
      const { data, error } = await supabase
        .from('bots')
        .select('*')
        .order('id', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn('DB Error fetching bots, check your Supabase config:', e);
      return [];
    }
  }

  static async saveBot(bot: Partial<Bot>) {
    const { error } = await supabase
      .from('bots')
      .upsert({ 
        ...bot, 
        id: bot.id || Math.random().toString(36).substr(2, 9),
        created_at: bot.id ? undefined : new Date().toISOString()
      });
    
    if (error) throw error;
  }

  static async deleteBot(id: string) {
    const { error } = await supabase
      .from('bots')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // --- Users ---
  static async getUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('joinDate', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn('DB Error fetching users:', e);
      return [];
    }
  }

  static async updateUser(user: Partial<User>) {
    const { error } = await supabase
      .from('users')
      .upsert(user);
    
    if (error) throw error;
  }

  // --- Transactions ---
  static async getTransactions(): Promise<CryptoTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.warn('DB Error fetching transactions:', e);
      return [];
    }
  }

  // --- Admin Auth Session Management ---
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
    console.log("BotlyHub V3 Database Engine Initialized.");
  }
}

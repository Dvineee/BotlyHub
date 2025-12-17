
import { createClient } from '@supabase/supabase-js';
import { Bot, User, Channel, CryptoTransaction } from '../types';

// Bu değerler normalde .env dosyasında tutulur.
const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const STORAGE_KEYS = {
  ADMIN_AUTH: 'db_admin_session_v3'
};

export class DatabaseService {
  // --- Bots ---
  static async getBots(): Promise<Bot[]> {
    const { data, error } = await supabase
      .from('bots')
      .select('*')
      .order('id', { ascending: false });
    
    if (error) {
      console.error('Error fetching bots:', error);
      return [];
    }
    return data || [];
  }

  static async saveBot(bot: Partial<Bot>) {
    const { error } = await supabase
      .from('bots')
      .upsert({ ...bot, id: bot.id || Math.random().toString(36).substr(2, 9) });
    
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
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('joinDate', { ascending: false });
    
    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }
    return data || [];
  }

  static async updateUser(user: Partial<User>) {
    const { error } = await supabase
      .from('users')
      .upsert(user);
    
    if (error) throw error;
  }

  // --- Transactions ---
  static async getTransactions(): Promise<CryptoTransaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
    return data || [];
  }

  // --- Admin Auth ---
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
    console.log("Database Engine V3 Ready.");
  }
}

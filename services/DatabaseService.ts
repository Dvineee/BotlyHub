
import { createClient } from '@supabase/supabase-js';
import { Bot, User, Channel, CryptoTransaction } from '../types';

// NOTE: These should be provided in your environment variables for production.
// For the context of this Mini App, we initialize with placeholders or 
// environment variables if available.
const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const STORAGE_KEYS = {
  ADMIN_AUTH: 'db_admin_session_v3'
};

export class DatabaseService {
  /**
   * Note for implementation:
   * You need to create 'bots', 'users', 'transactions', and 'channels' tables in your Supabase dashboard.
   */

  // --- Bots ---
  static async getBots(): Promise<Bot[]> {
    const { data, error } = await supabase
      .from('bots')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching bots:', error);
      return [];
    }
    return data || [];
  }

  static async saveBot(bot: Bot) {
    const { error } = await supabase
      .from('bots')
      .upsert(bot);
    
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

  static async updateUser(user: User) {
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

  static async addTransaction(tx: CryptoTransaction) {
    const { error } = await supabase
      .from('transactions')
      .insert(tx);
    
    if (error) throw error;
  }

  // --- Channels ---
  static async getChannels(): Promise<Channel[]> {
    const { data, error } = await supabase
      .from('channels')
      .select('*');
    
    if (error) {
      console.error('Error fetching channels:', error);
      return [];
    }
    return data || [];
  }

  // --- Admin Auth ---
  // Note: For real world use Supabase Auth, here we simulate session persistence
  static setAdminSession(token: string) {
    localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, token);
  }

  static isAdminLoggedIn(): boolean {
    return !!localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH);
  }

  static logoutAdmin() {
    localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
  }

  // Initialize DB logic (Seed if needed - only for dev/testing)
  static async init() {
    console.log("Real Database Connection Initialized");
    // You can add logic here to check if tables exist or if seeds are needed.
  }
}

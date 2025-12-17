
import { createClient } from '@supabase/supabase-js';
import { Bot, User, CryptoTransaction } from '../types';

/**
 * SUPABASE BAĞLANTISI
 * Bu bilgiler senin projenin kimlik kartıdır.
 */
const SUPABASE_URL = 'https://ybnxfwqrduuinzgnbymc.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_VeYQ304ZpUpj3ymB3ihpjw_jt49W1G-'; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const STORAGE_KEYS = {
  ADMIN_AUTH: 'db_admin_session_v3'
};

export class DatabaseService {
  
  // --- Bot Yönetimi (Market Verileri) ---
  static async getBots(): Promise<Bot[]> {
    try {
      const { data, error } = await supabase
        .from('bots')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('Botlar yüklenirken hata oluştu:', e);
      return [];
    }
  }

  static async saveBot(bot: Partial<Bot>) {
    // ID yoksa yeni oluşturur, varsa günceller (Admin Paneli için)
    const { error } = await supabase
      .from('bots')
      .upsert({ 
        ...bot, 
        id: bot.id || Math.random().toString(36).substr(2, 9)
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

  // --- Kullanıcı Yönetimi ---
  static async getUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('joinDate', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('Kullanıcılar yüklenirken hata:', e);
      return [];
    }
  }

  static async updateUser(user: Partial<User>) {
    const { error } = await supabase
      .from('users')
      .upsert(user);
    
    if (error) throw error;
  }

  // --- Finansal İşlemler (Para Yatırma/Çekme Geçmişi) ---
  static async getTransactions(): Promise<CryptoTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('İşlemler yüklenirken hata:', e);
      return [];
    }
  }

  // --- Admin Yetkilendirme (Dashboard Girişi) ---
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
    console.log("BotlyHub V3: Supabase Bulut Motoru Aktif.");
  }
}

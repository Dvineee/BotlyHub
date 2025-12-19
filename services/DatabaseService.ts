
import { createClient } from '@supabase/supabase-js';
import { Bot, User, Channel, Announcement, Notification } from '../types';

const SUPABASE_URL = 'https://ybnxfwqrduuinzgnbymc.supabase.co'; 
const SUPABASE_ANON_KEY = 'sb_publishable_VeYQ304ZpUpj3ymB3ihpjw_jt49W1G-'; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export class DatabaseService {
  
  static async getAdminStats() {
    try {
      const [users, bots, notifications, anns, sales] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('bots').select('id', { count: 'exact', head: true }),
        supabase.from('notifications').select('id', { count: 'exact', head: true }),
        supabase.from('announcements').select('id', { count: 'exact', head: true }),
        supabase.from('user_bots').select('user_id', { count: 'exact', head: true })
      ]);
      return {
        userCount: users.count || 0,
        botCount: bots.count || 0,
        notifCount: notifications.count || 0,
        annCount: anns.count || 0,
        salesCount: sales.count || 0
      };
    } catch (e) {
      return { userCount: 0, botCount: 0, notifCount: 0, annCount: 0, salesCount: 0 };
    }
  }

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
      const { data, error } = await supabase.from('bots').select('*').eq('id', id).maybeSingle();
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

  static async getAllPurchases() {
      try {
          // user_bots tablosundan kullanıcı ve bot detaylarını join ile çekiyoruz
          const { data, error } = await supabase
              .from('user_bots')
              .select(`
                *,
                users:user_id (*),
                bots:bot_id (*)
              `)
              .order('acquired_at', { ascending: false });
          
          if (error) throw error;
          return data || [];
      } catch (e) {
          console.error("Error fetching purchases:", e);
          return [];
      }
  }

  static async addUserBot(userData: any, botData: Bot, isPremium: boolean = false) {
    const userId = (userData.id || userData).toString();
    const botId = botData.id.toString();
    
    try {
        // 1. Kullanıcıyı senkronize et (Eğer yoksa oluştur)
        const { data: userExists } = await supabase.from('users').select('id').eq('id', userId).maybeSingle();
        if (!userExists) {
            await this.syncUser({
                id: userId,
                name: userData.first_name ? `${userData.first_name} ${userData.last_name || ''}`.trim() : (userData.name || 'User'),
                username: userData.username || 'user',
                avatar: userData.photo_url || `https://ui-avatars.com/api/?name=User`
            });
        }

        // 2. Botun varlığını doğrula
        const { data: botExists } = await supabase.from('bots').select('id').eq('id', botId).maybeSingle();
        if (!botExists) {
            await this.saveBot(botData);
        }

        // 3. İşlem Kaydı (Satın Alma / Edinme)
        const payload = {
            user_id: userId,
            bot_id: botId,
            is_active: true,
            is_premium: isPremium,
            acquired_at: new Date().toISOString()
        };

        // Doğrudan upsert dene
        const { error: upsertError } = await supabase
            .from('user_bots')
            .upsert(payload, { onConflict: 'user_id,bot_id' });
        
        // Eğer onConflict hatası gelirse manuel kontrol yap (Fallback)
        if (upsertError) {
            console.warn("Upsert failed, trying manual check/insert:", upsertError.message);
            const { data: existing } = await supabase
                .from('user_bots')
                .select('*')
                .eq('user_id', userId)
                .eq('bot_id', botId)
                .maybeSingle();

            if (existing) {
                const { error: updateError } = await supabase
                    .from('user_bots')
                    .update(payload)
                    .eq('user_id', userId)
                    .eq('bot_id', botId);
                if (updateError) throw updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('user_bots')
                    .insert(payload);
                if (insertError) throw insertError;
            }
        }

        // 4. İşlem başarılı bildirimi gönder (Kullanıcıya log düşür)
        await this.sendNotification({
            user_id: userId,
            type: isPremium ? 'payment' : 'bot',
            title: isPremium ? 'Premium Bot Alındı' : 'Kütüphaneye Eklendi',
            message: `${botData.name} adlı botu artık kullanabilirsiniz.`,
            target_type: 'user'
        });

    } catch (e: any) {
        console.error("Critical Database Error in addUserBot:", e);
        throw new Error(e.message || "İşlem tamamlanamadı.");
    }
  }

  static async getUserBots(userId: string): Promise<Bot[]> {
    try {
        const { data, error } = await supabase
            .from('user_bots')
            .select('*, bots(*)')
            .eq('user_id', userId.toString());
        if (error) throw error;
        return (data || []).map((item: any) => item.bots).filter(Boolean);
    } catch (e) {
        return [];
    }
  }

  static async syncUser(user: Partial<User>) {
    if (!user.id) return;
    const { error } = await supabase.from('users').upsert({
        ...user,
        id: user.id.toString(),
        joinDate: user.joinDate || new Date().toISOString(),
        role: user.role || 'User',
        status: user.status || 'Active'
    }, { onConflict: 'id' });
    if (error) console.error("User Sync Error:", error);
  }

  static async getUserDetailedAssets(userId: string) {
      try {
        const [channels, logs, userBots] = await Promise.all([
            supabase.from('channels').select('*').eq('user_id', userId.toString()),
            supabase.from('notifications').select('*').eq('user_id', userId.toString()).order('date', { ascending: false }),
            supabase.from('user_bots').select('*, bots(*)').eq('user_id', userId.toString())
        ]);
        
        const mappedUserBots = (userBots.data || []).map((ub: any) => ({
            bot: ub.bots,
            ownership: {
                is_active: ub.is_active ?? true,
                is_premium: ub.is_premium ?? false,
                acquired_at: ub.acquired_at || new Date().toISOString()
            }
        })).filter((item: any) => item.bot !== null);

        return {
            channels: channels.data || [],
            logs: logs.data || [],
            userBots: mappedUserBots
        };
      } catch (e) {
          return { channels: [], logs: [], userBots: [] };
      }
  }

  static async getChannels(userId: string): Promise<Channel[]> {
    try {
      const { data, error } = await supabase.from('channels').select('*').eq('user_id', userId.toString());
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

  static async getSettings() {
    try {
      const { data, error } = await supabase.from('settings').select('*').maybeSingle();
      if (error) throw error;
      return data;
    } catch (e) {
      return null;
    }
  }

  static async saveSettings(settings: any) {
    const { error } = await supabase.from('settings').upsert(settings, { onConflict: 'id' });
    if (error) throw error;
  }

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
      id: ann.id || Math.random().toString(36).substr(2, 9)
    }, { onConflict: 'id' });
    if (error) throw error;
  }

  static async deleteAnnouncement(id: string) {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) throw error;
  }

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

  static async markNotificationRead(id: string) {
    const { error } = await supabase.from('notifications').update({ isRead: true }).eq('id', id);
    if (error) throw error;
  }

  static async sendNotification(notification: Partial<Notification>) {
    const { error } = await supabase.from('notifications').insert({
      ...notification,
      id: notification.id || Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      isRead: false
    });
    if (error) throw error;
  }

  static async getUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase.from('users').select('*').order('joinDate', { ascending: false });
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

  static setAdminSession(token: string) { localStorage.setItem('admin_v3_session', token); }
  static isAdminLoggedIn(): boolean { return !!localStorage.getItem('admin_v3_session'); }
  static logoutAdmin() { localStorage.removeItem('admin_v3_session'); }
  static async init() { console.log("Service Initialized"); }
}

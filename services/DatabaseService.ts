
import { createClient } from '@supabase/supabase-js';
import { Bot, User, Channel, Announcement, Notification, UserBot } from '../types';

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

  static async getBotById(id: string): Promise<Bot | null> {
    const { data } = await supabase.from('bots').select('*').eq('id', id).maybeSingle();
    return data;
  }

  static async getUserById(userId: string): Promise<User | null> {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId.toString())
            .maybeSingle();
        
        if (error || !data) return null;

        return {
            id: data.id.toString(),
            name: data.name || 'İsimsiz',
            username: data.username || 'user',
            avatar: data.avatar || '',
            role: data.role || 'User',
            status: data.status || 'Active',
            badges: data.badges || [],
            joinDate: data.joindate || data.joinDate,
            email: data.email,
            phone: data.phone
        };
    } catch (e) {
        return null;
    }
  }

  static async getUserBots(userId: string): Promise<UserBot[]> {
    const { data, error } = await supabase
      .from('user_bots')
      .select('*, bots(*)')
      .eq('user_id', userId.toString());
    
    if (error || !data) return [];
    return data.map((item: any) => ({
        ...item.bots,
        expiryDate: item.expiry_date || item.expiryDate,
        ownership_id: item.id
    })).filter((b: any) => b.id !== undefined);
  }

  static async addUserBot(userData: any, botData: Bot, isPremium: boolean = false) {
    if (!userData || !botData) throw new Error("Eksik veri.");
    const userId = (userData.id || userData).toString();
    const botId = botData.id.toString();
    
    let expiryDate = null;
    if (botData.price > 0) {
        const date = new Date();
        date.setDate(date.getDate() + 30);
        expiryDate = date.toISOString();
    }
    
    try {
        await this.syncUser({
            id: userId,
            name: userData.first_name ? `${userData.first_name} ${userData.last_name || ''}`.trim() : (userData.name || 'User'),
            username: userData.username || 'user',
            avatar: userData.photo_url || `https://ui-avatars.com/api/?name=User`
        });

        const { error } = await supabase.from('user_bots').upsert({
            user_id: userId,
            bot_id: botId,
            is_active: true,
            is_premium: isPremium,
            acquired_at: new Date().toISOString(),
            expiry_date: expiryDate
        }, { onConflict: 'user_id,bot_id' });
        
        if (error) throw error;
        return true;
    } catch (e) {
        console.error(e);
        throw e;
    }
  }

  static async removeUserBot(userId: string, botId: string) {
    const { error } = await supabase
        .from('user_bots')
        .delete()
        .eq('user_id', userId.toString())
        .eq('bot_id', botId.toString());
    
    if (error) throw error;
  }

  static async syncChannelsFromBotActivity(userId: string): Promise<number> {
      try {
          const { data: logs, error: logErr } = await supabase
              .from('bot_discovery_logs')
              .select('*')
              .eq('owner_id', userId.toString())
              .eq('is_synced', false);

          if (logErr || !logs || logs.length === 0) return 0;

          let syncedCount = 0;
          for (const log of logs) {
              // Aynı isimde bir kanal var mı kontrol et
              const { data: existing } = await supabase
                  .from('channels')
                  .select('*')
                  .eq('user_id', userId.toString())
                  .eq('name', log.channel_name)
                  .maybeSingle();

              if (existing) {
                  // Mevcut kanalı güncelle (bot_id ekle ve üye sayısını güncelle)
                  const updatedBots = Array.from(new Set([...(existing.connected_bot_ids || []), log.bot_id]));
                  await supabase.from('channels').update({
                      member_count: log.member_count || existing.member_count,
                      connected_bot_ids: updatedBots
                  }).eq('id', existing.id);
              } else {
                  // Yeni kanal oluştur
                  await supabase.from('channels').insert({
                      user_id: userId.toString(),
                      name: log.channel_name,
                      member_count: log.member_count || 0,
                      icon: log.channel_icon,
                      connected_bot_ids: [log.bot_id],
                      is_ad_enabled: false,
                      revenue: 0
                  });
              }

              // Log'u senkronize edildi olarak işaretle
              await supabase.from('bot_discovery_logs').update({ is_synced: true }).eq('id', log.id);
              syncedCount++;
          }
          return syncedCount;
      } catch (e) {
          console.error("Auto-sync error:", e);
          return 0;
      }
  }

  static async getBots(category?: string): Promise<Bot[]> {
    try {
      let query = supabase.from('bots').select('*').order('id', { ascending: false });
      if (category && category !== 'all') query = query.eq('category', category);
      const { data } = await query;
      return data || [];
    } catch (e) { return []; }
  }

  static async saveBot(bot: Partial<Bot>) {
    const { error } = await supabase.from('bots').upsert(bot);
    if (error) throw error;
  }

  static async deleteBot(id: string) {
    const { error } = await supabase.from('bots').delete().eq('id', id);
    if (error) throw error;
  }

  static async syncUser(user: Partial<User>) {
    if (!user.id) return;
    try {
        const userId = user.id.toString();
        
        const { data: existing } = await supabase
            .from('users')
            .select('email, phone, joindate, joinDate')
            .eq('id', userId)
            .maybeSingle();

        const updateData: any = {
            id: userId,
            name: user.name,
            username: user.username,
            avatar: user.avatar,
            role: user.role || 'User',
            status: user.status || 'Active',
            badges: user.badges || [],
            email: user.email || existing?.email || null,
            phone: user.phone || existing?.phone || null,
            joindate: user.joinDate || existing?.joindate || existing?.joinDate || new Date().toISOString(),
            joinDate: user.joinDate || existing?.joinDate || existing?.joindate || new Date().toISOString()
        };

        const { error } = await supabase.from('users').upsert(updateData, { onConflict: 'id' });
        if (error) throw error;
    } catch (e) {
        console.error("Sync error:", e);
    }
  }

  static async getChannels(userId: string): Promise<Channel[]> {
    const { data } = await supabase.from('channels').select('*').eq('user_id', userId.toString()).order('revenue', { ascending: false });
    return (data || []).map(c => ({
        id: c.id,
        user_id: c.user_id,
        name: c.name,
        memberCount: c.member_count,
        icon: c.icon,
        isAdEnabled: c.is_ad_enabled,
        connectedBotIds: c.connected_bot_ids,
        revenue: c.revenue
    }));
  }

  static async getAllPurchases(): Promise<any[]> {
    const { data } = await supabase
      .from('user_bots')
      .select('*, users(*), bots(*)')
      .order('acquired_at', { ascending: false });
    return data || [];
  }

  static async getUserDetailedAssets(userId: string) {
    const [channels, notifications, userBotsRaw] = await Promise.all([
      this.getChannels(userId),
      this.getNotifications(userId),
      supabase.from('user_bots').select('*, bots(*)').eq('user_id', userId.toString())
    ]);

    const userBots = (userBotsRaw.data || []).map((ub: any) => ({
      ownership: {
        is_active: ub.is_active,
        is_premium: ub.is_premium,
        acquired_at: ub.acquired_at,
        expiry_date: ub.expiry_date
      },
      bot: ub.bots
    }));

    return {
      channels: channels,
      logs: notifications,
      userBots: userBots
    };
  }

  static async getSettings() {
    const { data } = await supabase.from('settings').select('*').maybeSingle();
    return data;
  }

  static async saveSettings(settings: any) {
    await supabase.from('settings').upsert(settings);
  }

  static async getAnnouncements(): Promise<Announcement[]> {
    const { data } = await supabase.from('announcements').select('*');
    return data || [];
  }

  static async saveAnnouncement(ann: Partial<Announcement>) {
    const { error } = await supabase.from('announcements').upsert(ann);
    if (error) throw error;
  }

  static async deleteAnnouncement(id: string) {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) throw error;
  }

  static async getNotifications(userId?: string): Promise<Notification[]> {
    let query = supabase.from('notifications').select('*').order('date', { ascending: false });
    if (userId) query = query.or(`user_id.eq.${userId},target_type.eq.global`);
    const { data } = await query;
    return data || [];
  }

  static async markNotificationRead(id: string) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  }

  static async sendNotification(n: any) {
    await supabase.from('notifications').insert({ ...n, date: new Date().toISOString() });
  }

  static async getUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('joindate', { ascending: false });

      if (error) throw error;

      return (data || []).map(u => ({
          id: u.id.toString(),
          name: u.name || 'İsimsiz',
          username: u.username || 'user',
          avatar: u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'User')}`,
          role: u.role || 'User',
          status: u.status || 'Active',
          badges: u.badges || [],
          joinDate: u.joindate || u.joinDate,
          email: u.email,
          phone: u.phone
      }));
    } catch (e: any) {
      console.error("Kullanıcı listesi çekme hatası:", e.message || e);
      return [];
    }
  }

  static async updateUserStatus(userId: string, status: string) {
    await supabase.from('users').update({ status }).eq('id', userId);
  }

  static setAdminSession(token: string) { localStorage.setItem('admin_v3_session', token); }
  static isAdminLoggedIn(): boolean { return !!localStorage.getItem('admin_v3_session'); }
  static logoutAdmin() { localStorage.removeItem('admin_v3_session'); }
  static async init() { console.log("DB Loaded"); }
}

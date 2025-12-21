
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

  // Fix: Added getBotById to fetch a specific bot's details by its ID.
  static async getBotById(id: string): Promise<Bot | null> {
    const { data } = await supabase.from('bots').select('*').eq('id', id).maybeSingle();
    return data;
  }

  // Fix: Added getUserBots to retrieve all bots associated with a specific user.
  static async getUserBots(userId: string): Promise<Bot[]> {
    const { data, error } = await supabase
      .from('user_bots')
      .select('bots(*)')
      .eq('user_id', userId.toString());
    
    if (error || !data) return [];
    return data.map((item: any) => item.bots).filter((b: any) => b !== null);
  }

  static async addUserBot(userData: any, botData: Bot, isPremium: boolean = false) {
    if (!userData || !botData) throw new Error("Eksik veri.");
    const userId = (userData.id || userData).toString();
    const botId = botData.id.toString();
    
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
            acquired_at: new Date().toISOString()
        }, { onConflict: 'user_id,bot_id' });
        
        if (error) throw error;
        return true;
    } catch (e) {
        console.error(e);
        throw e;
    }
  }

  static async syncChannelsFromBotActivity(userId: string): Promise<number> {
      try {
          const { data: logs, error: logErr } = await supabase
              .from('bot_discovery_logs')
              .select('*')
              .eq('owner_id', userId.toString())
              .eq('is_synced', false);

          if (logErr || !logs || logs.length === 0) return 0;

          let synced = 0;
          for (const log of logs) {
              const { error: chErr } = await supabase.from('channels').insert({
                  user_id: userId.toString(),
                  name: log.channel_name,
                  member_count: log.member_count || 0,
                  icon: log.channel_icon,
                  connected_bot_ids: [log.bot_id]
              });

              if (!chErr) {
                  await supabase.from('bot_discovery_logs').update({ is_synced: true }).eq('id', log.id);
                  synced++;
              }
          }
          return synced;
      } catch (e) {
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

  // Fix: Added saveBot to handle creating or updating bot definitions in the marketplace.
  static async saveBot(bot: Partial<Bot>) {
    const { error } = await supabase.from('bots').upsert(bot);
    if (error) throw error;
  }

  // Fix: Added deleteBot to allow removing bots from the database.
  static async deleteBot(id: string) {
    const { error } = await supabase.from('bots').delete().eq('id', id);
    if (error) throw error;
  }

  static async syncUser(user: Partial<User>) {
    if (!user.id) return;
    await supabase.from('users').upsert({
        ...user,
        id: user.id.toString(),
        join_date: user.joinDate || new Date().toISOString()
    });
  }

  static async getChannels(userId: string): Promise<Channel[]> {
    const { data } = await supabase.from('channels').select('*').eq('user_id', userId.toString());
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

  // Fix: Added getAllPurchases to provide administrative insights into bot acquisitions.
  static async getAllPurchases(): Promise<any[]> {
    const { data } = await supabase
      .from('user_bots')
      .select('*, users(*), bots(*)')
      .order('acquired_at', { ascending: false });
    return data || [];
  }

  // Fix: Added getUserDetailedAssets to aggregate a user's assets (channels, bots) and notification history for the admin view.
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
        acquired_at: ub.acquired_at
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

  // Fix: Modified getAnnouncements to return all announcements, enabling full management in the admin dashboard.
  static async getAnnouncements(): Promise<Announcement[]> {
    const { data } = await supabase.from('announcements').select('*');
    return data || [];
  }

  // Fix: Added saveAnnouncement for managing promotional cards.
  static async saveAnnouncement(ann: Partial<Announcement>) {
    const { error } = await supabase.from('announcements').upsert(ann);
    if (error) throw error;
  }

  // Fix: Added deleteAnnouncement for removing promotional cards.
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
    const { data } = await supabase.from('users').select('*').order('join_date', { ascending: false });
    return (data || []).map(u => ({ ...u, joinDate: u.join_date }));
  }

  static async updateUserStatus(userId: string, status: string) {
    await supabase.from('users').update({ status }).eq('id', userId);
  }

  static setAdminSession(token: string) { localStorage.setItem('admin_v3_session', token); }
  static isAdminLoggedIn(): boolean { return !!localStorage.getItem('admin_v3_session'); }
  static logoutAdmin() { localStorage.removeItem('admin_v3_session'); }
  static async init() { console.log("DB Init"); }
}

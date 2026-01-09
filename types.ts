
export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  role: 'Admin' | 'User' | 'Moderator';
  status: 'Active' | 'Passive';
  badges: string[];
  joinDate: string;
  email?: string;
  phone?: string;
  isRestricted?: boolean;
  canPublishAds?: boolean;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  type: 'auth' | 'bot_manage' | 'channel_sync' | 'payment' | 'security' | 'system';
  action_key: string;
  title: string;
  description: string;
  metadata: any;
  created_at: string;
}

export interface Bot {
  id: string;
  name: string;
  description: string;
  icon: string;
  price: number;
  category: string;
  bot_link: string;
  screenshots: string[];
  isNew?: boolean;
  features?: string[];
}

export interface Ad {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  button_text?: string;
  button_link?: string;
  status: 'pending' | 'sending' | 'sent' | 'failed';
  total_reach: number;
  channel_count: number;
  processed_channels?: string[]; // Hangi kanallara başarıyla gittiği
  created_at: string;
  sent_at?: string;
}

export interface Announcement {
  id: string;
  title: string;
  description: string;
  button_text: string;
  button_link: string;
  icon_name: string;
  color_scheme: string;
  is_active: boolean;
  action_type: 'link' | 'popup';
  content_detail?: string;
}

export interface ExtendedBot extends Bot {
  isPremium?: boolean;
}

export interface UserBot extends Bot {
  isAdEnabled: boolean;
  isActive: boolean;
  expiryDate?: string;
  ownership_id?: string;
}

export interface Channel {
  id: string;
  user_id: string;
  telegram_id: string; 
  name: string;
  memberCount: number;
  icon: string;
  isAdEnabled: boolean;
  connectedBotIds: string[];
  revenue: number;
}

export type ChainType = 'TON' | 'BSC' | 'TRX' | 'SOL' | 'STARS';

export interface CryptoTransaction {
  id: string;
  type: 'Deposit' | 'Withdrawal' | 'BotEarnings';
  amount: number;
  symbol: string;
  chain: ChainType;
  toAddress?: string;
  date: string;
  status: 'Success' | 'Pending' | 'Failed' | 'Processing';
  hash: string;
}

export interface Notification {
  id: string;
  type: 'system' | 'payment' | 'security' | 'bot';
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  user_id?: string;
  target_type?: 'user' | 'global';
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billingPeriod: string;
  description: string;
  color: string;
  icon: any;
  isPopular?: boolean;
  features: string[];
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: any;
    };
  }
}

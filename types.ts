
export interface BlogComment {
  id: string;
  blog_id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  content: string;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  image: string;
  author: string;
  authorAvatar?: string;
  category: string;
  date: string;
  created_at: string;
  readTime: string;
  slug?: string;
  isFeatured?: boolean;
  views_count?: number;
  likes_count?: number;
}

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
  canPublishPromos?: boolean; // canPublishAds yerine
  hasPanelAccess?: boolean;
  panelPassword?: string;
  referred_by?: string;
  referral_count?: number;
  referral_earnings?: number;
  is_premium?: boolean;
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
  user?: {
    name: string;
    username: string;
    avatar: string;
  };
}

export interface Bot {
  id: string;
  name: string;
  description: string;
  icon: string;
  price: number;
  category: string[];
  bot_link: string;
  screenshots: string[];
  isNew?: boolean;
  features?: string[];
  views?: number;
  is_official?: boolean;
  promoted_type?: 'latest' | 'official' | 'featured' | 'none';
  languages?: string[];
  telegram_group?: string;
  website_url?: string;
  app_url?: string;
  social_url?: string;
  rating?: number;
  rating_count?: number;
  user_count?: number;
}

export interface Promotion {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  button_text?: string;
  button_link?: string;
  status: 'pending' | 'sending' | 'sent' | 'failed';
  total_reach: number;
  channel_count: number;
  click_count: number; // Added engagement tracking
  total_views?: number;
  total_reactions?: number;
  price_per_view?: number; // Added unit price per view
  source_channel?: string; // Ana paylaşımın yapılacağı kanal
  source_message_id?: number; // Ana kanaldaki mesaj ID'si (iletme için)
  processed_channels?: string[]; 
  created_at: string;
  sent_at?: string;
}

export interface PromotionChannelStats {
  id: string;
  promotion_id: string;
  channel_id: string;
  views: number;
  revenue: number;
  updated_at: string;
  channel_name?: string; // Gösterim için ekledik
  promotion?: Promotion;
  channel?: Channel;
}

export interface Announcement {
  id: string;
  title: string;
  description: string;
  button_text: string;
  button_link: string;
  icon_name: string;
  color_scheme: string;
  bg_image_url?: string;
  is_active: boolean;
  action_type: 'link' | 'popup';
  content_detail?: string;
  tag?: string;
  badge_text?: string;
}

export interface ExtendedBot extends Bot {
  isPremium?: boolean;
}

export interface UserBot extends Bot {
  revenueEnabled: boolean; // isAdEnabled yerine
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
  revenueEnabled: boolean; // isAdEnabled yerine
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
  view_count?: number;
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

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  status: 'pending' | 'confirmed' | 'rejected';
  reward_amount: number;
  created_at: string;
  confirmed_at?: string;
  ip_address?: string;
  device_fingerprint?: string;
  is_premium_referral: boolean;
  referred_user?: {
    name: string;
    avatar: string;
    username?: string;
  };
}

export interface ReferralSettings {
  id: string;
  standard_reward: number;
  premium_reward: number;
  min_days_active: number;
  require_group_join: boolean;
  group_id: string;
  pending_duration_hours: number;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: any;
    };
  }
}

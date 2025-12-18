
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
}

export interface Channel {
  id: string;
  user_id: string;
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

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billingPeriod: 'Aylık' | 'Yıllık';
  description: string;
  features: string[];
  color: string;
  icon: any;
  isPopular?: boolean;
}

export interface Notification {
  id: string;
  type: 'system' | 'payment' | 'security' | 'bot';
  title: string;
  message: string;
  date: string;
  isRead: boolean;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: any;
    };
  }
}

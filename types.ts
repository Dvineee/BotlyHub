
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
  bot_link: string; // Telegram bot link (e.g., t.me/mybot)
  screenshots: string[]; // Array of image URLs
  isNew?: boolean;
  features?: string[];
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

// Fixed: Expanded ChainType to include all supported networks used in the WalletService
export type ChainType = 'TON' | 'BSC' | 'TRX' | 'SOL';

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
      WebApp?: {
        initData: string;
        initDataUnsafe: any;
        version: string;
        platform: string;
        colorScheme: 'light' | 'dark';
        themeParams: any;
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        headerColor: string;
        backgroundColor: string;
        isVersionAtLeast: (version: string) => boolean;
        ready: () => void;
        expand: () => void;
        close: () => void;
        openInvoice: (url: string, callback?: (status: string) => void) => void;
        showPopup: (params: any, callback?: (id: string) => void) => void;
        openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
        openTelegramLink: (url: string) => void;
        setHeaderColor?: (color: string) => void;
        setBackgroundColor?: (color: string) => void;
        onEvent: (eventType: string, eventHandler: Function) => void;
        offEvent: (eventType: string, eventHandler: Function) => void;
        MainButton: any;
        BackButton: any;
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
      };
    };
  }
}
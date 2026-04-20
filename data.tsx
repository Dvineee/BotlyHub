
import { Layout, Gamepad2, Wallet, Shield, Zap, Sparkles, MessageSquare, Briefcase, Music, Coins, Cpu, PenTool, ShoppingBag, Lock, GraduationCap, Newspaper, Star, Crown, Gem } from 'lucide-react';
import { ExtendedBot, SubscriptionPlan, Notification } from './types';

const AppsIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 56 56" 
    fill="none" 
    className={`${className} rounded-[19px] outline outline-[3px] outline-[#d1d1d1]`}
  > 
    <path d="M28 56C43.464 56 56 43.464 56 28C56 12.536 43.464 0 28 0C12.536 0 0 12.536 0 28C0 43.464 12.536 56 28 56Z" fill="#0098EA"></path> 
    <path d="M37.5603 15.6277H18.4386C14.9228 15.6277 12.6944 19.4202 14.4632 22.4861L26.2644 42.9409C27.0345 44.2765 28.9644 44.2765 29.7345 42.9409L41.5381 22.4861C43.3045 19.4251 41.0761 15.6277 37.5627 15.6277H37.5603ZM26.2548 36.8068L23.6847 31.8327L17.4833 20.7414C17.0742 20.0315 17.5795 19.1218 18.4362 19.1218H26.2524V36.8092L26.2548 36.8068ZM38.5108 20.739L32.3118 31.8351L29.7417 36.8068V19.1194H37.5579C38.4146 19.1194 38.9199 20.0291 38.5108 20.739Z" fill="white"></path> 
  </svg>
);

export const categories = [
  { id: 'all', label: 'cat_all', icon: Layout },
  { id: 'apps', label: 'cat_apps', icon: AppsIcon },
  { id: 'games', label: 'cat_games', icon: Gamepad2 },
  { id: 'finance', label: 'cat_finance', icon: Wallet },
  { id: 'moderation', label: 'cat_moderation', icon: Shield },
  { id: 'utilities', label: 'cat_utilities', icon: Zap },
  { id: 'ai_services', label: 'cat_ai_services', icon: Sparkles },
  { id: 'communication', label: 'cat_communication', icon: MessageSquare },
  { id: 'productivity', label: 'cat_productivity', icon: Briefcase },
  { id: 'music', label: 'cat_music', icon: Music },
  { id: 'crypto', label: 'cat_crypto', icon: Coins },
  { id: 'telegram_platform', label: 'cat_telegram_platform', icon: Cpu },
  { id: 'bloggers', label: 'cat_bloggers', icon: PenTool },
  { id: 'shopping', label: 'cat_shopping', icon: ShoppingBag },
  { id: 'security', label: 'cat_security', icon: Lock },
  { id: 'education', label: 'cat_education', icon: GraduationCap },
  { id: 'content', label: 'cat_content', icon: Newspaper },
];

export const mockBots: ExtendedBot[] = [
  { id: '1', name: 'Task Master', description: 'Günlük görevlerinizi ve iş akışınızı yönetin.', price: 29.99, icon: 'https://picsum.photos/seed/task/200', category: 'productivity', isNew: true, bot_link: 'https://t.me/botlyhub_bot', screenshots: [] },
  { id: '2', name: 'GameBot Pro', description: 'Topluluk içi oyun sunucusu yönetimi.', price: 0, icon: 'https://picsum.photos/seed/game/200', category: 'games', bot_link: 'https://t.me/botlyhub_bot', screenshots: [] },
  { id: '10', name: 'StockBot', description: 'Borsa ve hisse senedi teknik analizi.', price: 120.00, icon: 'https://picsum.photos/seed/stock/200', category: 'finance', bot_link: 'https://t.me/botlyhub_bot', screenshots: [] },
];

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'plan_starter',
    name: 'Başlangıç',
    price: 0,
    billingPeriod: 'Aylık',
    description: 'Platformu keşfetmek isteyenler için.',
    color: 'slate',
    icon: Star,
    features: [
      '5 Kanala Kadar Bağlantı',
      'Standart Destek',
      '%20 Reklam Komisyonu'
    ]
  },
  {
    id: 'plan_pro',
    name: 'Pro Üyelik',
    price: 149.90,
    billingPeriod: 'Aylık',
    description: 'Büyüyen topluluklar için.',
    color: 'blue',
    icon: Zap,
    isPopular: true,
    features: [
      '20 Kanala Kadar Bağlantı',
      'Öncelikli Destek',
      '%10 Reklam Komisyonu',
      'Detaylı İstatistikler'
    ]
  },
  {
    id: 'plan_elite',
    name: 'Elite Üyelik',
    price: 399.90,
    billingPeriod: 'Aylık',
    description: 'Maksimum kazanç ve sınırsız özellikler.',
    color: 'yellow',
    icon: Crown,
    features: [
      'Sınırsız Kanal Bağlantısı',
      '7/24 Canlı Destek',
      '%2 Reklam Komisyonu',
      'Özel Profil Rozeti'
    ]
  }
];

export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'payment',
    title: 'Ödeme Başarılı',
    message: 'TON ödemeniz başarıyla alındı.',
    date: new Date().toISOString(),
    isRead: false
  }
];

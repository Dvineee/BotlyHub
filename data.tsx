
import { ExtendedBot, SubscriptionPlan, Notification } from './types';
import { Star, Crown, Gem, Zap } from 'lucide-react';

const AppsIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 32 32" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <title>file_type_appsemble</title>
    <path fill="#a6cfff" d="m 8,3 h 1.607 a 5,5 0 0 1 5,5 v 6.607 H 3 V 8 A 5,5 0 0 1 8,3 Z"/>
    <path fill="#4a90e2" d="M 22.393,3 H 29 v 11.607 h -6.607 a 5,5 0 0 1 -5,-5 V 8 a 5,5 0 0 1 5,-5 z"/>
    <path fill="#a6cfff" d="M 14.607,29 H 3 V 17.393 h 11.607 z"/>
    <path fill="#4a90e2" d="M 24,29 H 17.393 V 17.393 H 24 a 5,5 0 0 1 5,5 V 24 a 5,5 0 0 1 -5,5 z"/>
  </svg>
);

const AllIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect fill="#a6cfff" x="3" y="3" width="11" height="11" rx="4"/>
    <rect fill="#4a90e2" x="18" y="3" width="11" height="11" rx="4"/>
    <rect fill="#4a90e2" x="3" y="18" width="11" height="11" rx="4"/>
    <rect fill="#a6cfff" x="18" y="18" width="11" height="11" rx="4"/>
  </svg>
);

const GamesIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path fill="#4a90e2" d="M16 3L29 11V21L16 29L3 21V11L16 3Z"/>
    <circle fill="#a6cfff" cx="11" cy="16" r="3"/>
    <path fill="#a6cfff" d="M18 13H24V19H18V13Z"/>
  </svg>
);

const FinanceIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect fill="#a6cfff" x="3" y="14" width="8" height="15" rx="2"/>
    <rect fill="#4a90e2" x="12" y="8" width="8" height="21" rx="2"/>
    <rect fill="#a6cfff" x="21" y="3" width="8" height="26" rx="2"/>
  </svg>
);

const ModerationIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path fill="#4a90e2" d="M16 3L29 8V16C29 23 23 27 16 29C9 27 3 23 3 16V8L16 3Z"/>
    <path d="M10 16L14 20L22 12" stroke="#a6cfff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);

const UtilitiesIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path fill="#4a90e2" d="M18 3L6 18H15L14 29L26 14H17L18 3Z"/>
    <circle fill="#a6cfff" cx="24" cy="6" r="4"/>
  </svg>
);

const AIServicesIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path fill="#4a90e2" d="M16 3L19 13L29 16L19 19L16 29L13 19L3 16L13 13L16 3Z"/>
    <rect fill="#a6cfff" x="24" y="4" width="5" height="5" rx="1"/>
    <rect fill="#a6cfff" x="3" y="23" width="5" height="5" rx="1"/>
  </svg>
);

const CommunicationIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path fill="#a6cfff" d="M6 6H26V21H16L10 26V21H6V6Z"/>
    <circle fill="#4a90e2" cx="11" cy="13" r="1.5"/>
    <circle fill="#4a90e2" cx="16" cy="13" r="1.5"/>
    <circle fill="#4a90e2" cx="21" cy="13" r="1.5"/>
  </svg>
);

const ProductivityIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect fill="#4a90e2" x="4" y="4" width="24" height="24" rx="6"/>
    <path fill="#a6cfff" d="M10 16L14 20L22 10L20 8L14 16L12 14L10 16Z"/>
  </svg>
);

const MusicIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path fill="#4a90e2" d="M10 26V6L26 3V21"/>
    <circle fill="#a6cfff" cx="6" cy="24" r="5"/>
    <circle fill="#a6cfff" cx="22" cy="20" r="5"/>
  </svg>
);

const CryptoIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle fill="#4a90e2" cx="16" cy="16" r="13"/>
    <path fill="#a6cfff" d="M12 11H20V14H12V11ZM12 18H20V21H12V18Z"/>
    <rect fill="#a6cfff" x="14.5" y="7" width="3" height="18" rx="1"/>
  </svg>
);

const TelegramPlatformIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path fill="#4a90e2" d="L28 6L4 14L12 18L28 6Z"/>
    <path fill="#a6cfff" d="L12 18L16 28L28 6L12 18Z"/>
    <path fill="#4a90e2" d="L12 18L16 21V28L12 18Z"/>
  </svg>
);

const BloggersIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect fill="#4a90e2" x="4" y="24" width="24" height="4" rx="2"/>
    <path fill="#a6cfff" d="M8 20L22 4L28 10L14 26L8 20Z"/>
  </svg>
);

const ShoppingIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path fill="#4a90e2" d="M6 10L4 6H28L26 10H6Z"/>
    <rect fill="#a6cfff" x="6" y="10" width="20" height="16" rx="4"/>
    <circle fill="#4a90e2" cx="11" cy="28" r="2.5"/>
    <circle fill="#4a90e2" cx="21" cy="28" r="2.5"/>
  </svg>
);

const SecurityIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect fill="#a6cfff" x="6" y="14" width="20" height="14" rx="4"/>
    <path d="M10 14V10C10 6.68629 12.6863 4 16 4C19.3137 4 22 6.68629 22 10V14" stroke="#4a90e2" strokeWidth="4" fill="none"/>
  </svg>
);

const EducationIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path fill="#4a90e2" d="M16 4L3 11L16 18L29 11L16 4Z"/>
    <path d="M6 14V22C6 22 10 26 16 26C22 26 26 22 26 22V14" stroke="#a6cfff" strokeWidth="2" fill="none"/>
  </svg>
);

const ContentIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect fill="#4a90e2" x="3" y="6" width="26" height="20" rx="4"/>
    <path fill="#a6cfff" d="M13 11L21 16L13 21V11Z"/>
  </svg>
);

export const categories = [
  { id: 'all', label: 'cat_all', icon: AllIcon },
  { id: 'apps', label: 'cat_apps', icon: AppsIcon },
  { id: 'games', label: 'cat_games', icon: GamesIcon },
  { id: 'finance', label: 'cat_finance', icon: FinanceIcon },
  { id: 'moderation', label: 'cat_moderation', icon: ModerationIcon },
  { id: 'utilities', label: 'cat_utilities', icon: UtilitiesIcon },
  { id: 'ai_services', label: 'cat_ai_services', icon: AIServicesIcon },
  { id: 'communication', label: 'cat_communication', icon: CommunicationIcon },
  { id: 'productivity', label: 'cat_productivity', icon: ProductivityIcon },
  { id: 'music', label: 'cat_music', icon: MusicIcon },
  { id: 'crypto', label: 'cat_crypto', icon: CryptoIcon },
  { id: 'telegram_platform', label: 'cat_telegram_platform', icon: TelegramPlatformIcon },
  { id: 'bloggers', label: 'cat_bloggers', icon: BloggersIcon },
  { id: 'shopping', label: 'cat_shopping', icon: ShoppingIcon },
  { id: 'security', label: 'cat_security', icon: SecurityIcon },
  { id: 'education', label: 'cat_education', icon: EducationIcon },
  { id: 'content', label: 'cat_content', icon: ContentIcon },
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

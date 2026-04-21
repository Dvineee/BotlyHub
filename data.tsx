
import { ExtendedBot, SubscriptionPlan, Notification } from './types';
import { Star, Crown, Gem, Zap } from 'lucide-react';

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

const AllIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg" className={className}><path d="M4 6C4 4.89543 4.89543 4 6 4H8C9.10457 4 10 4.89543 10 6V8C10 9.10457 9.10457 10 8 10H6C4.89543 10 4 9.10457 4 8V6Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 6C14 4.89543 14.8954 4 16 4H18C19.1046 4 20 4.89543 20 6V8C20 9.10457 19.1046 10 18 10H16C14.8954 10 14 9.10457 14 8V6Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 16C4 14.8954 4.89543 14 6 14H8C9.10457 14 10 14.8954 10 16V18C10 19.1046 9.10457 20 8 20H6C4.89543 20 4 19.1046 4 18V16Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 16C14 14.8954 14.8954 14 16 14H18C19.1046 14 20 14.8954 20 16V18C20 19.1046 19.1046 20 18 20H16C14.8954 20 14 19.1046 14 18V16Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
);

const GamesIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg" className={className}><path fillRule="evenodd" clipRule="evenodd" d="M5.68798 6.4931C6.08736 6.18072 6.58459 6 7.11535 6H16.8848C17.4156 6 17.9128 6.18072 18.3122 6.4931C18.7116 6.80553 19.0114 7.24835 19.1446 7.77198L20.7208 13.9686C20.9063 14.6976 21.0001 15.4473 21.0001 16.2C21.0001 16.6999 20.8002 17.1494 20.4766 17.4756C20.1531 17.8017 19.7109 18 19.2223 18C18.7338 18 18.2915 17.8017 17.968 17.4756C17.7139 17.2194 17.2946 16.5645 16.8918 15.8595C16.7033 15.5294 16.536 15.2202 16.4157 14.9932C16.3557 14.8799 16.3076 14.7876 16.2748 14.7242L16.2376 14.6517L16.2283 14.6335L16.2261 14.6293L16.2257 14.6284L16.2257 14.6284L16.2257 14.6283L16.2256 14.6283L15.9481 14.08H15.3335H8.66679H8.0541L7.77591 14.6258L7.7759 14.6258L7.77586 14.6259L7.77586 14.6259L7.77544 14.6267L7.77334 14.6308L7.76423 14.6485L7.72738 14.7196C7.69493 14.782 7.64733 14.8726 7.5877 14.9841C7.46821 15.2076 7.30169 15.5125 7.11302 15.8391C6.71197 16.5335 6.28642 17.1914 6.01426 17.4657C5.66486 17.8179 5.23993 18 4.77784 18C4.28927 18 3.84703 17.8017 3.52356 17.4756C3.20638 17.1559 3.00808 16.7178 3.00029 16.2299C3.03766 15.1767 3.12934 14.5582 3.27934 13.9686L4.8556 7.77198C4.9888 7.24835 5.28851 6.80553 5.68798 6.4931ZM15.1552 16.8515C14.9928 16.5671 14.846 16.2989 14.7286 16.08H9.2692C9.15254 16.2955 9.00674 16.5592 8.84492 16.8394C8.46365 17.4995 7.9179 18.3866 7.4341 18.8743C6.7357 19.5783 5.80965 20 4.77784 20C3.73228 20 2.78562 19.5715 2.10373 18.8842C1.4272 18.2022 1.00649 17.261 1.00012 16.2238L1 16.2035L1.0007 16.1831C1.04107 15.0151 1.14571 14.2435 1.34106 13.4755L2.91733 7.27893C3.16217 6.31639 3.71586 5.49648 4.45581 4.91773C5.19584 4.33892 6.12403 4 7.11535 4H16.8848C17.8761 4 18.8043 4.33892 19.5443 4.91773C20.2843 5.49648 20.838 6.31639 21.0828 7.27893L22.6591 13.4755C22.8855 14.3658 23.0001 15.2811 23.0001 16.2C23.0001 17.2465 22.5782 18.197 21.8964 18.8842C21.2145 19.5715 20.2679 20 19.2223 20C18.1768 20 17.2301 19.5715 16.5482 18.8842C16.0763 18.4085 15.5333 17.5134 15.1552 16.8515ZM10.0001 10C10.0001 10.8284 9.32853 11.5 8.50011 11.5C7.67168 11.5 7.00011 10.8284 7.00011 10C7.00011 9.17157 7.67168 8.5 8.50011 8.5C9.32853 8.5 10.0001 9.17157 10.0001 10ZM17.0001 10C17.0001 10.8284 16.3285 11.5 15.5001 11.5C14.6717 11.5 14.0001 10.8284 14.0001 10C14.0001 9.17157 14.6717 8.5 15.5001 8.5C16.3285 8.5 17.0001 9.17157 17.0001 10Z" fill="currentColor"></path></svg>
);

const FinanceIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg" className={className}><path d="M19 8H5C3.89543 8 3 8.89543 3 10V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V10C21 8.89543 20.1046 8 19 8Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M17 8V6C17 4.89543 16.1046 4 15 4H9C7.89543 4 7 4.89543 7 6V8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M11 14H13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
);

const ModerationIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg" className={className}><path d="M12 2L3 7V12C3 17.5 7.5 21 12 22C16.5 21 21 17.5 21 12V7L12 2Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
);

const UtilitiesIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg" className={className}><path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
);

const AIServicesIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg" className={className}><path d="M12 2L14.85 9.15L22 12L14.85 14.85L12 22L9.15 14.85L2 12L9.15 9.15L12 2Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M19 3L20 5L22 6L20 7L19 9L18 7L16 6L18 5L19 3Z" fill="currentColor"/><path d="M5 16L6 18L8 19L6 20L5 22L4 20L2 19L4 18L5 16Z" fill="currentColor"/></svg>
);

const CommunicationIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg" className={className}><path d="M21 11.5C21 16.1944 16.9706 20 12 20C10.5312 20 9.1541 19.6644 7.9406 19.0725L3 20.5L4.5 15.5C3.55938 14.4181 3 13.0298 3 11.5C3 6.80558 7.02944 3 12 3C16.9706 3 21 6.80558 21 11.5Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
);

const ProductivityIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg" className={className}><path d="M16 4H8C5.79086 4 4 5.79086 4 8V16C4 18.2091 5.79086 20 8 20H16C18.2091 20 20 18.2091 20 16V8C20 5.79086 18.2091 4 16 4Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
);

const MusicIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg" className={className}><path d="M9 18V5L20 3V16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="2.5"/><circle cx="17" cy="16" r="3" stroke="currentColor" strokeWidth="2.5"/></svg>
);

const CryptoIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg" className={className}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5"/><path d="M9 10C9 10 10.5 9 12 9C13.5 9 15 10 15 12C15 14 13.5 15 12 15C10.5 15 9 14 9 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/><path d="M12 7V17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
);

const TelegramPlatformIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg" className={className}><path d="M21 12H3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/><path d="M12 21V3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/><rect x="7" y="7" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="2.5"/></svg>
);

const BloggersIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg" className={className}><path d="M12 20H21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M16.5 3.5C17.3284 2.67157 18.6716 2.67157 19.5 3.5C20.3284 4.32843 20.3284 5.67157 19.5 6.5L7 19L3 20L4 16L16.5 3.5Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
);

const ShoppingIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg" className={className}><path d="M6 2L3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6L18 2H6Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 6H21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 10C16 12.2091 14.2091 14 12 14C9.79086 14 8 12.2091 8 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
);

const SecurityIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg" className={className}><rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2.5"/><path d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
);

const EducationIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg" className={className}><path d="M22 10L12 5L2 10L12 15L22 10Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 12V17C6 17 8.5 19 12 19C15.5 19 18 17 18 17V12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
);

const ContentIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg" className={className}><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2.5"/><path d="M8 9H16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/><path d="M8 13H16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/><path d="M8 17H12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
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

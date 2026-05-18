
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

const AppSubIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#ff6b6b" />
        <path d="M2 17L12 22L22 17" stroke="#ff8e53" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 12L12 17L22 12" stroke="#ff8e53" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const TrendIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M23 6L13.5 15.5L8.5 10.5L1 18" stroke="#ff6b6b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M17 6H23V12" stroke="#ff8e53" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const EditorIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#ff6b6b" stroke="#ff8e53" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const NewIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="12" cy="12" r="10" stroke="#ff8e53" strokeWidth="2"/>
        <path d="M12 8V16M8 12H16" stroke="#ff6b6b" strokeWidth="2" strokeLinecap="round"/>
    </svg>
);

const AppGamesIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect x="2" y="6" width="20" height="12" rx="2" stroke="#ff8e53" strokeWidth="2"/>
        <path d="M6 12H10M8 10V14" stroke="#ff6b6b" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="15.5" cy="10.5" r="1.5" fill="#ff6b6b"/>
        <circle cx="18.5" cy="13.5" r="1.5" fill="#ff6b6b"/>
    </svg>
);

const BotIconForApps = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect x="3" y="11" width="18" height="10" rx="2" stroke="#ff8e53" strokeWidth="2"/>
        <circle cx="12" cy="5" r="2" stroke="#ff6b6b" strokeWidth="2"/>
        <path d="M12 7V11" stroke="#ff6b6b" strokeWidth="2"/>
        <path d="M9 15H9.01M15 15H15.01" stroke="#ff8e53" strokeWidth="3" strokeLinecap="round"/>
    </svg>
);

const SiteIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="12" cy="12" r="10" stroke="#ff8e53" strokeWidth="2"/>
        <path d="M2 12H22" stroke="#ff6b6b" strokeWidth="2"/>
        <path d="M12 2C14.5 4.5 16 8.5 16 12C16 15.5 14.5 19.5 12 22C9.5 19.5 8 15.5 8 12C8 8.5 9.5 4.5 12 2Z" stroke="#ff6b6b" strokeWidth="2"/>
    </svg>
);

const AIIconForApps = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="#ff6b6b" stroke="#ff8e53" strokeWidth="1"/>
    </svg>
);

const Web3Icon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M12 2L4 7V17L12 22L20 17V7L12 2Z" stroke="#ff8e53" strokeWidth="2"/>
        <path d="M12 22V12M12 12L20 7M12 12L4 7" stroke="#ff6b6b" strokeWidth="2"/>
    </svg>
);

const EarnIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="12" cy="12" r="8" stroke="#ff8e53" strokeWidth="2"/>
        <path d="M12 8V16M12 12H12.01" stroke="#ff6b6b" strokeWidth="4" strokeLinecap="round"/>
        <path d="M15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12Z" stroke="#ff6b6b" strokeWidth="2"/>
    </svg>
);

const TradeIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M12 20V10M18 20V4M6 20V16" stroke="#ff8e53" strokeWidth="2" strokeLinecap="round"/>
        <path d="M3 20H21" stroke="#ff6b6b" strokeWidth="2" strokeLinecap="round"/>
    </svg>
);

const ArtIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#ff8e53" strokeWidth="2"/>
        <circle cx="7.5" cy="11.5" r="1.5" fill="#ff6b6b"/>
        <circle cx="11.5" cy="7.5" r="1.5" fill="#ff6b6b"/>
        <circle cx="16.5" cy="8.5" r="1.5" fill="#ff6b6b"/>
    </svg>
);

const SocialIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="#ff8e53" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="9" cy="7" r="4" stroke="#ff6b6b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M23 21V19C22.9993 18.1137 22.7044 17.2522 22.1614 16.5523C21.6184 15.8524 20.8581 15.3516 20 15.13" stroke="#ff8e53" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25393 19.0078 6.11768 19.0078 7.005C19.0078 7.89232 18.7122 8.75607 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="#ff6b6b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const DevIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M16 18L22 12L16 6" stroke="#ff6b6b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8 6L2 12L8 18" stroke="#ff6b6b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M13 3L11 21" stroke="#ff8e53" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const SaaSIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="#ff8e53" strokeWidth="2"/>
        <path d="M3 9H21" stroke="#ff6b6b" strokeWidth="2"/>
        <path d="M9 3V21" stroke="#ff6b6b" strokeWidth="2"/>
    </svg>
);

const PrivacyIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="#ff8e53" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="11" r="3" stroke="#ff6b6b" strokeWidth="2"/>
        <path d="M12 14V17" stroke="#ff6b6b" strokeWidth="2"/>
    </svg>
);

export const appsSubCategories = [
    { id: 'trending', label: 'apps_cat_trending', icon: TrendIcon },
    { id: 'editors_choice', label: 'apps_cat_editors_choice', icon: EditorIcon },
    { id: 'new', label: 'apps_cat_new', icon: NewIcon },
    { id: 'games_sub', label: 'apps_cat_games', icon: AppGamesIcon },
    { id: 'tma_bots', label: 'apps_cat_tma_bots', icon: BotIconForApps },
    { id: 'ton_sites', label: 'apps_cat_ton_sites', icon: SiteIcon },
    { id: 'ai_sub', label: 'apps_cat_ai', icon: AIIconForApps },
    { id: 'web3_general', label: 'apps_cat_web3', icon: Web3Icon },
    { id: 'earn', label: 'apps_cat_earn', icon: EarnIcon },
    { id: 'trade', label: 'apps_cat_trade', icon: TradeIcon },
    { id: 'art', label: 'apps_cat_art', icon: ArtIcon },
    { id: 'social', label: 'apps_cat_social', icon: SocialIcon },
    { id: 'dev', label: 'apps_cat_dev', icon: DevIcon },
    { id: 'saas', label: 'apps_cat_saas', icon: SaaSIcon },
    { id: 'security_privacy', label: 'apps_cat_security', icon: PrivacyIcon },
];

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
  { id: 'games', label: 'cat_games', desc: 'desc_cat_games', icon: GamesIcon },
  { id: 'finance', label: 'cat_finance', desc: 'desc_cat_finance', icon: FinanceIcon },
  { id: 'moderation', label: 'cat_moderation', desc: 'desc_cat_moderation', icon: ModerationIcon },
  { id: 'utilities', label: 'cat_utilities', desc: 'desc_cat_utilities', icon: UtilitiesIcon },
  { id: 'ai_services', label: 'cat_ai_services', desc: 'desc_cat_ai_services', icon: AIServicesIcon },
  { id: 'communication', label: 'cat_communication', desc: 'desc_cat_communication', icon: CommunicationIcon },
  { id: 'productivity', label: 'cat_productivity', desc: 'desc_cat_productivity', icon: ProductivityIcon },
  { id: 'music', label: 'cat_music', desc: 'desc_cat_music', icon: MusicIcon },
  { id: 'crypto', label: 'cat_crypto', desc: 'desc_cat_crypto', icon: CryptoIcon },
  { id: 'telegram_platform', label: 'cat_telegram_platform', desc: 'desc_cat_telegram_platform', icon: TelegramPlatformIcon },
  { id: 'bloggers', label: 'cat_bloggers', desc: 'desc_cat_bloggers', icon: BloggersIcon },
  { id: 'shopping', label: 'cat_shopping', desc: 'desc_cat_shopping', icon: ShoppingIcon },
  { id: 'security', label: 'cat_security', desc: 'desc_cat_security', icon: SecurityIcon },
  { id: 'education', label: 'cat_education', desc: 'desc_cat_education', icon: EducationIcon },
  { id: 'content', label: 'cat_content', desc: 'desc_cat_content', icon: ContentIcon },
];

export const mockBots: ExtendedBot[] = [
  { id: '1', slug: 'task-master', name: 'Task Master', description: 'bot_task_master_desc', price: 29.99, icon: 'https://picsum.photos/seed/task/200', category: ['productivity'], isNew: true, bot_link: 'https://t.me/botlyhub_bot', screenshots: [] },
  { id: '2', slug: 'gamebot-pro', name: 'GameBot Pro', description: 'bot_gamebot_pro_desc', price: 0, icon: 'https://picsum.photos/seed/game/200', category: ['games'], bot_link: 'https://t.me/botlyhub_bot', screenshots: [] },
  { id: '10', slug: 'stockbot', name: 'StockBot', description: 'bot_stockbot_desc', price: 120.00, icon: 'https://picsum.photos/seed/stock/200', category: ['finance'], bot_link: 'https://t.me/botlyhub_bot', screenshots: [] },
];

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'plan_starter',
    name: 'plan_starter_name',
    price: 0,
    billingPeriod: 'plan_billing_monthly',
    description: 'plan_starter_desc',
    color: 'slate',
    icon: Star,
    features: [
      'plan_feature_5_channels',
      'plan_feature_standard_support',
      'plan_feature_20_comm'
    ]
  },
  {
    id: 'plan_pro',
    name: 'plan_pro_name',
    price: 149.90,
    billingPeriod: 'plan_billing_monthly',
    description: 'plan_pro_desc',
    color: 'blue',
    icon: Zap,
    isPopular: true,
    features: [
      'plan_feature_20_channels',
      'plan_feature_priority_support',
      'plan_feature_10_comm',
      'plan_feature_detailed_stats'
    ]
  },
  {
    id: 'plan_elite',
    name: 'plan_elite_name',
    price: 399.90,
    billingPeriod: 'plan_billing_monthly',
    description: 'plan_elite_desc',
    color: 'yellow',
    icon: Crown,
    features: [
      'plan_feature_unlimited_channels',
      'plan_feature_247_support',
      'plan_feature_2_comm',
      'plan_feature_special_badge'
    ]
  }
];

export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'payment',
    title: 'notif_payment_received',
    message: 'notif_ton_received_msg',
    date: new Date().toISOString(),
    isRead: false
  }
];

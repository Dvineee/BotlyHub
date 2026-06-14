
import { ExtendedBot, SubscriptionPlan, Notification } from './types';
import { realBotsData } from './bots_data';
import { 
  Star, Crown, Gem, Zap,
  LayoutGrid, Gamepad2, Landmark, ShieldCheck, Wrench, BrainCircuit,
  MessageSquare, Briefcase, Music, Coins, Send, PenTool,
  ShoppingBag, Shield, GraduationCap, Play, Flame, Award,
  Sparkles, Bot, Globe, Link2, RefreshCw, Palette, Users, Code, Cloud, EyeOff
} from 'lucide-react';

const AppsIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <LayoutGrid size={size} className={`stroke-[2.2] text-[#0a263d] dark:text-slate-200 ${className}`} />
);

const AllIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <LayoutGrid size={size} className={`stroke-[2.2] text-[#0a263d] dark:text-slate-200 ${className}`} />
);

const GamesIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <Gamepad2 size={size} className={`stroke-[2.2] text-[#0a263d] dark:text-slate-200 ${className}`} />
);

const FinanceIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <Landmark size={size} className={`stroke-[2.2] text-[#0a263d] dark:text-slate-200 ${className}`} />
);

const ModerationIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <ShieldCheck size={size} className={`stroke-[2.2] text-[#0a263d] dark:text-slate-200 ${className}`} />
);

const UtilitiesIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <Wrench size={size} className={`stroke-[2.2] text-[#0a263d] dark:text-slate-200 ${className}`} />
);

const AIServicesIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <BrainCircuit size={size} className={`stroke-[2.2] text-[#0a263d] dark:text-slate-200 ${className}`} />
);

const CommunicationIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <MessageSquare size={size} className={`stroke-[2.2] text-[#0a263d] dark:text-slate-200 ${className}`} />
);

const ProductivityIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <Briefcase size={size} className={`stroke-[2.2] text-[#0a263d] dark:text-slate-200 ${className}`} />
);

const MusicIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <Music size={size} className={`stroke-[2.2] text-[#0a263d] dark:text-slate-200 ${className}`} />
);

const CryptoIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <Coins size={size} className={`stroke-[2.2] text-[#0a263d] dark:text-slate-200 ${className}`} />
);

const TelegramPlatformIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <Send size={size} className={`stroke-[2.2] text-[#0a263d] dark:text-slate-200 ${className}`} />
);

const BloggersIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <PenTool size={size} className={`stroke-[2.2] text-[#0a263d] dark:text-slate-200 ${className}`} />
);

const ShoppingIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <ShoppingBag size={size} className={`stroke-[2.2] text-[#0a263d] dark:text-slate-200 ${className}`} />
);

const SecurityIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <Shield size={size} className={`stroke-[2.2] text-[#0a263d] dark:text-slate-200 ${className}`} />
);

const AppSubIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
    <Sparkles size={size} className={`stroke-[2.2] text-[#0a263d] dark:text-slate-200 ${className}`} />
);

const TrendIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
    <Flame size={size} className={`stroke-[2.2] text-[#0a263d] dark:text-slate-200 ${className}`} />
);

const EditorIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
    <Award size={size} className={`stroke-[2.2] text-[#0a263d] dark:text-slate-200 ${className}`} />
);

const NewIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
    <Sparkles size={size} className={`stroke-[2.2] text-[#0a263d] dark:text-slate-200 ${className}`} />
);

const AppGamesIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
    <Gamepad2 size={size} className={`stroke-[2.2] text-[#0a263d] dark:text-slate-200 ${className}`} />
);

const BotIconForApps = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
    <Bot size={size} className={`stroke-[2.2] text-[#0a263d] dark:text-slate-200 ${className}`} />
);

const SiteIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
    <Globe size={size} className={`stroke-[2.2] text-[#0a263d] dark:text-slate-200 ${className}`} />
);

const AIIconForApps = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
    <BrainCircuit size={size} className={`stroke-[2.2] text-[#0a263d] dark:text-slate-200 ${className}`} />
);

const Web3Icon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
    <Link2 size={size} className={`stroke-[2.2] text-[#0a263d] dark:text-slate-200 ${className}`} />
);

const EarnIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
    <Coins size={size} className={`stroke-[2.2] text-[#0a263d] dark:text-slate-200 ${className}`} />
);

const TradeIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
    <RefreshCw size={size} className={`stroke-[2.2] text-[#0a263d] dark:text-slate-200 ${className}`} />
);

const ArtIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
    <Palette size={size} className={`stroke-[2.2] text-[#0a263d] dark:text-slate-200 ${className}`} />
);

const SocialIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
    <Users size={size} className={`stroke-[2.2] text-[#0a263d] dark:text-slate-200 ${className}`} />
);

const DevIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
    <Code size={size} className={`stroke-[2.2] text-[#0a263d] dark:text-slate-200 ${className}`} />
);

const SaaSIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
    <Cloud size={size} className={`stroke-[2.2] text-[#0a263d] dark:text-slate-200 ${className}`} />
);

const PrivacyIcon = ({ size = 24, className = "" }: { size?: number, className?: string }) => (
    <EyeOff size={size} className={`stroke-[2.2] text-[#0a263d] dark:text-slate-200 ${className}`} />
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
  <GraduationCap size={size} className={`stroke-[2.2] text-[#0a263d] dark:text-slate-200 ${className}`} />
);

const ContentIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <Play size={size} className={`stroke-[2.2] text-[#0a263d] dark:text-slate-200 ${className}`} />
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
  { id: 'a_kategori', label: 'a_kategori', desc: 'desc_a_kategori', icon: AllIcon },
];

export const mockBots: ExtendedBot[] = realBotsData.map(bot => ({
  ...bot,
  category: bot.category,
  screenshots: bot.screenshots || [],
  languages: bot.languages || [],
  isNew: bot.isNew || false
}));

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

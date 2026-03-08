
import { Layout, Briefcase, Gamepad2, Zap, Wallet, Music, Shield, Star, Crown, Gem } from 'lucide-react';
import { ExtendedBot, SubscriptionPlan, Notification } from './types';

export const categories = [
  { id: 'all', label: 'cat_all', icon: Layout },
  { id: 'productivity', label: 'cat_productivity', icon: Briefcase },
  { id: 'games', label: 'cat_games', icon: Gamepad2 },
  { id: 'utilities', label: 'cat_utilities', icon: Zap },
  { id: 'finance', label: 'cat_finance', icon: Wallet },
  { id: 'music', label: 'cat_music', icon: Music },
  { id: 'moderation', label: 'cat_moderation', icon: Shield },
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

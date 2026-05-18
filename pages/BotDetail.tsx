
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Share2, Send, Loader2, ShieldCheck, 
  Bot as BotIcon, Zap, Shield, PlusCircle, X, 
  Maximize2, ChevronRight, ChevronLeft, ChevronDown, Eye, Lock, Unlock, AlertTriangle, Edit3,
  Sparkles, Star, Download, Info, CheckCircle2, Globe, Cpu,
  Play, UserPlus, MessageSquare, BarChart3, MousePointer2,
  Search, LayoutGrid, Store, User as UserIcon, Megaphone, Bell, Link as LinkIcon, Flag,
  Sun, Moon, Wallet, Menu, ExternalLink, Coins, Briefcase, Compass, LogOut, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import { Bot, Channel, User, Notification } from '../types';
import { categories } from '../data';
import { useTelegram } from '../hooks/useTelegram';
import { DatabaseService } from '../services/DatabaseService';
import PriceService from '../services/PriceService';
import { useTranslation } from '../TranslationContext';
import { GeminiService } from '../services/GeminiService';
import { useDraggableScroll } from '../hooks/useDraggableScroll';
import { useTheme } from '../ThemeContext';
import Logo from '../components/Logo';
import { useRef } from 'react';
import { SEO } from '../components/SEO';
import LoginModal from '../components/LoginModal';

const getLiveBotIcon = (bot: Bot) => {
    if (bot.bot_link) {
        const username = bot.bot_link.replace('@', '').replace('https://t.me/', '').split('/').pop()?.trim();
        if (username) return `https://t.me/i/userpic/320/${username}.jpg`;
    }
    return bot.icon || `https://ui-avatars.com/api/?name=${encodeURIComponent(bot.name)}&background=1e293b&color=fff&bold=true`;
};

const NavMenu = ({ 
    user, 
    unreadCount, 
    theme, 
    toggleTheme, 
    haptic, 
    isMenuOpen, 
    setIsMenuOpen, 
    setIsLoginModalOpen, 
    setWebAuthUser, 
    isLoginModalOpen,
    menuRef: parentMenuRef
}: { 
    user: any, 
    unreadCount: number, 
    theme: string, 
    toggleTheme: () => void, 
    haptic: any, 
    isMenuOpen: boolean, 
    setIsMenuOpen: (v: boolean) => void,
    setIsLoginModalOpen: (v: boolean) => void,
    setWebAuthUser: (v: any) => void,
    isLoginModalOpen: boolean,
    menuRef: React.RefObject<HTMLDivElement>
}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [openMenu, setOpenMenu] = useState<'kesfet' | 'investors' | null>(null);
    const [mobileModal, setMobileModal] = useState<'kesfet' | 'investors' | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const internalMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (internalMenuRef.current && !internalMenuRef.current.contains(event.target as Node)) {
                setOpenMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            haptic('light');
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
            setOpenMenu(null);
            setMobileModal(null);
        }
    };

    const discoverItems: { id: string; label: string; desc: string; icon: any; action?: () => void; path?: string; }[] = [
        { id: 'bots', label: 'Botlar', desc: 'Telegram Bot Marketi', icon: BotIcon, action: () => { navigate('/search?mode=bots&category=all'); setOpenMenu(null); setMobileModal(null); } },
        { id: 'apps', label: 'Uygulamalar', desc: 'Web3 & TMA Uygulamaları', icon: LayoutGrid, action: () => { navigate('/search?mode=apps&category=all'); setOpenMenu(null); setMobileModal(null); } },
        { id: 'channels', label: 'Kanallar', desc: 'Popüler Telegram Kanalları', icon: Megaphone, path: '/channels' },
        { id: 'ads', label: 'Reklam', desc: 'Projenizi Öne Çıkarın', icon: Share2, path: '/settings' },
    ];

    const investorItems: { id: string; label: string; desc: string; icon: any; action?: () => void; path?: string; }[] = [
        { id: 'exchanges', label: 'Borsalar ve Takas', desc: 'CEX & DEX Platformları', icon: BarChart3 },
        { id: 'earn', label: 'Kazanç Uygulamaları', desc: 'Pasif Gelir Fırsatları', icon: Coins },
        { id: 'tools', label: 'Yatırım Araçları', desc: 'Analiz ve Takip Araçları', icon: Briefcase },
        { id: 'new', label: 'Yeni Keşifler', desc: 'Gelecek Vaadeden Projeler', icon: Compass },
    ];

    const simpleLinks = [
        { label: 'Hızlı Link 1', path: '#' },
        { label: 'Hızlı Link 2', path: '#' },
        { label: 'Hızlı Link 3', path: '#' },
    ];

    const renderMegaMenuContent = () => {
        if (openMenu === 'kesfet') {
            return (
                <div className="max-w-5xl mx-auto px-6 grid grid-cols-12 gap-8">
                    <div className="col-span-8">
                        <div className="grid grid-cols-2 gap-4">
                            {discoverItems.map(item => (
                                <button 
                                    key={item.id}
                                    onClick={() => {
                                        if (item.action) item.action();
                                        else if (item.path) { navigate(item.path); setOpenMenu(null); }
                                    }}
                                    className="flex items-center gap-4 p-4 hover:bg-black/[0.02] dark:hover:bg-white/5 rounded-2xl transition-all group border border-transparent hover:border-black/5 dark:hover:border-white/10 text-left w-full"
                                >
                                    <div className="menu-icon-container shrink-0">
                                        <item.icon size={20} className="menu-item-icon" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[14px] font-semibold menu-item-text">{item.label}</span>
                                        <span className="text-[12px] text-slate-500 dark:text-slate-400 font-normal">{item.desc}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        if (openMenu === 'investors') {
            return (
                <div className="max-w-5xl mx-auto px-6 grid grid-cols-12 gap-8">
                    <div className="col-span-8">
                        <div className="grid grid-cols-2 gap-4">
                            {investorItems.map(item => (
                                <button 
                                    key={item.id}
                                    className="flex items-center gap-4 p-4 hover:bg-black/[0.02] dark:hover:bg-white/5 rounded-2xl transition-all group border border-transparent hover:border-black/5 dark:hover:border-white/10 text-left w-full"
                                >
                                    <div className="menu-icon-container shrink-0">
                                        <item.icon size={20} className="menu-item-icon" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[14px] font-semibold menu-item-text">{item.label}</span>
                                        <span className="text-[12px] text-slate-500 dark:text-slate-400 font-normal">{item.desc}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }
    };

    return (
        <>
        <div className="sticky top-0 z-[100] bg-white dark:bg-slate-900 border-b border-[#f7f7f7] dark:border-white/5 w-full py-2.5 md:pb-2 transition-colors" ref={internalMenuRef}>
            <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between gap-3 md:gap-4">
                {/* Left Section (Logo) */}
                <div className="flex items-center w-auto shrink-0">
                    <Logo onClick={() => navigate('/')} className="cursor-pointer" />
                </div>

                {/* Mobile Search Button */}
                <div className="flex md:hidden flex-1 justify-center">
                    <button 
                        onClick={() => { haptic('light'); navigate('/search'); }}
                        className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 border border-black/5 dark:border-white/10 rounded-xl text-slate-500 active:scale-95 transition-all"
                    >
                        <Search size={20} />
                    </button>
                </div>

                {/* Center Section (Navigation & Search) */}
                <div className="hidden md:flex items-center justify-center gap-8 md:gap-10 flex-1">
                    <div className="flex items-center gap-6">
                        {/* Discover (Keşfet) */}
                        <div 
                            className="relative md:static"
                            onMouseEnter={() => { if (window.innerWidth >= 768) setOpenMenu('kesfet'); }}
                        >
                            <button 
                                onClick={() => {
                                    if (window.innerWidth < 768) {
                                        haptic('light');
                                        setMobileModal('kesfet');
                                    } else {
                                        setOpenMenu(openMenu === 'kesfet' ? null : 'kesfet');
                                    }
                                }}
                                className={`nav-menu-item grow-0 ${openMenu === 'kesfet' ? 'text-slate-900 dark:text-white bg-blue-500/5' : 'text-slate-600 dark:text-slate-400 hover:bg-blue-500/5'}`}
                            >
                                Keşfet <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${openMenu === 'kesfet' ? 'rotate-180' : ''}`} />
                            </button>
                        </div>

                        {/* Investors (Yatırımcılar) */}
                        <div 
                            className="relative md:static"
                            onMouseEnter={() => { if (window.innerWidth >= 768) setOpenMenu('investors'); }}
                        >
                            <button 
                                onClick={() => {
                                    if (window.innerWidth < 768) {
                                        haptic('light');
                                        setMobileModal('investors');
                                    } else {
                                        setOpenMenu(openMenu === 'investors' ? null : 'investors');
                                    }
                                }}
                                className={`nav-menu-item grow-0 ${openMenu === 'investors' ? 'text-slate-900 dark:text-white bg-emerald-500/5' : 'text-slate-600 dark:text-slate-400 hover:bg-emerald-500/5'}`}
                            >
                                Yatırımcılar <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${openMenu === 'investors' ? 'rotate-180' : ''}`} />
                            </button>
                        </div>

                        {/* Blog Link */}
                        <button 
                            onClick={() => { haptic('light'); navigate('/blog'); }}
                            className="nav-menu-item text-slate-600 dark:text-slate-400 hover:bg-blue-500/5 whitespace-nowrap"
                        >
                            {t('blog_title')}
                        </button>
                    </div>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="flex-1 max-w-sm">
                        <div className="relative flex items-center bg-slate-50 dark:bg-slate-800/50 border border-black/5 dark:border-white/10 rounded-xl p-1 group">
                            <Search size={16} className="ml-2 text-slate-400 group-focus-within:text-blue-500" />
                            <input 
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t('search_placeholder')}
                                className="w-full bg-transparent border-none focus:ring-0 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 text-slate-700 dark:text-slate-200"
                            />
                        </div>
                    </form>
                </div>

                {/* Profile Section */}
                <div className="flex items-center justify-end w-auto shrink-0 gap-2 md:gap-3">
                    <button 
                        onClick={() => { haptic('light'); toggleTheme(); }} 
                        className="hidden md:flex nav-menu-item min-w-[33px] px-2 items-center justify-center bg-transparent hover:bg-slate-100/50 dark:hover:bg-white/5 border border-black/5 dark:border-white/5 rounded-[10px] text-slate-900 dark:text-white active:scale-95 transition-all outline-none"
                    >
                        {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
                    </button>

                    {user ? (
                        <>
                            <button onClick={() => { haptic('medium'); navigate('/earnings'); }} className="hidden sm:flex nav-menu-item w-[33px] !px-0 flex items-center justify-center bg-transparent hover:bg-slate-100/50 dark:hover:bg-white/5 border border-black/5 dark:border-white/5 rounded-[10px] text-slate-900 dark:text-white active:scale-95 transition-all">
                                <Wallet size={17} />
                            </button>
                            <div className="relative" ref={parentMenuRef}>
                                <button 
                                  onClick={() => { haptic('light'); setIsMenuOpen(!isMenuOpen); }} 
                                  className={`nav-menu-item border border-black/5 dark:border-white/5 text-slate-900 dark:text-white active:scale-95 transition-all relative ${isMenuOpen ? 'bg-slate-100 dark:bg-white/10' : 'bg-transparent hover:bg-slate-100/50 dark:hover:bg-white/5'}`}
                                >
                                    <Menu size={16} strokeWidth={2.5} />
                                    <span className="hidden lg:inline">{t('home_menu') || 'Menu'}</span>
                                    {unreadCount > 0 && (
                                        <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-600 rounded-full border-2 border-slate-50 dark:border-slate-950 text-[8px] font-black text-white flex items-center justify-center px-1">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </div>
                                    )}
                                </button>
                                {isMenuOpen && (
                                    <div className="absolute right-0 top-full mt-4 w-60 bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-white/5 rounded-2xl shadow-2xl p-2 z-[100] animate-in fade-in zoom-in-95 duration-200">
                                        <div className="p-4 border-b border-slate-100 dark:border-white/5 mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-black">
                                                    {user.first_name ? user.first_name[0] : 'U'}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-[13px] font-bold text-slate-900 dark:text-white truncate">
                                                        {user.first_name} {user.last_name}
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 truncate">@{user.username || user.id}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <button onClick={() => { haptic('light'); navigate('/notifications'); setIsMenuOpen(false); }} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all group">
                                            <div className="flex items-center gap-3">
                                                <Bell size={18} className="group-hover:text-blue-500 transition-colors" />
                                                <span className="text-xs font-bold uppercase tracking-tight">{t('notif_inbox')}</span>
                                            </div>
                                            {unreadCount > 0 && <div className="w-2 h-2 bg-red-500 rounded-full" />}
                                        </button>

                                        <button onClick={() => { haptic('light'); navigate('/settings'); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all group">
                                            <Plus size={18} className="group-hover:text-emerald-500 transition-colors" />
                                            <span className="text-xs font-bold uppercase tracking-tight">{t('add_project')}</span>
                                        </button>

                                        <div className="h-px bg-slate-100 dark:border-white/5 my-2" />

                                        <button onClick={() => { 
                                            const confirmed = window.confirm("Çıkış yapmak istediğinize emin misiniz?");
                                            if (confirmed) {
                                                haptic('medium'); 
                                                setWebAuthUser(null);
                                                setIsMenuOpen(false); 
                                            }
                                        }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 transition-all font-bold text-xs uppercase">
                                            <LogOut size={18} />
                                            {t('home_logout')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <button 
                            onClick={() => { haptic('light'); setIsLoginModalOpen(true); }}
                            className="nav-menu-item bg-blue-600 hover:bg-blue-700 text-white border-none text-[10px] font-black uppercase tracking-widest px-4 md:px-6 shadow-lg shadow-blue-500/20 active:scale-95 transition-all whitespace-nowrap"
                        >
                            {t('home_login')}
                        </button>
                    )}
                </div>
            </div>

            {/* Desktop Mega Menu Overlay */}
            <AnimatePresence>
                {openMenu && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 w-full bg-white dark:bg-slate-900 border-b border-black/5 dark:border-white/5 shadow-2xl py-8 hidden md:block"
                        onMouseLeave={() => setOpenMenu(null)}
                    >
                        {renderMegaMenuContent()}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* Mobile Mega Menus */}
        <AnimatePresence>
            {mobileModal && (
                <div className="fixed inset-0 z-[200] md:hidden">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setMobileModal(null)}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div 
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="absolute bottom-0 left-0 w-full bg-white dark:bg-slate-900 rounded-t-[32px] p-6 max-h-[85vh] overflow-y-auto"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic">
                                {mobileModal === 'kesfet' ? 'Keşfet' : 'Yatırımcılar'}
                            </h3>
                            <button onClick={() => setMobileModal(null)} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {(mobileModal === 'kesfet' ? discoverItems : investorItems).map(item => (
                                <button 
                                    key={item.id}
                                    onClick={() => {
                                        if (item.action) item.action();
                                        else if (item.path) { navigate(item.path); setMobileModal(null); }
                                    }}
                                    className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl text-left"
                                >
                                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm text-blue-500">
                                        <item.icon size={24} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-base font-bold text-slate-900 dark:text-white">{item.label}</span>
                                        <span className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
        </>
    );
};

const BotDetail = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const { haptic, user, notification, tg, isTelegram, setWebAuthUser } = useTelegram();
  const { t } = useTranslation();
  const { toggleTheme, theme } = useTheme();
  
  const [bot, setBot] = useState<Bot | null>(null);
  const [isOwned, setIsOwned] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [tonRate, setTonRate] = useState(250);
  const [showGuide, setShowGuide] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(false);
  const [isSidebarDropdownOpen, setIsSidebarDropdownOpen] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isRating, setIsRating] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const screenshotScroll = useDraggableScroll();
  
  const fetchBotData = useCallback(async () => {
    if (!slug) return;
    setIsLoading(true);
    try {
        const data = await DatabaseService.getBotBySlug(slug);
        setBot(data);
        if (data) {
            DatabaseService.incrementBotView(data.id);
        }
        const userId = user?.id?.toString();
        if (userId && data) {
            const owned = await DatabaseService.isBotOwnedByUser(userId, data.id);
            setIsOwned(owned);
            
            // Log bot view
            await DatabaseService.logActivity(userId, 'system', 'bot_view', 'Bot İnceleme', `${data.name} botu detayları görüntülendi.`);

            // Get notifications for unread count
            DatabaseService.getNotifications(userId).then(notes => {
                const unread = notes.filter(n => !n.isRead).length;
                setUnreadCount(unread);
            });
        }
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  }, [slug, user?.id]);

  useEffect(() => {
    fetchBotData();
    const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsMenuOpen(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage(null as any);
      if (e.key === 'ArrowLeft') prevImage(null as any);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [fetchBotData, slug]);

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setIsLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    document.body.style.overflow = 'auto';
  };

  const nextImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!bot?.screenshots) return;
    setCurrentImageIndex((prev) => (prev + 1) % bot.screenshots!.length);
  };

  const prevImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!bot?.screenshots) return;
    setCurrentImageIndex((prev) => (prev - 1 + bot.screenshots!.length) % bot.screenshots!.length);
  };

  useEffect(() => {
    if (user?.id && bot?.id) {
        DatabaseService.getUserBotRating(user.id.toString(), bot.id).then(setUserRating);
    }
  }, [user?.id, bot?.id]);

  useEffect(() => {
    PriceService.getTonPrice().then(p => setTonRate(p.tonTry));
  }, []);

  const handleAction = useCallback(async () => {
      if (isProcessing || !bot) return;
      haptic('medium');
      
      if (isOwned) {
          const username = bot.bot_link.replace('@', '').replace('https://t.me/', '').split('/').pop()?.trim();
          const finalUrl = `https://t.me/${username}`;
          if (tg?.openTelegramLink) tg.openTelegramLink(finalUrl);
          else window.open(finalUrl, '_blank');
          return;
      }
      
      if (bot.price === 0) {
          setIsProcessing(true);
          try {
              const userData = user || { id: 'guest_user', first_name: 'User' };
              
              const syncData: Partial<User> = {
                  id: userData.id.toString(),
                  name: `${userData.first_name} ${userData.last_name || ''}`.trim(),
                  username: userData.username || 'user',
                  role: 'User',
                  status: 'Active',
                  joinDate: new Date().toISOString()
              };
              await DatabaseService.syncUser(syncData);

              await DatabaseService.addUserBot(userData, bot, false);
              
              DatabaseService.logActivity(userData.id.toString(), 'system', 'bot_added', 'Kütüphaneye Ekleme', `${bot.name} botu kütüphaneye eklendi.`);
              
              try {
                  await DatabaseService.sendUserNotification(
                      userData.id.toString(),
                      t('detail_added_to_lib_title'),
                      `'${bot.name}' ${t('detail_added_to_lib_msg')}`,
                      'bot'
                  );
              } catch (noteErr) {
                  console.warn("Bildirim gönderilemedi ancak bot eklendi.", noteErr);
              }

              setIsOwned(true);
              notification('success');
              setTimeout(() => setShowGuide(true), 500);
          } catch (e: any) {
              console.error("Action failed:", e);
              alert("İşlem başarısız: " + (e.message || "Lütfen tekrar deneyin."));
          } finally {
              setIsProcessing(false);
          }
      } else {
          navigate(`/payment/${bot.slug}`);
      }
  }, [isProcessing, bot, isOwned, haptic, tg, user, notification, setShowGuide, navigate]);

  const handleAiAnalysis = async () => {
    if (!bot || isAiLoading) return;
    setIsAiLoading(true);
    try {
      const response = await GeminiService.analyzeBot(bot);
      setAiAnalysis(response);
      
      if (user?.id) {
        await DatabaseService.logActivity(user.id.toString(), 'system', 'bot_ai_analysis', 'AI Analizi', `${bot.name} botu için AI analizi istendi.`);
      }
    } catch (error) {
      console.error("AI Analysis Error:", error);
      setAiAnalysis("AI asistanı şu anda meşgul. Lütfen daha sonra tekrar deneyin.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleShare = () => {
    if (!bot) return;
    const shareUrl = `https://t.me/BotlyHubBot/app?startapp=bot_${bot.slug}`;
    const shareText = `BotlyHub'da harika bir bot buldum: ${bot.name}\n\n${bot.description}\n\n${shareUrl}`;
    
    if (tg?.openTelegramLink) {
        tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`);
    } else {
        navigator.clipboard.writeText(shareUrl);
        setIsCopied(true);
        notification('success');
        setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleRate = async (rating: number) => {
    console.log("handleRate called with:", rating);
    if (isRating) return;
    
    if (!user?.id) {
        notification('error');
        if (tg?.showAlert) tg.showAlert("Puan vermek için giriş yapmış olmalısınız.");
        else alert("Puan vermek için giriş yapmış olmalısınız.");
        return;
    }

    if (!bot?.id) return;

    setIsRating(true);
    try {
        console.log("Saving rating to DB...");
        await DatabaseService.rateBot(user.id.toString(), bot.id, rating);
        console.log("Rating saved successfully");
        setUserRating(rating);
        await fetchBotData();
        notification('success');
    } catch (e: any) {
        console.error("Rating Error:", e);
        notification('error');
        if (tg?.showAlert) tg.showAlert(`Hata: ${e.message || 'Puan kaydedilemedi'}`);
        else alert(`Hata: ${e.message || 'Puan kaydedilemedi'}`);
    } finally {
        setIsRating(false);
    }
  };

  const prices = useMemo(() => {
    if (!bot) return { ton: 0, stars: 0 };
    return PriceService.convert(bot.price, tonRate);
  }, [bot, tonRate]);

  if (isLoading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500/50" size={32} />
    </div>
  );

  if (!bot) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <BotIcon className="text-slate-300 dark:text-slate-700 mb-4" size={64} />
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2 italic uppercase tracking-tight">Bot Bulunamadı</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium">Aradığınız bot sistemde bulunamadı veya silinmiş olabilir.</p>
        <button 
          onClick={() => navigate('/')}
          className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black text-[11px] uppercase tracking-widest active:scale-95 transition-transform"
        >
            Anasayfaya Dön
        </button>
    </div>
  );

  return (
    <>
    <SEO 
        title={`${bot.name} - ${t('detail_seo_title')}`} 
        description={`${bot.name} ${t('home_seo_desc')}`}
        ogImage={bot.icon || undefined}
        breadcrumbs={[
            { name: t('search_breadcrumb_home'), item: 'https://botlyhub.com/' },
            { name: bot.name, item: `https://botlyhub.com/bot/${bot.slug}` }
        ]}
    />
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200 pb-40 animate-in fade-in transition-colors duration-300 bot-detail-page">
      <NavMenu 
        user={user} 
        unreadCount={unreadCount} 
        theme={theme} 
        toggleTheme={toggleTheme} 
        haptic={haptic}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        setIsLoginModalOpen={setIsLoginModalOpen}
        setWebAuthUser={setWebAuthUser}
        isLoginModalOpen={isLoginModalOpen}
        menuRef={menuRef}
      />
      <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-10">
        <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-16 overflow-visible pt-10">
          <div className="lg:col-start-1 min-w-0">
            {/* Hero & Stats Section */}
            <div className="pt-10 px-6 lg:px-0 flex flex-col md:flex-row md:items-center gap-6 mb-10">
              <div className="flex items-start justify-between gap-6 flex-1">
            <div className="flex items-start gap-6 min-w-0">
          <div className="flex flex-col gap-4 shrink-0 w-24">
              <div className="relative">
                  <img 
                    src={getLiveBotIcon(bot)} 
                    loading="lazy"
                    className="w-24 h-24 rounded-xl !p-0 border border-black/10 dark:border-white/10 object-cover bg-slate-200 dark:bg-slate-900" 
                    onError={(e) => { (e.target as any).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(bot.name)}&background=1e293b&color=fff&bold=true`; }}
                  />
                  {isOwned && (
                      <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-xl border-2 border-slate-50 dark:border-slate-950">
                          <CheckCircle2 size={14} />
                      </div>
                  )}
              </div>

              {/* Categories Moved under Photo */}
              <div className="flex flex-nowrap gap-2 w-max min-w-full">
                  {(() => {
                      const catList = Array.isArray(bot.category) ? bot.category : [bot.category];
                      const visibleCats = isCategoriesExpanded ? catList : catList.slice(0, 2);

                      return (
                          <div className="flex flex-nowrap gap-1.5 items-center">
                              {visibleCats.map(catId => {
                                  const cat = categories.find(c => c.id === catId);
                                  return (
                                      <motion.span 
                                          key={catId} 
                                          initial={isCategoriesExpanded ? { opacity: 0, scale: 0.9 } : false}
                                          animate={{ opacity: 1, scale: 1 }}
                                          className="text-brand dark:text-brand-light text-[8px] font-black uppercase tracking-wider border border-brand/20 px-2 py-0.5 rounded-lg bg-brand/5 whitespace-nowrap bot-category-tag"
                                      >
                                          {cat ? t(cat.label) : catId}
                                      </motion.span>
                                  );
                              })}
                              {!isCategoriesExpanded && catList.length > 2 && (
                                  <button 
                                      onClick={(e) => { e.stopPropagation(); haptic('light'); setIsCategoriesExpanded(true); }}
                                      className="text-brand dark:text-brand-light text-[8px] font-black uppercase tracking-wider border border-brand/20 px-2 py-0.5 rounded-lg bg-brand/5 flex items-center gap-1 active:scale-95 transition-all shadow-sm bot-category-tag"
                                  >
                                      +{catList.length - 2}
                                  </button>
                              )}
                              {isCategoriesExpanded && catList.length > 2 && (
                                  <button 
                                      onClick={(e) => { e.stopPropagation(); haptic('light'); setIsCategoriesExpanded(false); }}
                                      className="text-slate-400 dark:text-slate-500 text-[8px] font-bold uppercase tracking-wider px-1 py-0.5 flex items-center gap-1 active:scale-95 transition-all"
                                  >
                                      <X size={8} />
                                  </button>
                              )}
                          </div>
                      );
                  })()}
              </div>
          </div>
          <div className="flex-1 min-w-0 pt-1">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight truncate mb-1 flex items-center gap-2">
                  {bot.name}
                  {bot.is_official && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-[11px] h-[11px] text-[#139fec] shrink-0">
                          <polyline points="20 6 9 17 4 12" />
                      </svg>
                  )}
                  {isOwned && (
                      <button 
                          onClick={() => { haptic('medium'); navigate(`/bot-panel/${bot.id}`); }}
                          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/10 border border-blue-600/20 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-600/20 active:scale-95 transition-all ml-2"
                          title="Bot Yönetim Paneli"
                      >
                          <LayoutGrid size={12} />
                          <span className="text-[10px] font-black uppercase tracking-widest italic">YÖNETİM PANELİ</span>
                      </button>
                  )}
                  {DatabaseService.isAdminLoggedIn() && (
                      <button 
                          onClick={() => navigate('/a/dashboard/bots')}
                          className="p-1.5 bg-brand text-white rounded-lg active:scale-90 transition-transform ml-2"
                          title="Admin Panelinde Düzenle"
                      >
                          <Edit3 size={12} />
                      </button>
                  )}
              </h1>
              <div className="flex flex-wrap gap-2 mb-3">
                  <span className="bg-brand/10 border border-brand/20 text-brand dark:text-brand-light text-[10px] font-bold px-3 py-1 rounded-xl uppercase flex items-center gap-1">
                      <ShieldCheck size={12} /> {t('verified')}
                  </span>
              </div>
          </div>
          </div>
          <div className="lg:hidden flex flex-col gap-2 shrink-0">
            <button 
              onClick={() => { haptic('medium'); notification('warning'); /* Future Report logic */ }}
              className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-xl text-slate-400 hover:text-red-500 active:scale-90 transition-all shrink-0"
            >
              <Flag size={20} />
            </button>
            <button 
              onClick={handleShare}
              className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-xl text-slate-400 active:scale-90 transition-all shrink-0 relative"
            >
                <Share2 size={18} className={isCopied ? 'text-emerald-500' : ''} />
                <AnimatePresence>
                    {isCopied && (
                        <motion.span 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute -top-8 left-1/2 -translate-x-1/2 text-[8px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md uppercase whitespace-nowrap"
                        >
                            Kopyalandı!
                        </motion.span>
                    )}
                </AnimatePresence>
            </button>
          </div>
      </div>

        <div className="w-full md:w-auto md:min-w-[320px] lg:hidden px-6">
            <div className="flex flex-col bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 p-4 rounded-xl stats-card-bg mb-4">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col items-center flex-1">
                        <span className="text-slate-900 dark:text-white font-bold text-base">{bot.rating || '0.0'} <Star size={12} className="inline mb-1 fill-yellow-500 text-yellow-500" /></span>
                        <span className="text-[9px] text-slate-500 font-bold uppercase mt-0.5 tracking-wider">{bot.rating_count || 0} Oy</span>
                    </div>
                    <div className="w-px h-8 bg-black/5 dark:bg-white/5 mx-2"></div>
                    <div className="flex flex-col items-center flex-1">
                        <span className="text-slate-900 dark:text-white font-bold text-base">{bot.user_count && bot.user_count > 1000 ? `${(bot.user_count / 1000).toFixed(1)}K` : bot.user_count || 0}</span>
                        <span className="text-[9px] text-slate-500 font-bold uppercase mt-0.5 tracking-wider">Kullanıcı</span>
                    </div>
                    <div className="w-px h-8 bg-black/5 dark:bg-white/5 mx-2"></div>
                    <div className="flex flex-col items-center flex-1">
                        <span className="text-slate-900 dark:text-white font-bold text-base">{bot.views && bot.views > 1000 ? `${(bot.views / 1000).toFixed(1)}K` : bot.views || 0}</span>
                        <span className="text-[9px] text-slate-500 font-bold uppercase mt-0.5 tracking-wider">Görüntüleme</span>
                    </div>
                </div>
            </div>

            {/* Bağlantılar Dropdown Menu */}
            {(bot.telegram_group || bot.website_url || bot.app_url || bot.social_url) && (
              <div className="relative mb-6">
                  <button 
                      onClick={() => { haptic('light'); setIsDropdownOpen(!isDropdownOpen); }}
                      className="w-full h-14 bg-white dark:bg-slate-900 rounded-xl border border-black/5 dark:border-white/10 flex items-center justify-between px-5 text-[11px] font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98] stats-card-bg"
                  >
                      <div className="flex items-center gap-3">
                          <LinkIcon size={18} className="text-brand" />
                          <span>{t('official_links')}</span>
                      </div>
                      <ChevronDown size={18} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                      {isDropdownOpen && (
                          <>
                              <div className="fixed inset-0 z-[60]" onClick={() => setIsDropdownOpen(false)}></div>
                              <motion.div 
                                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                  className="absolute left-0 right-0 top-full mt-2 z-[70] bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden"
                              >
                                  <div className="p-2 space-y-1">
                                      {bot.telegram_group && (
                                          <button 
                                              onClick={() => {
                                                  const url = bot.telegram_group!.startsWith('@') ? `https://t.me/${bot.telegram_group!.substring(1)}` : bot.telegram_group;
                                                  window.open(url, '_blank');
                                                  setIsDropdownOpen(false);
                                              }}
                                              className="w-full flex items-center justify-between px-4 py-4 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors text-left group"
                                          >
                                              <div className="flex items-center gap-3">
                                                  <Send size={14} className="text-blue-500" />
                                                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">Telegram Grup</span>
                                              </div>
                                              <ChevronRight size={14} className="text-slate-300 dark:text-slate-700" />
                                          </button>
                                      )}
                                      {bot.website_url && (
                                          <button 
                                              onClick={() => { window.open(bot.website_url, '_blank'); setIsDropdownOpen(false); }}
                                              className="w-full flex items-center justify-between px-4 py-4 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors text-left group border-t border-black/[0.03] dark:border-white/[0.03]"
                                          >
                                              <div className="flex items-center gap-3">
                                                  <Globe size={14} className="text-emerald-500" />
                                                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">Web Site</span>
                                              </div>
                                              <ChevronRight size={14} className="text-slate-300 dark:text-slate-700" />
                                          </button>
                                      )}
                                      {bot.app_url && (
                                          <button 
                                              onClick={() => { window.open(bot.app_url, '_blank'); setIsDropdownOpen(false); }}
                                              className="w-full flex items-center justify-between px-4 py-4 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors text-left group border-t border-black/[0.03] dark:border-white/[0.03]"
                                          >
                                              <div className="flex items-center gap-3">
                                                  <Cpu size={14} className="text-purple-500" />
                                                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">App / Bot</span>
                                              </div>
                                              <ChevronRight size={14} className="text-slate-300 dark:text-slate-700" />
                                          </button>
                                      )}
                                      {bot.social_url && (
                                          <button 
                                              onClick={() => { window.open(bot.social_url, '_blank'); setIsDropdownOpen(false); }}
                                              className="w-full flex items-center justify-between px-4 py-4 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors text-left group border-t border-black/[0.03] dark:border-white/[0.03]"
                                          >
                                              <div className="flex items-center gap-3">
                                                  <Share2 size={14} className="text-orange-500" />
                                                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">Sosyal Medya</span>
                                              </div>
                                              <ChevronRight size={14} className="text-slate-300 dark:text-slate-700" />
                                          </button>
                                      )}
                                  </div>
                              </motion.div>
                          </>
                      )}
                  </AnimatePresence>
              </div>
            )}
        </div>
      </div>

      {/* Gallery Section */}
      <div className="mb-12 relative group/gallery DappScreenshot_root__FSZyc">
          <div className="px-6 mb-6 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">{t('preview')}</h3>
              
              <div className="flex gap-2">
                  <button 
                    onClick={() => {
                        if (screenshotScroll.ref.current) {
                            screenshotScroll.ref.current.scrollBy({ left: -340, behavior: 'smooth' });
                            haptic('light');
                        }
                    }}
                    className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-brand hover:scale-110 shadow-lg transition-all active:scale-95"
                  >
                      <ChevronLeft size={20} />
                  </button>
                  <button 
                    onClick={() => {
                        if (screenshotScroll.ref.current) {
                            screenshotScroll.ref.current.scrollBy({ left: 340, behavior: 'smooth' });
                            haptic('light');
                        }
                    }}
                    className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-brand hover:scale-110 shadow-lg transition-all active:scale-95"
                  >
                      <ChevronRight size={20} />
                  </button>
              </div>
          </div>

          <div className="overflow-hidden">
              <div 
                ref={screenshotScroll.ref}
                onMouseDown={screenshotScroll.onMouseDown}
                onMouseUp={screenshotScroll.onMouseUp}
                onMouseMove={screenshotScroll.onMouseMove}
                onMouseLeave={screenshotScroll.onMouseLeave}
                onContextMenu={screenshotScroll.onContextMenu}
                className={`flex gap-4 overflow-x-auto no-scrollbar px-6 snap-x pb-0 ${screenshotScroll.isDragging ? 'cursor-grabbing' : 'cursor-grab'} DappScreenshotsCarousel_root__s30Gy`}
              >
                  {bot.screenshots && bot.screenshots.length > 0 ? (
                      bot.screenshots.map((s, i) => (
                        <motion.div 
                          key={i} 
                          whileHover={{ scale: 1.02, y: -4 }}
                          className="h-[260px] w-[380px] rounded-[2.5rem] bg-slate-200 dark:bg-slate-950 border border-black/5 dark:border-white/10 overflow-hidden snap-center shrink-0 cursor-zoom-in group relative DappScreenshotsCarousel_emblaItem__s30Gy"
                          onClick={() => openLightbox(i)}
                        >
                            {/* Blurred Background Layer - Using the image itself */}
                            <div className="absolute inset-0 transform-gpu overflow-hidden">
                                <img src={s} className="w-full h-full object-cover blur-[40px] opacity-70 dark:opacity-50 scale-150" />
                                <div className="absolute inset-0 bg-white/20 dark:bg-black/40" />
                            </div>

                            {/* Central Crisp Phone Mockup */}
                            <div className="absolute inset-0 flex items-center justify-center p-0 z-10">
                                <div className="h-full aspect-[9/19] relative group-hover:scale-105 transition-transform duration-700 ease-out">
                                    <img 
                                        src={s} 
                                        loading="lazy" 
                                        className="h-full w-full object-cover rounded-xl relative z-10 border-2 border-white/40 dark:border-white/20" 
                                    />
                                    {/* Glass Reflection */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-white/5 to-transparent z-20 rounded-xl" />
                                </div>
                            </div>

                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none z-30">
                                <div className="bg-white/20 backdrop-blur-md p-4 rounded-full opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 border border-white/20">
                                    <Maximize2 size={24} className="text-white" />
                                </div>
                            </div>
                        </motion.div>
                      ))
                  ) : (
                      [1,2,3].map(i => (
                        <div key={i} className="w-[380px] h-[260px] rounded-[2.5rem] bg-slate-100 dark:bg-slate-900/50 border border-black/5 dark:border-white/5 overflow-hidden snap-center shrink-0 flex items-center justify-center">
                            <ImageIcon className="text-slate-300 dark:text-slate-800" size={32} />
                        </div>
                      ))
                  )}
              </div>
          </div>
      </div>

      {/* Rating Section */}
      {isOwned && (
          <div className="px-6 mb-10">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative p-5 bg-white/5 dark:bg-slate-900/40 backdrop-blur-xl rounded-xl border border-black/5 dark:border-white/5 overflow-hidden group"
              >
                  <div className="relative z-10">
                      <div className="flex items-center justify-between mb-5">
                          <div className="flex flex-col gap-0.5">
                              <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Deneyimi Puanla</h3>
                          </div>
                          {userRating && (
                              <motion.div 
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-xl"
                              >
                                  <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                                  <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Puanınız: {userRating}</span>
                              </motion.div>
                          )}
                      </div>

                      <div className="flex items-center justify-center gap-2">
                          {[1, 2, 3, 4, 5].map((star) => {
                              const isActive = (hoverRating || userRating || 0) >= star;
                              const isSelected = userRating === star;
                              
                              return (
                                  <motion.button
                                      key={star}
                                      onMouseEnter={() => setHoverRating(star)}
                                      onMouseLeave={() => setHoverRating(null)}
                                      onClick={() => { console.log("Star clicked:", star); haptic('heavy'); handleRate(star); }}
                                      disabled={isRating}
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      className="relative p-1.5 transition-all z-50"
                                  >
                                      <Star 
                                          size={28} 
                                          className={`transition-all duration-300 ${
                                              isActive 
                                              ? 'fill-yellow-400 text-yellow-400 ' 
                                              : 'text-slate-200 dark:text-slate-800'
                                          }`} 
                                      />
                                      {isSelected && (
                                          <motion.div 
                                            layoutId="star-glow"
                                            className="absolute inset-0 bg-yellow-400/10 blur-lg rounded-full -z-10"
                                          />
                                      )}
                                  </motion.button>
                              );
                          })}
                      </div>
                  </div>
              </motion.div>
          </div>
      )}

      {/* Description */}
      <div className="px-6 mb-10">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('detail_about_label')}</h3>
          </div>
          <div className="p-[11px] bg-white dark:bg-slate-900/60 rounded-xl border border-black/5 dark:border-white/5 text-sm text-slate-600 dark:text-slate-400 leading-[1.6] whitespace-pre-wrap">
              {bot.description}
          </div>
      </div>

          </div>

          {/* Right Column (PC only) - Action bar moved here for large screens */}
          <aside className="hidden lg:flex flex-col gap-4 sticky top-10 h-fit pr-6 lg:pr-0 mt-10">
              {/* Action Buttons for Sidebar */}
              <div className="flex flex-col gap-4">
                  <button 
                    onClick={handleAction}
                    disabled={isProcessing}
                    className={`w-full h-20 rounded-xl text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all active:scale-95 disabled:opacity-50 border-b-8 ${
                        isOwned 
                        ? 'bg-emerald-600 text-white border-emerald-800' 
                        : 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-700 dark:border-slate-300'
                    }`}
                  >
                      {isProcessing ? <Loader2 className="animate-spin" /> : (
                          isOwned ? <><Send size={20} /> {t('detail_launch')}</> : (
                              bot.price === 0 ? <><PlusCircle size={20} /> {t('detail_get_free')}</> : (
                                  <div className="flex items-center gap-5">
                                      <span className="text-2xl font-black italic tracking-tighter leading-none">{prices.ton}</span>
                                      <div className="h-6 w-px bg-white/20 dark:bg-slate-400/20"></div>
                                      <div className="flex items-center gap-2">
                                          <span className="font-black tracking-[0.3em]">{t('buy')}</span>
                                          <ChevronRight size={20} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                                      </div>
                                  </div>
                              )
                          )
                      )}
                  </button>

                  <div className="flex gap-3">
                      <button 
                        onClick={handleShare}
                        className="h-20 flex-1 bg-white dark:bg-slate-900 rounded-xl border border-black/5 dark:border-white/10 flex items-center justify-center gap-3 text-slate-500 dark:text-slate-400 active:scale-95 transition-all relative border-b-8 border-transparent"
                      >
                          <Share2 size={20} className={isCopied ? 'text-emerald-500' : ''} />
                          <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t('detail_share_btn')}</span>
                          <AnimatePresence>
                              {isCopied && (
                                  <motion.span 
                                      initial={{ opacity: 0, y: -10 }}
                                      animate={{ opacity: 1, y: -35 }}
                                      exit={{ opacity: 0 }}
                                      className="absolute left-1/2 -translate-x-1/2 text-[8px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md uppercase whitespace-nowrap"
                                  >
                                      {t('share_copied')}
                                  </motion.span>
                              )}
                          </AnimatePresence>
                      </button>

                      <button 
                        onClick={() => { haptic('medium'); notification('warning'); /* Future Report logic */ }}
                        className="h-20 w-20 shrink-0 bg-white dark:bg-slate-900 rounded-xl border border-black/5 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-red-500 active:scale-95 transition-all border-b-8 border-transparent"
                      >
                          <Flag size={20} />
                      </button>
                  </div>

                  {/* Direct Link Buttons for Sidebar (PC/Large Screens) */}
                  {(bot.telegram_group || bot.website_url || bot.app_url || bot.social_url) && (
                      <div className="flex flex-col bg-white dark:bg-slate-900/40 rounded-xl border border-black/5 dark:border-white/5 p-4 pt-5 gap-[0.6em] official-links-box">
                          <div className="px-2 mb-1">
                              <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{t('detail_official_links')}</h4>
                          </div>
                          {bot.telegram_group && (
                              <button 
                                  onClick={() => {
                                      const url = bot.telegram_group!.startsWith('@') ? `https://t.me/${bot.telegram_group!.substring(1)}` : bot.telegram_group;
                                      window.open(url, '_blank');
                                  }}
                                  className="w-full flex items-center gap-4 pl-2 pr-6 py-4.5 hover:bg-slate-50 dark:hover:bg-transparent rounded-2xl transition-all text-left group"
                              >
                                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                      <Send size={16} className="text-blue-500" />
                                  </div>
                                  <span className="text-[10px] font-black uppercase tracking-widest italic text-slate-700 dark:text-slate-300">{t('detail_tg_group')}</span>
                              </button>
                          )}
                          {bot.website_url && (
                              <button 
                                  onClick={() => window.open(bot.website_url, '_blank')}
                                  className="w-full flex items-center gap-4 pl-2 pr-6 py-4.5 hover:bg-slate-50 dark:hover:bg-transparent rounded-2xl transition-all text-left group"
                              >
                                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                      <Globe size={16} className="text-emerald-500" />
                                  </div>
                                  <span className="text-[10px] font-black uppercase tracking-widest italic text-slate-700 dark:text-slate-300">{t('detail_website')}</span>
                              </button>
                          )}
                          {bot.app_url && (
                              <button 
                                  onClick={() => window.open(bot.app_url, '_blank')}
                                  className="w-full flex items-center gap-4 pl-2 pr-6 py-4.5 hover:bg-slate-50 dark:hover:bg-transparent rounded-2xl transition-all text-left group"
                              >
                                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                      <PlusCircle size={16} className="text-purple-500" />
                                  </div>
                                  <span className="text-[10px] font-black uppercase tracking-widest italic text-slate-700 dark:text-slate-300">{t('detail_app_bot')}</span>
                              </button>
                          )}
                          {bot.social_url && (
                              <button 
                                  onClick={() => window.open(bot.social_url, '_blank')}
                                  className="w-full flex items-center gap-4 pl-2 pr-6 py-4.5 hover:bg-slate-50 dark:hover:bg-transparent rounded-2xl transition-all text-left group"
                              >
                                  <div className="w-8 h-8 rounded-xl bg-blue-400/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                      <Share2 size={16} className="text-blue-400" />
                                  </div>
                                  <span className="text-[10px] font-black uppercase tracking-widest italic text-slate-700 dark:text-slate-300">{t('detail_social')}</span>
                              </button>
                          )}
                      </div>
                  )}
              </div>

              <div className="w-full">
                  <div className="flex flex-col bg-white dark:bg-slate-900/60 rounded-xl border border-black/5 dark:border-white/5 backdrop-blur-xl overflow-hidden fancy-glass-card stats-card-bg">
                      <div className="flex items-center justify-between p-6">
                          <div className="flex flex-col items-center flex-1 border-r border-black/5 dark:border-white/5">
                              <span className="text-slate-900 dark:text-white font-bold text-base">{bot.rating || '0.0'} <Star size={12} className="inline mb-1 fill-yellow-500 text-yellow-500" /></span>
                              <span className="text-[10px] text-slate-500 font-medium uppercase mt-1 tracking-wider">{bot.rating_count || 0} {t('detail_vote')}</span>
                          </div>
                          <div className="flex flex-col items-center flex-1 border-r border-black/5 dark:border-white/5">
                              <span className="text-slate-900 dark:text-white font-bold text-base">{bot.user_count && bot.user_count > 1000 ? `${(bot.user_count / 1000).toFixed(1)}K` : bot.user_count || 0}</span>
                              <span className="text-[10px] text-slate-500 font-medium uppercase mt-1 tracking-wider">{t('detail_users_count')}</span>
                          </div>
                          <div className="flex flex-col items-center flex-1">
                              <span className="text-slate-900 dark:text-white font-bold text-base">{bot.views && bot.views > 1000 ? `${(bot.views / 1000).toFixed(1)}K` : bot.views || 0}</span>
                              <span className="text-[10px] text-slate-500 font-medium uppercase mt-1 tracking-wider">{t('detail_views')}</span>
                          </div>
                      </div>
                      {bot.languages && bot.languages.length > 0 && (
                          <div className="px-6 py-3 border-t border-black/5 dark:border-white/5 flex items-center justify-start gap-3">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 mr-[3px]"><path fillRule="evenodd" clipRule="evenodd" d="M5.5 2.5V2C5.5 1.17157 6.17157 0.5 7 0.5C7.82843 0.5 8.5 1.17157 8.5 2V2.5H9.9742C9.9901 2.49975 10.0061 2.49974 10.0221 2.5H12C12.8284 2.5 13.5 3.17157 13.5 4C13.5 4.82843 12.8284 5.5 12 5.5H11.2512C10.7379 7.82318 9.75127 9.98263 8.30067 11.9736C9.27943 12.9992 10.4353 13.9118 11.7719 14.7138C12.4823 15.14 12.7126 16.0614 12.2864 16.7717C11.8602 17.4821 10.9388 17.7125 10.2284 17.2862C8.75981 16.4051 7.46579 15.399 6.34922 14.2699C5.33326 15.3069 4.1736 16.2908 2.87186 17.2206C2.19774 17.7021 1.26091 17.546 0.7794 16.8719C0.297886 16.1977 0.454024 15.2609 1.12814 14.7794C2.38555 13.8813 3.48271 12.9379 4.42182 11.9481C3.69705 10.8985 3.09174 9.76779 2.60746 8.55709C2.29979 7.78791 2.67391 6.91496 3.44309 6.60729C4.21226 6.29961 5.08522 6.67374 5.39289 7.44291C5.67512 8.14848 6.00658 8.8209 6.38782 9.46053C7.19463 8.20649 7.78489 6.88692 8.16216 5.5H2C1.17157 5.5 0.5 4.82843 0.5 4C0.5 3.17157 1.17157 2.5 2 2.5H5.5ZM16.4912 16.5H18.5088L17.5 13.5856L16.4912 16.5ZM15.4527 19.5L14.4175 22.4907C14.1465 23.2735 13.2922 23.6885 12.5093 23.4175C11.7265 23.1465 11.3115 22.2922 11.5825 21.5093L16.0825 8.50933C16.5484 7.16356 18.4516 7.16356 18.9175 8.50933L23.4175 21.5093C23.6885 22.2922 23.2735 23.1465 22.4907 23.4175C21.7078 23.6885 20.8535 23.2735 20.5825 22.4907L19.5473 19.5H15.4527Z" fill="#758CA3"/></svg>
                              {bot.languages.map((lang, idx) => (
                              <span key={idx} className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                  {lang}
                              </span>
                              ))}
                          </div>
                      )}
                  </div>
              </div>
          </aside>
        </div>
      </div>

      {/* Sticky Action Bar */}
      <div className="fixed bottom-0 inset-x-0 p-6 z-[70] bg-gradient-to-t from-slate-50 dark:from-[#020617] via-slate-50 dark:via-[#020617]/95 to-transparent pb-10 lg:hidden bot-sticky-action-bar">
          <div className="max-w-md mx-auto flex items-center gap-3">
              <button 
                onClick={handleAction}
                disabled={isProcessing}
                className={`flex-1 h-14 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 transition-all active:scale-95 disabled:opacity-50 border-b-4 ${
                    isOwned 
                    ? 'bg-emerald-600 text-white border-emerald-800' 
                    : 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-700 dark:border-slate-300 shadow-lg shadow-brand/20'
                }`}
              >
                  {isProcessing ? <Loader2 className="animate-spin" /> : (
                      isOwned ? <><Send size={18} /> {t('launch_bot')}</> : (
                          bot.price === 0 ? <><PlusCircle size={18} /> {t('get_free')}</> : (
                              <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-1.5">
                                      <span className="text-xl font-black italic tracking-tighter leading-none">{Number(prices.ton).toFixed(1)}</span>
                                      <svg fill="none" height="14" width="14" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" className="opacity-90">
                                          <title>Payment TON icon</title>
                                          <g clipPath="url(#a_ton_buy)" fill="currentColor">
                                              <path d="M7.5 11.015V5.963H5.268a.31.31 0 0 0-.272.463l1.772 3.17.734 1.419ZM9.232 9.596l1.771-3.17a.31.31 0 0 0-.272-.463H8.498v5.053l.734-1.42Z"></path>
                                              <path clipRule="evenodd" d="M16 8.5a8 8 0 1 1-16 0 8 8 0 0 1 16 0ZM5.268 4.965h5.464c1.004 0 1.64 1.085 1.136 1.96l-3.372 5.844a.572.572 0 0 1-.992 0L4.132 6.925c-.505-.876.132-1.96 1.136-1.96Z" fill-rule="evenodd"></path>
                                          </g>
                                          <defs>
                                              <clipPath id="a_ton_buy">
                                                  <path d="M0 0h16v16H0z" fill="#fff" transform="translate(0 .5)"></path>
                                              </clipPath>
                                          </defs>
                                      </svg>
                                  </div>
                                  <div className="flex items-center gap-2 border-l border-white/20 dark:border-slate-400/20 pl-4">
                                      <span className="font-black tracking-[0.2em]">{t('buy')}</span>
                                      <ChevronRight size={18} className="opacity-40" />
                                  </div>
                              </div>
                          )
                      )
                  )}
              </button>
          </div>
      </div>

      {/* Onboarding Guide Modal */}
      <AnimatePresence>
        {showGuide && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGuide(false)}
              className="absolute inset-0 bg-slate-50/95 dark:bg-[#020617]/95 backdrop-blur-xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 rounded-xl overflow-hidden"
            >
              <div className="p-8 lg:p-10">
                <div className="flex justify-between items-center mb-8">
                  <div className="w-12 h-12 bg-brand dark:bg-brand-light rounded-2xl flex items-center justify-center uppercase tracking-widest text-[11px] font-bold text-white">
                    <Sparkles className="text-white" size={24} />
                  </div>
                  <button onClick={() => setShowGuide(false)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <h2 className="text-2xl font-black text-slate-900 dark:text-white italic uppercase tracking-tighter leading-none mb-3">
                  {t('guide_congrats_title')} <br/> <span className="text-brand dark:text-brand-light">{t('guide_congrats_subtitle')}</span>
                </h2>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-10 italic">
                  {t('guide_steps_desc')}
                </p>

                <div className="space-y-6 mb-10">
                  {[
                    { icon: Play, title: t('guide_step_1_title'), desc: t('guide_step_1_desc') },
                    { icon: UserPlus, title: t('guide_step_2_title'), desc: t('guide_step_2_desc') },
                    { icon: MessageSquare, title: t('guide_step_3_title'), desc: t('guide_step_3_desc') },
                    { icon: BarChart3, title: t('guide_step_4_title'), desc: t('guide_step_4_desc') }
                  ].map((step, i) => (
                    <div key={i} className="flex gap-5 group">
                      <div className="w-10 h-10 shrink-0 bg-slate-100 dark:bg-white/5 rounded-xl flex items-center justify-center text-brand dark:text-brand-light border border-black/5 dark:border-white/5 group-hover:bg-brand dark:group-hover:bg-brand-light group-hover:text-white transition-all duration-500">
                        <step.icon size={18} />
                      </div>
                      <div>
                        <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1 italic">{i+1}. {step.title}</h4>
                        <p className="text-[9px] text-slate-500 font-bold uppercase leading-relaxed italic">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={() => {
                      setShowGuide(false);
                      handleAction();
                    }}
                    className="w-full py-5 bg-brand dark:bg-brand-light hover:opacity-90 text-white font-black rounded-xl text-[10px] uppercase tracking-[0.4em] transition-all active:scale-95 flex items-center justify-center gap-3"
                  >
                    <Send size={16} /> {t('guide_now_start')}
                  </button>
                  <button 
                    onClick={() => setShowGuide(false)}
                    className="w-full py-4 text-slate-400 dark:text-slate-600 font-black text-[9px] uppercase tracking-widest hover:text-slate-900 dark:hover:text-slate-400 transition-colors"
                  >
                    {t('home_maybe_later')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Screenshot Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && bot?.screenshots && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] flex items-center justify-center bg-black/95 backdrop-blur-3xl px-4 md:px-0"
            onClick={closeLightbox}
          >
            <div className="absolute top-8 right-8 flex items-center gap-4">
              <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] hidden md:block">
                {t('detail_screenshot')} {currentImageIndex + 1} / {bot.screenshots.length}
              </span>
              <button 
                onClick={closeLightbox}
                className="w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors"
                aria-label={t('close')}
              >
                <X size={24} />
              </button>
            </div>

            <button 
              onClick={prevImage}
              className="absolute left-4 md:left-8 w-12 h-12 md:w-16 md:h-16 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all z-10 active:scale-90"
              aria-label={t('prev')}
            >
              <ChevronLeft size={32} />
            </button>

            <motion.div 
              key={currentImageIndex}
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: -20 }}
              className="relative w-full max-w-4xl h-[70vh] md:h-[80vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={bot.screenshots[currentImageIndex]} 
                alt={`${t('detail_screenshot')} ${currentImageIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-xl md:rounded-xl shadow-2xl"
              />
            </motion.div>

            <button 
              onClick={nextImage}
              className="absolute right-4 md:right-8 w-12 h-12 md:w-16 md:h-16 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all z-10 active:scale-90"
              aria-label={t('next')}
            >
              <ChevronRight size={32} />
            </button>

            {/* Thumbnails preview for large screens */}
            <div className="absolute bottom-10 left-10 right-10 flex justify-center gap-3 overflow-x-auto no-scrollbar py-4 hidden md:flex">
              {bot.screenshots.map((s, idx) => (
                <button 
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                  className={`w-12 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${currentImageIndex === idx ? 'border-brand scale-110' : 'border-white/10 opacity-40 hover:opacity-100'}`}
                >
                  <img src={s} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </>
  );
};

const ImageIcon = ({ className, size }: { className?: string, size?: number }) => (
    <div className={className} style={{ width: size, height: size }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
    </div>
);

export default BotDetail;


import React, { useState, useEffect, useRef } from 'react';
import { 
    Search, ChevronDown, Sun, Moon, Wallet, Menu, Plus, LogOut, 
    Bell, Bot as BotIcon, Megaphone, LayoutGrid, Share2, 
    ExternalLink, BarChart3, Coins, Briefcase, Compass, X, 
    ArrowLeft, ChevronRight, Store, User
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from '../TranslationContext';
import { useTelegram } from '../hooks/useTelegram';
import { useTheme } from '../ThemeContext';
import Logo from './Logo';

interface NavMenuProps {
    showLogo?: boolean;
    showSearch?: boolean;
    unreadCount?: number;
    initialSearchQuery?: string;
}

const Header: React.FC<NavMenuProps> = ({ 
    showLogo = true, 
    showSearch = false,
    unreadCount = 0,
    initialSearchQuery = ''
}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, haptic, setWebAuthUser } = useTelegram();
    const { theme, toggleTheme } = useTheme();
    
    const [openMenu, setOpenMenu] = useState<'kesfet' | 'investors' | null>(null);
    const [mobileModal, setMobileModal] = useState<'kesfet' | 'investors' | null>(null);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [searchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || initialSearchQuery);
    
    useEffect(() => {
        const q = searchParams.get('q');
        if (q !== null) setSearchQuery(q);
    }, [searchParams]);
    
    const menuRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpenMenu(null);
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) setIsUserMenuOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const discoverItems = [
        { id: 'bots', label: 'Botlar', desc: 'Telegram Bot Marketi', icon: BotIcon, path: '/search?mode=bots' },
        { id: 'apps', label: 'Uygulamalar', desc: 'Web3 & TMA Uygulamaları', icon: LayoutGrid, path: '/search?mode=apps' },
        { id: 'channels', label: 'Kanallar', desc: 'Popüler Telegram Kanalları', icon: Megaphone, path: '/channels' },
        { id: 'ads', label: 'Reklam', desc: 'Projenizi Öne Çıkarın', icon: Share2, path: '/settings' },
    ];

    const investorItems = [
        { id: 'exchanges', label: 'Borsalar ve Takas', desc: 'CEX & DEX Platformları', icon: BarChart3, path: '/search?mode=apps&category=all' },
        { id: 'earn', label: 'Kazanç Uygulamaları', desc: 'Pasif Gelir Fırsatları', icon: Coins, path: '/search?mode=apps&category=all' },
        { id: 'tools', label: 'Yatırım Araçları', desc: 'Analiz ve Takip Araçları', icon: Briefcase, path: '/search?mode=apps&category=all' },
        { id: 'new', label: 'Yeni Keşifler', desc: 'Gelecek Vaadeden Projeler', icon: Compass, path: '/search?mode=apps&category=all' },
    ];

    const simpleLinks = [
        { label: 'Marketplace', path: '/search' },
        { label: 'TON Ecosystem', path: 'https://ton.org/' },
        { label: 'Developer Hub', path: '/settings' },
    ];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    };

    const renderMegaMenuContent = () => {
        const items = openMenu === 'kesfet' ? discoverItems : investorItems;
        const linksTitle = openMenu === 'kesfet' ? 'Hızlı Bağlantılar' : 'Yatırım Linkleri';
        
        return (
            <div className="max-w-7xl mx-auto px-8 grid grid-cols-12 gap-8">
                <div className="col-span-8">
                    <div className="grid grid-cols-2 gap-4">
                        {items.map(item => (
                            <button 
                                key={item.id}
                                onClick={() => { navigate(item.path); setOpenMenu(null); }}
                                className="flex items-center gap-4 p-4 hover:bg-black/[0.02] dark:hover:bg-white/5 rounded-2xl transition-all group border border-transparent hover:border-black/5 dark:hover:border-white/10 text-left w-full"
                            >
                                <div className={`menu-icon-container shrink-0 ${openMenu === 'kesfet' ? 'text-blue-500' : 'text-emerald-500'}`}>
                                    <item.icon size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[14px] font-black uppercase tracking-tight text-slate-800 dark:text-slate-200">{item.label}</span>
                                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-widest opacity-60">{item.desc}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="col-span-4 border-l border-black/5 dark:border-white/5 pl-8 flex flex-col justify-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600 mb-2">{linksTitle}</span>
                    {simpleLinks.map((link, i) => (
                        <button 
                            key={i}
                            onClick={() => { if(link.path.startsWith('http')) window.open(link.path, '_blank'); else navigate(link.path); setOpenMenu(null); }}
                            className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-all font-bold text-[10px] uppercase tracking-widest group"
                        >
                            {link.label}
                            <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <>
        <div className="sticky top-0 z-[100] bg-white dark:bg-slate-950 border-b border-[#f7f7f7] dark:border-white/5 w-full py-2.5 transition-colors" ref={menuRef}>
            <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between gap-4">
                {/* Left Section (Logo) */}
                <div className={`flex items-center w-32 sm:w-40 shrink-0 transition-opacity duration-300 ${showLogo ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <Logo onClick={() => navigate('/')} className="cursor-pointer" />
                </div>

                {/* Center Section (Navigation & Search) */}
                <div className="hidden md:flex items-center justify-center gap-6 lg:gap-14 flex-1">
                    <div className="flex items-center gap-4 lg:gap-8">
                        <button 
                            onMouseEnter={() => setOpenMenu('kesfet')}
                            onClick={() => setOpenMenu(openMenu === 'kesfet' ? null : 'kesfet')}
                            className={`nav-menu-item font-black uppercase tracking-[0.15em] text-[10px] lg:text-[11px] flex items-center gap-2 ${openMenu === 'kesfet' ? 'text-blue-500 bg-blue-500/5 px-4 rounded-xl py-2' : ''}`}
                        >
                            Keşfet <ChevronDown size={14} className={`transition-transform ${openMenu === 'kesfet' ? 'rotate-180' : ''}`} />
                        </button>
                        <button 
                            onMouseEnter={() => setOpenMenu('investors')}
                            onClick={() => setOpenMenu(openMenu === 'investors' ? null : 'investors')}
                            className={`nav-menu-item font-black uppercase tracking-[0.15em] text-[10px] lg:text-[11px] flex items-center gap-2 ${openMenu === 'investors' ? 'text-emerald-500 bg-emerald-500/5 px-4 rounded-xl py-2' : ''}`}
                        >
                            Yatırımcılar <ChevronDown size={14} className={`transition-transform ${openMenu === 'investors' ? 'rotate-180' : ''}`} />
                        </button>
                        <button onClick={() => navigate('/blog')} className="nav-menu-item font-black uppercase tracking-[0.15em] text-[10px] lg:text-[11px] hidden lg:block">
                            {t('blog_title')}
                        </button>
                    </div>

                    {showSearch && (
                        <form onSubmit={handleSearch} className="flex-1 max-w-[200px] lg:max-w-[280px] relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                <Search size={14} />
                            </div>
                            <input 
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t('search_placeholder_bots')}
                                className="w-full bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl py-2 pl-9 pr-4 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all"
                            />
                        </form>
                    )}
                </div>

                {/* Mobile Search Icon (only if showSearch is true) */}
                {showSearch && (
                    <div className="md:hidden flex flex-1 justify-center">
                        <button 
                            onClick={() => navigate('/search')}
                            className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl text-slate-500 active:scale-95 transition-all"
                        >
                            <Search size={20} />
                        </button>
                    </div>
                )}

                {/* Right Section (Profile & Actions) */}
                <div className="flex items-center justify-end w-32 sm:w-40 shrink-0 gap-2">
                    {/* Theme Toggle - Hidden on mobile if showSearch (meaning BotDetail/Search) */}
                    <button 
                        onClick={() => { haptic('light'); toggleTheme(); }} 
                        className={`p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-all active:scale-95 ${showSearch ? 'hidden md:flex' : 'flex'}`}
                    >
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                    
                    {user ? (
                        <div className="relative" ref={userMenuRef}>
                            <button 
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className={`flex items-center gap-2 p-1.5 pr-3 rounded-xl border transition-all active:scale-95 ${isUserMenuOpen ? 'bg-slate-100 dark:bg-white/10 border-blue-500/30' : 'bg-slate-50 dark:bg-white/5 border-transparent'}`}
                            >
                                <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center text-white text-[10px] font-black">
                                    {user.first_name?.[0] || 'U'}
                                </div>
                                <Menu size={16} className="text-slate-400" />
                            </button>
                            
                            <AnimatePresence>
                                {isUserMenuOpen && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 top-full mt-3 w-56 bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-2xl shadow-2xl py-2 z-[110]"
                                    >
                                        <div className="px-4 py-3 border-b border-black/5 dark:border-white/5 mb-2">
                                            <span className="block text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white truncate">{user.first_name} {user.last_name}</span>
                                            <span className="block text-[9px] font-bold text-slate-400 truncate mt-0.5">@{user.username || user.id}</span>
                                        </div>
                                        <button onClick={() => { navigate('/settings'); setIsUserMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">
                                            <User size={16} /> {t('profile')}
                                        </button>
                                        <button onClick={() => { navigate('/my-bots'); setIsUserMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">
                                            <BotIcon size={16} /> {t('my_bots')}
                                        </button>
                                        <button onClick={() => { navigate('/earnings'); setIsUserMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">
                                            <Wallet size={16} /> {t('wallet_title') || t('earnings_title')}
                                        </button>
                                        <div className="h-px bg-black/5 dark:bg-white/5 my-2" />
                                        <button onClick={() => { setWebAuthUser(null); setIsUserMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-500/10 text-[10px] font-black uppercase tracking-widest text-red-500">
                                            <LogOut size={16} /> {t('home_logout')}
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <button 
                            onClick={() => navigate('/premium')} 
                            className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                        >
                            Giriş
                        </button>
                    )}
                </div>
            </div>

            {/* Mega Menu Overlay */}
            <AnimatePresence>
                {openMenu && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 w-full bg-white dark:bg-slate-950 border-b border-black/5 dark:border-white/5 shadow-2xl py-10 hidden md:block"
                        onMouseLeave={() => setOpenMenu(null)}
                    >
                        {renderMegaMenuContent()}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* Mobile Modals (Optimized) */}
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
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-widest italic">
                                {mobileModal === 'kesfet' ? 'Keşfet' : 'Yatırımcılar'}
                            </h3>
                            <button onClick={() => setMobileModal(null)} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {(mobileModal === 'kesfet' ? discoverItems : investorItems).map(item => (
                                <button 
                                    key={item.id}
                                    onClick={() => { navigate(item.path); setMobileModal(null); }}
                                    className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 text-left"
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${mobileModal === 'kesfet' ? 'text-blue-500' : 'text-emerald-500'} bg-white dark:bg-slate-800 shadow-sm`}>
                                        <item.icon size={24} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[14px] font-black uppercase tracking-tight text-slate-800 dark:text-slate-200">{item.label}</span>
                                        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold opacity-60">{item.desc}</span>
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

export default Header;

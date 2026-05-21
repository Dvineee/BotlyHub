
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, LayoutGrid, DollarSign, Loader2, Store, User, Bot as BotIcon, Megaphone, X, Info, Sparkles, Zap, Gift, Star, Heart, Bell, Shield, TrendingUp, Radio, Send, Link, CheckCircle2, ChevronDown, Sun, Moon, Wallet, Menu, Plus, LogOut, Compass, Coins, BarChart3, Binoculars, Share2, Briefcase, MousePointer2, ExternalLink, ArrowLeft, MessageSquare, Award } from 'lucide-react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Announcement, Notification, BlogPost } from '../types';
import { categories, appsSubCategories } from '../data';
import { useTranslation } from '../TranslationContext';
import { DatabaseService } from '../services/DatabaseService';
import PriceService from '../services/PriceService';
import { useTelegram } from '../hooks/useTelegram';
import { useDraggableScroll } from '../hooks/useDraggableScroll';
import { useFilter } from '../FilterContext';
import { FilterMenu } from '../components/FilterMenu';
import { useTheme } from '../ThemeContext';
import Logo from '../components/Logo';
import { SEO } from '../components/SEO';
import LoginModal from '../components/LoginModal';

const iconMap: Record<string, any> = {
  Sparkles, Megaphone, Zap, Gift, Star, Info, BotIcon, Heart, Bell, Shield
};

const getLiveBotIcon = (bot: Bot) => {
    if (bot.bot_link) {
        const username = bot.bot_link.replace('@', '').replace('https://t.me/', '').split('/').pop()?.trim();
        if (username) return `https://t.me/i/userpic/320/${username}.jpg`;
    }
    return bot.icon || `https://ui-avatars.com/api/?name=${encodeURIComponent(bot.name)}&background=random&color=fff`;
};



const PromoCard: React.FC<{ ann: Announcement, onShowPopup: (ann: Announcement) => void }> = React.memo(({ ann, onShowPopup }) => {
  const navigate = useNavigate();
  const { haptic } = useTelegram();
  const { t } = useTranslation();

  const handleAction = async (e: React.MouseEvent) => {
    e.stopPropagation();
    haptic('light');
    
    try {
        await DatabaseService.incrementPromotionClick(ann.id);
    } catch (err) {
        console.warn("Click tracking error:", err);
    }

    if (ann.action_type === 'popup') onShowPopup(ann);
    else {
        let link = ann.button_link;
        if (!link) return;
        if (link.startsWith('@')) window.location.href = `https://t.me/${link.substring(1)}`;
        else if (link.startsWith('http')) window.location.href = link;
        else if (link.startsWith('/')) navigate(link);
        else window.location.href = `https://t.me/${link.replace('@','')}`;
    }
  };

  return (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -3 }}
        className="w-full relative bg-white/70 dark:bg-slate-900/50 border border-slate-200/40 dark:border-white/[0.06] flex items-center p-3 sm:p-4 gap-4 shrink-0 snap-center rounded-2xl overflow-hidden cursor-pointer group promo-card backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_12px_45px_0_rgba(59,130,246,0.08)] transition-all duration-300"
        onClick={handleAction}
    >
        {/* Left Side: Thumbnail with micro overlay glow */}
        <div className="w-[85px] h-[85px] sm:w-[95px] sm:h-[95px] rounded-xl overflow-hidden relative shrink-0 border border-slate-100 dark:border-white/[0.04]">
            <img 
                src={ann.bg_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(ann.title)}&background=random&color=fff`} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                referrerPolicy="no-referrer"
                alt={ann.title}
                loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
        </div>
        
        {/* Right Side: Content */}
        <div className="flex-1 min-w-0 py-0.5">
            <div className="flex items-center gap-1.5 mb-1.5">
                <h3 className="text-slate-900 dark:text-white font-bold text-base tracking-tight truncate leading-tight flex-1">
                    {ann.title}
                </h3>
            </div>
            
            <p className="text-slate-500 dark:text-slate-400 text-[12px] leading-[1.5] line-clamp-2 font-medium mb-3">
                {ann.description}
            </p>

            <div className="flex items-center gap-2">
                <div 
                    className="flex items-center gap-1.5 px-2 py-1 rounded-md shrink-0 shadow-sm"
                    style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' }}
                >
                    <span className="text-[8px] font-black text-white uppercase tracking-wider leading-none">
                        {ann.tag || t('home_tag_default')}
                    </span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 dark:bg-white/[0.04] rounded-md shrink-0 border border-slate-200/40 dark:border-white/[0.06]">
                    <Megaphone size={10} className="text-blue-500 shrink-0" />
                    <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-none">
                        {ann.badge_text || t('home_badge_default')}
                    </span>
                </div>
            </div>
        </div>
    </motion.div>
  );
});

const FeaturedBotsSlider: React.FC<{ bots: Bot[] }> = React.memo(({ bots }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { haptic } = useTelegram();
    const scroll = useDraggableScroll();
    const [activeType, setActiveType] = useState<'latest' | 'official' | 'featured'>('latest');
    const [scrollState, setScrollState] = useState({ left: false, right: true });

    const checkScroll = useCallback(() => {
        const el = scroll.ref.current;
        if (el) {
            const canScrollLeft = el.scrollLeft > 5;
            const canScrollRight = el.scrollLeft < (el.scrollWidth - el.clientWidth - 5);
            setScrollState({ left: canScrollLeft, right: canScrollRight });
        }
    }, [scroll.ref]);

    useEffect(() => {
        const el = scroll.ref.current;
        if (el) {
            el.addEventListener('scroll', checkScroll);
            checkScroll(); // Initial check
            window.addEventListener('resize', checkScroll);
            return () => {
                el.removeEventListener('scroll', checkScroll);
                window.removeEventListener('resize', checkScroll);
            };
        }
    }, [checkScroll, scroll.ref, activeType]);

    const featuredBots = useMemo(() => {
        // En son eklenenler: If type is latest, show those flagged OR just the latest bots
        if (activeType === 'latest') {
            const flagged = bots.filter(b => b.promoted_type === 'latest');
            if (flagged.length > 0) return flagged;
            // Fallback: Show last 10 added bots
            return [...bots].sort((a, b) => Number(b.id) - Number(a.id)).slice(0, 10);
        }
        // Orjinal: Show official bots
        if (activeType === 'official') {
            const flagged = bots.filter(b => b.promoted_type === 'official');
            if (flagged.length > 0) return flagged;
            return bots.filter(b => b.is_official).sort((a, b) => Number(a.id) - Number(b.id));
        }
        // Market Özel: Show featured bots
        return bots.filter(b => b.promoted_type === 'featured');
    }, [bots, activeType]);

    const types = [
        { id: 'latest', label: t('home_latest_added') },
        { id: 'official', label: t('home_official') },
        { id: 'featured', label: t('home_market_special') }
    ];

    const cycleType = () => {
        const currentIndex = types.findIndex(t => t.id === activeType);
        const nextIndex = (currentIndex + 1) % types.length;
        setActiveType(types[nextIndex].id as any);
    };

    if (bots.length === 0) return null;

    return (
        <div className="mb-8 md:mb-12 flex flex-col md:flex-row items-stretch bg-white/75 dark:bg-slate-900/30 px-6 py-5 md:p-6 rounded-2xl border border-slate-200/40 dark:border-white/[0.04] backdrop-blur-xl relative overflow-hidden group shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            {/* Header Info with elegant premium tabs */}
            <div className="flex flex-col gap-4 shrink-0 md:w-[190px] md:border-r border-slate-200/40 dark:border-white/[0.06] md:pr-6 justify-center mb-5 md:mb-0">
                <div 
                    className="flex items-center gap-2 cursor-pointer md:cursor-default"
                >
                    <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">
                        {t('nav_explore')}
                    </h2>
                </div>
                
                {/* Desktop and Mobile Tabs */}
                <div className="flex flex-row md:flex-col gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
                    {types.map(t => {
                        const isSelected = activeType === t.id;
                        return (
                            <button 
                                key={t.id}
                                onClick={() => { haptic('light'); setActiveType(t.id as any); }}
                                className={`text-[11px] font-bold uppercase tracking-wider px-3 py-2 rounded-xl text-left transition-all shrink-0 md:shrink-1 ${
                                    isSelected 
                                        ? 'bg-blue-500 text-white shadow-xs' 
                                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.02]'
                                }`}
                            >
                                {t.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Slider Content */}
            <div className="relative flex-1 w-full overflow-hidden md:pl-6 flex items-center">
                {/* Left Blur & Button */}
                <AnimatePresence>
                    {scrollState.left && (
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white dark:from-slate-950 via-white/80 dark:via-slate-950/80 to-transparent z-40 pointer-events-none flex items-center pl-2"
                        >
                            <button 
                                onClick={(e) => { e.stopPropagation(); scroll.ref.current?.scrollBy({ left: -300, behavior: 'smooth' }); }}
                                className="hidden md:flex w-8 h-8 bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-white/10 rounded-full items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-500/20 transition-all shadow-md pointer-events-auto active:scale-95"
                            >
                                <ChevronLeft size={16} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Right Blur & Button */}
                <AnimatePresence>
                    {scrollState.right && (
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white dark:from-slate-950 via-white/80 dark:via-slate-950/80 to-transparent z-40 pointer-events-none flex items-center justify-end pr-2"
                        >
                            <button 
                                onClick={(e) => { e.stopPropagation(); scroll.ref.current?.scrollBy({ left: 300, behavior: 'smooth' }); }}
                                className="hidden md:flex w-8 h-8 bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-white/10 rounded-full items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-500/20 transition-all shadow-md pointer-events-auto active:scale-95"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div 
                    ref={scroll.ref}
                    onMouseDown={scroll.onMouseDown}
                    onMouseUp={scroll.onMouseUp}
                    onMouseMove={scroll.onMouseMove}
                    onMouseLeave={scroll.onMouseLeave}
                    onContextMenu={scroll.onContextMenu}
                    className={`flex items-center gap-6 overflow-x-auto no-scrollbar py-2 transform-gpu will-change-transform ${scroll.isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                >
                    {featuredBots.map((bot) => (
                        <motion.div
                            key={bot.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ y: -2 }}
                            onClick={() => navigate(`/bot/${bot.slug}`)}
                            className="flex flex-col items-center gap-2.5 shrink-0 cursor-pointer group/item w-20 text-center"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-2xl opacity-0 group-hover/item:opacity-100 transition-opacity"></div>
                                <div className="w-[56px] h-[56px] rounded-2xl p-[1px] bg-slate-200/50 dark:bg-white/[0.04] group-hover/item:bg-blue-500/30 transition-all duration-300 shadow-sm">
                                    <img 
                                        src={getLiveBotIcon(bot)} 
                                        className="w-full h-full rounded-[14px] object-cover bg-white dark:bg-slate-900"
                                        onError={(e) => { (e.target as any).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(bot.name)}&background=334155&color=fff&bold=true`; }}
                                        referrerPolicy="no-referrer"
                                    />
                                </div>
                            </div>
                            <div className="w-full">
                                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 tracking-tight leading-tight block truncate w-full group-hover/item:text-blue-500 transition-colors">
                                    {bot.name}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
});
const BotCard: React.FC<{ bot: Bot, tonRate: number }> = React.memo(({ bot, tonRate }) => {
  const navigate = useNavigate();
  const prices = useMemo(() => PriceService.convert(bot.price, tonRate), [bot.price, tonRate]);
  
  return (
    <div 
        onClick={() => navigate(`/bot/${bot.slug}`)} 
        className="flex items-center p-4 sm:p-5 bot-card cursor-pointer group bg-white/75 dark:bg-slate-900/30 hover:bg-slate-100/80 dark:hover:bg-slate-900/70 rounded-2xl transition-all border border-slate-200/40 dark:border-white/[0.04] hover:border-blue-500/20 dark:hover:border-blue-500/10 active:scale-[0.99] transform-gpu shadow-xs duration-300"
    >
        <div className="relative shrink-0">
            <div className="absolute inset-0 bg-blue-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
            <img 
                src={getLiveBotIcon(bot)} 
                alt={bot.name} 
                loading="lazy"
                className="w-[3.6rem] h-[3.6rem] sm:w-[4rem] sm:h-[4rem] rounded-2xl object-cover bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-white/[0.04] group-hover:scale-105 transition-transform duration-500" 
                onError={(e) => { (e.target as any).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(bot.name)}&background=334155&color=fff&bold=true`; }}
            />
        </div>
        <div className="flex-1 ml-4 min-w-0 mr-2">
            <h3 className="font-extrabold text-[15px] sm:text-[16px] text-slate-800 dark:text-slate-100 truncate tracking-tight uppercase leading-none mb-1.5 flex items-center gap-1.5">
                {bot.name}
                {bot.is_official && (
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="text-blue-500 shrink-0">
                        <path fillRule="evenodd" clipRule="evenodd" d="M7.408 1.2375C7.57933 1.11017 7.78667 1.0415 8 1.0415C8.21333 1.0415 8.42067 1.11017 8.592 1.2375L9.81067 2.14417C9.83467 2.16217 9.86133 2.1755 9.88933 2.18484C9.91733 2.19417 9.94733 2.19884 9.97733 2.19817L11.496 2.18084C11.7093 2.17817 11.918 2.24484 12.09 2.37017C12.2627 2.4955 12.39 2.6735 12.454 2.87684L12.9073 4.32617C12.916 4.35484 12.93 4.3815 12.9473 4.4055C12.9647 4.4295 12.986 4.45084 13.0107 4.46817L14.2493 5.34684C14.4233 5.47017 14.5527 5.64617 14.6187 5.8495C14.6847 6.05217 14.6833 6.27084 14.6153 6.4735L14.13 7.91284C14.1207 7.94084 14.1153 7.97084 14.1153 8.00017C14.1153 8.0295 14.12 8.0595 14.13 8.0875L14.6153 9.52684C14.6833 9.72884 14.6847 9.9475 14.6187 10.1508C14.5527 10.3535 14.4233 10.5302 14.2493 10.6535L13.0107 11.5322C12.9867 11.5495 12.9653 11.5702 12.9473 11.5948C12.93 11.6188 12.9167 11.6455 12.9073 11.6742L12.454 13.1235C12.3907 13.3268 12.2627 13.5048 12.09 13.6302C11.9173 13.7555 11.7093 13.8222 11.496 13.8195L9.97733 13.8022C9.94733 13.8015 9.918 13.8062 9.88933 13.8155C9.86133 13.8248 9.83467 13.8382 9.81067 13.8562L8.592 14.7628C8.42067 14.8902 8.21333 14.9588 8 14.9588C7.78667 14.9588 7.57933 14.8902 7.408 14.7628L6.18933 13.8562C6.16533 13.8382 6.13867 13.8248 6.11067 13.8155C6.08267 13.8062 6.05267 13.8015 6.02267 13.8022L4.504 13.8195C4.29067 13.8222 4.082 13.7555 3.91 13.6302C3.73733 13.5048 3.61 13.3268 3.546 13.1235L3.09267 11.6742C3.084 11.6455 3.07 11.6188 3.05267 11.5948C3.03533 11.5708 3.014 11.5495 2.98933 11.5322L1.75067 10.6535C1.57667 10.5302 1.44733 10.3542 1.38133 10.1508C1.31533 9.94817 1.31667 9.7295 1.38467 9.52684L1.87 8.00017C1.88067 8.0595 1.88533 8.03017 1.88533 8.00017C1.88533 7.97017 1.88067 7.94084 1.87067 7.91284L1.38533 6.4735C1.31733 6.2715 1.316 6.05284 1.382 5.8495C1.448 5.64684 1.57733 5.47084 1.75133 5.3475L2.99 4.46884C3.014 4.45084 3.03533 4.43017 3.05333 4.40617C3.07067 4.38217 3.084 4.3555 3.09333 4.32684L3.54667 2.8775C3.61 2.67417 3.738 2.49617 3.91067 2.37084C4.08333 2.2455 4.29133 2.17884 4.50467 2.1815L6.02333 2.19884C6.05333 2.1995 6.08266 2.19484 6.11133 2.1855C6.13933 2.17617 6.166 2.16284 6.19 2.14484L7.408 1.2375Z" fill="currentColor"></path>
                        <path fillRule="evenodd" clipRule="evenodd" d="M7.33334 10.6668C7.16267 10.6668 6.992 10.6015 6.862 10.4715L4.862 8.4715C4.60134 8.21083 4.60134 7.7895 4.862 7.52883C5.12267 7.26817 5.544 7.26817 5.80467 7.52883L7.33334 9.0575L10.1953 6.1955C10.456 5.93483 10.8773 5.93483 11.138 6.1955C11.3987 6.45617 11.3987 6.8775 11.138 7.13817L7.80467 10.4715C7.67467 10.6015 7.504 10.6668 7.33334 10.6668Z" fill="white"></path>
                    </svg>
                )}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate mb-2">{bot.description}</p>
            <div className="flex items-center gap-2">
                {bot.price > 0 && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-500/10 rounded-md border border-blue-500/15">
                        <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-tighter flex items-center gap-1 leading-none">
                            {Number(prices.ton).toFixed(1)}
                            <svg fill="none" height="10" width="10" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" className="translate-y-[0.5px]">
                                <title>Payment TON icon</title>
                                <g clipPath="url(#a_ton_home)" fill="currentColor">
                                    <path d="M7.5 11.015V5.963H5.268a.31.31 0 0 0-.272.463l1.772 3.17.734 1.419ZM9.232 9.596l1.771-3.17a.31.31 0 0 0-.272-.463H8.498v5.053l.734-1.42Z"></path>
                                    <path clipRule="evenodd" d="M16 8.5a8 8 0 1 1-16 0 8 8 0 0 1 16 0ZM5.268 4.965h5.464c1.004 0 1.64 1.085 1.136 1.96l-3.372 5.844a.572.572 0 0 1-.992 0L4.132 6.925c-.505-.876.132-1.96 1.136-1.96Z" fillRule="evenodd"></path>
                                </g>
                                <defs>
                                    <clipPath id="a_ton_home">
                                        <path d="M0 0h16v16H0z" fill="#fff" transform="translate(0 .5)"></path>
                                    </clipPath>
                                </defs>
                            </svg>
                        </span>
                    </div>
                )}
                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-500/10 rounded-md border border-amber-500/15">
                    <Star size={9} className="text-amber-500 fill-amber-500" />
                    <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-tighter leading-none">{bot.rating || '0.0'}</span>
                </div>
            </div>
        </div>
        <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 dark:bg-white/[0.03] text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-500/5 transition-all duration-300">
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </div>
    </div>
  );
});

const AddProjectBanner: React.FC<{ className?: string }> = ({ className = "" }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    
    return (
        <div 
            className={`h-[128px] rounded-2xl bg-white/70 dark:bg-slate-900/50 border border-slate-200/40 dark:border-white/[0.06] flex items-center p-3 sm:p-4 gap-4 shrink-0 snap-center overflow-hidden cursor-pointer group backdrop-blur-xl transition-all duration-300 hover:border-blue-500/20 hover:shadow-[0_8px_30px_rgba(59,130,246,0.04)] ${className}`}
            onClick={() => navigate('/settings')}
        >
            {/* Left Side: Illustration with high-quality styling */}
            <div className="w-[95px] h-[95px] rounded-xl overflow-hidden relative shrink-0 bg-slate-100 dark:bg-slate-800 border border-slate-100 dark:border-white/[0.04] flex items-center justify-center">
                <img 
                    src="https://i.hizliresim.com/eoisiuq.png" 
                    alt="Add Project" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
            </div>
            
            {/* Right Side: Content */}
            <div className="flex-1 min-w-0 py-0.5 flex flex-col justify-between h-[95px]">
                <div>
                    <h3 className="text-slate-900 dark:text-white font-bold text-base tracking-tight truncate leading-tight mb-1 group-hover:text-blue-500 transition-colors">
                        {t('home_add_auto_title')}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-[12px] leading-[1.4] line-clamp-2 font-medium">
                        {t('home_add_auto_desc')}
                    </p>
                </div>
                
                <div className="flex items-center">
                    <div 
                        className="flex items-center gap-1.5 px-3 py-1 rounded-md shrink-0 shadow-sm"
                        style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' }}
                    >
                        <span className="text-[8px] font-black text-white uppercase tracking-wider leading-none">
                            {t('home_join_now')}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const NavMenu = ({ 
    isScrolled, 
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
    isScrolled: boolean, 
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
    const [navState, setNavState] = useState<'main' | 'bots' | 'apps'>('main');
    const [mobileModal, setMobileModal] = useState<'kesfet' | 'investors' | null>(null);
    const internalMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (internalMenuRef.current && !internalMenuRef.current.contains(event.target as Node)) {
                setOpenMenu(null);
                setNavState('main');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const botsCategories = categories.filter(c => c.id !== 'apps' && c.id !== 'all');
    const appsCategories = appsSubCategories;

    const handleCategoryClick = (catId: string, mode: 'bots' | 'apps') => {
        haptic('light');
        navigate(`/search?mode=${mode}&category=${catId}`);
        setOpenMenu(null);
        setMobileModal(null);
        setNavState('main');
    };

    interface MenuItem {
        id: string;
        label: string;
        desc: string;
        icon: any;
        action?: () => void;
        path?: string;
    }

    const discoverItems: MenuItem[] = [
        { id: 'bots', label: 'Botlar', desc: 'Telegram Bot Marketi', icon: BotIcon, action: () => setNavState('bots') },
        { id: 'apps', label: 'Uygulamalar', desc: 'Web3 & TMA Uygulamaları', icon: LayoutGrid, action: () => setNavState('apps') },
        { id: 'channels', label: 'Kanallar', desc: 'Popüler Telegram Kanalları', icon: Megaphone, path: '/channels' },
        { id: 'ads', label: 'Reklam', desc: 'Projenizi Öne Çıkarın', icon: Share2, path: '/settings' },
    ];

    const investorItems: MenuItem[] = [
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
                        <AnimatePresence mode="wait">
                            {navState === 'main' ? (
                                <motion.div 
                                    key="main"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="grid grid-cols-2 gap-4"
                                >
                                    {discoverItems.map(item => (
                                        <button 
                                            key={item.id}
                                            onClick={() => {
                                                if (item.action) item.action();
                                                else if (item.path) { navigate(item.path); setOpenMenu(null); }
                                            }}
                                            className="flex items-center gap-4 p-4 hover:bg-black/[0.02] dark:hover:bg-white/5 rounded-2xl transition-all group border border-transparent hover:border-black/5 dark:hover:border-white/10 text-left w-full"
                                        >
                                            <div className="menu-icon-container shrink-0 flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                                                <item.icon size={20} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[14px] font-semibold menu-item-text">{item.label}</span>
                                                <span className="text-[12px] text-slate-500 dark:text-slate-400 font-normal">{item.desc}</span>
                                            </div>
                                        </button>
                                    ))}
                                </motion.div>
                            ) : navState === 'bots' ? (
                                <motion.div 
                                    key="bots"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="flex flex-col gap-6"
                                >
                                    <div className="flex items-center gap-4 mb-2">
                                        <button 
                                            onClick={() => setNavState('main')}
                                            className="p-2 hover:bg-white/10 rounded-full text-slate-500 transition-colors"
                                        >
                                            <ArrowLeft size={20} />
                                        </button>
                                        <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-tight">Bot Kategorileri</h3>
                                    </div>
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                        {botsCategories.map(cat => (
                                            <button 
                                                key={cat.id}
                                                onClick={() => handleCategoryClick(cat.id, 'bots')}
                                                className="flex items-center gap-3 p-3 hover:bg-black/[0.02] dark:hover:bg-white/5 rounded-xl transition-all group text-left border border-transparent hover:border-black/5 dark:hover:border-white/10 w-full"
                                            >
                                                <div className="menu-icon-container !w-8 !h-8 px-0 shrink-0 flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                                                    <cat.icon size={16} />
                                                </div>
                                                <span className="text-[11px] font-bold uppercase tracking-tight menu-item-text">{t(cat.label)}</span>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="apps"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="flex flex-col gap-6"
                                >
                                    <div className="flex items-center gap-4 mb-2">
                                        <button 
                                            onClick={() => setNavState('main')}
                                            className="p-2 hover:bg-white/10 rounded-full text-slate-500 transition-colors"
                                        >
                                            <ArrowLeft size={20} />
                                        </button>
                                        <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-tight">Uygulama Kategorileri</h3>
                                    </div>
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                        {appsCategories.map(cat => (
                                            <button 
                                                key={cat.id}
                                                onClick={() => handleCategoryClick(cat.id, 'apps')}
                                                className="flex items-center gap-3 p-3 hover:bg-black/[0.02] dark:hover:bg-white/5 rounded-xl transition-all group text-left border border-transparent hover:border-black/5 dark:hover:border-white/10 w-full"
                                            >
                                                <div className="menu-icon-container !w-8 !h-8 px-0 shrink-0 flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                                                    <cat.icon size={16} />
                                                </div>
                                                <span className="text-[11px] font-bold uppercase tracking-tight menu-item-text">{t(cat.label)}</span>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <div className="col-span-4 border-l border-black/5 dark:border-white/5 pl-8 flex flex-col justify-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600 mb-2">Hızlı Bağlantılar</span>
                        {simpleLinks.map((link, i) => (
                            <a 
                                key={i}
                                href={link.path}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-all font-bold text-xs uppercase group"
                            >
                                {link.label}
                                <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
                            </a>
                        ))}
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
                                    <div className="menu-icon-container shrink-0 flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                                        <item.icon size={20} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[14px] font-semibold menu-item-text">{item.label}</span>
                                        <span className="text-[12px] text-slate-500 dark:text-slate-400 font-normal">{item.desc}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="col-span-4 border-l border-black/5 dark:border-white/5 pl-8 flex flex-col justify-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600 mb-2">Yatırım Linkleri</span>
                        {simpleLinks.map((link, i) => (
                            <a 
                                key={i}
                                href={link.path}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition-all font-bold text-xs uppercase group"
                            >
                                {link.label}
                                <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
                            </a>
                        ))}
                    </div>
                </div>
            );
        }
    };

    return (
        <>
        <div className="sticky top-0 z-[1] bg-white dark:bg-slate-900 border-b border-[#f7f7f7] dark:border-white/5 w-full py-2.5 md:pb-2 transition-colors" ref={internalMenuRef}>
            <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between">
                {/* Left Section (Logo) */}
                <div className="hidden md:flex items-center w-48 shrink-0">
                    {isScrolled ? (
                        <Logo onClick={() => navigate('/')} className="cursor-pointer" />
                    ) : null}
                </div>

                {/* Center Section (Navigation) */}
                <div className="flex items-center justify-center gap-8 md:gap-14 flex-1">
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
                        className="nav-menu-item text-slate-600 dark:text-slate-400 hover:bg-blue-500/5"
                    >
                        {t('blog_title')}
                    </button>
                </div>

                {/* Profile Section */}
                <div className="flex items-center justify-end md:w-48 shrink-0">
                    <AnimatePresence mode="wait">
                        {isScrolled && (
                            <motion.div 
                                key="scrolled-actions"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ duration: 0.2 }}
                                className="hidden md:flex items-center gap-2 md:gap-3"
                            >
                                <button 
                                    onClick={() => { haptic('light'); toggleTheme(); }} 
                                    className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-black/5 dark:border-white/5 rounded-xl text-slate-900 dark:text-white active:scale-95 transition-all outline-none shrink-0"
                                >
                                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                                </button>

                                {user ? (
                                    <>
                                        <button onClick={() => { haptic('medium'); navigate('/earnings'); }} className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-black/5 dark:border-white/5 rounded-xl text-slate-900 dark:text-white active:scale-95 transition-all shrink-0">
                                            <Wallet size={18} />
                                        </button>
                                        <div className="relative" ref={parentMenuRef}>
                                            <button 
                                              onClick={() => { haptic('light'); setIsMenuOpen(!isMenuOpen); }} 
                                              className={`h-10 px-3 flex items-center gap-2 border border-black/5 dark:border-white/5 text-slate-900 dark:text-white rounded-xl active:scale-95 transition-all relative ${isMenuOpen ? 'bg-slate-100 dark:bg-white/10' : 'bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10'}`}
                                            >
                                                <span className="block md:hidden text-[11px] font-black uppercase tracking-wide">
                                                    {(user.username || user.first_name || user.name || '').slice(0, 5)}{(user.username || user.first_name || user.name || '').length > 5 ? '..' : ''}
                                                </span>
                                                <span className="hidden md:block text-[11px] font-black uppercase tracking-wide">
                                                    {user.username || user.first_name || user.name || ''}
                                                </span>
                                                <ChevronDown size={12} className={`text-slate-400 dark:text-slate-500 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
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
                                                            {(user.photo_url || user.avatar) ? (
                                                                <img 
                                                                    src={user.photo_url || user.avatar} 
                                                                    alt={user.first_name || user.name}
                                                                    className="w-10 h-10 rounded-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-black">
                                                                    {user.first_name ? user.first_name[0] : (user.name ? user.name[0] : 'U')}
                                                                </div>
                                                            )}
                                                            <div className="flex flex-col min-w-0">
                                                                <span className="text-[13px] font-bold text-slate-900 dark:text-white truncate">
                                                                    {user.first_name ? `${user.first_name} ${user.last_name || ''}` : user.name}
                                                                </span>
                                                                <span className="text-[10px] text-slate-500 truncate">@{user.username || user.id}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <button onClick={() => { haptic('light'); navigate('/'); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all group">
                                                        <Store size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                                                        <span className="text-xs font-bold uppercase tracking-tight">{t('market')}</span>
                                                    </button>

                                                    <button onClick={() => { haptic('light'); navigate('/profile'); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all group">
                                                        <User size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                                                        <span className="text-xs font-bold uppercase tracking-tight">{t('profile')}</span>
                                                    </button>

                                                    <button onClick={() => { haptic('light'); navigate('/my-bots'); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all group">
                                                        <BotIcon size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                                                        <span className="text-xs font-bold uppercase tracking-tight">{t('my_bots')}</span>
                                                    </button>

                                                    <button onClick={() => { haptic('light'); navigate('/channels'); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all group">
                                                        <Megaphone size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                                                        <span className="text-xs font-bold uppercase tracking-tight">{t('my_channels')}</span>
                                                    </button>

                                                    <button onClick={() => { haptic('light'); navigate('/notifications'); setIsMenuOpen(false); }} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all group">
                                                        <div className="flex items-center gap-3">
                                                            <Bell size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                                                            <span className="text-xs font-bold uppercase tracking-tight">{t('notifications')}</span>
                                                        </div>
                                                        {unreadCount > 0 && <div className="w-2 h-2 bg-red-500 rounded-full" />}
                                                    </button>

                                                    <button onClick={() => { haptic('light'); navigate('/qa'); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all group">
                                                        <MessageSquare size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                                                        <span className="text-xs font-bold uppercase tracking-tight">Soru Cevap & Q&A</span>
                                                    </button>

                                                    <div className="h-px bg-slate-100 dark:border-white/5 my-2" />
                                                    
                                                    <button 
                                                        onClick={() => { 
                                                            const confirmed = window.confirm("Çıkış yapmak istediğinize emin misiniz?");
                                                            if (confirmed) {
                                                                haptic('medium'); 
                                                                setWebAuthUser(null);
                                                                setIsMenuOpen(false); 
                                                            }
                                                        }} 
                                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 transition-all font-bold text-xs uppercase"
                                                    >
                                                        <LogOut size={18} /> 
                                                        <span className="text-xs font-bold uppercase tracking-tight">{t('home_logout')}</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <button 
                                        onClick={() => { haptic('light'); setIsLoginModalOpen(true); }}
                                        className="nav-menu-item !px-5 bg-blue-500 hover:bg-blue-600 text-white text-[13px] font-bold rounded-[10px] transition-all active:scale-95 flex items-center justify-center whitespace-nowrap shadow-lg shadow-blue-500/25 border-none"
                                    >
                                        {t('home_login')}
                                    </button>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Desktop Mega Menu Dropdown */}
            <AnimatePresence>
                {openMenu && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="hidden md:block absolute left-0 right-0 top-full bg-white dark:bg-slate-900/95 backdrop-blur-xl border-b border-black/5 dark:border-white/10 shadow-2xl z-[100] mega-menu-container"
                        onMouseLeave={() => { setOpenMenu(null); setNavState('main'); }}
                    >
                        {renderMegaMenuContent()}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* Mobile Modal for Categories */}
        <AnimatePresence>
            {mobileModal && (
                <div className="fixed inset-0 z-[200] flex items-end justify-center p-0 md:hidden">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => { setMobileModal(null); setNavState('main'); }}
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                    />
                    <motion.div 
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="relative w-full bg-white dark:bg-slate-900 rounded-t-[32px] overflow-hidden pt-4 pb-12 border-t border-black/10 dark:border-white/10"
                    >
                        {/* Drag Handle */}
                        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-8" />
                        
                        <div className="flex justify-between items-center mb-6 px-8">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-widest uppercase italic">
                                {mobileModal === 'kesfet' ? 'KEŞFET' : 'YATIRIMCILAR'}
                            </h3>
                            <button onClick={() => { setMobileModal(null); setNavState('main'); }} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 active:scale-90 transition-all">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="max-h-[70vh] overflow-y-auto px-6 pb-4">
                            <AnimatePresence mode="wait">
                                {navState === 'main' ? (
                                    <motion.div 
                                        key="mobile-main"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="grid grid-cols-1 gap-3"
                                    >
                                        {(mobileModal === 'kesfet' ? discoverItems : investorItems).map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => {
                                                    if (item.action) item.action();
                                                    else if (item.path) { navigate(item.path); setMobileModal(null); }
                                                }}
                                                className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-white/5 active:bg-slate-100 dark:active:bg-white/10 transition-all rounded-2xl border border-black/5 dark:border-white/5 group mobile-menu-item"
                                            >
                                                <div className={`mobile-menu-icon-container flex items-center justify-center rounded-xl shrink-0 ${mobileModal === 'kesfet' ? 'text-blue-500' : 'text-emerald-500'}`}>
                                                    <item.icon size={22} className="menu-item-icon" />
                                                </div>
                                                <div className="flex flex-col items-start min-w-0">
                                                    <span className="text-[13px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider truncate w-full">
                                                        {item.label}
                                                    </span>
                                                </div>
                                                {item.action && <ChevronRight size={16} className="ml-auto text-slate-300 dark:text-slate-700" />}
                                            </button>
                                        ))}
                                    </motion.div>
                                ) : navState === 'bots' ? (
                                    <motion.div 
                                        key="mobile-bots"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="flex flex-col gap-4"
                                    >
                                        <button 
                                            onClick={() => setNavState('main')}
                                            className="flex items-center gap-2 text-blue-500 font-black uppercase tracking-widest text-[11px] mb-2"
                                        >
                                            <ArrowLeft size={16} /> Geri
                                        </button>
                                        <div className="grid grid-cols-2 gap-3">
                                            {botsCategories.map(cat => (
                                                <button 
                                                    key={cat.id}
                                                    onClick={() => handleCategoryClick(cat.id, 'bots')}
                                                    className="flex flex-col items-start gap-3 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 mobile-menu-item"
                                                >
                                                    <div className="mobile-menu-icon-container flex items-center justify-center text-blue-500">
                                                        <cat.icon size={20} />
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-tight text-slate-700 dark:text-slate-300">{t(cat.label)}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div 
                                        key="mobile-apps"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="flex flex-col gap-4"
                                    >
                                        <button 
                                            onClick={() => setNavState('main')}
                                            className="flex items-center gap-2 text-blue-500 font-black uppercase tracking-widest text-[11px] mb-2"
                                        >
                                            <ArrowLeft size={16} /> Geri
                                        </button>
                                        <div className="grid grid-cols-2 gap-3">
                                            {appsCategories.map(cat => (
                                                <button 
                                                    key={cat.id}
                                                    onClick={() => handleCategoryClick(cat.id, 'apps')}
                                                    className="flex flex-col items-start gap-3 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 mobile-menu-item"
                                                >
                                                    <div className="mobile-menu-icon-container flex items-center justify-center text-emerald-500">
                                                        <cat.icon size={20} />
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-tight text-slate-700 dark:text-slate-300">{t(cat.label)}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            
                            {navState === 'main' && (
                                <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/5">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600 block mb-4">Hızlı Bağlantılar</span>
                                    <div className="grid grid-cols-1 gap-2">
                                        {simpleLinks.map((link, i) => (
                                            <a 
                                                key={i}
                                                href={link.path}
                                                className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-bold text-xs uppercase"
                                            >
                                                {link.label}
                                                <ExternalLink size={14} />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
        </>
    );
};

const Home = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, haptic, isTelegram, setWebAuthUser } = useTelegram();
  const { toggleTheme, theme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [bots, setBots] = useState<Bot[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [tonRate, setTonRate] = useState(250);
  const [selectedAnn, setSelectedAnn] = useState<Announcement | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { activeFilter } = useFilter();
  const [selectedAppsCategory, setSelectedAppsCategory] = useState('all');
  const [selectedBotsCategory, setSelectedBotsCategory] = useState('all');
  const [homeBlogs, setHomeBlogs] = useState<BlogPost[]>([]);

  useEffect(() => {
    const handleScroll = () => {
        setIsScrolled(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const annScroll = useDraggableScroll();
  const catScroll = useDraggableScroll();
  const botsCatScroll = useDraggableScroll();

  const botsCategories = categories.filter(c => c.id !== 'apps' && c.id !== 'all');

  const filteredBots = useMemo(() => {
    let result = [...bots];
    
    if (activeFilter === 'paid') result = result.filter(b => b.price > 0);
    else if (activeFilter === 'free') result = result.filter(b => b.price === 0);
    else if (activeFilter === 'popular') result = result.sort((a, b) => (b.views || 0) - (a.views || 0));
    else if (activeFilter === 'bhub') result = result.filter(b => b.is_official);
    
    return result;
  }, [bots, activeFilter]);

  const loadData = useCallback(async () => {
    // İlk yüklemede sadece botları, duyuruları ve son blogları çek, fiyatı arka planda güncelle
    const [botData, annData, blogData] = await Promise.all([
        DatabaseService.getBots(),
        DatabaseService.getAnnouncements(),
        DatabaseService.getBlogs(3)
    ]);
    
    setBots(botData);
    if (annData.length > 0) {
        setAnnouncements(annData.filter(a => a.is_active));
    }
    setHomeBlogs(blogData);
    setIsLoading(false);

    // Fiyat ve bildirimleri arka planda çek
    PriceService.getTonPrice().then(pData => setTonRate(pData.tonTry));
    
    if (user?.id) {
        DatabaseService.getNotifications(user.id.toString()).then(notes => {
            const unread = notes.filter(n => !n.isRead).length;
            setUnreadCount(unread);
        });
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
    const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [loadData]);

  const categorizedBots = useMemo(() => {
    const result: Record<string, { featured: Bot[], slider: Bot[], total: number }> = {};
    const baseBots = [...filteredBots].sort((a, b) => (b.views || 0) - (a.views || 0));

    // Apps section
    const allApps = baseBots.filter(b => Array.isArray(b.category) ? b.category.includes('apps') : b.category === 'apps');
    
    // Top 3 (Overall most popular apps)
    const appsFeatured = allApps.slice(0, 3);
    
    // Slider/List (Popular apps in selected category)
    let appsForList = allApps;
    if (selectedAppsCategory !== 'all') {
        appsForList = allApps.filter(b => 
            Array.isArray(b.category) 
                ? b.category.includes(selectedAppsCategory) 
                : b.category === selectedAppsCategory
        );
    }
    const appsSlider = appsForList.slice(0, 9); // Limit to 9 as requested

    if (allApps.length > 0) {
        result['apps'] = {
            featured: appsFeatured,
            slider: appsSlider,
            total: allApps.length
        };
    }

    // Bots section (everything else)
    const allBots = baseBots.filter(b => Array.isArray(b.category) ? !b.category.includes('apps') : b.category !== 'apps');
    
    // Top 3 (Overall most popular bots)
    const botsFeatured = allBots.slice(0, 3);
    
    // Slider/List (Popular bots in selected category)
    let botsForList = allBots;
    if (selectedBotsCategory !== 'all') {
        botsForList = allBots.filter(b => 
            Array.isArray(b.category) 
                ? b.category.includes(selectedBotsCategory) 
                : b.category === selectedBotsCategory
        );
    }
    const botsSlider = botsForList.slice(0, 9); // Limit to 9 as requested

    if (allBots.length > 0) {
        result['bots'] = {
            featured: botsFeatured,
            slider: botsSlider,
            total: allBots.length
        };
    }
    
    return result;
  }, [filteredBots, selectedAppsCategory, selectedBotsCategory]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-200 animate-in transition-colors duration-300 home-page">
      <SEO 
          title={t('home_seo_title')} 
          description={t('home_seo_desc')}
      />
      {/* Top Background Wrapper */}
      <div className="bg-[#00000008] dark:bg-slate-900/10">
        {/* Top Section */}
        <div className="w-full pt-6 md:pt-10 pb-4 shadow-[inset_0_-1px_0_0_rgba(0,0,0,0.03)] relative z-[120]">
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
              <div className="flex flex-wrap md:flex-nowrap items-center justify-between mb-8 px-1 gap-y-6 md:gap-x-6">
                <div className="flex items-center order-1 md:w-48 shrink-0">
                    <Logo onClick={() => navigate('/')} className="cursor-pointer" />
                </div>

                  <div className="w-full md:flex-1 md:max-w-2xl order-3 md:order-2 flex items-center gap-2 md:gap-3">
                      <div className="flex-1 md:w-[330px] md:flex-none relative z-[100]">
                          <div className="relative flex items-center bg-slate-50 dark:bg-slate-800/50 border border-black/5 dark:border-white/10 rounded-xl group shadow-sm">
                              <div 
                                onClick={() => navigate('/search')} 
                                className="flex items-center flex-1 min-w-0 cursor-pointer active:scale-[0.98] transition-transform"
                              >
                                  <div className="ml-2 md:ml-3 w-8 h-8 flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors shrink-0">
                                      <Search size={16} />
                                  </div>
                                  <div className="w-full py-2 px-3 text-[11px] text-slate-700 dark:text-slate-200 font-bold uppercase tracking-wider truncate min-w-0">
                                      {t('search_placeholder')}
                                  </div>
                              </div>
                              <div className="flex items-center gap-0.5 pr-1 shrink-0 ml-auto border-l border-black/[0.05] dark:border-white/[0.05] pl-1 relative z-[110]">
                                  <FilterMenu />
                              </div>
                          </div>
                      </div>
                      <RouterLink 
                          to="/settings"
                          onClick={() => haptic('light')}
                          className="hidden md:flex items-center gap-1.5 px-3 h-10 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-[13px] font-bold transition-all active:scale-95 whitespace-nowrap"
                      >
                          <Plus size={14} />
                          <span style={{ fontWeight: 600 }}>{t('add_your')}</span>
                      </RouterLink>
                  </div>

                  <div className={`flex items-center gap-2 md:gap-3 order-2 md:order-3 md:w-48 justify-end ml-auto shrink-0 ${isScrolled ? 'md:hidden' : ''}`}>
                      <button 
                          onClick={() => { haptic('light'); toggleTheme(); }} 
                          className="w-10 h-10 flex items-center justify-center text-slate-900 dark:text-white bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl active:scale-95 transition-all outline-none"
                      >
                          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                      </button>

                      {user && (
                          <button onClick={() => { haptic('medium'); navigate('/earnings'); }} className="hidden sm:flex w-10 h-10 items-center justify-center text-slate-900 dark:text-white bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl active:scale-95 transition-all outline-none">
                              <Wallet size={18} />
                          </button>
                      )}

                      {user ? (
                          <div className="relative" ref={menuRef}>
                              <button 
                                onClick={() => { haptic('light'); setIsMenuOpen(!isMenuOpen); }} 
                                className="h-10 px-3 flex items-center justify-center gap-1.5 text-slate-900 dark:text-white bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl active:scale-95 transition-all relative outline-none select-none"
                              >
                                       <span className="block md:hidden text-[11px] font-black uppercase tracking-wide">
                                           {(user.username || user.first_name || user.name || '').slice(0, 5)}{(user.username || user.first_name || user.name || '').length > 5 ? '..' : ''}
                                       </span>
                                       <span className="hidden md:block text-[11px] font-black uppercase tracking-wide">
                                           {user.username || user.first_name || user.name || ''}
                                       </span>
                                       <ChevronDown size={12} className={`text-slate-400 dark:text-slate-500 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
                                  {unreadCount > 0 && (
                                      <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-600 rounded-full border-2 border-slate-50 dark:border-slate-950 text-[8px] font-black text-white flex items-center justify-center px-1 badge-pop">
                                          {unreadCount > 9 ? '9+' : unreadCount}
                                      </div>
                                  )}
                              </button>
                              {isMenuOpen && (
                                  <div className="absolute right-0 top-full mt-4 w-60 bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-white/5 rounded-2xl shadow-2xl p-2 z-[100] animate-in fade-in zoom-in-95 duration-200">
                                      <div className="p-4 border-b border-slate-100 dark:border-white/5 mb-2">
                                          <div className="flex items-center gap-3">
                                              {(user.photo_url || user.avatar) ? (
                                                  <img 
                                                      src={user.photo_url || user.avatar} 
                                                      alt={user.first_name || user.name}
                                                      className="w-10 h-10 rounded-full object-cover"
                                                  />
                                              ) : (
                                                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-black">
                                                      {user.first_name ? user.first_name[0] : (user.name ? user.name[0] : 'U')}
                                                  </div>
                                              )}
                                              <div className="flex flex-col min-w-0">
                                                  <span className="text-[13px] font-bold text-slate-900 dark:text-white truncate">
                                                      {user.first_name ? `${user.first_name} ${user.last_name || ''}` : user.name}
                                                  </span>
                                                  <span className="text-[10px] text-slate-500 truncate">@{user.username || user.id}</span>
                                              </div>
                                          </div>
                                      </div>

                                      <button onClick={() => { haptic('light'); navigate('/'); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all group">
                                          <Store size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                                          <span className="text-xs font-bold uppercase tracking-tight">{t('market')}</span>
                                      </button>

                                      <button onClick={() => { haptic('light'); navigate('/profile'); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all group">
                                          <User size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                                          <span className="text-xs font-bold uppercase tracking-tight">{t('profile')}</span>
                                      </button>

                                      <button onClick={() => { haptic('light'); navigate('/my-bots'); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all group">
                                          <BotIcon size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                                          <span className="text-xs font-bold uppercase tracking-tight">{t('my_bots')}</span>
                                      </button>

                                      <button onClick={() => { haptic('light'); navigate('/channels'); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all group">
                                          <Megaphone size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                                          <span className="text-xs font-bold uppercase tracking-tight">{t('my_channels')}</span>
                                      </button>

                                      <button onClick={() => { haptic('light'); navigate('/notifications'); setIsMenuOpen(false); }} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all group">
                                          <div className="flex items-center gap-3">
                                              <Bell size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                                              <span className="text-xs font-bold uppercase tracking-tight">{t('notifications')}</span>
                                          </div>
                                          {unreadCount > 0 && <div className="w-2 h-2 bg-red-500 rounded-full" />}
                                      </button>

                                      <button onClick={() => { haptic('light'); navigate('/qa'); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all group">
                                          <MessageSquare size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                                          <span className="text-xs font-bold uppercase tracking-tight">{t('qa_forum') || 'Soru Cevap Forumu'}</span>
                                      </button>

                                      <div className="h-px bg-slate-100 dark:border-white/5 my-2" />
                                      
                                      <button 
                                          onClick={() => { 
                                              const confirmed = window.confirm("Çıkış yapmak istediğinize emin misiniz?");
                                              if (confirmed) {
                                                  haptic('medium'); 
                                                  setWebAuthUser(null);
                                                  setIsMenuOpen(false); 
                                              }
                                          }} 
                                          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 transition-all font-bold text-xs uppercase"
                                      >
                                          <LogOut size={18} /> 
                                          <span className="text-xs font-bold uppercase tracking-tight">{t('home_logout')}</span>
                                      </button>
                                  </div>
                              )}
                          </div>
                      ) : (
                          <button 
                              onClick={() => { haptic('light'); setIsLoginModalOpen(true); }}
                              className="px-5 h-10 bg-blue-500 hover:bg-blue-600 text-white text-[13px] font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center whitespace-nowrap shadow-lg shadow-blue-500/25"
                          >
                              {t('login')}
                          </button>
                      )}
                  </div>
                  <LoginModal 
                      isOpen={isLoginModalOpen} 
                      onClose={() => setIsLoginModalOpen(false)} 
                      onAuth={(user) => setWebAuthUser(user)} 
                  />
                </div>
              </div>
          </div>
      </div>
        {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4"><Loader2 className="animate-spin text-blue-500" size={32} /></div>
        ) : (
            <>
              {announcements.length > 0 && (
                  <div className="min-h-[150px] pb-5 flex flex-col lg:flex-row justify-center items-center gap-6 pt-3 max-w-7xl mx-auto w-full overflow-hidden px-4 sm:px-8">
                      <div className="w-full sm:max-w-[480px] lg:w-[480px] shrink h-[118px]">
                          <AnnouncementsCarousel 
                              announcements={announcements} 
                              scroll={annScroll} 
                              onShowPopup={(a) => setSelectedAnn(a)} 
                          />
                      </div>
                      {/* PC & Tablet: Show banner next to announcement on larger screens */}
                      <AddProjectBanner className="hidden lg:flex lg:w-[480px] shrink-0 h-[118px]" />
                  </div>
              )}
            </>
          )}

      {!isLoading && (
        <NavMenu 
            isScrolled={isScrolled}
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
      )}

      {/* Bottom Section */}
      <div className="bg-slate-50/50 dark:bg-slate-950/80 w-full pt-12 pb-32 relative overflow-hidden border-t border-slate-200/20 dark:border-white/[0.02]">
          {/* Futuristic ambient background glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/[0.03] dark:bg-blue-500/[0.02] rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute top-10 right-[10%] w-[350px] h-[350px] bg-indigo-500/[0.04] dark:bg-indigo-500/[0.02] rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-20 left-[5%] w-[300px] h-[300px] bg-sky-500/[0.03] dark:bg-sky-500/[0.01] rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-5 sm:px-8 relative z-10">
              {!isLoading && (
                  <>
                    {/* Premium Split Hero Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center mb-16 sm:mb-28 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                        {/* Left Side: Editorial Typography & Search CTA */}
                        <div className="lg:col-span-7 text-left space-y-6 sm:space-y-8">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 dark:bg-blue-500/5 border border-blue-500/25 dark:border-blue-500/10 shadow-[0_4px_15px_rgba(59,130,246,0.06)]">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                                    ✦ TÜRKİYE'NİN EN ÖNCÜ TELEGRAM REHBERİ
                                </span>
                            </div>
                            
                            <div className="space-y-4">
                                <h1 className="text-4xl sm:text-5xl lg:text-6.5xl font-black tracking-[-0.04em] leading-[1.05] text-slate-900 dark:text-white-pure">
                                    {t('home_hero_title').includes(':') ? (
                                        <>
                                            {t('home_hero_title').split(':')[0]}: <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-sky-500 bg-clip-text text-transparent">{t('home_hero_title').split(':')[1]?.trim()}</span>
                                        </>
                                    ) : t('home_hero_title')}
                                </h1>
                                <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-xl">
                                    {t('home_hero_desc')}
                                </p>
                            </div>

                            {/* Active Premium Search Bar inside Hero */}
                            <div 
                                onClick={() => navigate('/search')} 
                                className="max-w-md relative group cursor-pointer bg-white/80 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900/80 border border-slate-200/40 dark:border-white/[0.04] p-3 rounded-2xl flex items-center gap-3 transition-all duration-300 shadow-[0_4px_25px_rgba(0,0,0,0.015)] hover:shadow-[0_15px_45px_rgba(59,130,246,0.09)] hover:border-blue-500/25"
                            >
                                <div className="p-2.5 ml-1 rounded-xl bg-blue-500 text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-all">
                                    <Search size={16} />
                                </div>
                                <span className="text-xs sm:text-sm font-semibold text-slate-400 dark:text-slate-500 flex-1">
                                    Keşfetmek istediğiniz Telegram botunu yazın...
                                </span>
                                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.04] text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-wider">
                                    ARA <ChevronRight size={10} className="translate-y-[0.5px] group-hover:translate-x-0.5 transition-transform" />
                                </div>
                            </div>

                            {/* Key Stats Badges */}
                            <div className="pt-4 grid grid-cols-3 gap-6 max-w-lg border-t border-slate-200/50 dark:border-white/[0.04]">
                                <div>
                                    <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">140+</div>
                                    <div className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-slate-400 mt-1">Aktif Proje</div>
                                </div>
                                <div>
                                    <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">85+</div>
                                    <div className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-slate-400 mt-1">Doğrulanmış Dev</div>
                                </div>
                                <div>
                                    <div className="text-xl sm:text-2xl font-black text-blue-500 dark:text-blue-400 tracking-tight leading-tight">TON</div>
                                    <div className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-slate-400 mt-1">Ecosystem Hazır</div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Bento Spotlight Dashboard Panel */}
                        <div className="lg:col-span-5 h-full flex items-center justify-center">
                            <div className="relative w-full max-w-sm bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 p-6 rounded-3xl border border-slate-200/50 dark:border-white/[0.06] shadow-xl overflow-hidden backdrop-blur-xl group hover:shadow-[0_20px_50px_rgba(59,130,246,0.06)] hover:border-blue-500/15 transition-all duration-300">
                                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-44 h-44 bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/20 transition-all"></div>
                                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

                                {/* Header Row */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2">
                                        <Award size={14} className="text-amber-500 fill-amber-500/20" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                            Öne Çıkan Spotlight
                                        </span>
                                    </div>
                                    <span className="text-[8px] font-black uppercase tracking-widest px-2.5 py-1 bg-blue-500/10 dark:bg-blue-500/5 text-blue-600 dark:text-blue-400 border border-blue-500/20 dark:border-blue-500/10 rounded-md">
                                        HAFTANIN EN İYİSİ
                                    </span>
                                </div>

                                {/* Body Row: Curated Showcase of an elegant Telegram Bot mockup */}
                                <div className="space-y-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-[1px] shadow-md shrink-0">
                                            <div className="w-full h-full rounded-[15px] bg-slate-900 flex items-center justify-center">
                                                <Sparkles size={22} className="text-white-pure animate-pulse" />
                                            </div>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="font-black text-base text-slate-900 dark:text-white tracking-tight uppercase leading-tight mb-1">
                                                Botly Premium AI
                                            </h4>
                                            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate leading-none font-medium">
                                                Entegre Yapay Zeka & Sinyal Robotu
                                            </p>
                                        </div>
                                    </div>

                                    {/* Embedded Interactive Performance Stats */}
                                    <div className="bg-slate-100/50 dark:bg-white/[0.01] border border-slate-200/50 dark:border-white/[0.02] p-4.5 rounded-2xl space-y-3.5 shadow-xs">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">Kullanıcı Oyu:</span>
                                            <div className="flex items-center gap-1 bg-white dark:bg-white/5 px-2 py-0.5 rounded-lg border border-black/[0.03] dark:border-white/5">
                                                <Star size={10} className="text-amber-500 fill-amber-500" />
                                                <span className="text-[11px] font-black text-slate-800 dark:text-slate-200">4.9 / 5.0</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">Popülarite:</span>
                                            <span className="text-[11px] font-black text-blue-500 bg-blue-500/5 px-2 py-0.5 rounded-lg border border-blue-500/10">✦ %98 Çok Aktif</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">TON Ücreti:</span>
                                            <span className="text-[11px] font-black text-slate-800 dark:text-slate-200">Ücretsiz Deneme</span>
                                        </div>
                                        <div className="w-full bg-slate-200 dark:bg-white/5 h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-blue-500 h-full w-[94%] rounded-full shadow-xs" />
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => navigate('/search?q=AI')}
                                        className="w-full py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-black text-[10px] uppercase tracking-widest active:scale-98 transition-all hover:opacity-95 flex items-center justify-center gap-2 group shadow-lg shadow-black/[0.1] dark:shadow-white/[0.02]"
                                    >
                                        PROJEYİ İNCELE <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>


                    <AnimatePresence mode="wait">
                <motion.div 
                    key={activeFilter}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {/* Apps Section */}
                    {categorizedBots['apps'] && (() => {
                        const data = categorizedBots['apps'];
                        
                        const featuredBots = data.featured;
                        const sliderBots = data.slider;

                        const botChunks = [];
                        for (let i = 0; i < sliderBots.length; i += 3) {
                            botChunks.push(sliderBots.slice(i, i + 3));
                        }

                        return (
                            <div className="mt-14 mb-14 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div className="flex flex-col gap-5 overflow-hidden">
                                    <div className="flex flex-col gap-1.5 md:gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)] animate-pulse"></span>
                                            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">TMA UYGULAMA REHBERİ</span>
                                        </div>
                                        <div 
                                            className="flex flex-wrap items-baseline gap-2.5 cursor-pointer group shrink-0"
                                            onClick={() => navigate(`/search?mode=apps&category=all`)}
                                        >
                                            <h2 className="text-2xl sm:text-3xl lg:text-3.5xl font-black text-slate-900 dark:text-white tracking-[-0.035em] uppercase hover:text-blue-500 transition-colors flex items-center gap-2">
                                                TMA Uygulamaları
                                                <ChevronRight size={20} className="text-slate-300 dark:text-slate-700 group-hover:translate-x-1 transition-transform shrink-0" />
                                            </h2>
                                            <span className="text-xs font-black bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-0.5 rounded-full tracking-wider leading-none">
                                                {data.total} Proje
                                            </span>
                                        </div>
                                        <p className="hidden sm:block text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-xl">
                                            {t('home_apps_desc')}
                                        </p>
                                    </div>

                                    {/* Top 3 Featured Cards for this section */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-2 animate-in fade-in slide-in-from-bottom-3 duration-1000">
                                        {featuredBots.map((bot, idx) => (
                                            <div 
                                                key={bot.id} 
                                                onClick={() => { haptic('light'); navigate(`/bot/${bot.slug}`); }}
                                                className="flex items-center justify-between p-4.5 rounded-2xl border border-slate-200/40 dark:border-white/[0.04] bg-white/80 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900/80 shadow-[0_4px_25px_rgba(0,0,0,0.015)] hover:shadow-[0_12px_45px_rgba(59,130,246,0.08)] hover:border-blue-500/25 dark:hover:border-blue-500/15 transition-all duration-300 cursor-pointer group hover:-translate-y-1"
                                            >
                                                <div className="flex items-center gap-4 min-w-0">
                                                    <div className="relative shrink-0">
                                                        <div className="absolute -top-2 -left-2 w-5.5 h-5.5 rounded-full bg-slate-900 dark:bg-slate-800 text-white font-black text-[9px] flex items-center justify-center border border-slate-200/20 z-10 italic shadow-sm">
                                                            #{idx + 1}
                                                        </div>
                                                        <div className="w-12 h-12 rounded-2xl p-[1px] bg-slate-200/50 dark:bg-white/[0.04] group-hover:bg-blue-500/20 transition-all duration-300 overflow-hidden flex items-center justify-center">
                                                            <img 
                                                                src={getLiveBotIcon(bot)} 
                                                                className="w-full h-full object-cover rounded-[14px]" 
                                                                alt={bot.name}
                                                                onError={(e) => { (e.target as any).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(bot.name)}&background=334155&color=fff&bold=true`; }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <div className="flex items-center gap-1.5 mb-0.5">
                                                            <span className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight truncate leading-none">{bot.name}</span>
                                                            <CheckCircle2 size={13} className="text-blue-500 fill-blue-500/5 shrink-0" />
                                                        </div>
                                                        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium line-clamp-1 leading-none">{bot.description}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1.5 shrink-0 pl-2">
                                                    <Star size={11} className="text-amber-500 fill-amber-500 shrink-0" />
                                                    <span className="text-sm font-black text-slate-900 dark:text-white-pure italic">
                                                        {bot.rating || '0.0'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div 
                                        ref={catScroll.ref}
                                        onMouseDown={catScroll.onMouseDown}
                                        onMouseUp={catScroll.onMouseUp}
                                        onMouseMove={catScroll.onMouseMove}
                                        onMouseLeave={catScroll.onMouseLeave}
                                        onContextMenu={catScroll.onContextMenu}
                                        className="category-filter-container no-scrollbar relative z-0 mt-2"
                                    >
                                        <button 
                                            className={`category-filter-item cursor-pointer hover:text-blue-500 transition-all whitespace-nowrap outline-none focus-visible:ring-2 ring-blue-500/50 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider border ${selectedAppsCategory === 'all' ? 'text-blue-500 border-blue-500/30 bg-blue-500/10 dark:bg-blue-500/5 font-black' : 'text-slate-500 dark:text-slate-400 border-slate-200/50 dark:border-white/[0.04] bg-white/50 dark:bg-slate-900/20 hover:bg-slate-100 dark:hover:bg-white/5'}`}
                                            onClick={() => { haptic('light'); setSelectedAppsCategory('all'); }}
                                        >
                                            {t('home_all')}
                                        </button>
                                        {appsSubCategories.map((subCat) => (
                                            <button 
                                                key={subCat.id} 
                                                className={`category-filter-item cursor-pointer hover:text-blue-500 transition-all whitespace-nowrap outline-none focus-visible:ring-2 ring-blue-500/50 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider border ${selectedAppsCategory === subCat.id ? 'text-blue-500 border-blue-500/30 bg-blue-500/10 dark:bg-blue-500/5 font-black' : 'text-slate-500 dark:text-slate-400 border-slate-200/50 dark:border-white/[0.04] bg-white/50 dark:bg-slate-900/20 hover:bg-slate-100 dark:hover:bg-white/5'}`}
                                                onClick={() => { haptic('light'); setSelectedAppsCategory(subCat.id); }}
                                            >
                                                {t(subCat.label)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="relative -mx-4 px-4 overflow-hidden">
                                    <div className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-4">
                                        {botChunks.map((chunk, chunkIdx) => (
                                            <div key={chunkIdx} className="flex flex-col gap-3 min-w-[88vw] sm:min-w-[400px] snap-center first:pl-2">
                                                {chunk.map(bot => (
                                                    <div key={bot.id} className="w-full h-full">
                                                        <BotCard bot={bot} tonRate={tonRate} />
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <FeaturedBotsSlider bots={bots.filter(b => Array.isArray(b.category) ? b.category.includes('apps') : b.category === 'apps')} />
                                </div>
                            </div>
                        );
                    })()}

                    {/* Mobile Banner between sections */}
                    <div className="px-4 mb-10 sm:hidden">
                        <AddProjectBanner />
                    </div>

                    {/* Bots Section */}
                    {categorizedBots['bots'] && (() => {
                        const data = categorizedBots['bots'];
                        
                        const featuredBots = data.featured;
                        const sliderBots = data.slider;

                        const botChunks = [];
                        for (let i = 0; i < sliderBots.length; i += 3) {
                            botChunks.push(sliderBots.slice(i, i + 3));
                        }

                        return (
                            <div className="mt-20 mb-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div className="flex flex-col gap-5 overflow-hidden">
                                    <div className="flex flex-col gap-1.5 md:gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.6)] animate-pulse"></span>
                                            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">AYRIŞTIRILMIŞ YAPAY ZEKA VE SERVİSLER</span>
                                        </div>
                                        <div 
                                            className="flex flex-wrap items-baseline gap-2.5 cursor-pointer group shrink-0"
                                            onClick={() => navigate(`/search?mode=bots&category=all`)}
                                        >
                                            <h2 className="text-2xl sm:text-3xl lg:text-3.5xl font-black text-slate-900 dark:text-white-pure tracking-[-0.035em] uppercase hover:text-indigo-500 transition-colors flex items-center gap-2">
                                                TELEGRAM BOTLARI
                                                <ChevronRight size={20} className="text-slate-300 dark:text-slate-700 group-hover:translate-x-1 transition-transform shrink-0" />
                                            </h2>
                                            <span className="text-xs font-black bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-3 py-0.5 rounded-full tracking-wider leading-none">
                                                {data.total} Proje
                                            </span>
                                        </div>
                                        <p className="hidden sm:block text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-xl">
                                            {t('home_bots_desc')}
                                        </p>
                                    </div>

                                    {/* Top 3 Featured Cards for this section */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-2 animate-in fade-in slide-in-from-bottom-3 duration-1000">
                                        {featuredBots.map((bot, idx) => (
                                            <div 
                                                key={bot.id} 
                                                onClick={() => { haptic('light'); navigate(`/bot/${bot.slug}`); }}
                                                className="flex items-center justify-between p-4.5 rounded-2xl border border-slate-200/40 dark:border-white/[0.04] bg-white/80 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900/80 shadow-[0_4px_25px_rgba(0,0,0,0.015)] hover:shadow-[0_12px_45px_rgba(99,102,241,0.08)] hover:border-indigo-500/25 dark:hover:border-indigo-500/15 transition-all duration-300 cursor-pointer group hover:-translate-y-1"
                                            >
                                                <div className="flex items-center gap-4 min-w-0">
                                                    <div className="relative shrink-0">
                                                        <div className="absolute -top-2 -left-2 w-5.5 h-5.5 rounded-full bg-slate-900 dark:bg-slate-800 text-white font-black text-[9px] flex items-center justify-center border border-slate-200/20 z-10 italic shadow-sm">
                                                            #{idx + 1}
                                                        </div>
                                                        <div className="w-12 h-12 rounded-2xl p-[1px] bg-slate-200/50 dark:bg-white/[0.04] group-hover:bg-indigo-500/20 transition-all duration-300 overflow-hidden flex items-center justify-center">
                                                            <img 
                                                                src={getLiveBotIcon(bot)} 
                                                                className="w-full h-full object-cover rounded-[14px]" 
                                                                alt={bot.name}
                                                                onError={(e) => { (e.target as any).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(bot.name)}&background=334155&color=fff&bold=true`; }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <div className="flex items-center gap-1.5 mb-0.5">
                                                            <span className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight truncate leading-none">{bot.name}</span>
                                                            <CheckCircle2 size={13} className="text-blue-500 fill-blue-500/5 shrink-0" />
                                                        </div>
                                                        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium line-clamp-1 leading-none">{bot.description}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1.5 shrink-0 pl-2">
                                                    <Star size={11} className="text-amber-500 fill-amber-500 shrink-0" />
                                                    <span className="text-sm font-black text-slate-900 dark:text-white-pure italic">
                                                        {bot.rating || '0.0'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div 
                                        ref={botsCatScroll.ref}
                                        onMouseDown={botsCatScroll.onMouseDown}
                                        onMouseUp={botsCatScroll.onMouseUp}
                                        onMouseMove={botsCatScroll.onMouseMove}
                                        onMouseLeave={botsCatScroll.onMouseLeave}
                                        onContextMenu={botsCatScroll.onContextMenu}
                                        className="category-filter-container no-scrollbar relative z-0 mt-2"
                                    >
                                        <button 
                                            className={`category-filter-item cursor-pointer hover:text-indigo-500 transition-all whitespace-nowrap outline-none focus-visible:ring-2 ring-indigo-500/50 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider border ${selectedBotsCategory === 'all' ? 'text-indigo-500 border-indigo-500/30 bg-indigo-500/10 dark:bg-indigo-500/5 font-black' : 'text-slate-500 dark:text-slate-400 border-slate-200/50 dark:border-white/[0.04] bg-white/50 dark:bg-slate-900/20 hover:bg-slate-100 dark:hover:bg-white/5'}`}
                                            onClick={() => { haptic('light'); setSelectedBotsCategory('all'); }}
                                        >
                                            {t('home_all')}
                                        </button>
                                        {botsCategories.map((cat) => (
                                            <button 
                                                key={cat.id} 
                                                className={`category-filter-item cursor-pointer hover:text-indigo-500 transition-all whitespace-nowrap outline-none focus-visible:ring-2 ring-indigo-500/50 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-wider border ${selectedBotsCategory === cat.id ? 'text-indigo-500 border-indigo-500/30 bg-indigo-500/10 dark:bg-indigo-500/5 font-black' : 'text-slate-500 dark:text-slate-400 border-slate-200/50 dark:border-white/[0.04] bg-white/50 dark:bg-slate-900/20 hover:bg-slate-100 dark:hover:bg-white/5'}`}
                                                onClick={() => { haptic('light'); setSelectedBotsCategory(cat.id); }}
                                            >
                                                {t(cat.label)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="relative -mx-4 px-4 overflow-hidden">
                                    <div className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-4">
                                        {botChunks.map((chunk, chunkIdx) => (
                                            <div key={chunkIdx} className="flex flex-col gap-3 min-w-[88vw] sm:min-w-[400px] snap-center first:pl-2">
                                                {chunk.map(bot => (
                                                    <div key={bot.id} className="w-full h-full">
                                                        <BotCard bot={bot} tonRate={tonRate} />
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <FeaturedBotsSlider bots={bots.filter(b => Array.isArray(b.category) ? !b.category.includes('apps') : b.category !== 'apps')} />
                                </div>
                            </div>
                        );
                    })()}

                    {Object.keys(categorizedBots).length === 0 && (
                        <div className="py-24 text-center text-slate-400 dark:text-slate-700 font-bold uppercase text-xs tracking-widest animate-in fade-in zoom-in duration-500">
                             {t('home_no_items')}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {homeBlogs.length > 0 && (
                <div className="mt-24 mb-16 pt-16 border-t border-black/[0.03] dark:border-white/[0.03]">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-[2px] bg-blue-500"></div>
                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic">
                                {t('blog_title')}
                            </h2>
                        </div>
                        <button 
                            onClick={() => { haptic('light'); navigate('/blog'); }}
                            className="text-[11px] font-bold text-slate-400 hover:text-blue-500 uppercase tracking-widest transition-colors flex items-center gap-1.5"
                        >
                            {t('blog_all_articles')}
                            <ChevronRight size={14} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                        {homeBlogs.map((post) => (
                            <div 
                                key={post.id}
                                onClick={() => { haptic('light'); navigate(`/blog/${post.slug || post.id}`); }}
                                className="group cursor-pointer flex flex-col bg-slate-50 dark:bg-slate-900/10 border border-black/5 dark:border-white/5 rounded-3xl overflow-hidden hover:border-blue-500/20 hover:scale-[1.01] transition-all duration-300"
                            >
                                <div className="aspect-video relative overflow-hidden bg-slate-100 dark:bg-white/5">
                                    {post.image ? (
                                        <img 
                                            src={post.image} 
                                            alt={post.title} 
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                            referrerPolicy="no-referrer"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600/10 to-indigo-600/10 text-blue-500">
                                            <Sparkles size={24} />
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-white/90 dark:bg-slate-950/90 backdrop-blur-md text-slate-900 dark:text-white text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-black/5 dark:border-white/5">
                                            {post.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-5 flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight line-clamp-2 mb-2 group-hover:text-blue-500 transition-colors duration-300">
                                            {post.title}
                                        </h3>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic line-clamp-2 mb-4">
                                            {post.excerpt || post.content.replace(/<[^>]*>/g, '').slice(0, 100) + '...'}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t border-black/[0.03] dark:border-white/[0.03]">
                                        <div className="flex items-center gap-2 max-w-[70%]">
                                            <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/10 shrink-0">
                                                <img 
                                                    src={post.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author)}&background=334155&color=fff&bold=true`} 
                                                    alt="" 
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 truncate">
                                                {post.author}
                                            </span>
                                        </div>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight shrink-0">
                                            {post.readTime || '5 dk'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-20 mb-20 px-4 max-w-4xl mx-auto border-t border-black/[0.03] dark:border-white/[0.03] pt-20">
                <div className="prose prose-slate dark:prose-invert max-w-none">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic mb-6">
                        {t('home_about_title').includes(':') ? (
                            <>
                                {t('home_about_title').split(':')[0]}: <span className="text-blue-500">{t('home_about_title').split(':')[1]?.trim()}</span>
                            </>
                        ) : t('home_about_title')}
                    </h2>
                    <div className="text-[13px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic space-y-4">
                        <p>{t('home_about_p1')}</p>
                        <p>{t('home_about_p2')}</p>
                        <p>{t('home_about_p3')}</p>
                        <p>{t('home_about_p4')}</p>
                    </div>
                </div>
            </div>

            <div className="mt-20 mb-20 px-4 max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-[2px] bg-blue-500"></div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic">
                        {t('home_faq_title')}
                    </h2>
                </div>
                
                <div className="space-y-4">
                    {[
                        {
                            q: t('home_faq_1_q'),
                            a: t('home_faq_1_a')
                        },
                        {
                            q: t('home_faq_2_q'),
                            a: t('home_faq_2_a')
                        },
                        {
                            q: t('home_faq_3_q'),
                            a: t('home_faq_3_a')
                        },
                        {
                            q: t('home_faq_4_q'),
                            a: t('home_faq_4_a')
                        }
                    ].map((item, idx) => (
                        <details key={idx} className="group bg-white dark:bg-slate-900/40 border border-black/5 dark:border-white/5 rounded-xl transition-all overflow-hidden shadow-sm">
                            <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                                <span className="text-[13px] font-bold text-slate-900 dark:text-white uppercase tracking-tight italic">{item.q}</span>
                                <ChevronDown size={18} className="text-slate-400 group-open:rotate-180 transition-transform duration-300" />
                            </summary>
                            <div className="p-5 pt-0 text-[12px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic border-t border-black/[0.03] dark:border-white/[0.03] bg-[#00000004] dark:bg-black/20">
                                {item.a}
                            </div>
                        </details>
                    ))}
                </div>
                
                {/* FAQ Schema */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        "mainEntity": [
                            {
                                "@type": "Question",
                                "name": "BotlyHub nedir?",
                                "acceptedAnswer": {
                                    "@type": "AcceptedAnswer",
                                    "text": "BotlyHub, Telegram ekosistemindeki en iyi botları, kanalları ve uygulamaları keşfetmenizi sağlayan merkezi bir platformdur."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "Kendi botumu nasıl ekleyebilirim?",
                                "acceptedAnswer": {
                                    "@type": "AcceptedAnswer",
                                    "text": "Sağ üstteki 'Bot Ekle' butonuna basarak veya admin paneli üzerinden projenizi sisteme kaydedebilirsiniz."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "Premium üyelik avantajları nelerdir?",
                                "acceptedAnswer": {
                                    "@type": "AcceptedAnswer",
                                    "text": "Düşük komisyonlar, öne çıkan listeleme ve detaylı analizler sunar."
                                }
                            }
                        ]
                    })}
                </script>
            </div>

            <div className="mt-16">
                <div className="pb-32" />
            </div>
          </>
        )}
        </div>
      </div>

      <AnimatePresence>
        {selectedAnn && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl" onClick={() => setSelectedAnn(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 w-[min(calc(100vw-32px),384px)] rounded-xl overflow-hidden relative" 
              onClick={e => e.stopPropagation()}
            >
                <div className="relative h-44 overflow-hidden">
                    {selectedAnn.bg_image_url ? (
                        <>
                            <img src={selectedAnn.bg_image_url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 via-transparent to-transparent"></div>
                        </>
                    ) : (
                        <div className={`absolute inset-0 bg-gradient-to-br ${
                            selectedAnn.color_scheme === 'purple' ? 'from-purple-600 to-indigo-700' :
                            selectedAnn.color_scheme === 'emerald' ? 'from-emerald-600 to-teal-700' :
                            selectedAnn.color_scheme === 'blue' ? 'from-blue-600 to-cyan-700' :
                            'from-orange-500 to-red-600'
                        } opacity-90`}>
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 to-transparent"></div>
                        </div>
                    )}
                    
                    <button 
                        onClick={() => setSelectedAnn(null)} 
                        className="absolute top-6 right-6 flex items-center justify-center p-2 text-white/80 hover:text-white transition-all active:scale-90 drop-shadow-lg"
                    >
                        <X size={20} />
                    </button>

                    <div className="absolute bottom-6 left-8 flex items-center gap-2">
                        {selectedAnn.badge_text && (
                            selectedAnn.badge_text.toLowerCase() === 'sponsorlu' ? (
                                <div className="sponsored-badge flex items-center px-3 py-1 rounded-full shadow-lg">
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{selectedAnn.badge_text}</span>
                                </div>
                            ) : (
                                <div className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl">
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{selectedAnn.badge_text}</span>
                                </div>
                            )
                        )}
                        {selectedAnn.tag && (
                            <div className="px-3 py-1 bg-brand border border-white/20 rounded-xl">
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">{selectedAnn.tag}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-8 pt-2">
                    <div className="flex items-center gap-4 mb-4">
                        {selectedAnn.icon_name !== 'None' && (
                            <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl flex items-center justify-center shrink-0">
                                {React.createElement(iconMap[selectedAnn.icon_name] || Sparkles, { size: 22, className: 'text-brand dark:text-brand-light' })}
                            </div>
                        )}
                        <h3 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase leading-none truncate pr-2">
                            {selectedAnn.title}
                        </h3>
                    </div>

                    <div className="bg-slate-50 dark:bg-black/20 rounded-xl p-6 mb-8 border border-black/5 dark:border-white/5">
                        <p className="text-slate-600 dark:text-slate-400 text-[12px] leading-relaxed font-bold uppercase italic opacity-80 whitespace-pre-wrap">
                            {selectedAnn.content_detail || selectedAnn.description}
                        </p>
                    </div>
                    
                    <div className="space-y-3">
                        <button 
                            onClick={() => { 
                                haptic('heavy'); 
                                const link = selectedAnn.button_link;
                                if (link.startsWith('@')) window.location.href = `https://t.me/${link.substring(1)}`;
                                else if (link.startsWith('http')) window.location.href = link;
                                else navigate(link);
                                setSelectedAnn(null); 
                            }} 
                            className="w-full h-14 bg-brand dark:bg-brand-light text-white text-[12px] font-black rounded-xl uppercase tracking-[0.2em] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group shadow-lg shadow-brand/20"
                        >
                            {selectedAnn.button_text || t('home_explore_now')} 
                            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        
                        <button 
                            onClick={() => setSelectedAnn(null)} 
                            className="w-full py-4 text-slate-400 dark:text-slate-500 font-black text-[9px] uppercase tracking-[0.2em] hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        >
                            {t('home_maybe_later')}
                        </button>
                    </div>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AnnouncementsCarousel: React.FC<{ 
    announcements: Announcement[], 
    scroll: any, 
    onShowPopup: (ann: Announcement) => void 
}> = React.memo(({ announcements, scroll, onShowPopup }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleScroll = useCallback(() => {
        if (scroll.ref.current) {
            const width = scroll.ref.current.offsetWidth;
            const index = Math.round(scroll.ref.current.scrollLeft / width);
            if (index !== currentIndex) {
                setCurrentIndex(index);
            }
        }
    }, [currentIndex, scroll.ref]);

    useEffect(() => {
        const el = scroll.ref.current;
        if (el) {
            el.addEventListener('scroll', handleScroll);
            return () => el.removeEventListener('scroll', handleScroll);
        }
    }, [handleScroll, scroll.ref]);

    useEffect(() => {
        if (announcements.length <= 1) return;

        const interval = setInterval(() => {
            if (scroll.ref.current && !scroll.isDragging) {
                const nextIndex = (currentIndex + 1) % announcements.length;
                const width = scroll.ref.current.offsetWidth;
                scroll.ref.current.scrollTo({
                    left: nextIndex * width,
                    behavior: 'smooth'
                });
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [currentIndex, announcements.length, scroll.isDragging, scroll.ref]);

    return (
        <div className="relative h-full">
            <div 
                ref={scroll.ref}
                onMouseDown={scroll.onMouseDown}
                onMouseUp={scroll.onMouseUp}
                onMouseMove={scroll.onMouseMove}
                onMouseLeave={scroll.onMouseLeave}
                onContextMenu={scroll.onContextMenu}
                className={`flex overflow-x-auto no-scrollbar h-full snap-x snap-mandatory ${scroll.isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            >
                {announcements.map(ann => (
                    <div key={ann.id} className="w-full shrink-0 snap-center px-4 sm:px-0">
                        <PromoCard ann={ann} onShowPopup={onShowPopup} />
                    </div>
                ))}
            </div>
            
            {announcements.length > 1 && (
                <div className="absolute bottom-5 left-[58px] sm:left-[62px] -translate-x-1/2 flex items-center gap-1 z-10 pointer-events-none">
                    {announcements.map((_, i) => (
                        <button 
                            key={i} 
                            onClick={(e) => {
                                e.stopPropagation();
                                if (scroll.ref.current) {
                                    const width = scroll.ref.current.offsetWidth;
                                    scroll.ref.current.scrollTo({
                                        left: i * width,
                                        behavior: 'smooth'
                                    });
                                }
                            }}
                            className={`h-1 rounded-full transition-all duration-300 shadow-lg cursor-pointer outline-hidden pointer-events-auto ${i === currentIndex ? 'w-4 bg-white' : 'w-1 bg-white/50 hover:bg-white/80'}`} 
                        />
                    ))}
                </div>
            )}
        </div>
    );
});

export default Home;

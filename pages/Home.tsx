
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, LayoutGrid, DollarSign, Loader2, Store, User, Bot as BotIcon, Megaphone, X, Info, Sparkles, Zap, Gift, Star, Heart, Bell, Shield, ShieldCheck, TrendingUp, Radio, Send, Instagram, Youtube, Link, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Announcement, Notification } from '../types';
import { categories } from '../data';
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

const getLangLabel = (lang: string) => {
    const mapping: Record<string, string> = {
        '🇹🇷': 'TR',
        '🇬🇧': 'EN',
        '🇺🇸': 'EN',
        '🇷🇺': 'RU',
        '🇮🇷': 'FA',
        '🇺🇦': 'UA',
        '🇪🇸': 'ES',
        '🇮🇳': 'HI',
        '🇸🇦': 'AR',
        '🇫🇷': 'FR',
        '🇩🇪': 'DE'
    };
    return mapping[lang] || lang;
};

const PromoCard: React.FC<{ ann: Announcement, onShowPopup: (ann: Announcement) => void }> = React.memo(({ ann, onShowPopup }) => {
  const navigate = useNavigate();
  const colors: Record<string, string> = {
    purple: 'from-purple-600/20 to-indigo-600/20 border-purple-500/30',
    emerald: 'from-emerald-600/20 to-teal-600/20 border-emerald-500/30',
    blue: 'from-blue-600/20 to-cyan-600/20 border-blue-500/30',
    orange: 'from-orange-500/20 to-red-600/20 border-orange-500/30'
  };

  const handleAction = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
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

  const scheme = colors[ann.color_scheme] || colors.purple;

  return (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-[340px] h-32 rounded-[32px] relative overflow-hidden shrink-0 cursor-pointer group snap-center border bg-white dark:bg-slate-900 border-black/5 dark:border-white/5 flex items-stretch"
        onClick={handleAction}
    >
        {/* Left Side: Visual */}
        <div className="w-28 h-full shrink-0 relative overflow-hidden border-r border-black/5 dark:border-white/5 bg-slate-100 dark:bg-slate-800">
            {ann.bg_image_url ? (
                <>
                    <img src={ann.bg_image_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                </>
            ) : (
                <div className={`absolute inset-0 bg-gradient-to-br ${scheme.split(' ').slice(0, 2).join(' ')} opacity-60`}></div>
            )}
            
            {ann.icon_name !== 'None' && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 transition-transform">
                        {React.createElement(iconMap[ann.icon_name] || Megaphone, { size: 22 })}
                    </div>
                </div>
            )}
        </div>

        {/* Right Side: Content */}
        <div className="flex-1 p-4 flex flex-col justify-center min-w-0">
            <div className="flex items-center gap-1.5 mb-2">
                {ann.badge_text && ann.badge_text.toLowerCase() !== 'sponsorlu' && (
                    <div className="px-2 py-0.5 rounded-full bg-blue-500/10 dark:bg-blue-400/10 border border-blue-500/20 dark:border-blue-400/20 flex items-center gap-1 scale-[0.8] origin-left">
                        <Sparkles size={8} className="text-blue-500" />
                        <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest leading-none">{ann.badge_text}</span>
                    </div>
                )}
                {ann.tag && (
                    <div className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/10 scale-[0.8] origin-left">
                        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none">{ann.tag}</span>
                    </div>
                )}
            </div>

            <h3 className="text-slate-900 dark:text-white font-extrabold text-sm mb-1 tracking-tight leading-tight line-clamp-1 truncate pr-2">
                {ann.title}
            </h3>
            
            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-tight line-clamp-2 font-medium opacity-80">
                {ann.description}
            </p>
        </div>

        {/* Absolute Sponsored Badge */}
        {ann.badge_text && ann.badge_text.toLowerCase() === 'sponsorlu' && (
            <div className="absolute top-2 right-2 z-20 origin-right scale-[0.7]">
                <div className="sponsored-badge flex items-center px-3 py-1 rounded-full shadow-lg">
                    <span>{ann.badge_text}</span>
                </div>
            </div>
        )}

        {/* Gloss effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
    </motion.div>
  );
});

const FeaturedBotsSlider: React.FC<{ bots: Bot[] }> = React.memo(({ bots }) => {
    const navigate = useNavigate();
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
        { id: 'latest', label: 'en son eklenenler' },
        { id: 'official', label: 'orjinal' },
        { id: 'featured', label: 'market özel' }
    ];

    const cycleType = () => {
        const currentIndex = types.findIndex(t => t.id === activeType);
        const nextIndex = (currentIndex + 1) % types.length;
        setActiveType(types[nextIndex].id as any);
    };

    if (bots.length === 0) return null;

    return (
        <div className="mb-10 flex flex-col md:flex-row items-center !gap-[0.3rem] bg-[#ffffff] dark:bg-[#1e293b] px-4 md:px-[10px] !pt-[0.3rem] !pb-0 -mx-4 md:mx-0 rounded-none md:rounded-lg border-y md:border border-black/5 dark:border-white/5 relative overflow-hidden group !shadow-none">
            {/* Header Info */}
            <div className="flex flex-col shrink-0 min-w-full md:min-w-[180px] md:border-r border-black/5 dark:border-white/5 md:pr-6 h-full justify-center">
                <div 
                    className="flex items-center gap-1.5 mb-0.5 cursor-pointer md:cursor-default"
                    onClick={() => { if (window.innerWidth < 768) cycleType(); }}
                >
                    <h2 className="text-[17px] font-black text-slate-900 dark:text-white lowercase tracking-tight leading-none">
                        {types.find(t => t.id === activeType)?.label}
                    </h2>
                    <div className="text-slate-400">
                        <Info size={16} />
                    </div>
                </div>
                <div className="hidden md:flex flex-col">
                    {types.map(t => t.id !== activeType && (
                        <button 
                            key={t.id}
                            onClick={() => setActiveType(t.id as any)}
                            className="text-[14px] font-medium text-blue-500 lowercase hover:underline text-left transition-all"
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Slider Content */}
            <div className="relative flex-1 w-full overflow-hidden">
                {/* Left Blur & Button */}
                <AnimatePresence>
                    {scrollState.left && (
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#ffffff] dark:from-[#1e293b] via-[#ffffff]/80 dark:via-[#1e293b]/80 to-transparent z-40 pointer-events-none flex items-center pl-2"
                        >
                            <button 
                                onClick={(e) => { e.stopPropagation(); scroll.ref.current?.scrollBy({ left: -300, behavior: 'smooth' }); }}
                                className="hidden md:flex w-8 h-8 bg-white dark:bg-slate-800 border border-black/5 dark:border-white/10 rounded-full items-center justify-center text-slate-400 hover:text-brand transition-all shadow-lg pointer-events-auto active:scale-95"
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
                            className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#ffffff] dark:from-[#1e293b] via-[#ffffff]/80 dark:via-[#1e293b]/80 to-transparent z-40 pointer-events-none flex items-center justify-end pr-2"
                        >
                            <button 
                                onClick={(e) => { e.stopPropagation(); scroll.ref.current?.scrollBy({ left: 300, behavior: 'smooth' }); }}
                                className="hidden md:flex w-8 h-8 bg-white dark:bg-slate-800 border border-black/5 dark:border-white/10 rounded-full items-center justify-center text-slate-400 hover:text-brand transition-all shadow-lg pointer-events-auto active:scale-95"
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
                    className={`flex items-start gap-10 overflow-x-auto no-scrollbar py-2 transform-gpu will-change-transform ${scroll.isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                >
                    {featuredBots.map((bot) => (
                        <motion.div
                            key={bot.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={() => navigate(`/bot/${bot.id}`)}
                            className="flex flex-col items-center gap-2 shrink-0 cursor-pointer group/item w-20"
                        >
                                <div className="relative">
                                    <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full opacity-0 group-hover/item:opacity-100 transition-opacity"></div>
                                    <div className="w-[58px] h-[58px] rounded-full p-[2px] bg-gradient-to-tr from-black/5 to-black/10 dark:from-white/5 dark:to-white/10 group-hover/item:from-blue-500/50 group-hover/item:to-brand/50 transition-all">
                                        <img 
                                            src={getLiveBotIcon(bot)} 
                                            className="w-full h-full rounded-full border border-black/5 dark:border-white/10 shadow-lg object-cover bg-white dark:bg-slate-800"
                                            onError={(e) => { (e.target as any).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(bot.name)}&background=334155&color=fff&bold=true`; }}
                                            referrerPolicy="no-referrer"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col items-center text-center">
                                    <span className="text-[12px] font-bold text-slate-800 dark:text-slate-200 tracking-tight leading-tight whitespace-nowrap overflow-hidden text-ellipsis w-full group-hover/item:text-blue-500 transition-colors">
                                        {bot.name.length > 9 ? bot.name.substring(0, 9) + '...' : bot.name}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                </div>
            </div>
        </div>
    );
});

const BotCard: React.FC<{ bot: Bot, tonRate: number, isVertical?: boolean }> = React.memo(({ bot, tonRate, isVertical = false }) => {
  const navigate = useNavigate();
  const prices = useMemo(() => PriceService.convert(bot.price, tonRate), [bot.price, tonRate]);
  
  if (isVertical) {
    return (
        <div 
            onClick={() => navigate(`/bot/${bot.id}`)} 
            className="flex flex-col p-4 bg-white dark:bg-slate-900/40 border border-black/5 dark:border-white/5 rounded-[24px] hover:border-brand/30 transition-all group cursor-pointer active:scale-[0.98] h-full"
        >
            <div className="relative mb-4">
                <img 
                    src={getLiveBotIcon(bot)} 
                    alt={bot.name} 
                    className="w-full aspect-square rounded-[20px] object-cover bg-slate-100 dark:bg-slate-800 border border-black/5 dark:border-white/5 group-hover:scale-[1.02] transition-transform"
                    onError={(e) => { (e.target as any).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(bot.name)}&background=334155&color=fff&bold=true`; }}
                />
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="font-black text-xs text-slate-900 dark:text-white truncate uppercase tracking-tight mb-1 flex items-center gap-1">
                    {bot.name}
                    {bot.is_official && <ShieldCheck size={10} className="text-brand shrink-0" />}
                </h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest line-clamp-1 mb-3 opacity-60">
                    {bot.description}
                </p>
                <div className="flex items-center justify-between mt-auto">
                    <span className={`text-[9px] font-black uppercase tracking-tighter ${bot.price === 0 ? 'text-emerald-500' : 'text-brand'}`}>
                        {bot.price === 0 ? 'Ücretsiz' : `${prices.ton} TON`}
                    </span>
                    <div className="flex items-center gap-1 opacity-60">
                        <Star size={10} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-[9px] font-black text-slate-600 dark:text-slate-400">{bot.rating || '0.0'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div onClick={() => navigate(`/bot/${bot.id}`)} className="flex items-center p-6 bot-card cursor-pointer group bg-white dark:bg-transparent hover:bg-slate-100 dark:hover:bg-slate-900/60 rounded-[32px] transition-all border border-black/5 dark:border-transparent hover:border-slate-200 dark:hover:border-slate-800/50 active:bg-slate-200 dark:active:bg-slate-900 transform-gpu">
        <div className="relative shrink-0">
            <img 
                src={getLiveBotIcon(bot)} 
                alt={bot.name} 
                loading="lazy"
                className="w-20 h-20 rounded-[28px] object-cover bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 group-hover:scale-105 transition-transform" 
                onError={(e) => { (e.target as any).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(bot.name)}&background=334155&color=fff&bold=true`; }}
            />
            {/* Removed Zap icon badge for paid bots */}
        </div>
        <div className="flex-1 ml-5 min-w-0 mr-3">
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100 truncate tracking-tight uppercase leading-none mb-1.5 flex items-center gap-1.5">
                {bot.name}
                {bot.is_official && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-[11px] h-[11px] text-[#139fec] shrink-0">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                )}
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider truncate mb-2">{bot.description}</p>
            <div className="flex items-center gap-3">
                {bot.price === 0 ? (
                    <span className="text-[8px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">Ücretsiz</span>
                ) : (
                    <div className="flex items-center gap-2 px-2 py-1 bg-blue-500/10 rounded-md border border-blue-500/20">
                        <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-tighter">{prices.ton} TON</span>
                    </div>
                )}
                <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/10 rounded-md border border-yellow-500/20">
                    <Star size={10} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-[9px] font-black text-yellow-600 dark:text-yellow-400 uppercase tracking-tighter">{bot.rating || '0.0'}</span>
                </div>
                {bot.languages && bot.languages.length > 0 && (
                    <div className="flex items-center gap-1.5">
                        {bot.languages.map((lang, idx) => (
                            <span 
                                key={idx} 
                                className={`
                                    text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter opacity-80
                                    ${idx === 3 ? '!hidden !md:inline-block' : ''}
                                    ${idx >= 4 ? '!hidden !lg:inline-block' : ''}
                                `}
                            >
                                <span className="md:hidden">{getLangLabel(lang)}</span>
                                <span className="hidden md:inline">{lang}</span>
                            </span>
                        ))}
                        {/* Plus SVG indicators for mobile/tablet truncation */}
                        {bot.languages.length > 3 && (
                            <span className="!inline-flex !md:hidden text-slate-400 dark:text-slate-500 opacity-80 items-center">
                                <svg width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            </span>
                        )}
                        {bot.languages.length > 4 && (
                            <span className="!hidden !md:inline-flex !lg:hidden text-slate-400 dark:text-slate-500 opacity-80 items-center">
                                <svg width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
        <div className="bg-slate-100 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700/50 text-slate-400 group-hover:text-white group-hover:bg-blue-600 group-hover:border-blue-500 transition-all">
            <ChevronRight size={18} />
        </div>
    </div>
  );
});

const CategorySection: React.FC<{ category: any, bots: Bot[], tonRate: number }> = React.memo(({ category, bots, tonRate }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { haptic } = useTelegram();
    const scroll = useDraggableScroll();

    const categoryBots = useMemo(() => {
        return bots
            .filter(bot => (Array.isArray(bot.category) ? bot.category : [bot.category]).includes(category.id))
            .sort((a, b) => (b.views || 0) - (a.views || 0))
            .slice(0, 9);
    }, [bots, category.id]);

    if (categoryBots.length === 0) return null;

    return (
        <section className="mb-12 last:mb-0">
            <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand/10 rounded-2xl flex items-center justify-center text-brand shadow-sm">
                        <category.icon size={20} />
                    </div>
                    <div>
                        <h2 className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.4em] mb-0.5">PLATFORM</h2>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">{t(category.label)}</h3>
                    </div>
                </div>
                <button 
                    onClick={() => { haptic('light'); navigate(`/search?category=${category.id}`); }}
                    className="flex items-center gap-2 group"
                >
                    <span className="text-[10px] font-black text-brand uppercase tracking-widest group-hover:tracking-[0.15em] transition-all">TÜMÜ <span className="opacity-40">{categoryBots.length <= 9 ? '' : `(${categoryBots.length})`}</span></span>
                    <ChevronRight size={14} className="text-brand group-hover:translate-x-0.5 transition-transform" />
                </button>
            </div>

            <div 
                ref={scroll.ref}
                onMouseDown={scroll.onMouseDown}
                onMouseUp={scroll.onMouseUp}
                onMouseMove={scroll.onMouseMove}
                onMouseLeave={scroll.onMouseLeave}
                onContextMenu={scroll.onContextMenu}
                className={`flex gap-4 overflow-x-auto no-scrollbar -mx-4 px-4 pb-2 snap-x transform-gpu touch-pan-x ${scroll.isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            >
                {categoryBots.map(bot => (
                    <div key={bot.id} className="w-[160px] md:w-[200px] shrink-0 snap-center">
                        <BotCard bot={bot} tonRate={tonRate} isVertical />
                    </div>
                ))}
                
                {/* View All Card at the end */}
                <div 
                    onClick={() => navigate(`/search?category=${category.id}`)}
                    className="w-[160px] md:w-[200px] shrink-0 snap-center flex flex-col items-center justify-center bg-brand/5 border border-brand/20 rounded-[24px] cursor-pointer group active:scale-[0.98] transition-all"
                >
                    <div className="w-12 h-12 rounded-full bg-brand/20 flex items-center justify-center text-brand mb-4 group-hover:scale-110 transition-transform">
                        <ChevronRight size={24} />
                    </div>
                    <span className="text-[10px] font-black text-brand uppercase tracking-widest text-center px-4">
                        TÜM {t(category.label)} BOTLARINI GÖR
                    </span>
                </div>
            </div>
        </section>
    );
});

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
  const menuRef = useRef<HTMLDivElement>(null);
  const { activeFilter } = useFilter();
  
  const annScroll = useDraggableScroll();
  const catScroll = useDraggableScroll();

  const filteredBots = useMemo(() => {
    let result = [...bots];
    
    if (activeFilter === 'paid') result = result.filter(b => b.price > 0);
    else if (activeFilter === 'free') result = result.filter(b => b.price === 0);
    else if (activeFilter === 'popular') result = result.sort((a, b) => (b.views || 0) - (a.views || 0));
    else if (activeFilter === 'bhub') result = result.filter(b => b.is_official);
    
    return result;
  }, [bots, activeFilter]);

  const loadData = useCallback(async () => {
    // İlk yüklemede sadece botları ve duyuruları çek, fiyatı arka planda güncelle
    const [botData, annData] = await Promise.all([
        DatabaseService.getBots(),
        DatabaseService.getAnnouncements()
    ]);
    
    setBots(botData);
    if (annData.length > 0) setAnnouncements(annData.filter(a => a.is_active));
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

  return (
    <>
    <SEO 
        title="Telegram Bot ve Kanalları - Keşfet, Tanıt ve Yönet" 
        description="BotlyHub V3, Telegram ekosistemindeki en iyi botları ve kanalları bulabileceğiniz, kendi botlarınızı tanıtabileceğiniz ve yönetebileceğiniz kapsamlı bir platformdur."
    />
    <div className="p-4 pt-10 min-h-screen bg-slate-50 dark:bg-slate-950 pb-32 font-sans text-slate-900 dark:text-slate-200 animate-in transition-colors duration-300">
        <div className="flex flex-wrap md:flex-nowrap items-center justify-between mb-8 px-1 gap-y-6 md:gap-x-6">
        <div className="flex items-center gap-3 order-1">
            <div className="shrink-0">
                <Logo style={{ width: '2.5rem', height: 'auto', display: 'block' }} className="" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">BotlyHub</h1>
        </div>

        <div className="w-full md:w-auto md:flex-1 md:max-w-2xl order-3 md:order-2 cursor-pointer" onClick={() => navigate('/search')}>
            <div className="relative flex items-center bg-white dark:bg-slate-900/40 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-[28px] p-1.5 transition-all active:scale-[0.98] group">
                <div className="ml-4 w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-400 group-hover:text-blue-500 transition-colors">
                    <Search size={20} />
                </div>
                <div className="w-full py-3 px-4 text-sm text-slate-400 font-bold uppercase tracking-widest opacity-60">{t('search_placeholder')}</div>
            </div>
        </div>

        <div className="flex items-center gap-3 order-2 md:order-3">
            <button 
                onClick={() => { haptic('light'); toggleTheme(); }} 
                className="hidden md:flex w-12 h-12 items-center justify-center bg-white dark:bg-slate-900/80 border border-black/5 dark:border-white/5 rounded-full text-slate-900 dark:text-white active:scale-90 transition-transform"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2.20001C12.4418 2.20001 12.8 2.55818 12.8 3.00001V4.00001C12.8 4.44184 12.4418 4.80001 12 4.80001C11.5581 4.80001 11.2 4.44184 11.2 4.00001V3.00001C11.2 2.55818 11.5581 2.20001 12 2.20001ZM5.03427 5.03433C5.34668 4.72191 5.85322 4.72191 6.16564 5.03433L6.86564 5.73433C7.17806 6.04675 7.17806 6.55328 6.86564 6.8657C6.55322 7.17812 6.04669 7.17812 5.73427 6.8657L5.03427 6.1657C4.72185 5.85328 4.72185 5.34675 5.03427 5.03433ZM18.9656 5.03433C19.2781 5.34675 19.2781 5.85328 18.9656 6.1657L18.2656 6.8657C17.9532 7.17812 17.4467 7.17812 17.1343 6.8657C16.8218 6.55328 16.8218 6.04675 17.1343 5.73433L17.8343 5.03433C18.1467 4.72191 18.6532 4.72191 18.9656 5.03433ZM12 8.80001C10.2326 8.80001 8.79995 10.2327 8.79995 12C8.79995 13.7673 10.2326 15.2 12 15.2C13.7673 15.2 15.2 13.7673 15.2 12C15.2 10.2327 13.7673 8.80001 12 8.80001ZM7.19995 12C7.19995 9.34905 9.34898 7.20001 12 7.20001C14.6509 7.20001 16.8 9.34905 16.8 12C16.8 14.651 14.6509 16.8 12 16.8C9.34898 16.8 7.19995 14.651 7.19995 12ZM2.19995 12C2.19995 11.5582 2.55812 11.2 2.99995 11.2H3.99995C4.44178 11.2 4.79995 11.5582 4.79995 12C4.79995 12.4418 4.44178 12.8 3.99995 12.8H2.99995C2.55812 12.8 2.19995 12.4418 2.19995 12ZM19.2 12C19.2 11.5582 19.5581 11.2 20 11.2H21C21.4418 11.2 21.7999 11.5582 21.7999 12C21.7999 12.4418 21.4418 12.8 21 12.8H20C19.5581 12.8 19.2 12.4418 19.2 12ZM6.86564 17.1343C7.17806 17.4467 7.17806 17.9533 6.86564 18.2657L6.16564 18.9657C5.85322 19.2781 5.34668 19.2781 5.03427 18.9657C4.72185 18.6533 4.72185 18.1467 5.03427 17.8343L5.73427 17.1343C6.04669 16.8219 6.55322 16.8219 6.86564 17.1343ZM17.1343 17.1343C17.4467 16.8219 17.9532 16.8219 18.2656 17.1343L18.9656 17.8343C19.2781 18.1467 19.2781 18.6533 18.9656 18.9657C18.6532 19.2781 18.1467 19.2781 17.8343 18.9657L17.1343 18.2657C16.8218 17.9533 16.8218 17.4467 17.1343 17.1343ZM12 19.2C12.4418 19.2 12.8 19.5582 12.8 20V21C12.8 21.4418 12.4418 21.8 12 21.8C11.5581 21.8 11.2 21.4418 11.2 21V20C11.2 19.5582 11.5581 19.2 12 19.2Z " fill="currentColor"></path>
                </svg>
            </button>

            {user ? (
                <>
                    <button onClick={() => { haptic('medium'); navigate('/earnings'); }} className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-900/80 border border-black/5 dark:border-white/5 rounded-full text-slate-900 dark:text-white active:scale-90 transition-transform">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M5.54845 3.77673C3.55195 3.77673 1.93347 5.39521 1.93347 7.39171V16.6083C1.93347 18.6048 3.55195 20.2233 5.54845 20.2233H18.4517C20.4482 20.2233 22.0667 18.6048 22.0667 16.6083V8.31337V7.39171C22.0667 5.39521 20.4482 3.77673 18.4517 3.77673H5.54845ZM3.63347 7.39171C3.63347 6.3341 4.49084 5.47673 5.54845 5.47673H18.4517C19.5093 5.47673 20.3667 6.3341 20.3667 7.39171V8.31337V8.38503H17.53C15.5335 8.38503 13.915 10.0035 13.915 12C13.915 13.9965 15.5335 15.615 17.53 15.615H20.3667V16.6083C20.3667 17.6659 19.5093 18.5233 18.4517 18.5233H5.54845C4.49084 18.5233 3.63347 17.6659 3.63347 16.6083V7.39171ZM20.3667 13.915V10.085H17.53C16.4724 10.085 15.615 10.9424 15.615 12C15.615 13.0576 16.4724 13.915 17.53 13.915H20.3667Z" fill="currentColor"/>
                        </svg>
                    </button>
                    <div className="relative" ref={menuRef}>
                        <button 
                          onClick={() => { haptic('light'); setIsMenuOpen(!isMenuOpen); }} 
                          className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-900/80 border border-black/5 dark:border-white/5 rounded-full text-slate-900 dark:text-white active:scale-90 transition-transform relative"
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 7H20M4 12H20M4 17H20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            {unreadCount > 0 && (
                                <div className="absolute -top-1 -right-1 min-w-[20px] h-[20px] bg-red-600 rounded-full border-2 border-slate-50 dark:border-slate-950 text-[9px] font-black text-white flex items-center justify-center px-1 badge-pop">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </div>
                            )}
                        </button>
                        {isMenuOpen && (
                            <div className="absolute right-0 top-full mt-4 w-60 bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-[32px] overflow-hidden z-[100] animate-in py-2 backdrop-blur-2xl">
                                {[
                                    { path: '/', icon: Store, color: 'text-blue-500 dark:text-blue-400', label: 'market' },
                                    { path: '/settings', icon: User, color: 'text-purple-500 dark:text-purple-400', label: 'profile' },
                                    { path: '/my-bots', icon: BotIcon, color: 'text-emerald-500 dark:text-emerald-400', label: 'my_bots' },
                                    { path: '/channels', icon: Megaphone, color: 'text-orange-500 dark:text-orange-400', label: 'my_channels' },
                                    { path: '/notifications', icon: Bell, color: 'text-blue-600 dark:text-blue-500', label: 'notifications', badge: unreadCount > 0 }
                                ].map((item, i) => (
                                    <button key={i} onClick={() => { navigate(item.path); setIsMenuOpen(false); }} className="w-full flex items-center gap-4 px-6 py-4 hover:bg-black/5 dark:hover:bg-white/5 text-left border-b border-black/5 dark:border-white/5 last:border-0 relative">
                                        <item.icon size={18} className={item.color} /> 
                                        <span className="text-[11px] font-black uppercase tracking-tight text-slate-700 dark:text-slate-300">{t(item.label)}</span>
                                        {item.badge && <div className="absolute right-6 w-2.5 h-2.5 bg-red-600 rounded-full"></div>}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="flex items-center">
                    <button 
                        onClick={() => { haptic('light'); setIsLoginModalOpen(true); }}
                        className="px-6 h-12 bg-white dark:bg-slate-900/80 border border-black/5 dark:border-white/5 rounded-full text-slate-900 dark:text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
                    >
                        Giriş Yap
                    </button>
                    <LoginModal 
                        isOpen={isLoginModalOpen} 
                        onClose={() => setIsLoginModalOpen(false)} 
                        onAuth={(user) => setWebAuthUser(user)} 
                    />
                </div>
            )}
        </div>
      </div>

      {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4"><Loader2 className="animate-spin text-blue-500" size={32} /></div>
      ) : (
          <>
            {announcements.length > 0 && (
                <div className="mb-10">
                    <AnnouncementsCarousel 
                        announcements={announcements} 
                        scroll={annScroll} 
                        onShowPopup={(a) => setSelectedAnn(a)} 
                    />
                </div>
            )}

            <div className="mb-10">
                <div 
                    ref={catScroll.ref}
                    onMouseDown={catScroll.onMouseDown}
                    onMouseUp={catScroll.onMouseUp}
                    onMouseMove={catScroll.onMouseMove}
                    onMouseLeave={catScroll.onMouseLeave}
                    onContextMenu={catScroll.onContextMenu}
                    className={`flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-2 snap-x transform-gpu ${catScroll.isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                >
                    {categories.map((cat) => (
                        <motion.button 
                            key={cat.id} 
                            whileHover="hover"
                            onClick={() => { haptic('light'); navigate(`/search?category=${cat.id}`); }}
                            className="flex items-center gap-3 px-4 py-3 rounded-2xl border bg-white dark:bg-slate-900/60 border-black/5 dark:border-white/5 text-slate-900 dark:text-white hover:border-purple-500/30 transition-all active:scale-95 whitespace-nowrap snap-center"
                        >
                            <motion.div
                                variants={{
                                    hover: { 
                                        scale: 1.1,
                                    }
                                }}
                                transition={{ duration: 0.2 }}
                            >
                                <cat.icon size={18} className="text-[#a5afc3]" />
                            </motion.div>
                            <span className="text-[11px] font-bold uppercase tracking-wider">{t(cat.label)}</span>
                        </motion.button>
                    ))}
                </div>
            </div>

            <FeaturedBotsSlider bots={bots} />

            <div className="space-y-12">
                <div className="flex items-center justify-between px-2">
                    <button 
                        onClick={() => { haptic('light'); navigate('/referral'); }} 
                        className="flex items-center gap-2.5 group cursor-pointer"
                    >
                        <div className="w-8 h-8 bg-brand/10 rounded-xl flex items-center justify-center text-brand transition-all group-hover:scale-110 group-active:scale-95 shadow-sm">
                            <Send size={14} className="group-hover:rotate-12 transition-transform" />
                        </div>
                        <span className="text-[10px] font-black text-brand uppercase tracking-[0.3em] group-hover:tracking-[0.4em] transition-all">
                            SİSTEME BAŞVURU YAP
                        </span>
                    </button>
                    <FilterMenu />
                </div>

                {activeFilter === 'all' || !activeFilter ? (
                    <div className="space-y-4">
                        {categories.map((cat) => (
                            <CategorySection key={cat.id} category={cat} bots={bots} tonRate={tonRate} />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredBots.length > 0 ? (
                            filteredBots.map(bot => <BotCard key={bot.id} bot={bot} tonRate={tonRate} />)
                        ) : (
                            <div className="col-span-full py-24 text-center text-slate-400 dark:text-slate-700 font-bold uppercase text-xs tracking-widest">
                                Sonuç yok.
                            </div>
                        )}
                    </div>
                )}
            </div>
          </>
      )}

      {/* Enhanced Announcement Popup */}
      <AnimatePresence>
        {selectedAnn && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl" onClick={() => setSelectedAnn(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 w-full max-w-sm rounded-[44px] overflow-hidden relative" 
              onClick={e => e.stopPropagation()}
            >
                {/* Header/Cover Section */}
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
                    
                    {/* Close Button UI */}
                    <button 
                        onClick={() => setSelectedAnn(null)} 
                        className="absolute top-6 right-6 p-2.5 bg-black/20 backdrop-blur-md rounded-2xl text-white/80 hover:bg-black/40 hover:text-white transition-all active:scale-90"
                    >
                        <X size={18} />
                    </button>

                    {/* Badge UI */}
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
                            <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl flex items-center justify-center shrink-0">
                                {React.createElement(iconMap[selectedAnn.icon_name] || Sparkles, { size: 22, className: 'text-brand dark:text-brand-light' })}
                            </div>
                        )}
                        <h3 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase leading-none truncate pr-2">
                            {selectedAnn.title}
                        </h3>
                    </div>

                    <div className="bg-slate-50 dark:bg-black/20 rounded-3xl p-6 mb-8 border border-black/5 dark:border-white/5">
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
                            className="w-full h-18 bg-brand dark:bg-brand-light text-white text-[11px] font-black rounded-3xl uppercase tracking-[0.2em] active:translate-y-1 transition-all flex items-center justify-center gap-3 group"
                        >
                            {selectedAnn.button_text || 'ŞİMDİ KEŞFET'} 
                            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        
                        <button 
                            onClick={() => setSelectedAnn(null)} 
                            className="w-full py-4 text-slate-400 dark:text-slate-500 font-black text-[9px] uppercase tracking-[0.2em] hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        >
                            Belki Daha Sonra
                        </button>
                    </div>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
    </>
  );
};

const AnnouncementsCarousel: React.FC<{ 
    announcements: Announcement[], 
    scroll: any, 
    onShowPopup: (ann: Announcement) => void 
}> = React.memo(({ announcements, scroll, onShowPopup }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (announcements.length <= 1) return;

        const interval = setInterval(() => {
            setProgress(prev => {
                if (scroll.isDragging) return 0;
                if (prev >= 100) {
                    setCurrentIndex(current => {
                        const next = (current + 1) % announcements.length;
                        if (scroll.ref.current) {
                            const cardWidth = 340;
                            const gap = 16;
                            const scrollLeft = next * (cardWidth + gap);
                            scroll.ref.current.scrollTo({ left: scrollLeft, behavior: 'smooth' });
                        }
                        return next;
                    });
                    return 0;
                }
                return prev + 1;
            });
        }, 50);

        return () => clearInterval(interval);
    }, [announcements.length, currentIndex, scroll.ref, scroll.isDragging]);

    const handleScroll = useCallback(() => {
        if (scroll.ref.current) {
            const cardWidth = 340;
            const gap = 16;
            const index = Math.round(scroll.ref.current.scrollLeft / (cardWidth + gap));
            if (index !== currentIndex) {
                setCurrentIndex(index);
                setProgress(0);
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

    return (
        <>
            <div 
                ref={scroll.ref}
                onMouseDown={scroll.onMouseDown}
                onMouseUp={scroll.onMouseUp}
                onMouseMove={scroll.onMouseMove}
                onMouseLeave={scroll.onMouseLeave}
                onContextMenu={scroll.onContextMenu}
                className={`flex gap-4 overflow-x-auto no-scrollbar -mx-4 px-4 pb-2 snap-x snap-mandatory ${scroll.isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            >
                {announcements.map(ann => <PromoCard key={ann.id} ann={ann} onShowPopup={onShowPopup} />)}
            </div>
            {announcements.length > 1 && (
                <div className="flex justify-center gap-1.5 mt-3">
                    {announcements.map((_, i) => (
                        <div key={i} className="w-8 h-1 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                            <motion.div 
                                className="h-full bg-blue-500"
                                initial={{ width: 0 }}
                                animate={{ 
                                    width: i === currentIndex ? `${progress}%` : (i < currentIndex ? '100%' : '0%') 
                                }}
                                transition={{ duration: 0.1 }}
                            />
                        </div>
                    ))}
                </div>
            )}
        </>
    );
});

export default Home;


import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, ChevronLeft, X, Zap, Loader2, Sparkles, Send, Bot as BotIcon, Star, Sun, Moon, Wallet, Menu, Store, User, Bell, Megaphone } from 'lucide-react';
import { Bot, Notification } from '../types';
import { categories } from '../data';
import { useTranslation } from '../TranslationContext';
import { DatabaseService } from '../services/DatabaseService';
import PriceService from '../services/PriceService';
import { useTelegram } from '../hooks/useTelegram';
import { GeminiService } from '../services/GeminiService';
import { motion, AnimatePresence } from 'motion/react';
import { useDraggableScroll } from '../hooks/useDraggableScroll';
import { useFilter } from '../FilterContext';
import { FilterMenu } from '../components/FilterMenu';
import { useTheme } from '../ThemeContext';
import LoginModal from '../components/LoginModal';

import { useNavigate, useSearchParams } from 'react-router-dom';
import { SEO } from '../components/SEO';

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

const BotCard: React.FC<{ bot: Bot, tonRate: number }> = ({ bot, tonRate }) => {
  const navigate = useNavigate();
  const prices = PriceService.convert(bot.price, tonRate);
  
  return (
    <div onClick={() => navigate(`/bot/${bot.id}`)} className="flex items-center p-3 sm:p-6 bot-card cursor-pointer group bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-900/80 rounded-xl transition-all border border-black/5 dark:border-white/5 active:scale-[0.98] ">
        <div className="relative shrink-0">
            <img 
                src={getLiveBotIcon(bot)} 
                alt={bot.name} 
                className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-xl object-cover bg-slate-200 dark:bg-slate-900  border border-black/5 dark:border-white/5 group-hover:scale-105 transition-transform" 
                onError={(e) => { (e.target as any).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(bot.name)}&background=334155&color=fff&bold=true`; }}
            />
            {bot.price > 0 && (
                <div className="absolute -top-1.5 -right-1.5 w-7 h-7 bg-brand dark:bg-brand-light rounded-xl flex items-center justify-center  border-2 border-slate-50 dark:border-slate-950">
                    <Zap size={12} fill="currentColor" className="text-white" />
                </div>
            )}
        </div>
        <div className="flex-1 ml-5 min-w-0">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate tracking-tight mb-1 flex items-center gap-1.5">
                {bot.name}
                {bot.is_official && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="w-[14px] h-[14px] text-[#139fec] shrink-0">
                        <path fillRule="evenodd" clipRule="evenodd" d="M7.408 1.2375C7.57933 1.11017 7.78667 1.0415 8 1.0415C8.21333 1.0415 8.42067 1.11017 8.592 1.2375L9.81067 2.14417C9.83467 2.16217 9.86133 2.1755 9.88933 2.18484C9.91733 2.19417 9.94733 2.19884 9.97733 2.19817L11.496 2.18084C11.7093 2.17817 11.918 2.24484 12.09 2.37017C12.2627 2.4955 12.39 2.6735 12.454 2.87684L12.9073 4.32617C12.916 4.35484 12.93 4.3815 12.9473 4.4055C12.9647 4.4295 12.986 4.45084 13.0107 4.46817L14.2493 5.34684C14.4233 5.47017 14.5527 5.64617 14.6187 5.8495C14.6847 6.05217 14.6833 6.27084 14.6153 6.4735L14.13 7.91284C14.1207 7.94084 14.1153 7.97084 14.1153 8.00017C14.1153 8.0295 14.12 8.0595 14.13 8.0875L14.6153 9.52684C14.6833 9.72884 14.6847 9.9475 14.6187 10.1508C14.5527 10.3535 14.4233 10.5302 14.2493 10.6535L13.0107 11.5322C12.9867 11.5495 12.9653 11.5702 12.9473 11.5948C12.93 11.6188 12.9167 11.6455 12.9073 11.6742L12.454 13.1235C12.3907 13.3268 12.2627 13.5048 12.09 13.6302C11.9173 13.7555 11.7093 13.8222 11.496 13.8195L9.97733 13.8022C9.94733 13.8015 9.918 13.8062 9.88933 13.8155C9.86133 13.8248 9.83467 13.8382 9.81067 13.8562L8.592 14.7628C8.42067 14.8902 8.21333 14.9588 8 14.9588C7.78667 14.9588 7.57933 14.8902 7.408 14.7628L6.18933 13.8562C6.16533 13.8382 6.13867 13.8248 6.11067 13.8155C6.08267 13.8062 6.05267 13.8015 6.02267 13.8022L4.504 13.8195C4.29067 13.8222 4.082 13.7555 3.91 13.6302C3.73733 13.5048 3.61 13.3268 3.546 13.1235L3.09267 11.6742C3.084 11.6455 3.07 11.6188 3.05267 11.5948C3.03533 11.5708 3.014 11.5495 2.98933 11.5322L1.75067 10.6535C1.57667 10.5302 1.44733 10.3542 1.38133 10.1508C1.31533 9.94817 1.31667 9.7295 1.38467 9.52684L1.87 8.00017C1.88067 8.0595 1.88533 8.03017 1.88533 8.00017C1.88533 7.97017 1.88067 7.94084 1.87067 7.91284L1.38533 6.4735C1.31733 6.2715 1.316 6.05284 1.382 5.8495C1.448 5.64684 1.57733 5.47084 1.75133 5.3475L2.99 4.46884C3.014 4.45084 3.03533 4.43017 3.05333 4.40617C3.07067 4.38217 3.084 4.3555 3.09333 4.32684L3.54667 2.8775C3.61 2.67417 3.738 2.49617 3.91067 2.37084C4.08333 2.2455 4.29133 2.17884 4.50467 2.1815L6.02333 2.19884C6.05333 2.1995 6.08266 2.19484 6.11133 2.1855C6.13933 2.17617 6.166 2.16284 6.19 2.14484L7.408 1.2375Z" fill="currentColor"></path>
                        <path fillRule="evenodd" clipRule="evenodd" d="M7.33334 10.6668C7.16267 10.6668 6.992 10.6015 6.862 10.4715L4.862 8.4715C4.60134 8.21083 4.60134 7.7895 4.862 7.52883C5.12267 7.26817 5.544 7.26817 5.80467 7.52883L7.33334 9.0575L10.1953 6.1955C10.456 5.93483 10.8773 5.93483 11.138 6.1955C11.3987 6.45617 11.3987 6.8775 11.138 7.13817L7.80467 10.4715C7.67467 10.6015 7.504 10.6668 7.33334 10.6668Z" fill="white"></path>
                    </svg>
                )}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium truncate mb-2">{bot.description}</p>
            <div className="flex items-center gap-3">
                {bot.price > 0 && (
                    <div className="flex items-center gap-2 bg-brand/10 dark:bg-brand-light/10 px-3 py-1 rounded-xl">
                        <Zap size={10} className="text-brand dark:text-brand-light" />
                        <span className="text-[10px] font-bold text-brand dark:text-brand-light uppercase tracking-wider">{Number(prices.ton).toFixed(1)} TON</span>
                    </div>
                )}
                <div className="flex items-center gap-1.5 bg-yellow-500/10 px-3 py-1 rounded-xl border border-yellow-500/20">
                    <Star size={10} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-[10px] font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-wider">{bot.rating || '0.0'}</span>
                </div>
                {bot.languages && bot.languages.length > 0 && (
                    <div className="flex items-center gap-1.5">
                        {bot.languages.map((lang, idx) => (
                            <span 
                                key={idx} 
                                className={`
                                    text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter opacity-80
                                    ${idx === 3 ? 'hidden md:inline-block' : ''}
                                    ${idx >= 4 ? 'hidden lg:inline-block' : ''}
                                `}
                            >
                                <span className="md:hidden">{getLangLabel(lang)}</span>
                                <span className="hidden md:inline">{lang}</span>
                            </span>
                        ))}
                        {/* Plus SVG indicators for mobile/tablet truncation */}
                        {bot.languages.length > 3 && (
                            <span className="inline-flex md:hidden text-slate-400 dark:text-slate-500 opacity-80 items-center">
                                <svg width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            </span>
                        )}
                        {bot.languages.length > 4 && (
                            <span className="hidden md:inline-flex lg:hidden text-slate-400 dark:text-slate-500 opacity-80 items-center">
                                <svg width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const { user, haptic, setWebAuthUser } = useTelegram();
  const { theme, toggleTheme } = useTheme();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all');
  const [bots, setBots] = useState<Bot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tonRate, setTonRate] = useState(250);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const catScroll = useDraggableScroll();
  const { activeFilter } = useFilter();
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiAssistant, setShowAiAssistant] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        const [botData, pData] = await Promise.all([
            DatabaseService.getBots(),
            PriceService.getTonPrice()
        ]);
        setBots(botData);
        setTonRate(pData.tonTry || 250);
        setIsLoading(false);
        
        // Log search page visit
        if (user?.id) {
            await DatabaseService.logActivity(user.id.toString(), 'system', 'search_visit', 'Arama Sayfası', 'Kullanıcı arama motorunu başlattı.');
            
            // Fetch notifications for unread count
            const notes = await DatabaseService.getNotifications(user.id.toString());
            setUnreadCount(notes.filter(n => !n.isRead).length);
        }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredBots = bots.filter(bot => {
    const matchesQuery = bot.name.toLowerCase().includes(query.toLowerCase()) || 
                         bot.description.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = activeCategory === 'all' || (Array.isArray(bot.category) ? bot.category.includes(activeCategory) : bot.category === activeCategory);
    
    let matchesFilter = true;
    if (activeFilter === 'paid') matchesFilter = bot.price > 0;
    else if (activeFilter === 'free') matchesFilter = bot.price === 0;
    else if (activeFilter === 'bhub') matchesFilter = !!bot.is_official;
    
    return matchesQuery && matchesCategory && matchesFilter;
  }).sort((a, b) => {
    if (activeFilter === 'popular') return (b.views || 0) - (a.views || 0);
    return 0;
  });

  const handleAiSearch = async () => {
    if (!aiQuery.trim()) return;
    setIsAiLoading(true);
    try {
      const response = await GeminiService.recommendBots(aiQuery, bots);
      setAiResponse(response);
      if (user?.id) {
        await DatabaseService.logActivity(user.id.toString(), 'system', 'ai_search', 'AI Asistanı', `AI asistanına soruldu: ${aiQuery}`);
      }
    } catch (error) {
      console.error("AI Search Error:", error);
      setAiResponse("Üzgünüm, şu anda yardımcı olamıyorum.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <>
    <SEO 
        title="Bot ve Kanal Ara" 
        description="BotlyHub üzerinde dilediğiniz Telegram botunu veya kanalını arayarak keşfedin."
    />
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-5 sm:px-8 pt-4 md:pt-10 pb-32 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Header & Search Box */}
      <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-xl text-slate-500 active:scale-90 transition-transform shrink-0">
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex-1 relative">
            <div className="relative flex items-center bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-xl p-1 transition-all group custom-search-outline">
              <div className="ml-2 w-8 h-8 flex items-center justify-center text-slate-400 group-focus-within:text-blue-500">
                <SearchIcon size={18} />
              </div>
              <input 
                type="text" 
                value={query} 
                autoFocus
                onChange={(e) => setQuery(e.target.value)} 
                placeholder={t('search_placeholder')} 
                className="w-full bg-transparent py-2 px-2 text-[13px] text-slate-900 dark:text-white outline-none placeholder:text-slate-400 font-bold uppercase tracking-widest" 
              />
              {query && (
                <button onClick={() => setQuery('')} className="mr-1 w-8 h-8 flex items-center justify-center text-slate-400">
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="shrink-0">
              <FilterMenu />
          </div>
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="mb-10">
        <div 
            ref={catScroll.ref}
            onMouseDown={catScroll.onMouseDown}
            onMouseUp={catScroll.onMouseUp}
            onMouseMove={catScroll.onMouseMove}
            onMouseLeave={catScroll.onMouseLeave}
            onContextMenu={catScroll.onContextMenu}
            className={`flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-2 snap-x ${catScroll.isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        >
          {categories.map((cat) => (
            <button 
              key={cat.id} 
              onClick={() => {
                setActiveCategory(cat.id);
                if (user?.id) {
                    DatabaseService.logActivity(user.id.toString(), 'system', 'search_category', 'Kategori Filtresi', `Arama motorunda '${t(cat.label)}' kategorisi filtrelendi.`);
                }
              }}
              className={`flex items-center gap-3 px-4 py-2.5 md:px-6 md:py-4 rounded-xl border transition-all active:scale-95  whitespace-nowrap snap-center ${
                activeCategory === cat.id 
                ? 'bg-brand/10 dark:bg-brand-light/10 border-brand/40 dark:border-brand-light/40 text-brand dark:text-brand-light ring-1 ring-brand/20 dark:ring-brand-light/20' 
                : 'bg-white dark:bg-slate-900/60 border-black/5 dark:border-white/5 text-slate-500 dark:text-slate-400'
              }`}
            >
              <cat.icon size={16} className={activeCategory === cat.id ? 'text-brand dark:text-brand-light' : 'text-[#a5afc3]'} />
              <span className="text-[11px] font-bold uppercase tracking-wider">{t(cat.label)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-1">
        <div className="flex justify-between items-center mb-6 px-2">
            <h2 className="text-[10px] font-black text-slate-400 dark:text-slate-700 uppercase tracking-[0.4em]">Sonuçlar ({filteredBots.length})</h2>
        </div>

        {isLoading ? (
            <div className="flex justify-center py-24"><Loader2 className="animate-spin text-blue-500" /></div>
        ) : filteredBots.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-bottom-4">
                {filteredBots.map(bot => <BotCard key={bot.id} bot={bot} tonRate={tonRate} />)}
            </div>
        ) : (
            <div className="py-24 text-center">
                <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Kriterlere uygun bot bulunamadı.</p>
            </div>
        )}
      </div>
      </div>
    </div>
    </>
  );
};

export default SearchPage;

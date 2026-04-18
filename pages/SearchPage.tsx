
import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, ChevronLeft, X, Zap, Loader2, Sparkles, Send, Bot as BotIcon, Star } from 'lucide-react';
import { Bot } from '../types';
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

import { useNavigate, useSearchParams } from 'react-router-dom';

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
    <div onClick={() => navigate(`/bot/${bot.id}`)} className="flex items-center p-4 cursor-pointer group bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-900/80 rounded-[32px] transition-all border border-black/5 dark:border-white/5 active:scale-[0.98] shadow-lg">
        <div className="relative shrink-0">
            <img 
                src={getLiveBotIcon(bot)} 
                alt={bot.name} 
                className="w-20 h-20 rounded-[24px] object-cover bg-slate-200 dark:bg-slate-900 shadow-xl border border-black/5 dark:border-white/5 group-hover:scale-105 transition-transform" 
                onError={(e) => { (e.target as any).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(bot.name)}&background=334155&color=fff&bold=true`; }}
            />
            {bot.price > 0 && (
                <div className="absolute -top-1.5 -right-1.5 w-7 h-7 bg-brand dark:bg-brand-light rounded-xl flex items-center justify-center shadow-lg border-2 border-slate-50 dark:border-slate-950">
                    <Zap size={12} fill="currentColor" className="text-white" />
                </div>
            )}
        </div>
        <div className="flex-1 ml-5 min-w-0">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate tracking-tight mb-1">{bot.name}</h3>
            <p className="text-[11px] text-slate-500 font-medium truncate mb-2">{bot.description}</p>
            <div className="flex items-center gap-3">
                {bot.price === 0 ? (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider bg-emerald-400/10 px-3 py-1 rounded-xl">Ücretsiz</span>
                ) : (
                    <div className="flex items-center gap-2 bg-brand/10 dark:bg-brand-light/10 px-3 py-1 rounded-xl">
                        <Zap size={10} className="text-brand dark:text-brand-light" />
                        <span className="text-[10px] font-bold text-brand dark:text-brand-light uppercase tracking-wider">{prices.ton} TON</span>
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
  const { user } = useTelegram();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all');
  const [bots, setBots] = useState<Bot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tonRate, setTonRate] = useState(250);
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
        setTonRate(pData.tonTry);
        setIsLoading(false);
        
        // Log search page visit
        if (user?.id) {
            await DatabaseService.logActivity(user.id.toString(), 'system', 'search_visit', 'Arama Sayfası', 'Kullanıcı arama motorunu başlattı.');
        }
    };
    fetchData();
  }, [user]);

  const filteredBots = bots.filter(bot => {
    const matchesQuery = bot.name.toLowerCase().includes(query.toLowerCase()) || 
                         bot.description.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = activeCategory === 'all' || bot.category === activeCategory;
    
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 pt-10 pb-32 animate-in fade-in transition-colors duration-300">
      {/* Header & Search Box */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="w-12 h-12 flex items-center justify-center text-slate-500 dark:text-slate-400 active:scale-90 transition-transform shrink-0">
          <ChevronLeft size={22} />
        </button>
        <div className="relative flex-1">
          <div className="relative flex items-center bg-white dark:bg-slate-900/40 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-[28px] p-1.5 shadow-xl ring-2 ring-transparent focus-within:ring-blue-500/30 transition-all group">
            <div className="ml-4 w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-400 group-focus-within:text-blue-500 transition-colors">
              <SearchIcon size={20} />
            </div>
            <input 
              type="text" 
              value={query} 
              autoFocus
              onChange={(e) => setQuery(e.target.value)} 
              placeholder={t('search_placeholder')} 
              className="w-full bg-transparent py-3 px-4 text-sm text-slate-900 dark:text-white outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600 font-bold uppercase tracking-widest" 
            />
            {query && (
              <button onClick={() => setQuery('')} className="mr-4 w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                <X size={16} />
              </button>
            )}
          </div>
        </div>
        <FilterMenu />
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
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl border transition-all active:scale-95 shadow-lg whitespace-nowrap snap-center ${
                activeCategory === cat.id 
                ? 'bg-brand/10 dark:bg-brand-light/10 border-brand/40 dark:border-brand-light/40 text-brand dark:text-brand-light ring-1 ring-brand/20 dark:ring-brand-light/20' 
                : 'bg-white dark:bg-slate-900/60 border-black/5 dark:border-white/5 text-slate-500 dark:text-slate-400'
              }`}
            >
              <cat.icon size={20} className={activeCategory === cat.id ? 'text-brand dark:text-brand-light' : 'text-slate-400 dark:text-slate-300'} />
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
  );
};

export default SearchPage;

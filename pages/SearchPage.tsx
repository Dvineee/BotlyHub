
import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, ChevronLeft, X, Zap, Loader2 } from 'lucide-react';
import * as Router from 'react-router-dom';
import { Bot } from '../types';
import { categories } from '../data';
import { useTranslation } from '../TranslationContext';
import { DatabaseService } from '../services/DatabaseService';
import PriceService from '../services/PriceService';

const { useNavigate, useSearchParams } = Router as any;

const getLiveBotIcon = (bot: Bot) => {
    if (bot.bot_link) {
        const username = bot.bot_link.replace('@', '').replace('https://t.me/', '').split('/').pop()?.trim();
        if (username) return `https://t.me/i/userpic/320/${username}.jpg`;
    }
    return bot.icon || `https://ui-avatars.com/api/?name=${encodeURIComponent(bot.name)}&background=random&color=fff`;
};

const BotCard: React.FC<{ bot: Bot, tonRate: number }> = ({ bot, tonRate }) => {
  const navigate = useNavigate();
  const prices = PriceService.convert(bot.price, tonRate);
  
  return (
    <div onClick={() => navigate(`/bot/${bot.id}`)} className="flex items-center p-5 cursor-pointer group hover:bg-slate-900/60 rounded-[32px] transition-all border border-transparent hover:border-slate-800/50 mb-3 active:bg-slate-900 shadow-xl shadow-black/5">
        <div className="relative shrink-0">
            <img 
                src={getLiveBotIcon(bot)} 
                alt={bot.name} 
                className="w-20 h-20 rounded-[28px] object-cover bg-slate-900 shadow-2xl border border-slate-800 group-hover:scale-105 transition-transform" 
                onError={(e) => { (e.target as any).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(bot.name)}&background=334155&color=fff&bold=true`; }}
            />
            {bot.price > 0 && (
                <div className="absolute -top-1.5 -right-1.5 w-7 h-7 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg border-4 border-[#020617]">
                    <Zap size={12} fill="currentColor" className="text-white" />
                </div>
            )}
        </div>
        <div className="flex-1 ml-5 min-w-0 mr-3">
            <h3 className="font-black text-lg text-slate-100 truncate italic tracking-tighter uppercase mb-1.5">{bot.name}</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate mb-2">{bot.description}</p>
            <div className="flex items-center gap-3">
                {bot.price === 0 ? (
                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded-md">Ücretsiz</span>
                ) : (
                    <div className="flex items-center gap-2">
                        <Zap size={10} className="text-blue-500" />
                        <span className="text-[9px] font-black text-blue-400 uppercase tracking-tighter">{prices.ton} TON</span>
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
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all');
  const [bots, setBots] = useState<Bot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tonRate, setTonRate] = useState(250);

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
    };
    fetchData();
  }, []);

  const filteredBots = bots.filter(bot => {
    const matchesQuery = bot.name.toLowerCase().includes(query.toLowerCase()) || 
                         bot.description.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = activeCategory === 'all' || bot.category === activeCategory;
    return matchesQuery && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#020617] p-4 pt-10 pb-32 animate-in fade-in">
      {/* Header & Search Box */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/')} className="p-3 bg-slate-900/60 border border-slate-800 rounded-2xl text-slate-400 active:scale-90 transition-transform">
          <ChevronLeft size={20} />
        </button>
        <div className="relative flex-1">
          <div className="relative flex items-center bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[28px] p-1 shadow-2xl ring-2 ring-transparent focus-within:ring-blue-500/30 transition-all">
            <SearchIcon className="ml-5 text-slate-600 w-5 h-5" />
            <input 
              type="text" 
              value={query} 
              autoFocus
              onChange={(e) => setQuery(e.target.value)} 
              placeholder={t('search_placeholder')} 
              className="w-full bg-transparent py-4 px-4 text-xs text-white outline-none placeholder:text-slate-600 font-bold uppercase tracking-widest" 
            />
            {query && (
              <button onClick={() => setQuery('')} className="mr-5 text-slate-600 hover:text-white">
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Categories Grid (Directly below search box) */}
      <div className="mb-10">
        <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em] mb-6 px-2">Kategoriler</p>
        <div className="grid grid-cols-4 gap-3">
          {categories.map((cat) => (
            <button 
              key={cat.id} 
              onClick={() => setActiveCategory(cat.id)}
              className={`flex flex-col items-center justify-center gap-3 py-6 rounded-[28px] border transition-all active:scale-95 shadow-xl ${
                activeCategory === cat.id 
                ? 'bg-blue-600/10 border-blue-500/40 text-blue-400 ring-1 ring-blue-500/20' 
                : 'bg-slate-900/40 border-white/5 text-slate-600'
              }`}
            >
              <cat.icon size={22} className={activeCategory === cat.id ? 'text-blue-400' : 'text-slate-500'} />
              <span className="text-[8px] font-black tracking-widest text-center uppercase">{t(cat.label)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-1">
        <div className="flex justify-between items-center mb-6 px-2">
            <h2 className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em]">Sonuçlar ({filteredBots.length})</h2>
        </div>

        {isLoading ? (
            <div className="flex justify-center py-24"><Loader2 className="animate-spin text-blue-500" /></div>
        ) : filteredBots.length > 0 ? (
            <div className="animate-in slide-in-from-bottom-4">
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

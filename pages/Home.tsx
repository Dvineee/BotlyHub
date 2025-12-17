
import React, { useState, useEffect } from 'react';
import { Search, Sparkles, TrendingUp, ChevronRight, LayoutGrid, Store, User, Bot as BotIcon, Megaphone, DollarSign, X, Package, Loader2, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Bot, Announcement } from '../types';
import { categories } from '../data';
import { useTranslation } from '../TranslationContext';
import { DatabaseService } from '../services/DatabaseService';

const PromoCard = ({ ann }: { ann: Announcement }) => {
  const navigate = useNavigate();
  const colors: Record<string, string> = {
    blue: 'from-blue-600 to-blue-400',
    purple: 'from-purple-600 to-purple-400',
    emerald: 'from-emerald-600 to-emerald-400',
    orange: 'from-orange-600 to-orange-400'
  };

  return (
    <div className={`min-w-[280px] bg-gradient-to-br ${colors[ann.color_scheme] || colors.blue} p-5 rounded-[28px] relative overflow-hidden shadow-xl shadow-blue-900/10`}>
        <div className="relative z-10">
            <h3 className="text-white font-bold text-lg mb-1">{ann.title}</h3>
            <p className="text-white/80 text-xs mb-4 max-w-[180px] leading-relaxed">{ann.description}</p>
            <button 
                onClick={() => ann.button_link.startsWith('/') ? navigate(ann.button_link) : window.open(ann.button_link)}
                className="bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold py-2 px-4 rounded-full"
            >
                {ann.button_text}
            </button>
        </div>
        <div className="absolute -right-4 -bottom-4 opacity-20 transform rotate-12">
            <Sparkles size={120} className="text-white" />
        </div>
    </div>
  );
};

const BotCard: React.FC<{ bot: Bot }> = ({ bot }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const handleClick = () => {
      // Add to recently viewed
      const recent = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      const filtered = recent.filter((b: Bot) => b.id !== bot.id);
      localStorage.setItem('recentlyViewed', JSON.stringify([bot, ...filtered].slice(0, 10)));
      navigate(`/bot/${bot.id}`);
  };

  return (
    <div onClick={handleClick} className="flex items-center py-4 px-3 cursor-pointer group hover:bg-slate-900/40 rounded-2xl transition-all border border-transparent hover:border-slate-800">
        <img src={bot.icon} alt={bot.name} className="w-16 h-16 rounded-2xl object-cover bg-slate-900 shadow-lg" />
        <div className="flex-1 ml-4 min-w-0 mr-2">
            <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-bold text-base truncate text-slate-100">{bot.name}</h3>
                {bot.price > 0 && <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5"><Star size={8} fill="currentColor"/> {bot.price}</span>}
            </div>
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{bot.description}</p>
        </div>
        <button className="bg-slate-800 border border-slate-700 text-slate-200 text-[10px] font-bold py-2 px-4 rounded-full">
            {t('open')}
        </button>
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [bots, setBots] = useState<Bot[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [recentBots, setRecentBots] = useState<Bot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
        const [botData, annData] = await Promise.all([
            DatabaseService.getBots(),
            DatabaseService.getAnnouncements()
        ]);
        setBots(botData);
        setAnnouncements(annData);
        setRecentBots(JSON.parse(localStorage.getItem('recentlyViewed') || '[]'));
        setIsLoading(false);
    };
    load();
  }, []);

  return (
    <div className="p-4 pt-8 min-h-screen bg-slate-950 pb-24">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Package className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">BotlyHub <span className="text-blue-500">V3</span></h1>
        </div>
        <div className="flex items-center gap-3">
            <button onClick={() => navigate('/earnings')} className="p-2.5 bg-slate-900 border border-slate-800 rounded-full text-emerald-400"><DollarSign size={20} /></button>
            <div className="relative">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2.5 bg-slate-900 border border-slate-800 rounded-full text-white"><LayoutGrid size={20} /></button>
                {isMenuOpen && (
                    <div className="absolute right-0 top-full mt-3 w-48 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50">
                        <button onClick={() => navigate('/settings')} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 text-left border-b border-slate-800/50"><User size={18} className="text-purple-400" /> <span className="text-sm font-bold text-slate-200">Profil</span></button>
                        <button onClick={() => navigate('/my-bots')} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 text-left border-b border-slate-800/50"><BotIcon size={18} className="text-emerald-400" /> <span className="text-sm font-bold text-slate-200">Botlarım</span></button>
                        <button onClick={() => navigate('/channels')} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800 text-left"><Megaphone size={18} className="text-orange-400" /> <span className="text-sm font-bold text-slate-200">Kanallarım</span></button>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
        <input 
          type="text" 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('search_placeholder')}
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:border-blue-500 outline-none"
        />
      </div>

      {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" /></div>
      ) : (
          <>
            {/* Dynamic Announcements */}
            <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-4 px-4 mb-10">
                {announcements.map(ann => <PromoCard key={ann.id} ann={ann} />)}
                {announcements.length === 0 && (
                    <div className="min-w-[280px] bg-slate-900 border border-slate-800 p-5 rounded-[28px] flex flex-col justify-center items-center text-slate-500 italic text-xs">Henüz duyuru yok.</div>
                )}
            </div>

            {/* Categories */}
            <div className="grid grid-cols-4 gap-3 mb-10">
                {categories.slice(0, 4).map((cat) => (
                    <button key={cat.id} onClick={() => navigate(`/search?category=${cat.id}`)} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-900 border border-slate-800">
                        <cat.icon size={20} className="text-blue-500" />
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tight">{t(cat.label)}</span>
                    </button>
                ))}
            </div>

            {/* Recently Viewed */}
            {recentBots.length > 0 && (
                <div className="mb-10">
                    <div className="flex justify-between items-center mb-4 px-1">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Son Bakılanlar</h2>
                        <button onClick={() => {localStorage.removeItem('recentlyViewed'); setRecentBots([]);}} className="text-[10px] font-bold text-red-500">Temizle</button>
                    </div>
                    <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-4 px-4">
                        {recentBots.map(bot => (
                            <div key={bot.id} onClick={() => navigate(`/bot/${bot.id}`)} className="min-w-[120px] flex flex-col items-center">
                                <img src={bot.icon} className="w-16 h-16 rounded-2xl object-cover mb-2" />
                                <span className="text-[10px] font-bold text-slate-200 text-center truncate w-full">{bot.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Bot List */}
            <div className="space-y-1">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 px-1">Tüm Botlar</h2>
                <div className="bg-slate-900/20 rounded-3xl p-2 border border-slate-800/50">
                    {bots.map(bot => <BotCard key={bot.id} bot={bot} />)}
                </div>
            </div>
          </>
      )}
    </div>
  );
};

export default Home;


import React, { useState, useEffect } from 'react';
import { Search, Sparkles, ChevronRight, LayoutGrid, DollarSign, Package, Loader2, ShieldCheck, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Bot, Announcement } from '../types';
import { categories } from '../data';
import { useTranslation } from '../TranslationContext';
import { DatabaseService } from '../services/DatabaseService';

const PromoCard = ({ ann }: { ann: Announcement }) => {
  const navigate = useNavigate();
  const colors: Record<string, string> = {
    purple: 'from-[#7c3aed] to-[#a78bfa]',
    emerald: 'from-[#059669] to-[#34d399]',
    blue: 'from-[#2563eb] to-[#60a5fa]'
  };

  return (
    <div className={`min-w-[280px] h-44 bg-gradient-to-br ${colors[ann.color_scheme] || colors.purple} p-6 rounded-[32px] relative overflow-hidden shadow-lg`}>
        <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
                <h3 className="text-white font-black text-xl mb-1">{ann.title}</h3>
                <p className="text-white/80 text-xs max-w-[180px] leading-snug">{ann.description}</p>
            </div>
            <button 
                onClick={() => ann.button_link.startsWith('/') ? navigate(ann.button_link) : window.open(ann.button_link)}
                className="bg-white text-slate-900 text-[11px] font-bold py-2.5 px-6 rounded-xl w-fit"
            >
                {ann.button_text}
            </button>
        </div>
        <div className="absolute -right-6 -bottom-6 opacity-30 transform rotate-12">
            <Sparkles size={140} className="text-white" />
        </div>
    </div>
  );
};

const BotCard: React.FC<{ bot: Bot }> = ({ bot }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
      const recent = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      const filtered = recent.filter((b: Bot) => b.id !== bot.id);
      localStorage.setItem('recentlyViewed', JSON.stringify([bot, ...filtered].slice(0, 10)));
      navigate(`/bot/${bot.id}`);
  };

  return (
    <div onClick={handleClick} className="flex items-center py-4 px-2 cursor-pointer group hover:bg-slate-900/40 rounded-2xl transition-all">
        <img src={bot.icon} alt={bot.name} className="w-16 h-16 rounded-2xl object-cover bg-slate-900 shadow-xl border border-slate-800" />
        <div className="flex-1 ml-4 min-w-0 mr-2">
            <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-bold text-base text-slate-100 truncate">{bot.name}</h3>
                <span className="bg-indigo-500/10 text-indigo-400 text-[9px] font-bold px-1.5 py-0.5 rounded border border-indigo-500/20 uppercase tracking-tighter">Premium</span>
            </div>
            <p className="text-xs text-slate-500 truncate">{bot.description}</p>
        </div>
        <button className="bg-slate-800/80 text-white text-[11px] font-bold py-2 px-5 rounded-full border border-slate-700">
            Aç
        </button>
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
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

  const filteredBots = bots.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-4 pt-8 min-h-screen bg-[#020617] pb-24 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 px-1">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#7c3aed] rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                <div className="w-5 h-5 border-2 border-white rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
            </div>
            <h1 className="text-xl font-black text-white tracking-tight">BotlyHub V2</h1>
        </div>
        <div className="flex items-center gap-3">
            <button onClick={() => navigate('/earnings')} className="p-2.5 bg-slate-900/50 border border-slate-800 rounded-full text-emerald-400 shadow-sm"><DollarSign size={20} /></button>
            <button onClick={() => navigate('/settings')} className="p-2.5 bg-slate-900/50 border border-slate-800 rounded-full text-slate-300 shadow-sm"><LayoutGrid size={20} /></button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
        <input 
          type="text" 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Botları ara..."
          className="w-full bg-[#0f172a]/50 border border-slate-800/80 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:ring-1 ring-purple-500 outline-none placeholder:text-slate-600 transition-all"
        />
      </div>

      {/* Admin Button */}
      <button 
        onClick={() => navigate('/a/admin')}
        className="w-full bg-blue-600/10 border border-blue-500/20 text-blue-400 py-3.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 mb-8"
      >
        <ShieldCheck size={16} />
        Yönetici Paneline Git
      </button>

      {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-purple-500" /></div>
      ) : (
          <>
            {/* Promo Sliders */}
            <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-4 px-4 mb-10">
                {announcements.length > 0 ? announcements.map(ann => <PromoCard key={ann.id} ann={ann} />) : (
                    <div className="min-w-[280px] h-44 bg-slate-900 rounded-[32px] border border-slate-800 flex items-center justify-center text-slate-600 text-xs italic">Duyuru bulunamadı.</div>
                )}
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-4 gap-2.5 mb-10">
                {categories.map((cat) => (
                    <button 
                        key={cat.id} 
                        onClick={() => navigate(`/search?category=${cat.id}`)}
                        className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl bg-[#0f172a]/40 border border-slate-800/60 hover:border-purple-500/50 transition-all"
                    >
                        <cat.icon size={18} className="text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-500 tracking-tight text-center">{t(cat.label)}</span>
                    </button>
                ))}
            </div>

            {/* Recently Viewed */}
            {recentBots.length > 0 && (
                <div className="mb-10">
                    <div className="flex justify-between items-center mb-5 px-1">
                        <h2 className="text-lg font-black text-white">Son Bakılanlar</h2>
                        <button onClick={() => {localStorage.removeItem('recentlyViewed'); setRecentBots([]);}} className="text-xs font-bold text-blue-500">Temizle</button>
                    </div>
                    <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-4 px-4">
                        {recentBots.map(bot => (
                            <div key={bot.id} onClick={() => navigate(`/bot/${bot.id}`)} className="min-w-[70px] flex flex-col items-center">
                                <img src={bot.icon} className="w-16 h-16 rounded-[20px] object-cover mb-2 border border-slate-800 shadow-md" />
                                <span className="text-[10px] font-bold text-slate-400 text-center truncate w-full">{bot.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Sections */}
            <div className="space-y-12">
                <section>
                    <div className="flex justify-between items-center mb-5 px-1">
                        <h2 className="text-lg font-black text-white">Üretkenlik Botları</h2>
                        <button onClick={() => navigate('/search?category=productivity')} className="flex items-center gap-1 text-slate-500">
                            <span className="text-xs font-bold">Tümü</span>
                            <ChevronRight size={14} />
                        </button>
                    </div>
                    <div className="space-y-1 bg-slate-900/10 rounded-3xl border border-slate-900/50">
                        {bots.filter(b => b.category === 'productivity').slice(0, 3).map(bot => <BotCard key={bot.id} bot={bot} />)}
                    </div>
                </section>
            </div>

            {/* Footer Attribution */}
            <div className="mt-16 text-center">
                <p className="text-slate-700 text-[11px] font-bold tracking-widest uppercase">@teest44_BOT</p>
            </div>
          </>
      )}
    </div>
  );
};

export default Home;


import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, ChevronRight, LayoutGrid, DollarSign, Package, Loader2, ShieldCheck, Star, Store, User, Bot as BotIcon, Megaphone, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Bot, Announcement } from '../types';
import { categories } from '../data';
import { useTranslation } from '../TranslationContext';
import { DatabaseService } from '../services/DatabaseService';

const PromoCard = ({ ann }: { ann: Announcement }) => {
  const navigate = useNavigate();
  const colors: Record<string, string> = {
    purple: 'from-[#6366f1] to-[#a855f7]',
    emerald: 'from-[#10b981] to-[#34d399]',
    blue: 'from-[#3b82f6] to-[#60a5fa]'
  };

  return (
    <div className={`min-w-[300px] h-44 bg-gradient-to-br ${colors[ann.color_scheme] || colors.purple} p-6 rounded-[32px] relative overflow-hidden shadow-2xl`}>
        <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
                <h3 className="text-white font-black text-2xl mb-1">{ann.title}</h3>
                <p className="text-white/80 text-xs max-w-[200px] leading-snug">{ann.description}</p>
            </div>
            <button 
                onClick={() => ann.button_link.startsWith('/') ? navigate(ann.button_link) : window.open(ann.button_link)}
                className="bg-white text-slate-950 text-[11px] font-bold py-2.5 px-6 rounded-xl w-fit shadow-md transition-transform active:scale-95"
            >
                {ann.button_text}
            </button>
        </div>
        <div className="absolute -right-6 -bottom-6 opacity-30 transform rotate-12 pointer-events-none">
            <Sparkles size={160} className="text-white" />
        </div>
    </div>
  );
};

const BotCard: React.FC<{ bot: Bot }> = ({ bot }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const handleClick = () => {
      const recent = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      const filtered = recent.filter((b: Bot) => b.id !== bot.id);
      localStorage.setItem('recentlyViewed', JSON.stringify([bot, ...filtered].slice(0, 10)));
      navigate(`/bot/${bot.id}`);
  };

  return (
    <div onClick={handleClick} className="flex items-center py-4 px-3 cursor-pointer group hover:bg-slate-900/40 rounded-2xl transition-all border border-transparent hover:border-slate-800/50">
        <img src={bot.icon} alt={bot.name} className="w-16 h-16 rounded-[22px] object-cover bg-slate-900 shadow-xl border border-slate-800" />
        <div className="flex-1 ml-4 min-w-0 mr-2">
            <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-bold text-base text-slate-100 truncate">{bot.name}</h3>
                <span className="bg-indigo-500/10 text-indigo-400 text-[9px] font-bold px-1.5 py-0.5 rounded border border-indigo-500/20 uppercase tracking-tighter">Premium</span>
            </div>
            <p className="text-xs text-slate-500 truncate">{bot.description}</p>
        </div>
        <button className="bg-[#0f172a] text-white text-[11px] font-black py-2.5 px-6 rounded-full border border-slate-800 shadow-sm active:scale-90 transition-transform">
            Aç
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
  const menuRef = useRef<HTMLDivElement>(null);

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
    
    const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setIsMenuOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredBots = bots.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const productivityBots = filteredBots.filter(b => b.category === 'productivity');

  return (
    <div className="p-4 pt-8 min-h-screen bg-[#020617] pb-24 font-sans text-slate-200">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 px-1 relative">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#7c3aed] rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                <div className="w-5 h-5 border-2 border-white rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
            </div>
            <h1 className="text-xl font-black text-white tracking-tight">BotlyHub V2</h1>
        </div>
        <div className="flex items-center gap-3">
            <button onClick={() => navigate('/earnings')} className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-full text-[#10b981] shadow-sm"><DollarSign size={20} /></button>
            <div className="relative" ref={menuRef}>
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-full text-slate-300 shadow-sm"><LayoutGrid size={20} /></button>
                {isMenuOpen && (
                    <div className="absolute right-0 top-full mt-3 w-52 bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-[100] animate-in fade-in">
                        <button onClick={() => { navigate('/'); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-5 py-4 hover:bg-slate-800 text-left border-b border-slate-800/50"><Store size={18} className="text-blue-400" /> <span className="text-sm font-bold">Market</span></button>
                        <button onClick={() => { navigate('/settings'); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-5 py-4 hover:bg-slate-800 text-left border-b border-slate-800/50"><User size={18} className="text-purple-400" /> <span className="text-sm font-bold">Profil</span></button>
                        <button onClick={() => { navigate('/my-bots'); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-5 py-4 hover:bg-slate-800 text-left border-b border-slate-800/50"><BotIcon size={18} className="text-emerald-400" /> <span className="text-sm font-bold">Botlarım</span></button>
                        <button onClick={() => { navigate('/channels'); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 px-5 py-4 hover:bg-slate-800 text-left"><Megaphone size={18} className="text-orange-400" /> <span className="text-sm font-bold">Kanallarım</span></button>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
        <input 
          type="text" 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Botları ara..."
          className="w-full bg-[#0f172a]/80 border border-slate-800/80 rounded-2xl py-4.5 pl-12 pr-4 text-sm text-white focus:ring-1 ring-purple-500/50 outline-none placeholder:text-slate-600 transition-all shadow-inner"
        />
        {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"><X size={18}/></button>
        )}
      </div>

      {/* Admin Button */}
      <button 
        onClick={() => navigate('/a/admin')}
        className="w-full bg-[#1e293b]/40 border border-blue-500/30 text-blue-400 py-3.5 rounded-2xl text-[11px] font-black flex items-center justify-center gap-2 mb-8 tracking-wide uppercase"
      >
        <ShieldCheck size={16} />
        Yönetici Paneline Git
      </button>

      {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-purple-500" /></div>
      ) : (
          <>
            {/* Promo Sliders */}
            <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-4 px-4 mb-10 pb-2">
                {announcements.length > 0 ? announcements.map(ann => <PromoCard key={ann.id} ann={ann} />) : (
                    <div className="min-w-[300px] h-44 bg-slate-900 rounded-[32px] border border-slate-800 flex flex-col items-center justify-center gap-3">
                        <Star size={32} className="text-slate-700" />
                        <p className="text-slate-600 text-xs italic font-medium uppercase tracking-widest">BotlyHub Premium</p>
                    </div>
                )}
            </div>

            {/* Categories Grid (4x2 style) */}
            <div className="grid grid-cols-4 gap-3 mb-10">
                {categories.map((cat) => (
                    <button 
                        key={cat.id} 
                        onClick={() => navigate(`/search?category=${cat.id}`)}
                        className="flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl bg-[#0f172a]/50 border border-slate-800/80 hover:border-purple-500/50 transition-all active:scale-95 shadow-sm"
                    >
                        <cat.icon size={20} className="text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-500 tracking-tight text-center uppercase">{t(cat.label)}</span>
                    </button>
                ))}
            </div>

            {/* Recently Viewed */}
            {recentBots.length > 0 && !searchQuery && (
                <div className="mb-12 animate-in slide-in-from-bottom-2">
                    <div className="flex justify-between items-center mb-5 px-1">
                        <h2 className="text-lg font-black text-white tracking-tight">Son Bakılanlar</h2>
                        <button onClick={() => {localStorage.removeItem('recentlyViewed'); setRecentBots([]);}} className="text-xs font-bold text-blue-500 px-2 py-1">Temizle</button>
                    </div>
                    <div className="flex gap-5 overflow-x-auto no-scrollbar -mx-4 px-4">
                        {recentBots.map(bot => (
                            <div key={bot.id} onClick={() => navigate(`/bot/${bot.id}`)} className="min-w-[70px] flex flex-col items-center group cursor-pointer">
                                <img src={bot.icon} className="w-16 h-16 rounded-[24px] object-cover mb-2.5 border border-slate-800 shadow-xl group-hover:scale-105 transition-transform" />
                                <span className="text-[10px] font-bold text-slate-500 text-center truncate w-full group-hover:text-slate-200">{bot.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Sections */}
            <div className="space-y-12">
                <section>
                    <div className="flex justify-between items-center mb-5 px-1">
                        <h2 className="text-lg font-black text-white tracking-tight">Üretkenlik Botları</h2>
                        <button onClick={() => navigate('/search?category=productivity')} className="flex items-center gap-1.5 text-slate-500 group">
                            <span className="text-xs font-bold group-hover:text-slate-300 transition-colors">Tümü</span>
                            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </div>
                    <div className="space-y-2 bg-[#0f172a]/20 rounded-3xl p-1 border border-slate-900/80">
                        {productivityBots.length > 0 ? productivityBots.slice(0, 5).map(bot => <BotCard key={bot.id} bot={bot} />) : (
                            <div className="p-10 text-center text-slate-600 italic text-sm">Bu kategoride bot bulunamadı.</div>
                        )}
                    </div>
                </section>
            </div>

            {/* Footer Attribution */}
            <div className="mt-16 text-center border-t border-slate-900 pt-8">
                <p className="text-slate-800 text-[11px] font-black tracking-[0.2em] uppercase">@teest44_BOT</p>
            </div>
          </>
      )}
    </div>
  );
};

export default Home;

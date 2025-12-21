
import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronRight, LayoutGrid, DollarSign, Loader2, Store, User, Bot as BotIcon, Megaphone, X, Info, Sparkles, Zap, Gift, Star, Heart, Bell, Shield, TrendingUp } from 'lucide-react';
import * as Router from 'react-router-dom';
import { Bot, Announcement } from '../types';
import { categories } from '../data';
import { useTranslation } from '../TranslationContext';
import { DatabaseService } from '../services/DatabaseService';

const { useNavigate } = Router as any;

const iconMap: Record<string, any> = {
  Sparkles, Megaphone, Zap, Gift, Star, Info, BotIcon, Heart, Bell, Shield
};

const PromoCard: React.FC<{ ann: Announcement, onShowPopup: (ann: Announcement) => void }> = ({ ann, onShowPopup }) => {
  const navigate = useNavigate();
  const colors: Record<string, string> = {
    purple: 'from-[#6366f1] to-[#a855f7]',
    emerald: 'from-[#10b981] to-[#34d399]',
    blue: 'from-[#3b82f6] to-[#60a5fa]',
    orange: 'from-[#f59e0b] to-[#ef4444]'
  };

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (ann.action_type === 'popup') {
        onShowPopup(ann);
    } else {
        let link = ann.button_link;
        if (!link) return;
        
        if (link.startsWith('@')) {
            window.location.href = `https://t.me/${link.substring(1)}`;
        } else if (link.startsWith('http')) {
            window.location.href = link;
        } else if (link.startsWith('/')) {
            navigate(link);
        } else {
            window.location.href = `https://t.me/${link.replace('@','')}`;
        }
    }
  };

  return (
    <div 
        className={`min-w-[310px] h-48 bg-gradient-to-br ${colors[ann.color_scheme] || colors.purple} p-7 rounded-[40px] relative overflow-hidden shadow-2xl shrink-0 transition-all active:scale-[0.97] cursor-pointer group`}
        onClick={handleAction}
    >
        <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
                <h3 className="text-white font-black text-2xl mb-1.5 tracking-tight group-hover:translate-x-1 transition-transform">{ann.title}</h3>
                <p className="text-white/80 text-xs max-w-[210px] leading-relaxed line-clamp-2 font-semibold">{ann.description}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-md text-white text-[10px] font-black py-3 px-8 rounded-2xl w-fit border border-white/30 uppercase tracking-[0.2em] shadow-lg">
                {ann.button_text || 'Hemen İncele'}
            </div>
        </div>
        <div className="absolute -right-8 -bottom-8 opacity-20 transform rotate-12 group-hover:scale-110 transition-transform pointer-events-none">
            {React.createElement(iconMap[ann.icon_name] || Megaphone, { size: 180, className: 'text-white' })}
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
    <div onClick={handleClick} className="flex items-center p-4 cursor-pointer group hover:bg-slate-900/60 rounded-[28px] transition-all border border-transparent hover:border-slate-800/50 mb-2 active:bg-slate-900">
        <div className="relative shrink-0">
            <img src={bot.icon} alt={bot.name} className="w-20 h-20 rounded-[28px] object-cover bg-slate-900 shadow-2xl border border-slate-800 group-hover:scale-105 transition-transform" />
            {bot.price > 0 && (
                <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-yellow-500 rounded-lg flex items-center justify-center shadow-lg border-2 border-slate-950">
                    <Star size={12} fill="currentColor" className="text-slate-950" />
                </div>
            )}
        </div>
        <div className="flex-1 ml-5 min-w-0 mr-3">
            <div className="flex items-center gap-2 mb-1">
                <h3 className="font-black text-lg text-slate-100 truncate italic tracking-tight">{bot.name}</h3>
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest bg-slate-800 px-2 py-0.5 rounded-md">
                    {t('cat_' + (bot.category || '').toLowerCase())}
                </span>
            </div>
            <p className="text-xs text-slate-500 truncate font-medium">{bot.description}</p>
        </div>
        <div className="bg-slate-800/60 p-2 rounded-full border border-slate-700/50 text-slate-400 group-hover:text-white group-hover:bg-blue-600 group-hover:border-blue-500 transition-all">
            <ChevronRight size={18} />
        </div>
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [bots, setBots] = useState<Bot[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnn, setSelectedAnn] = useState<Announcement | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const loadData = async (catId: string = 'all') => {
    setIsLoading(true);
    const [botData, annData] = await Promise.all([
        DatabaseService.getBots(catId),
        DatabaseService.getAnnouncements()
    ]);
    setBots(botData);
    if (annData.length > 0) setAnnouncements(annData.filter(a => a.is_active));
    setIsLoading(false);
  };

  useEffect(() => {
    loadData(activeCategory);
    const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setIsMenuOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeCategory]);

  const filteredBots = bots.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 pt-10 min-h-screen bg-[#020617] pb-32 font-sans text-slate-200">
      {/* Dynamic Header */}
      <div className="flex justify-between items-center mb-10 px-1 relative">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#7c3aed] rounded-[20px] flex items-center justify-center shadow-2xl shadow-purple-500/20 rotate-3 group">
                <BotIcon size={24} className="text-white group-hover:scale-110 transition-transform" />
            </div>
            <div>
                <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic leading-none">Botly<span className="text-blue-500">Hub</span></h1>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1 italic">Premium Store</p>
            </div>
        </div>
        <div className="flex items-center gap-3">
            <button onClick={() => navigate('/earnings')} className="p-3 bg-slate-900/60 border border-slate-800 rounded-2xl text-emerald-400 shadow-xl active:scale-90 transition-transform"><DollarSign size={22} /></button>
            <div className="relative" ref={menuRef}>
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-3 bg-slate-900/60 border border-slate-800 rounded-2xl text-slate-300 shadow-xl active:scale-90 transition-transform"><LayoutGrid size={22} /></button>
                {isMenuOpen && (
                    <div className="absolute right-0 top-full mt-4 w-56 bg-[#0f172a] border border-slate-800 rounded-[28px] shadow-2xl overflow-hidden z-[100] animate-in fade-in py-2">
                        <button onClick={() => { navigate('/'); setIsMenuOpen(false); }} className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-800/60 text-left"><Store size={20} className="text-blue-400" /> <span className="text-sm font-black uppercase tracking-tight">{t('market')}</span></button>
                        <button onClick={() => { navigate('/settings'); setIsMenuOpen(false); }} className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-800/60 text-left"><User size={20} className="text-purple-400" /> <span className="text-sm font-black uppercase tracking-tight">{t('profile')}</span></button>
                        <button onClick={() => { navigate('/my-bots'); setIsMenuOpen(false); }} className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-800/60 text-left"><BotIcon size={20} className="text-emerald-400" /> <span className="text-sm font-black uppercase tracking-tight">{t('my_bots')}</span></button>
                        <button onClick={() => { navigate('/channels'); setIsMenuOpen(false); }} className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-800/60 text-left"><Megaphone size={20} className="text-orange-400" /> <span className="text-sm font-black uppercase tracking-tight">{t('my_channels')}</span></button>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Modern Search */}
      <div className="relative mb-10 group">
        <div className="absolute inset-0 bg-blue-500/5 blur-3xl rounded-[32px] opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
        <div className="relative flex items-center bg-[#0f172a]/80 backdrop-blur-xl border border-slate-800 rounded-[28px] p-1.5 shadow-2xl focus-within:border-blue-500/50 transition-all">
            <Search className="ml-5 text-slate-600 w-5 h-5" />
            <input 
              type="text" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search_placeholder')}
              className="w-full bg-transparent py-4 px-4 text-sm text-white outline-none placeholder:text-slate-600 font-bold"
            />
        </div>
      </div>

      {isLoading && bots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="animate-spin text-purple-500" size={32} />
              <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.5em] animate-pulse">Syncing Hub...</p>
          </div>
      ) : (
          <>
            {!searchQuery && activeCategory === 'all' && announcements.length > 0 && (
                <div className="mb-12">
                    <div className="flex justify-between items-center mb-6 px-2">
                        <h2 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.4em] flex items-center gap-3">
                            <TrendingUp size={14} className="text-blue-500" /> {t('featured')}
                        </h2>
                    </div>
                    <div className="flex gap-6 overflow-x-auto no-scrollbar -mx-4 px-4 pb-4">
                        {announcements.map(ann => <PromoCard key={ann.id} ann={ann} onShowPopup={(a) => setSelectedAnn(a)} />)}
                    </div>
                </div>
            )}

            {/* Categories */}
            <div className="grid grid-cols-4 gap-3 mb-12">
                {categories.map((cat) => (
                    <button 
                        key={cat.id} 
                        onClick={() => setActiveCategory(cat.id)}
                        className={`flex flex-col items-center justify-center gap-3 py-6 rounded-[28px] border-2 transition-all active:scale-95 shadow-xl ${
                            activeCategory === cat.id 
                            ? 'bg-blue-600/10 border-blue-500/40 text-blue-400' 
                            : 'bg-[#0f172a]/40 border-slate-900/50 text-slate-600 hover:border-slate-800'
                        }`}
                    >
                        <cat.icon size={22} className={activeCategory === cat.id ? 'text-blue-400' : 'text-slate-500'} />
                        <span className="text-[9px] font-black tracking-widest text-center uppercase">{t(cat.label)}</span>
                    </button>
                ))}
            </div>

            {/* Content List */}
            <div className="space-y-1">
                <div className="flex justify-between items-center mb-8 px-2">
                    <h2 className="text-[11px] font-black text-slate-600 uppercase tracking-[0.4em]">
                        {searchQuery ? t('search_results') : (activeCategory === 'all' ? 'Tüm Botlar' : t(categories.find(c => c.id === activeCategory)?.label || ''))}
                    </h2>
                </div>
                {filteredBots.length > 0 ? (
                    filteredBots.map(bot => <BotCard key={bot.id} bot={bot} />)
                ) : (
                    <div className="py-24 text-center flex flex-col items-center gap-6 bg-slate-900/20 rounded-[40px] border-2 border-dashed border-slate-900">
                        <BotIcon size={48} className="text-slate-900" />
                        <p className="text-slate-700 font-black uppercase text-xs tracking-widest italic">{t('no_results')}</p>
                    </div>
                )}
            </div>
          </>
      )}

      {/* Modern Modal */}
      {selectedAnn && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md animate-in fade-in" onClick={() => setSelectedAnn(null)}>
            <div className="bg-[#0f172a] w-full max-w-sm rounded-[40px] overflow-hidden shadow-2xl relative border border-slate-800" onClick={e => e.stopPropagation()}>
                <div className="w-full h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500" />
                <button onClick={() => setSelectedAnn(null)} className="absolute top-6 right-6 p-2 bg-slate-900 rounded-xl text-slate-500 hover:text-white transition-colors"><X size={18}/></button>
                <div className="p-10 text-center">
                    <div className="w-16 h-16 bg-[#1e293b] border-2 border-slate-800 rounded-[24px] flex items-center justify-center mx-auto mb-8 shadow-inner">
                        {React.createElement(iconMap[selectedAnn.icon_name] || Sparkles, { size: 32, className: 'text-blue-400' })}
                    </div>
                    <h3 className="text-2xl font-black text-white mb-3 tracking-tighter uppercase italic">{selectedAnn.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed font-medium mb-10 whitespace-pre-line">
                        {selectedAnn.content_detail || selectedAnn.description}
                    </p>
                    <button 
                        onClick={() => {
                            let link = selectedAnn.button_link;
                            if (link.startsWith('@')) {
                                window.location.href = `https://t.me/${link.substring(1)}`;
                            } else if (link.startsWith('http')) {
                                window.location.href = link;
                            } else if (link.startsWith('/')) {
                                navigate(link);
                            } else {
                                window.location.href = `https://t.me/${link.replace('@','')}`;
                            }
                            setSelectedAnn(null);
                        }}
                        className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-blue-900/40 transition-all active:scale-95"
                    >
                        {selectedAnn.button_text || 'Hemen Başla'}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Home;

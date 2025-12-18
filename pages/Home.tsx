
import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, ChevronRight, LayoutGrid, DollarSign, Loader2, ShieldCheck, Star, Store, User, Bot as BotIcon, Megaphone, X, Zap, Gift, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Bot, Announcement } from '../types';
import { categories } from '../data';
import { useTranslation } from '../TranslationContext';
import { DatabaseService } from '../services/DatabaseService';

const iconMap: Record<string, any> = {
  Sparkles, Megaphone, Zap, Gift, Star, Info, BotIcon
};

const PromoCard = ({ ann, onShowPopup }: { ann: Announcement, onShowPopup: (ann: Announcement) => void }) => {
  const navigate = useNavigate();
  const colors: Record<string, string> = {
    purple: 'from-[#6366f1] to-[#a855f7]',
    emerald: 'from-[#10b981] to-[#34d399]',
    blue: 'from-[#3b82f6] to-[#60a5fa]',
    orange: 'from-[#f59e0b] to-[#ef4444]'
  };

  const IconComp = iconMap[ann.icon_name] || Sparkles;

  const handleAction = () => {
    if (ann.action_type === 'popup') {
        onShowPopup(ann);
    } else {
        if (ann.button_link.startsWith('/')) navigate(ann.button_link);
        else window.open(ann.button_link);
    }
  };

  return (
    <div className={`min-w-[300px] h-44 bg-gradient-to-br ${colors[ann.color_scheme] || colors.purple} p-6 rounded-[32px] relative overflow-hidden shadow-2xl shrink-0 transition-transform active:scale-[0.98] cursor-pointer`} onClick={handleAction}>
        <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
                <h3 className="text-white font-black text-2xl mb-1">{ann.title}</h3>
                <p className="text-white/80 text-xs max-w-[200px] leading-snug line-clamp-2">{ann.description}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-md text-white text-[11px] font-bold py-2 px-5 rounded-xl w-fit border border-white/30">
                {ann.button_text || 'İncele'}
            </div>
        </div>
        <div className="absolute -right-6 -bottom-6 opacity-20 transform rotate-12 pointer-events-none">
            <IconComp size={160} className="text-white" />
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
    <div onClick={handleClick} className="flex items-center py-4 px-3 cursor-pointer group hover:bg-slate-900/60 rounded-2xl transition-all border border-transparent hover:border-slate-800/50 mb-1">
        <img src={bot.icon} alt={bot.name} className="w-16 h-16 rounded-[22px] object-cover bg-slate-900 shadow-xl border border-slate-800" />
        <div className="flex-1 ml-4 min-w-0 mr-2">
            <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-bold text-base text-slate-100 truncate">{bot.name}</h3>
                {bot.price > 0 && <span className="bg-indigo-500/10 text-indigo-400 text-[9px] font-bold px-1.5 py-0.5 rounded border border-indigo-500/20 uppercase tracking-tighter">Premium</span>}
            </div>
            <p className="text-xs text-slate-500 truncate">{bot.description}</p>
        </div>
        <button className="bg-slate-800/80 text-white text-[11px] font-black py-2.5 px-6 rounded-full border border-slate-700/50 shadow-sm active:scale-90 transition-transform">
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
    if (annData.length > 0) setAnnouncements(annData);
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
    <div className="p-4 pt-8 min-h-screen bg-[#020617] pb-24 font-sans text-slate-200">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 px-1 relative">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#7c3aed] rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                <div className="w-5 h-5 border-2 border-white rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
            </div>
            <h1 className="text-xl font-black text-white tracking-tight">BotlyHub V3</h1>
        </div>
        <div className="flex items-center gap-3">
            <button onClick={() => navigate('/earnings')} className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-full text-[#10b981] shadow-sm active:scale-95 transition-transform"><DollarSign size={20} /></button>
            <div className="relative" ref={menuRef}>
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-full text-slate-300 shadow-sm active:scale-95 transition-transform"><LayoutGrid size={20} /></button>
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

      {/* Modern Search Bar */}
      <div className="relative mb-6 group">
        <div className="absolute inset-0 bg-blue-500/5 blur-xl rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
        <div className="relative flex items-center bg-[#0f172a]/60 backdrop-blur-md border border-slate-800/80 rounded-[22px] p-1 shadow-inner focus-within:border-blue-500/40 transition-all">
            <Search className="ml-4 text-slate-500 w-5 h-5" />
            <input 
              type="text" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Hangi botu arıyorsun?"
              className="w-full bg-transparent py-4 px-3 text-sm text-white outline-none placeholder:text-slate-600 font-medium"
            />
            {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="mr-3 p-1 text-slate-500 hover:text-white bg-slate-800/50 rounded-lg"><X size={16}/></button>
            )}
        </div>
      </div>

      {isLoading && bots.length === 0 ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-purple-500" /></div>
      ) : (
          <>
            {/* Promo Sliders */}
            {!searchQuery && activeCategory === 'all' && announcements.length > 0 && (
                <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-4 px-4 mb-10 pb-2">
                    {announcements.map(ann => <PromoCard key={ann.id} ann={ann} onShowPopup={(a) => setSelectedAnn(a)} />)}
                </div>
            )}

            {/* Categories Grid */}
            <div className="grid grid-cols-4 gap-3 mb-10">
                {categories.map((cat) => (
                    <button 
                        key={cat.id} 
                        onClick={() => setActiveCategory(cat.id)}
                        className={`flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl border transition-all active:scale-95 shadow-sm ${
                            activeCategory === cat.id 
                            ? 'bg-blue-600/10 border-blue-500/50 text-blue-400' 
                            : 'bg-[#0f172a]/50 border-slate-800/80 text-slate-500'
                        }`}
                    >
                        <cat.icon size={20} className={activeCategory === cat.id ? 'text-blue-400' : 'text-slate-400'} />
                        <span className="text-[9px] font-black tracking-tighter text-center uppercase">{t(cat.label)}</span>
                    </button>
                ))}
            </div>

            {/* Results Header */}
            <div className="flex justify-between items-center mb-6 px-1">
                <h2 className="text-lg font-black text-white tracking-tight">
                    {searchQuery ? 'Arama Sonuçları' : (activeCategory === 'all' ? 'Öne Çıkan Botlar' : `${t(categories.find(c => c.id === activeCategory)?.label || '')} Botları`)}
                </h2>
            </div>

            {/* Bot List */}
            <div className="space-y-1">
                {filteredBots.length > 0 ? (
                    filteredBots.map(bot => <BotCard key={bot.id} bot={bot} />)
                ) : (
                    <div className="py-20 text-center flex flex-col items-center gap-4 bg-slate-900/20 rounded-[40px] border border-dashed border-slate-800">
                        <div className="p-6 bg-slate-900 rounded-full text-slate-700">
                             <Search size={40} />
                        </div>
                        <p className="text-slate-400 font-bold">Bot bulunamadı.</p>
                    </div>
                )}
            </div>

            {/* Footer Attribution */}
            <div className="mt-16 text-center border-t border-slate-900 pt-8 pb-4">
                <p className="text-slate-800 text-[10px] font-black tracking-[0.3em] uppercase">@teest44_BOT</p>
            </div>
          </>
      )}

      {/* Announcement Popup Modal */}
      {selectedAnn && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in fade-in" onClick={() => setSelectedAnn(null)}>
            <div className="bg-[#0f172a] border border-slate-800 w-full max-w-sm rounded-[40px] p-8 shadow-2xl relative overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${
                    selectedAnn.color_scheme === 'purple' ? 'from-indigo-500 to-purple-500' :
                    selectedAnn.color_scheme === 'emerald' ? 'from-emerald-500 to-teal-500' :
                    'from-blue-500 to-cyan-500'
                }`} />
                
                <button onClick={() => setSelectedAnn(null)} className="absolute top-6 right-6 text-slate-500 hover:text-white p-2 bg-slate-800/50 rounded-full transition-colors"><X size={20}/></button>
                
                <div className="mb-8 pt-4">
                    <div className="w-16 h-16 bg-slate-900 rounded-[24px] border border-slate-800 flex items-center justify-center mb-6">
                        {React.createElement(iconMap[selectedAnn.icon_name] || Sparkles, { size: 32, className: 'text-blue-400' })}
                    </div>
                    <h3 className="text-2xl font-black text-white mb-3">{selectedAnn.title}</h3>
                    <div className="text-slate-400 text-sm leading-relaxed max-h-[40vh] overflow-y-auto no-scrollbar whitespace-pre-line">
                        {selectedAnn.content_detail || selectedAnn.description}
                    </div>
                </div>
                
                {selectedAnn.button_link && (
                    <button 
                        onClick={() => {
                            if (selectedAnn.button_link.startsWith('/')) navigate(selectedAnn.button_link);
                            else window.open(selectedAnn.button_link);
                            setSelectedAnn(null);
                        }}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-xl shadow-blue-900/20 transition-all active:scale-95"
                    >
                        {selectedAnn.button_text || 'Hemen Göz At'}
                    </button>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default Home;

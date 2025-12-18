
import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronRight, LayoutGrid, DollarSign, Loader2, Store, User, Bot as BotIcon, Megaphone, X, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Bot, Announcement } from '../types';
import { categories } from '../data';
import { useTranslation } from '../TranslationContext';
import { DatabaseService } from '../services/DatabaseService';

const PromoCard = ({ ann, onShowPopup }: { ann: Announcement, onShowPopup: (ann: Announcement) => void }) => {
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
        const link = ann.button_link;
        if (link.startsWith('http')) {
            window.open(link, '_blank');
        } else if (link.startsWith('/')) {
            navigate(link);
        } else {
            // Telegram bot linki veya dahili rota
            window.location.href = link;
        }
    }
  };

  return (
    <div 
        className={`min-w-[280px] h-40 bg-gradient-to-br ${colors[ann.color_scheme] || colors.purple} p-6 rounded-[28px] relative overflow-hidden shadow-xl shrink-0 transition-all active:scale-[0.97] cursor-pointer group`}
        onClick={handleAction}
    >
        {/* Abstract Overlays for Pro look */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700"></div>
        
        <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-1 block">Öne Çıkan</span>
                <h3 className="text-white font-black text-xl mb-1 leading-tight">{ann.title}</h3>
                <p className="text-white/70 text-xs max-w-[180px] line-clamp-2 font-medium leading-snug">{ann.description}</p>
            </div>
            <div className="flex items-center gap-2 text-white text-[11px] font-black uppercase tracking-widest bg-black/20 w-fit py-2.5 px-5 rounded-xl border border-white/10 backdrop-blur-sm group-hover:bg-white group-hover:text-slate-900 transition-colors">
                {ann.button_text || 'İncele'}
                <ChevronRight size={14} />
            </div>
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
    <div onClick={handleClick} className="flex items-center py-4 px-3 cursor-pointer group hover:bg-slate-900/40 rounded-2xl transition-all border border-transparent hover:border-slate-800/50 mb-0.5">
        <img src={bot.icon} alt={bot.name} className="w-14 h-14 rounded-2xl object-cover bg-slate-900 shadow-lg border border-slate-800 flex-shrink-0" />
        <div className="flex-1 ml-4 min-w-0 mr-2">
            <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-bold text-[15px] text-slate-100 truncate">{bot.name}</h3>
                {bot.price > 0 && <span className="bg-blue-500/10 text-blue-400 text-[8px] font-black px-1.5 py-0.5 rounded border border-blue-500/20 uppercase tracking-tighter">Premium</span>}
            </div>
            <p className="text-xs text-slate-500 truncate font-medium">{bot.description}</p>
        </div>
        <button className="bg-slate-800/60 text-white text-[10px] font-black py-2 px-5 rounded-full border border-slate-700/50 active:scale-90 transition-transform uppercase tracking-widest">
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
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <BotIcon size={20} className="text-white" />
            </div>
            <h1 className="text-lg font-black text-white tracking-tight">BotlyHub <span className="text-blue-500">V3</span></h1>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={() => navigate('/earnings')} className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-emerald-400 active:scale-95 transition-transform"><DollarSign size={18} /></button>
            <div className="relative" ref={menuRef}>
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-300 active:scale-95 transition-transform"><LayoutGrid size={18} /></button>
                {isMenuOpen && (
                    <div className="absolute right-0 top-full mt-3 w-52 bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-[100] animate-in">
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
      <div className="relative mb-8 group">
        <div className="relative flex items-center bg-[#0f172a]/60 backdrop-blur-md border border-slate-800 rounded-2xl p-0.5 transition-all focus-within:ring-2 ring-blue-500/20">
            <Search className="ml-4 text-slate-500 w-4 h-4" />
            <input 
              type="text" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Hangi botu arıyorsun?"
              className="w-full bg-transparent py-4 px-3 text-sm text-white outline-none placeholder:text-slate-600 font-medium"
            />
            {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="mr-3 p-1.5 text-slate-500 hover:text-white bg-slate-800/50 rounded-lg"><X size={14}/></button>
            )}
        </div>
      </div>

      {isLoading && bots.length === 0 ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" /></div>
      ) : (
          <>
            {/* Promo Sliders */}
            {!searchQuery && activeCategory === 'all' && announcements.length > 0 && (
                <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-4 px-4 mb-10 pb-2">
                    {announcements.map(ann => <PromoCard key={ann.id} ann={ann} onShowPopup={(a) => setSelectedAnn(a)} />)}
                </div>
            )}

            {/* Categories Slider (Horizontal) */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar mb-8 -mx-4 px-4">
                {categories.map((cat) => (
                    <button 
                        key={cat.id} 
                        onClick={() => setActiveCategory(cat.id)}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl border transition-all whitespace-nowrap active:scale-95 ${
                            activeCategory === cat.id 
                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-900/20' 
                            : 'bg-slate-900/50 border-slate-800 text-slate-400'
                        }`}
                    >
                        <cat.icon size={16} />
                        <span className="text-xs font-bold tracking-tight">{t(cat.label)}</span>
                    </button>
                ))}
            </div>

            {/* Bot List */}
            <div className="space-y-1">
                <div className="flex items-center justify-between mb-4 px-1">
                    <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest">
                        {searchQuery ? 'Arama Sonuçları' : (activeCategory === 'all' ? 'Öne Çıkanlar' : `${t(categories.find(c => c.id === activeCategory)?.label || '')}`)}
                    </h2>
                </div>
                {filteredBots.length > 0 ? (
                    filteredBots.map(bot => <BotCard key={bot.id} bot={bot} />)
                ) : (
                    <div className="py-20 text-center flex flex-col items-center gap-4 bg-slate-900/20 rounded-[40px] border border-dashed border-slate-800">
                        <Search size={40} className="text-slate-700" />
                        <p className="text-slate-500 font-bold text-sm">Eşleşen bot bulunamadı.</p>
                    </div>
                )}
            </div>

            {/* Footer Attribution */}
            <div className="mt-16 text-center border-t border-slate-900 pt-8 pb-4">
                <p className="text-slate-800 text-[9px] font-black tracking-[0.5em] uppercase">BOTLYHUB SYSTEM v3.5</p>
            </div>
          </>
      )}

      {/* Announcement Popup Modal */}
      {selectedAnn && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/95 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedAnn(null)}>
            <div className="bg-[#0f172a] border border-slate-800 w-full max-w-sm rounded-[40px] p-10 shadow-2xl relative overflow-hidden" onClick={e => e.stopPropagation()}>
                <button onClick={() => setSelectedAnn(null)} className="absolute top-6 right-6 text-slate-500 hover:text-white p-2 bg-slate-800/50 rounded-full transition-colors"><X size={18}/></button>
                
                <div className="mb-8 pt-4">
                    <div className="w-16 h-16 bg-blue-600/10 rounded-[28px] border border-blue-500/20 flex items-center justify-center mb-6">
                        <Info size={32} className="text-blue-500" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-3 tracking-tight">{selectedAnn.title}</h3>
                    <div className="text-slate-400 text-sm leading-relaxed max-h-[40vh] overflow-y-auto no-scrollbar whitespace-pre-line font-medium">
                        {selectedAnn.content_detail || selectedAnn.description}
                    </div>
                </div>
                
                {selectedAnn.button_link && (
                    <button 
                        onClick={() => {
                            if (selectedAnn.button_link.startsWith('http')) window.open(selectedAnn.button_link, '_blank');
                            else navigate(selectedAnn.button_link);
                            setSelectedAnn(null);
                        }}
                        className="w-full py-4.5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-xl shadow-blue-900/20 transition-all active:scale-95 text-sm uppercase tracking-widest"
                    >
                        {selectedAnn.button_text || 'Anladım'}
                    </button>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default Home;

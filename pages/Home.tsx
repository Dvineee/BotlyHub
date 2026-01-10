
import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronRight, LayoutGrid, DollarSign, Loader2, Store, User, Bot as BotIcon, Megaphone, X, Info, Sparkles, Zap, Gift, Star, Heart, Bell, Shield, TrendingUp } from 'lucide-react';
import * as Router from 'react-router-dom';
import { Bot, Announcement, Notification } from '../types';
import { categories } from '../data';
import { useTranslation } from '../TranslationContext';
import { DatabaseService } from '../services/DatabaseService';
import PriceService from '../services/PriceService';
import { useTelegram } from '../hooks/useTelegram';

const { useNavigate } = Router as any;

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
        if (link.startsWith('@')) window.location.href = `https://t.me/${link.substring(1)}`;
        else if (link.startsWith('http')) window.location.href = link;
        else if (link.startsWith('/')) navigate(link);
        else window.location.href = `https://t.me/${link.replace('@','')}`;
    }
  };

  return (
    <div 
        className={`min-w-[310px] h-44 bg-gradient-to-br ${colors[ann.color_scheme] || colors.purple} p-7 rounded-[40px] relative overflow-hidden shadow-2xl shrink-0 transition-all active:scale-[0.97] cursor-pointer group`}
        onClick={handleAction}
    >
        <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
                <h3 className="text-white font-black text-2xl mb-1.5 tracking-tight group-hover:translate-x-1 transition-transform">{ann.title}</h3>
                <p className="text-white/80 text-[11px] max-w-[210px] leading-relaxed line-clamp-2 font-bold uppercase">{ann.description}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-md text-white text-[9px] font-black py-3 px-8 rounded-2xl w-fit border border-white/30 uppercase tracking-[0.2em] shadow-lg">
                {ann.button_text || 'İncele'}
            </div>
        </div>
        <div className="absolute -right-8 -bottom-8 opacity-20 transform rotate-12 group-hover:scale-110 transition-transform pointer-events-none">
            {React.createElement(iconMap[ann.icon_name] || Megaphone, { size: 180, className: 'text-white' })}
        </div>
    </div>
  );
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
        <div className="bg-slate-800/60 p-2.5 rounded-2xl border border-slate-700/50 text-slate-400 group-hover:text-white group-hover:bg-blue-600 group-hover:border-blue-500 transition-all">
            <ChevronRight size={18} />
        </div>
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useTelegram();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [bots, setBots] = useState<Bot[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [tonRate, setTonRate] = useState(250);
  const [selectedAnn, setSelectedAnn] = useState<Announcement | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const loadData = async () => {
    setIsLoading(true);
    const [botData, annData, pData] = await Promise.all([
        DatabaseService.getBots(),
        DatabaseService.getAnnouncements(),
        PriceService.getTonPrice()
    ]);
    
    setBots(botData);
    setTonRate(pData.tonTry);
    if (annData.length > 0) setAnnouncements(annData.filter(a => a.is_active));
    
    // Okunmamış bildirimleri kontrol et
    if (user?.id) {
        const notes = await DatabaseService.getNotifications(user.id.toString());
        const unread = notes.filter(n => !n.isRead).length;
        setUnreadCount(unread);
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
    const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [user]);

  return (
    <div className="p-4 pt-10 min-h-screen bg-[#020617] pb-32 font-sans text-slate-200">
      <div className="flex justify-between items-center mb-10 px-1 relative">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-[20px] flex items-center justify-center shadow-2xl rotate-3">
                <BotIcon size={24} className="text-white" />
            </div>
            <div>
                <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic leading-none">Botly<span className="text-blue-500">Hub</span></h1>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1 italic">V3 PREMİUM</p>
            </div>
        </div>
        <div className="flex items-center gap-3">
            <button onClick={() => navigate('/earnings')} className="p-3 bg-slate-900/60 border border-slate-800 rounded-2xl text-emerald-400 active:scale-90 transition-transform"><DollarSign size={22} /></button>
            <div className="relative" ref={menuRef}>
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)} 
                  className="p-3 bg-slate-900/60 border border-slate-800 rounded-2xl text-slate-300 active:scale-90 transition-transform relative"
                >
                    <LayoutGrid size={22} />
                    {/* Bildirim Sayaç Rozeti (Badge) */}
                    {unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-600 rounded-full border-2 border-[#020617] text-[8px] font-black text-white flex items-center justify-center px-1 animate-pulse shadow-lg">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </div>
                    )}
                </button>
                {isMenuOpen && (
                    <div className="absolute right-0 top-full mt-4 w-56 bg-[#020617] border border-slate-800 rounded-[28px] shadow-2xl overflow-hidden z-[100] animate-in fade-in py-2">
                        <button onClick={() => { navigate('/'); setIsMenuOpen(false); }} className="w-full flex items-center gap-4 px-6 py-4 hover:bg-white/5 text-left"><Store size={20} className="text-blue-400" /> <span className="text-[11px] font-black uppercase tracking-tight">{t('market')}</span></button>
                        <button onClick={() => { navigate('/settings'); setIsMenuOpen(false); }} className="w-full flex items-center gap-4 px-6 py-4 hover:bg-white/5 text-left"><User size={20} className="text-purple-400" /> <span className="text-[11px] font-black uppercase tracking-tight">{t('profile')}</span></button>
                        <button onClick={() => { navigate('/my-bots'); setIsMenuOpen(false); }} className="w-full flex items-center gap-4 px-6 py-4 hover:bg-white/5 text-left"><BotIcon size={20} className="text-emerald-400" /> <span className="text-[11px] font-black uppercase tracking-tight">{t('my_bots')}</span></button>
                        <button onClick={() => { navigate('/channels'); setIsMenuOpen(false); }} className="w-full flex items-center gap-4 px-6 py-4 hover:bg-white/5 text-left"><Megaphone size={20} className="text-orange-400" /> <span className="text-[11px] font-black uppercase tracking-tight">{t('my_channels')}</span></button>
                        <button onClick={() => { navigate('/notifications'); setIsMenuOpen(false); }} className="w-full flex items-center gap-4 px-6 py-4 hover:bg-white/5 text-left relative">
                            <Bell size={20} className="text-blue-500" /> 
                            <span className="text-[11px] font-black uppercase tracking-tight">{t('notifications')}</span>
                            {unreadCount > 0 && <div className="absolute right-6 w-2 h-2 bg-red-600 rounded-full"></div>}
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>

      <div className="relative mb-10 cursor-pointer" onClick={() => navigate('/search')}>
        <div className="relative flex items-center bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[28px] p-1 shadow-2xl transition-all active:scale-95">
            <Search className="ml-5 text-slate-600 w-5 h-5" />
            <div className="w-full py-4 px-4 text-xs text-slate-600 font-bold uppercase tracking-widest">{t('search_placeholder')}</div>
        </div>
      </div>

      {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4"><Loader2 className="animate-spin text-blue-500" size={32} /></div>
      ) : (
          <>
            {announcements.length > 0 && (
                <div className="mb-12">
                    <h2 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-6 flex items-center gap-3"><TrendingUp size={14} className="text-blue-500" /> {t('featured')}</h2>
                    <div className="flex gap-6 overflow-x-auto no-scrollbar -mx-4 px-4 pb-4 snap-x">
                        {announcements.map(ann => <PromoCard key={ann.id} ann={ann} onShowPopup={(a) => setSelectedAnn(a)} />)}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-4 gap-3 mb-12">
                {categories.map((cat) => (
                    <button 
                        key={cat.id} 
                        onClick={() => navigate(`/search?category=${cat.id}`)}
                        className="flex flex-col items-center justify-center gap-3 py-6 rounded-[28px] border bg-slate-900/40 border-white/5 text-slate-600 hover:border-slate-800 transition-all active:scale-95 shadow-xl"
                    >
                        <cat.icon size={22} className="text-slate-500" />
                        <span className="text-[8px] font-black tracking-widest text-center uppercase">{t(cat.label)}</span>
                    </button>
                ))}
            </div>

            <div className="space-y-1">
                <h2 className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em] mb-8">Mağaza Vitrini</h2>
                {bots.length > 0 ? bots.map(bot => <BotCard key={bot.id} bot={bot} tonRate={tonRate} />) : <div className="py-24 text-center text-slate-700 font-bold uppercase text-xs tracking-widest">Sonuç yok.</div>}
            </div>
          </>
      )}

      {/* SADELEŞTİRİLMİŞ MODAL TASARIMI */}
      {selectedAnn && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedAnn(null)}>
            <div className="bg-slate-900/90 w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl relative border border-white/10 backdrop-blur-xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                <button onClick={() => setSelectedAnn(null)} className="absolute top-4 right-4 p-2 bg-white/5 rounded-xl text-slate-500 hover:text-white transition-colors"><X size={16}/></button>
                <div className="p-8 text-center">
                    <div className="w-14 h-14 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        {React.createElement(iconMap[selectedAnn.icon_name] || Sparkles, { size: 24, className: 'text-blue-400' })}
                    </div>
                    <h3 className="text-xl font-black text-white mb-2 tracking-tight uppercase italic">{selectedAnn.title}</h3>
                    <p className="text-slate-400 text-[10px] leading-relaxed font-bold uppercase mb-8 line-clamp-3 px-2">{selectedAnn.content_detail || selectedAnn.description}</p>
                    <button 
                        onClick={() => { window.location.href = selectedAnn.button_link.startsWith('http') ? selectedAnn.button_link : `https://t.me/${selectedAnn.button_link.replace('@','')}`; setSelectedAnn(null); }} 
                        className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all"
                    >
                        {selectedAnn.button_text || 'Hemen Katıl'}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Home;

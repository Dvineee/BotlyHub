
import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronRight, LayoutGrid, DollarSign, Loader2, Store, User, Bot as BotIcon, Megaphone, X, Info, Sparkles, Zap, Gift, Star, Heart, Bell, Shield, TrendingUp, Radio, PlusSquare } from 'lucide-react';
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
    if (ann.action_type === 'popup') onShowPopup(ann);
    else {
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
                <h3 className="text-white font-black text-2xl mb-1.5 tracking-tight italic uppercase">{ann.title}</h3>
                <p className="text-white/80 text-[11px] max-w-[210px] leading-relaxed line-clamp-2 font-bold uppercase italic">{ann.description}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-md text-white text-[8px] font-black py-2.5 px-6 rounded-xl w-fit border border-white/30 uppercase tracking-[0.2em]">
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
    <div onClick={() => navigate(`/bot/${bot.id}`)} className="flex items-center p-5 cursor-pointer group hover:bg-slate-900/60 rounded-[32px] transition-all border border-transparent hover:border-slate-800/50 mb-3 active:bg-slate-900 shadow-xl">
        <div className="relative shrink-0">
            <img 
                src={getLiveBotIcon(bot)} 
                alt={bot.name} 
                className="w-20 h-20 rounded-[28px] object-cover bg-slate-900 border border-slate-800 group-hover:scale-105 transition-transform" 
                onError={(e) => { (e.target as any).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(bot.name)}&background=334155&color=fff&bold=true`; }}
            />
            {bot.price > 0 && (
                <div className="absolute -top-1.5 -right-1.5 w-7 h-7 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg border-4 border-[#020617]">
                    <Zap size={10} fill="currentColor" className="text-white" />
                </div>
            )}
        </div>
        <div className="flex-1 ml-5 min-w-0 mr-3">
            <h3 className="font-black text-lg text-slate-100 truncate italic tracking-tighter uppercase leading-none mb-1.5">{bot.name}</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate mb-2 italic">{bot.description}</p>
            <div className="flex items-center gap-3">
                {bot.price === 0 ? (
                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">Ücretsiz</span>
                ) : (
                    <div className="flex items-center gap-2 px-2 py-1 bg-blue-500/10 rounded-md border border-blue-500/20">
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
  const { user, haptic } = useTelegram();
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
    <div className="p-4 pt-10 min-h-screen bg-[#020617] pb-32 font-sans text-slate-200 animate-in">
      <div className="flex justify-between items-center mb-10 px-1 relative">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-[20px] flex items-center justify-center shadow-2xl rotate-3">
                <BotIcon size={24} className="text-white" />
            </div>
            <div>
                <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic leading-none">Botly<span className="text-blue-500">Hub</span></h1>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1 italic">V3 PREMİUM ENGINE</p>
            </div>
        </div>
        <div className="flex items-center gap-3">
            <button onClick={() => { haptic('medium'); navigate('/earnings'); }} className="p-3 bg-slate-900/60 border border-slate-800 rounded-2xl text-emerald-400 active:scale-90 transition-transform"><DollarSign size={22} /></button>
            <div className="relative" ref={menuRef}>
                <button 
                  onClick={() => { haptic('light'); setIsMenuOpen(!isMenuOpen); }} 
                  className="p-3 bg-slate-900/60 border border-slate-800 rounded-2xl text-slate-300 active:scale-90 transition-transform relative"
                >
                    <LayoutGrid size={22} />
                    {unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 min-w-[20px] h-[20px] bg-red-600 rounded-full border-2 border-[#020617] text-[9px] font-black text-white flex items-center justify-center px-1 badge-pop shadow-xl">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </div>
                    )}
                </button>
                {isMenuOpen && (
                    <div className="absolute right-0 top-full mt-4 w-60 bg-slate-900/95 border border-slate-800 rounded-[32px] shadow-2xl overflow-hidden z-[100] animate-in py-2 backdrop-blur-2xl">
                        {[
                            { path: '/', icon: Store, color: 'text-blue-400', label: 'market' },
                            { path: '/settings', icon: User, color: 'text-purple-400', label: 'profile' },
                            { path: '/my-bots', icon: BotIcon, color: 'text-emerald-400', label: 'my_bots' },
                            { path: '/channels', icon: Megaphone, color: 'text-orange-400', label: 'my_channels' },
                            { path: '/notifications', icon: Bell, color: 'text-blue-500', label: 'notifications', badge: unreadCount > 0 }
                        ].map((item, i) => (
                            <button key={i} onClick={() => { navigate(item.path); setIsMenuOpen(false); }} className="w-full flex items-center gap-4 px-6 py-4 hover:bg-white/5 text-left border-b border-white/5 last:border-0 relative">
                                <item.icon size={18} className={item.color} /> 
                                <span className="text-[11px] font-black uppercase tracking-tight">{t(item.label)}</span>
                                {item.badge && <div className="absolute right-6 w-2.5 h-2.5 bg-red-600 rounded-full shadow-[0_0_8px_rgba(220,38,38,0.6)]"></div>}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>

      <div className="relative mb-10 cursor-pointer" onClick={() => navigate('/search')}>
        <div className="relative flex items-center bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[28px] p-1 shadow-2xl transition-all active:scale-[0.98]">
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
                    <h2 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-6 px-2">
                        {t('featured')}
                    </h2>
                    <div className="flex gap-6 overflow-x-auto no-scrollbar -mx-4 px-4 pb-4 snap-x">
                        {announcements.map(ann => <PromoCard key={ann.id} ann={ann} onShowPopup={(a) => setSelectedAnn(a)} />)}
                    </div>
                </div>
            )}

            {/* Quick Promo Forge Button */}
            <div className="mb-12 px-2">
                <button 
                    onClick={() => { haptic('medium'); navigate('/publish-promo'); }}
                    className="w-full bg-gradient-to-r from-emerald-600/20 to-blue-600/20 border border-emerald-500/30 p-6 rounded-[32px] flex items-center justify-between group active:scale-[0.98] transition-all shadow-xl backdrop-blur-md"
                >
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
                            <PlusSquare size={24} className="text-white" />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic">Hızlı Reklam Ver</p>
                            <h4 className="text-sm font-black text-white uppercase italic tracking-tighter">Global Ağa Katılın</h4>
                        </div>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl text-slate-400 group-hover:text-emerald-500 transition-colors">
                        <ChevronRight size={20} />
                    </div>
                </button>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-12">
                {categories.map((cat) => (
                    <button 
                        key={cat.id} 
                        onClick={() => { haptic('light'); navigate(`/search?category=${cat.id}`); }}
                        className="flex flex-col items-center justify-center gap-3 py-6 rounded-[28px] border bg-slate-900/40 border-white/5 text-slate-600 hover:border-blue-500/30 transition-all active:scale-95 shadow-xl"
                    >
                        <cat.icon size={22} className="text-slate-500" />
                        <span className="text-[8px] font-black tracking-widest text-center uppercase">{t(cat.label)}</span>
                    </button>
                ))}
            </div>

            <div className="space-y-1">
                <h2 className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em] mb-8 px-2">
                    MAĞAZA VİTRİNİ
                </h2>
                {bots.length > 0 ? bots.map(bot => <BotCard key={bot.id} bot={bot} tonRate={tonRate} />) : <div className="py-24 text-center text-slate-700 font-bold uppercase text-xs tracking-widest">Sonuç yok.</div>}
            </div>
          </>
      )}

      {selectedAnn && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-[#020617]/90 backdrop-blur-md animate-in" onClick={() => setSelectedAnn(null)}>
            <div className="bg-slate-900 border border-white/10 w-full max-w-sm rounded-[36px] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-white/5 border border-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        {React.createElement(iconMap[selectedAnn.icon_name] || Sparkles, { size: 28, className: 'text-blue-500' })}
                    </div>
                    <h3 className="text-xl font-black text-white mb-2 tracking-tight uppercase italic">{selectedAnn.title}</h3>
                    <p className="text-slate-400 text-[11px] leading-relaxed font-bold uppercase mb-8 px-4 opacity-80 italic">{selectedAnn.content_detail || selectedAnn.description}</p>
                    
                    <button 
                        onClick={() => { haptic('heavy'); window.location.href = selectedAnn.button_link.startsWith('http') ? selectedAnn.button_link : `https://t.me/${selectedAnn.button_link.replace('@','')}`; setSelectedAnn(null); }} 
                        className="w-full py-4.5 bg-blue-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] active:scale-95 transition-all shadow-xl"
                    >
                        {selectedAnn.button_text || 'Hemen Katıl'}
                    </button>
                    <button onClick={() => setSelectedAnn(null)} className="w-full py-4 text-slate-600 font-black text-[9px] uppercase tracking-widest mt-2">KAPAT</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Home;

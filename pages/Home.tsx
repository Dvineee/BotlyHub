
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Search, ChevronRight, LayoutGrid, DollarSign, Loader2, Store, User, Bot as BotIcon, Megaphone, X, Info, Sparkles, Zap, Gift, Star, Heart, Bell, Shield, TrendingUp, Radio, Send, Instagram, Youtube, Link } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Bot, Announcement, Notification } from '../types';
import { categories } from '../data';
import { useTranslation } from '../TranslationContext';
import { DatabaseService } from '../services/DatabaseService';
import PriceService from '../services/PriceService';
import { useTelegram } from '../hooks/useTelegram';
import { useDraggableScroll } from '../hooks/useDraggableScroll';
import { useFilter } from '../FilterContext';
import { FilterMenu } from '../components/FilterMenu';

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

const PromoCard: React.FC<{ ann: Announcement, onShowPopup: (ann: Announcement) => void }> = React.memo(({ ann, onShowPopup }) => {
  const navigate = useNavigate();
  const colors: Record<string, string> = {
    purple: 'from-purple-600 to-indigo-600',
    emerald: 'from-emerald-600 to-teal-600',
    blue: 'from-blue-600 to-cyan-600',
    orange: 'from-orange-500 to-red-600'
  };

  const handleAction = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Tıklama Sayısını Artır
    try {
        await DatabaseService.incrementPromotionClick(ann.id);
    } catch (err) {
        console.warn("Click tracking error:", err);
    }

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
        className={`min-w-[280px] h-40 ${ann.bg_image_url ? 'bg-slate-900' : `bg-gradient-to-br ${colors[ann.color_scheme] || colors.purple}`} p-6 rounded-[32px] relative overflow-hidden shadow-xl shrink-0 transition-all active:scale-[0.97] cursor-pointer group snap-center`}
        onClick={handleAction}
    >
        {ann.bg_image_url && (
            <div className="absolute inset-0 z-0">
                <img src={ann.bg_image_url} alt="" className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            </div>
        )}
        <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
                <h3 className="text-white font-bold text-xl mb-1 tracking-tight">{ann.title}</h3>
                <p className="text-white/80 text-[11px] max-w-[180px] leading-relaxed line-clamp-2 font-medium">{ann.description}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold py-2 px-5 rounded-xl w-fit border border-white/30 uppercase tracking-wider">
                {ann.button_text || 'İncele'}
            </div>
        </div>
        <div className="absolute -right-6 -bottom-6 opacity-20 transform rotate-12 group-hover:scale-110 transition-transform pointer-events-none">
            {React.createElement(iconMap[ann.icon_name] || Megaphone, { size: 140, className: 'text-white' })}
        </div>
    </div>
  );
});

const BotCard: React.FC<{ bot: Bot, tonRate: number }> = React.memo(({ bot, tonRate }) => {
  const navigate = useNavigate();
  const prices = useMemo(() => PriceService.convert(bot.price, tonRate), [bot.price, tonRate]);
  
  return (
    <div onClick={() => navigate(`/bot/${bot.id}`)} className="flex items-center p-5 cursor-pointer group bg-white dark:bg-transparent hover:bg-slate-100 dark:hover:bg-slate-900/60 rounded-[32px] transition-all border border-black/5 dark:border-transparent hover:border-slate-200 dark:hover:border-slate-800/50 active:bg-slate-200 dark:active:bg-slate-900 shadow-xl">
        <div className="relative shrink-0">
            <img 
                src={getLiveBotIcon(bot)} 
                alt={bot.name} 
                loading="lazy"
                className="w-20 h-20 rounded-[28px] object-cover bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 group-hover:scale-105 transition-transform" 
                onError={(e) => { (e.target as any).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(bot.name)}&background=334155&color=fff&bold=true`; }}
            />
            {bot.price > 0 && (
                <div className="absolute -top-1.5 -right-1.5 w-7 h-7 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg border-4 border-slate-50 dark:border-[#020617]">
                    <Zap size={10} fill="currentColor" className="text-white" />
                </div>
            )}
        </div>
        <div className="flex-1 ml-5 min-w-0 mr-3">
            <h3 className="font-black text-lg text-slate-900 dark:text-slate-100 truncate italic tracking-tighter uppercase leading-none mb-1.5">{bot.name}</h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest truncate mb-2 italic">{bot.description}</p>
            <div className="flex items-center gap-3">
                {bot.price === 0 ? (
                    <span className="text-[8px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">Ücretsiz</span>
                ) : (
                    <div className="flex items-center gap-2 px-2 py-1 bg-blue-500/10 rounded-md border border-blue-500/20">
                        <Zap size={10} className="text-blue-600 dark:text-blue-500" />
                        <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-tighter">{prices.ton} TON</span>
                    </div>
                )}
                <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/10 rounded-md border border-yellow-500/20">
                    <Star size={10} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-[9px] font-black text-yellow-600 dark:text-yellow-400 uppercase tracking-tighter">{bot.rating || '0.0'}</span>
                </div>
                {bot.languages && bot.languages.length > 0 && (
                    <div className="flex items-center gap-1.5">
                        {bot.languages.map((lang, idx) => (
                            <span key={idx} className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter opacity-80">
                                {lang}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
        <div className="bg-slate-100 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700/50 text-slate-400 group-hover:text-white group-hover:bg-blue-600 group-hover:border-blue-500 transition-all">
            <ChevronRight size={18} />
        </div>
    </div>
  );
});

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
  const { activeFilter } = useFilter();
  
  const annScroll = useDraggableScroll();
  const catScroll = useDraggableScroll();

  const filteredBots = useMemo(() => {
    let result = [...bots];
    
    if (activeFilter === 'paid') result = result.filter(b => b.price > 0);
    else if (activeFilter === 'free') result = result.filter(b => b.price === 0);
    else if (activeFilter === 'popular') result = result.sort((a, b) => (b.views || 0) - (a.views || 0));
    else if (activeFilter === 'bhub') result = result.filter(b => b.is_official);
    
    return result;
  }, [bots, activeFilter]);

  const loadData = useCallback(async () => {
    // İlk yüklemede sadece botları ve duyuruları çek, fiyatı arka planda güncelle
    const [botData, annData] = await Promise.all([
        DatabaseService.getBots(),
        DatabaseService.getAnnouncements()
    ]);
    
    setBots(botData);
    if (annData.length > 0) setAnnouncements(annData.filter(a => a.is_active));
    setIsLoading(false);

    // Fiyat ve bildirimleri arka planda çek
    PriceService.getTonPrice().then(pData => setTonRate(pData.tonTry));
    
    if (user?.id) {
        DatabaseService.getNotifications(user.id.toString()).then(notes => {
            const unread = notes.filter(n => !n.isRead).length;
            setUnreadCount(unread);
        });
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
    const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [loadData]);

  return (
    <div className="p-4 pt-10 min-h-screen bg-slate-50 dark:bg-slate-950 pb-32 font-sans text-slate-900 dark:text-slate-200 animate-in transition-colors duration-300">
      <div className="flex flex-wrap md:flex-nowrap items-center justify-between mb-8 px-1 gap-y-6 md:gap-x-6">
        <div className="flex items-center gap-3 order-1">
            <div className="w-12 h-12 shrink-0">
                <svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_0_15px_rgba(34,158,217,0.2)]">
                  <g transform="rotate(26 150 150)">
                    <polygon points="150,85 225,195 75,195" fill="#229ED9" opacity="0.9"/>
                    <line x1="150" y1="85" x2="225" y2="195" stroke="#FF8A3D" strokeWidth="38" strokeLinecap="round" strokeOpacity="0.85"/>
                    <line x1="75" y1="195" x2="150" y2="85" stroke="#22C55E" strokeWidth="38" strokeLinecap="round" strokeOpacity="0.85"/>
                    <line x1="225" y1="195" x2="75" y2="195" stroke="#229ED9" strokeWidth="38" strokeLinecap="round" strokeOpacity="0.85"/>
                  </g>
                </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">BotlyHub</h1>
        </div>

        <div className="w-full md:w-auto md:flex-1 md:max-w-2xl order-3 md:order-2 cursor-pointer" onClick={() => navigate('/search')}>
            <div className="relative flex items-center bg-white dark:bg-slate-900/40 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-[28px] p-1.5 shadow-xl transition-all active:scale-[0.98] group">
                <div className="ml-4 w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-400 group-hover:text-blue-500 transition-colors">
                    <Search size={20} />
                </div>
                <div className="w-full py-3 px-4 text-sm text-slate-400 font-bold uppercase tracking-widest opacity-60">{t('search_placeholder')}</div>
            </div>
        </div>

        <div className="flex items-center gap-3 order-2 md:order-3">
            <button onClick={() => { haptic('medium'); navigate('/earnings'); }} className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-900/80 border border-black/5 dark:border-white/5 rounded-full text-emerald-600 dark:text-emerald-400 active:scale-90 transition-transform shadow-lg">
                <DollarSign size={22} />
            </button>
            <div className="relative" ref={menuRef}>
                <button 
                  onClick={() => { haptic('light'); setIsMenuOpen(!isMenuOpen); }} 
                  className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-900/80 border border-black/5 dark:border-white/5 rounded-full text-slate-900 dark:text-white active:scale-90 transition-transform relative shadow-lg"
                >
                    <LayoutGrid size={22} />
                    {unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 min-w-[20px] h-[20px] bg-red-600 rounded-full border-2 border-slate-50 dark:border-[#020617] text-[9px] font-black text-white flex items-center justify-center px-1 badge-pop shadow-xl">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </div>
                    )}
                </button>
                {isMenuOpen && (
                    <div className="absolute right-0 top-full mt-4 w-60 bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-[32px] shadow-2xl overflow-hidden z-[100] animate-in py-2 backdrop-blur-2xl">
                        {[
                            { path: '/', icon: Store, color: 'text-blue-500 dark:text-blue-400', label: 'market' },
                            { path: '/settings', icon: User, color: 'text-purple-500 dark:text-purple-400', label: 'profile' },
                            { path: '/my-bots', icon: BotIcon, color: 'text-emerald-500 dark:text-emerald-400', label: 'my_bots' },
                            { path: '/channels', icon: Megaphone, color: 'text-orange-500 dark:text-orange-400', label: 'my_channels' },
                            { path: '/notifications', icon: Bell, color: 'text-blue-600 dark:text-blue-500', label: 'notifications', badge: unreadCount > 0 }
                        ].map((item, i) => (
                            <button key={i} onClick={() => { navigate(item.path); setIsMenuOpen(false); }} className="w-full flex items-center gap-4 px-6 py-4 hover:bg-black/5 dark:hover:bg-white/5 text-left border-b border-black/5 dark:border-white/5 last:border-0 relative">
                                <item.icon size={18} className={item.color} /> 
                                <span className="text-[11px] font-black uppercase tracking-tight text-slate-700 dark:text-slate-300">{t(item.label)}</span>
                                {item.badge && <div className="absolute right-6 w-2.5 h-2.5 bg-red-600 rounded-full shadow-[0_0_8px_rgba(220,38,38,0.6)]"></div>}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>

      {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4"><Loader2 className="animate-spin text-blue-500" size={32} /></div>
      ) : (
          <>
            {announcements.length > 0 && (
                <div className="mb-10">
                    <div 
                        ref={annScroll.ref}
                        onMouseDown={annScroll.onMouseDown}
                        onMouseUp={annScroll.onMouseUp}
                        onMouseMove={annScroll.onMouseMove}
                        onMouseLeave={annScroll.onMouseLeave}
                        onContextMenu={annScroll.onContextMenu}
                        className={`flex gap-4 overflow-x-auto no-scrollbar -mx-4 px-4 pb-2 snap-x ${annScroll.isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                    >
                        {announcements.map(ann => <PromoCard key={ann.id} ann={ann} onShowPopup={(a) => setSelectedAnn(a)} />)}
                    </div>
                </div>
            )}

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
                        <motion.button 
                            key={cat.id} 
                            whileHover="hover"
                            onClick={() => { haptic('light'); navigate(`/search?category=${cat.id}`); }}
                            className="flex items-center gap-3 px-[1rem] py-[0.7rem] rounded-2xl border bg-white dark:bg-slate-900/60 border-black/5 dark:border-white/5 text-slate-900 dark:text-white hover:border-purple-500/30 transition-all active:scale-95 shadow-lg whitespace-nowrap snap-center"
                        >
                            <motion.div
                                variants={{
                                    hover: { 
                                        scale: 1.2, 
                                        rotate: [0, -10, 10, -10, 0],
                                        filter: "drop-shadow(0 0 8px rgba(19, 159, 236, 0.6))"
                                    }
                                }}
                                transition={{ duration: 0.4 }}
                            >
                                <cat.icon size={20} className="text-[#139fec]" />
                            </motion.div>
                            <span className="text-[11px] font-bold uppercase tracking-wider">{t(cat.label)}</span>
                        </motion.button>
                    ))}
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between mb-4 px-2">
                    <h2 className="text-[10px] font-black text-slate-400 dark:text-slate-700 uppercase tracking-[0.4em]">
                        MAĞAZA VİTRİNİ
                    </h2>
                    <FilterMenu />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredBots.length > 0 ? filteredBots.map(bot => <BotCard key={bot.id} bot={bot} tonRate={tonRate} />) : <div className="col-span-full py-24 text-center text-slate-400 dark:text-slate-700 font-bold uppercase text-xs tracking-widest">Sonuç yok.</div>}
                </div>
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

      <footer className="mt-12 pt-8 border-t border-black/5 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 px-2 pb-8">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 shrink-0">
              <svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <g transform="rotate(26 150 150)">
                  <polygon points="150,85 225,195 75,195" fill="#229ED9" opacity="0.9"/>
                  <line x1="150" y1="85" x2="225" y2="195" stroke="#FF8A3D" strokeWidth="38" strokeLinecap="round" strokeOpacity="0.85"/>
                  <line x1="75" y1="195" x2="150" y2="85" stroke="#22C55E" strokeWidth="38" strokeLinecap="round" strokeOpacity="0.85"/>
                  <line x1="225" y1="195" x2="75" y2="195" stroke="#229ED9" strokeWidth="38" strokeLinecap="round" strokeOpacity="0.85"/>
                </g>
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-4 text-slate-400 dark:text-slate-500">
            <a href="https://t.me/botlyhub" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors"><Send size={18} /></a>
            <a href="#" className="hover:text-pink-500 transition-colors"><Instagram size={18} /></a>
            <a href="#" className="hover:text-red-500 transition-colors"><Youtube size={18} /></a>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <a href="#" className="flex items-center gap-2 text-[#0098ea] text-[11px] font-black uppercase tracking-widest hover:opacity-80 transition-opacity">
            <Link size={14} />
            Hakkımızda
          </a>
          <a href="#" className="flex items-center gap-2 text-[#0098ea] text-[11px] font-black uppercase tracking-widest hover:opacity-80 transition-opacity">
            <Link size={14} />
            İletişim
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Home;

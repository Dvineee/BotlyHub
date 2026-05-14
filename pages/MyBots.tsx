
import { useState, useEffect } from 'react';
import { ShoppingBag, TrendingUp, Bot, Send, Activity, Trash2, AlertTriangle, X, Loader2, Lock, Clock, Info, Settings } from 'lucide-react';
import { UserBot, Bot as BotType } from '../types';
import { DatabaseService } from '../services/DatabaseService';
import { useTelegram } from '../hooks/useTelegram';

import { useNavigate } from 'react-router-dom';

/**
 * Telegram üzerinden güncel profil resmini çeken yardımcı fonksiyon
 */
const getLiveBotIcon = (bot: BotType) => {
    if (bot.bot_link) {
        const username = bot.bot_link.replace('@', '').replace('https://t.me/', '').trim();
        if (username) return `https://t.me/i/userpic/320/${username}.jpg`;
    }
    return bot.icon || `https://ui-avatars.com/api/?name=${encodeURIComponent(bot.name)}&background=334155&color=fff&bold=true`;
};

const MyBots = () => {
  const navigate = useNavigate();
  const { user, tg, haptic, notification } = useTelegram();
  const [bots, setBots] = useState<UserBot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [openSettingsId, setOpenSettingsId] = useState<string | null>(null);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [botToDelete, setBotToDelete] = useState<UserBot | null>(null);
  const [expiredBotNotice, setExpiredBotNotice] = useState<string | null>(null);

  useEffect(() => {
    loadBots();
  }, [user]);

  const loadBots = async () => {
    setIsLoading(true);
    if (user?.id) {
        try {
            const dbBots = await DatabaseService.getUserBots(user.id.toString());
            const now = new Date();
            const validBots: UserBot[] = [];
            const expiredNames: string[] = [];

            for (const b of dbBots) {
                if (b.expiryDate && new Date(b.expiryDate) < now) {
                    await DatabaseService.removeUserBot(user.id.toString(), b.id);
                    expiredNames.push(b.name);
                } else {
                    validBots.push(b);
                }
            }

            if (expiredNames.length > 0) {
                setExpiredBotNotice(`${expiredNames.join(', ')} botlarının kullanım süresi dolduğu için kütüphanenizden kaldırıldı.`);
                notification('warning');
            }

            setBots(validBots);
            localStorage.setItem('ownedBots', JSON.stringify(validBots));
        } catch (e) {
            console.error("Botlar yüklenemedi", e);
        }
    } else {
        const local = JSON.parse(localStorage.getItem('ownedBots') || '[]');
        setBots(local);
    }
    setIsLoading(false);
  };

  const toggleAdRevenue = async (botId: string) => {
      const bot = bots.find(b => b.id === botId);
      if (!bot || !bot.ownership_id) return;

      const newStatus = !bot.revenueEnabled;
      const updatedBots = bots.map(b => 
        b.id === botId ? { ...b, revenueEnabled: newStatus } : b
      );
      setBots(updatedBots);
      localStorage.setItem('ownedBots', JSON.stringify(updatedBots));

      try {
          await DatabaseService.updateUserBot(bot.ownership_id, { revenue_enabled: newStatus });
          if (user?.id) {
              await DatabaseService.logActivity(user.id.toString(), 'bot_manage', 'Ayar Değişti', 'Gelir Ayarı Güncellendi', `'${bot.name}' botu için gelir modu ${newStatus ? 'AÇILDI' : 'KAPATILDI'}.`);
          }
          haptic('light');
      } catch (e) {
          console.error("Gelir modu güncellenemedi", e);
          // Rollback UI if needed, but usually we trust the optimistic update or just let the user try again
      }
  };

  const toggleActiveStatus = async (botId: string) => {
    const bot = bots.find(b => b.id === botId);
    if (!bot || !bot.ownership_id) return;

    const newStatus = !bot.isActive;
    const updatedBots = bots.map(b => 
        b.id === botId ? { ...b, isActive: newStatus } : b
    );
    setBots(updatedBots);
    localStorage.setItem('ownedBots', JSON.stringify(updatedBots));

    try {
        await DatabaseService.updateUserBot(bot.ownership_id, { is_active: newStatus });
        if (user?.id) {
            await DatabaseService.logActivity(user.id.toString(), 'bot_manage', 'Statü Değişti', 'Bot Durumu Güncellendi', `'${bot.name}' bot durumu ${newStatus ? 'AKTİF' : 'PASİF'} yapıldı.`);
        }
        haptic('light');
    } catch (e) {
        console.error("Bot durumu güncellenemedi", e);
    }
  };

  const handleDeleteClick = (bot: UserBot) => {
      if (bot.price > 0) {
          alert("Ücretli botlar kullanım süresi bitmeden manuel olarak kaldırılamaz.");
          return;
      }
      setBotToDelete(bot);
      setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
      if (!botToDelete || !user?.id) return;
      
      setIsDeleting(true);
      haptic('medium');
      
      try {
          await DatabaseService.removeUserBot(user.id.toString(), botToDelete.id);
          await DatabaseService.logActivity(user.id.toString(), 'bot_manage', 'bot_removed', 'Bot Kütüphaneden Kaldırıldı', `'${botToDelete.name}' botu kullanıcı tarafından kütüphanesinden kaldırıldı.`);
          const updatedBots = bots.filter(b => b.id !== botToDelete.id);
          setBots(updatedBots);
          localStorage.setItem('ownedBots', JSON.stringify(updatedBots));
          
          notification('success');
          setShowDeleteModal(false);
          setBotToDelete(null);
          setOpenSettingsId(null);
      } catch (e: any) {
          notification('error');
          alert("Bot kaldırılamadı: " + e.message);
      } finally {
          setIsDeleting(false);
      }
  };

  const handleStartBot = async (bot: UserBot) => {
      haptic('medium');
      if (user?.id) {
          await DatabaseService.logActivity(user.id.toString(), 'bot_manage', 'Bot Başlatıldı', 'Bot Tetiklendi', `'${bot.name}' botu Telegram üzerinden tetiklendi.`);
      }
      let botLink = bot.bot_link || '';
      let finalUrl = botLink.startsWith('http') ? botLink : `https://t.me/${botLink.replace('@', '').trim()}`;
      if (tg?.openTelegramLink) tg.openTelegramLink(finalUrl);
      else window.open(finalUrl, '_blank');
  };

  const getExpiryText = (dateStr?: string) => {
      if (!dateStr) return 'Süresiz';
      const date = new Date(dateStr);
      return date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-5 sm:px-8 pt-6 md:pt-10 pb-32 animate-in fade-in transition-colors duration-300" onClick={() => setOpenSettingsId(null)}>
      <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8 px-1">
        <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Botlarım</h1>
        </div>
        <button onClick={(e) => { e.stopPropagation(); navigate('/'); }} className="w-12 h-12 flex items-center justify-center bg-brand dark:bg-brand-light rounded-xl text-white active:scale-90 transition-transform  ">
            <ShoppingBag size={20} />
        </button>
      </div>

      {expiredBotNotice && (
          <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-start gap-3 animate-in fade-in">
              <Info className="text-orange-600 dark:text-orange-500 shrink-0 mt-0.5" size={18} />
              <p className="text-[11px] text-orange-800 dark:text-orange-200 font-medium leading-relaxed">{expiredBotNotice}</p>
              <button onClick={() => setExpiredBotNotice(null)} className="text-orange-600 dark:text-orange-500"><X size={16}/></button>
          </div>
      )}

      <div className="space-y-4">
        {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" /></div>
        ) : bots.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-16 text-slate-500 bg-white dark:bg-slate-900/30 rounded-xl border border-black/5 dark:border-slate-800/50 border-dashed ">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4 ">
                    <Bot size={40} className="opacity-40" />
                </div>
                <p className="font-medium text-slate-600 dark:text-slate-300">Henüz bir botunuz yok.</p>
                <button onClick={(e) => { e.stopPropagation(); navigate('/'); }} className="mt-6 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-colors border border-black/5 dark:border-slate-700">Market'e Git</button>
            </div>
        ) : (
            bots.map((bot) => (
                <div key={bot.id} className="group relative bg-white dark:bg-slate-900/40 rounded-xl border border-black/5 dark:border-white/5 overflow-hidden transition-all hover:bg-slate-50 dark:hover:bg-slate-900/60 ">
                    <div className="p-4 flex items-center relative z-10">
                         <div className="relative flex-shrink-0">
                             <img 
                                src={getLiveBotIcon(bot)} 
                                alt={bot.name} 
                                className="w-24 h-24 rounded-xl object-cover bg-slate-200 dark:bg-slate-800 border border-black/5 dark:border-white/5 " 
                                onError={(e) => { (e.target as any).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(bot.name)}&background=334155&color=fff&bold=true`; }}
                             />
                             {bot.price > 0 && (
                                 <div className="absolute -top-2 -left-2 bg-brand dark:bg-brand-light text-white p-1.5 rounded-xl border-2 border-slate-50 dark:border-slate-950 ">
                                     <Lock size={12} />
                                 </div>
                             )}
                         </div>

                         <div className="ml-5 flex-1 min-w-0">
                                <h3 
                                    onClick={(e) => { e.stopPropagation(); navigate(`/bot/${bot.slug}`); }}
                                    className="font-bold text-lg text-slate-900 dark:text-white truncate cursor-pointer hover:text-brand dark:hover:text-brand-light transition-colors mb-1 tracking-tight"
                                >
                                    {bot.name}
                                </h3>
                                
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="flex items-center gap-1.5">
                                        <div className={`w-2 h-2 rounded-full ${bot.isActive ? 'bg-emerald-500 ' : 'bg-slate-400 dark:bg-slate-500'}`}></div>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${bot.isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                                            {bot.isActive ? 'Aktif' : 'Pasif'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                                        <Clock size={10} />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">{getExpiryText(bot.expiryDate)}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleStartBot(bot); }}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand/10 dark:bg-brand-light/10 hover:bg-brand dark:hover:bg-brand-light text-brand dark:text-brand-light hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-widest border border-brand/20 dark:border-brand-light/20 transition-all "
                                    >
                                        <Send size={12} />
                                        <span>Başlat</span>
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setOpenSettingsId(bot.id); }}
                                        className="w-10 h-10 flex items-center justify-center bg-slate-500/10 hover:bg-slate-500 text-slate-500 hover:text-white rounded-xl border border-slate-500/20 transition-all  shrink-0"
                                    >
                                        <Settings size={16} />
                                    </button>
                                </div>
                         </div>
                    </div>

                    {/* Settings Sidebar Overlay */}

                    <div className={`absolute inset-0 z-30 transition-transform duration-300 ease-out flex items-center justify-center p-3 ${openSettingsId === bot.id ? 'translate-x-0' : 'translate-x-full'}`}>
                         <div className="absolute inset-0 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-xl"></div>
                         <div className={`w-full h-full grid gap-3 relative z-40 content-center justify-center ${bot.is_official ? 'grid-cols-2 grid-rows-2' : 'grid-cols-1'}`}>
                                {bot.is_official && (
                                    <>
                                        {/* Ücretsiz botlarda gelir durumu kontrol edilmeyecek (buton olmayacak) */}
                                        {bot.price > 0 ? (
                                            <div 
                                                onClick={(e) => { e.stopPropagation(); toggleAdRevenue(bot.id); }}
                                                className={`cursor-pointer rounded-xl px-4 h-full max-h-[64px] flex items-center gap-3 border transition-all active:scale-95  ${
                                                    bot.revenueEnabled ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white dark:bg-slate-900/60 border-black/5 dark:border-white/5'
                                                }`}
                                            >
                                                <TrendingUp size={18} className={bot.revenueEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'} />
                                                <span className={`text-[11px] font-bold uppercase tracking-tight ${bot.revenueEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>Gelir Modu</span>
                                            </div>
                                        ) : (
                                            <div className="rounded-xl px-4 h-full max-h-[64px] flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-950/40 border border-black/5 dark:border-white/5 opacity-40 text-center">
                                                <Lock size={14} className="text-slate-400 dark:text-slate-500 mb-1" />
                                                <span className="text-[8px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-widest">Ücretsiz</span>
                                            </div>
                                        )}

                                        <div 
                                            onClick={(e) => { e.stopPropagation(); toggleActiveStatus(bot.id); }}
                                            className={`cursor-pointer rounded-xl px-4 h-full max-h-[64px] flex items-center gap-3 border transition-all active:scale-95  ${
                                                bot.isActive ? 'bg-brand/10 dark:bg-brand-light/10 border-brand/30 dark:border-brand-light/30' : 'bg-white dark:bg-slate-900/60 border-black/5 dark:border-white/5'
                                            }`}
                                        >
                                            <Activity size={18} className={bot.isActive ? 'text-brand dark:text-brand-light' : 'text-slate-400 dark:text-slate-500'} />
                                            <span className={`text-[11px] font-bold uppercase tracking-tight ${bot.isActive ? 'text-brand dark:text-brand-light' : 'text-slate-500 dark:text-slate-400'}`}>Bot Durumu</span>
                                        </div>
                                    </>
                                )}

                                <div 
                                    onClick={(e) => { e.stopPropagation(); handleDeleteClick(bot); }}
                                    className={`cursor-pointer rounded-xl px-4 h-full max-h-[64px] flex items-center justify-center gap-3 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 transition-all active:scale-95  ${bot.is_official ? 'col-start-2 row-start-2' : ''}`}
                                >
                                    <Trash2 size={18} className="text-red-500" />
                                    <span className="text-[11px] font-bold uppercase text-red-500">Kaldır</span>
                                </div>

                                {bot.is_official && bot.price > 0 && (
                                    <div className="rounded-xl px-4 h-full max-h-[64px] flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-950 border border-black/5 dark:border-white/5 opacity-60 col-start-2 row-start-2 text-center ">
                                        <Lock size={14} className="text-slate-400 dark:text-slate-500 mb-1" />
                                        <span className="text-[9px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-widest">Kilitli</span>
                                    </div>
                                )}
                         </div>
                    </div>
                </div>
            ))
        )}
      </div>

      {showDeleteModal && botToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 animate-in fade-in" onClick={() => !isDeleting && setShowDeleteModal(false)}>
              <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-slate-800 p-8 rounded-xl w-full max-w-sm text-center  relative" onClick={e => e.stopPropagation()}>
                  {!isDeleting && <button onClick={() => setShowDeleteModal(false)} className="absolute top-4 right-4 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white"><X size={20} /></button>}
                  <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                      {isDeleting ? <Loader2 className="animate-spin text-red-500" size={32} /> : <AlertTriangle size={32} className="text-red-500" />}
                  </div>
                  <h3 className="font-black text-slate-900 dark:text-white text-lg mb-2 uppercase italic tracking-tighter">{isDeleting ? 'Siliniyor...' : 'Botu Kaldır'}</h3>
                  <p className="text-slate-500 text-xs mb-8 font-medium leading-relaxed">
                      {isDeleting ? 'İşleminiz gerçekleştiriliyor, lütfen bekleyin.' : 'Bu botu kütüphanenizden kaldırdığınızda verilere erişiminizi kaybedeceksiniz. Emin misiniz?'}
                  </p>
                  {!isDeleting && (
                    <div className="flex gap-3">
                        <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-4 rounded-xl text-slate-400 dark:text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-800">Vazgeç</button>
                        <button onClick={confirmDelete} className="flex-1 py-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-[10px] uppercase tracking-widest  ">Evet, Kaldır</button>
                    </div>
                  )}
              </div>
          </div>
      )}
      </div>
    </div>
  );
};

export default MyBots;

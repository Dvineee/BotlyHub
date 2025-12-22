
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ShoppingBag, TrendingUp, Bot, Send, Activity, Trash2, AlertTriangle, X, Loader2, Lock, Clock, Info } from 'lucide-react';
import * as Router from 'react-router-dom';
import { UserBot } from '../types';
import { DatabaseService } from '../services/DatabaseService';
import { useTelegram } from '../hooks/useTelegram';

const { useNavigate } = Router as any;

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
            
            // Otomatik temizleme kontrolü (Expired Check)
            const now = new Date();
            const validBots: UserBot[] = [];
            const expiredNames: string[] = [];

            for (const b of dbBots) {
                // Eğer expiryDate varsa ve geçmişse sil
                if (b.expiryDate && new Date(b.expiryDate) < now) {
                    await DatabaseService.removeUserBot(user.id.toString(), b.id);
                    expiredNames.push(b.name);
                } else {
                    validBots.push({
                        ...b,
                        isAdEnabled: false,
                        isActive: true
                    } as UserBot);
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

  const toggleAdRevenue = (botId: string) => {
      const updatedBots = bots.map(bot => 
        bot.id === botId ? { ...bot, isAdEnabled: !bot.isAdEnabled } : bot
      );
      setBots(updatedBots);
      localStorage.setItem('ownedBots', JSON.stringify(updatedBots));
  };

  const toggleActiveStatus = (botId: string) => {
    const updatedBots = bots.map(bot => 
        bot.id === botId ? { ...bot, isActive: !bot.isActive } : bot
    );
    setBots(updatedBots);
    localStorage.setItem('ownedBots', JSON.stringify(updatedBots));
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

  const handleStartBot = (bot: UserBot) => {
      haptic('medium');
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
    <div className="min-h-screen bg-slate-950 p-4 pt-8" onClick={() => setOpenSettingsId(null)}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
            <button onClick={(e) => { e.stopPropagation(); navigate('/'); }} className="p-2 hover:bg-slate-900 rounded-full transition-colors group">
                <ChevronLeft className="w-6 h-6 text-slate-400 group-hover:text-white" />
            </button>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 italic uppercase tracking-tighter">Botlarım</h1>
        </div>
        <button onClick={(e) => { e.stopPropagation(); navigate('/'); }} className="p-2 bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-lg shadow-blue-900/30 flex items-center gap-2 px-4 active:scale-95">
            <ShoppingBag size={18} className="text-white" />
            <span className="text-xs font-bold text-white">Market</span>
        </button>
      </div>

      {expiredBotNotice && (
          <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-start gap-3 animate-in fade-in">
              <Info className="text-orange-500 shrink-0 mt-0.5" size={18} />
              <p className="text-[11px] text-orange-200 font-medium leading-relaxed">{expiredBotNotice}</p>
              <button onClick={() => setExpiredBotNotice(null)} className="text-orange-500"><X size={16}/></button>
          </div>
      )}

      <div className="space-y-4">
        {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" /></div>
        ) : bots.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-16 text-slate-500 bg-slate-900/30 rounded-3xl border border-slate-800/50 border-dashed">
                <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-4 shadow-inner">
                    <Bot size={40} className="opacity-40" />
                </div>
                <p className="font-medium text-slate-300">Henüz bir botunuz yok.</p>
                <button onClick={(e) => { e.stopPropagation(); navigate('/'); }} className="mt-6 bg-slate-800 hover:bg-slate-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-colors border border-slate-700">Market'e Git</button>
            </div>
        ) : (
            bots.map((bot) => (
                <div key={bot.id} className="group relative bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden h-[145px] transition-all hover:border-slate-700">
                    <div className="p-3 flex items-center h-full pr-14 relative z-10">
                         <div className="relative flex-shrink-0">
                             <img src={bot.icon} alt={bot.name} className="w-24 h-24 rounded-2xl object-cover bg-slate-800 border border-slate-700" />
                             {bot.price > 0 && (
                                 <div className="absolute -top-2 -left-2 bg-blue-600 text-white p-1.5 rounded-lg border-2 border-slate-950 shadow-xl">
                                     <Lock size={12} />
                                 </div>
                             )}
                         </div>

                         <div className="ml-4 flex-1 min-w-0 flex flex-col justify-center h-full">
                                <h3 
                                    onClick={(e) => { e.stopPropagation(); navigate(`/bot/${bot.id}`); }}
                                    className="font-black text-lg text-white truncate cursor-pointer hover:text-blue-400 transition-colors mb-1 italic tracking-tight"
                                >
                                    {bot.name}
                                </h3>
                                
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="flex items-center gap-1.5">
                                        <div className={`w-2 h-2 rounded-full ${bot.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-500'}`}></div>
                                        <span className={`text-[10px] font-black uppercase tracking-tight ${bot.isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                                            {bot.isActive ? 'Aktif' : 'Pasif'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-500">
                                        <Clock size={10} />
                                        <span className="text-[10px] font-bold uppercase">{getExpiryText(bot.expiryDate)}</span>
                                    </div>
                                </div>

                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleStartBot(bot); }}
                                    className="inline-flex items-center gap-2 self-start px-4 py-2 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-500/20 transition-all"
                                >
                                    <Send size={12} />
                                    <span>Başlat</span>
                                </button>
                         </div>
                    </div>

                    <button 
                        onClick={(e) => { e.stopPropagation(); setOpenSettingsId(bot.id); }}
                        className="absolute right-0 top-0 bottom-0 w-8 bg-slate-800 hover:bg-slate-750 border-l border-slate-700 flex flex-col items-center justify-center transition-all cursor-pointer z-20 group/btn"
                    >
                        <span className="text-[10px] font-black text-slate-500 group-hover/btn:text-slate-300 -rotate-90 whitespace-nowrap tracking-widest uppercase italic">Yönet</span>
                    </button>

                    <div className={`absolute inset-0 z-30 transition-transform duration-300 ease-out flex items-center justify-center p-2 ${openSettingsId === bot.id ? 'translate-x-0' : 'translate-x-full'}`}>
                         <div className="absolute inset-0 bg-slate-900/98 backdrop-blur-sm"></div>
                         <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-2 relative z-40 content-center justify-center">
                                <div 
                                    onClick={(e) => { e.stopPropagation(); toggleAdRevenue(bot.id); }}
                                    className={`cursor-pointer rounded-2xl px-3 h-full max-h-[60px] flex items-center gap-3 border transition-all active:scale-95 ${
                                        bot.isAdEnabled ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-slate-800 border-slate-700'
                                    }`}
                                >
                                    <TrendingUp size={18} className={bot.isAdEnabled ? 'text-emerald-400' : 'text-slate-500'} />
                                    <span className={`text-[10px] font-black uppercase tracking-tight ${bot.isAdEnabled ? 'text-emerald-400' : 'text-slate-400'}`}>Gelir Modu</span>
                                </div>

                                <div 
                                    onClick={(e) => { e.stopPropagation(); toggleActiveStatus(bot.id); }}
                                    className={`cursor-pointer rounded-2xl px-3 h-full max-h-[60px] flex items-center gap-3 border transition-all active:scale-95 ${
                                        bot.isActive ? 'bg-blue-500/10 border-blue-500/50' : 'bg-slate-800 border-slate-700'
                                    }`}
                                >
                                    <Activity size={18} className={bot.isActive ? 'text-blue-400' : 'text-slate-500'} />
                                    <span className={`text-[10px] font-black uppercase tracking-tight ${bot.isActive ? 'text-blue-400' : 'text-slate-400'}`}>Bot Durumu</span>
                                </div>

                                {bot.price === 0 ? (
                                    <div 
                                        onClick={(e) => { e.stopPropagation(); handleDeleteClick(bot); }}
                                        className="cursor-pointer rounded-2xl px-3 h-full max-h-[60px] flex items-center justify-center gap-2 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 transition-all active:scale-95 col-start-2 row-start-2"
                                    >
                                        <Trash2 size={18} className="text-red-500" />
                                        <span className="text-[10px] font-black uppercase text-red-500">Kaldır</span>
                                    </div>
                                ) : (
                                    <div className="rounded-2xl px-3 h-full max-h-[60px] flex flex-col items-center justify-center bg-slate-950 border border-slate-800 opacity-60 col-start-2 row-start-2 text-center">
                                        <Lock size={14} className="text-slate-500 mb-1" />
                                        <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Kilitli Mülkiyet</span>
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
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-sm text-center shadow-2xl relative" onClick={e => e.stopPropagation()}>
                  {!isDeleting && <button onClick={() => setShowDeleteModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={20} /></button>}
                  <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                      {isDeleting ? <Loader2 className="animate-spin text-red-500" size={32} /> : <AlertTriangle size={32} className="text-red-500" />}
                  </div>
                  <h3 className="font-black text-white text-lg mb-2 uppercase italic tracking-tighter">{isDeleting ? 'Siliniyor...' : 'Botu Kaldır'}</h3>
                  <p className="text-slate-500 text-xs mb-8 font-medium leading-relaxed">
                      {isDeleting ? 'İşleminiz gerçekleştiriliyor, lütfen bekleyin.' : 'Bu botu kütüphanenizden kaldırdığınızda verilere erişiminizi kaybedeceksiniz. Emin misiniz?'}
                  </p>
                  {!isDeleting && (
                    <div className="flex gap-3">
                        <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-4 rounded-xl text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-800">Vazgeç</button>
                        <button onClick={confirmDelete} className="flex-1 py-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-900/20">Evet, Kaldır</button>
                    </div>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};

export default MyBots;

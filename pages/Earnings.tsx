
import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownLeft, BarChart3, Wallet as WalletIcon, TrendingUp, Zap, Clock, ShieldCheck, PieChart, Eye, Megaphone, Loader2, RefreshCw } from 'lucide-react';
import * as Router from 'react-router-dom';
import { TonConnectButton, useTonWallet, useTonAddress } from '@tonconnect/ui-react';
import { useTranslation } from '../TranslationContext';
import { useTelegram } from '../hooks/useTelegram';
import { DatabaseService, supabase } from '../services/DatabaseService';
import PriceService from '../services/PriceService';
import { PromotionChannelStats } from '../types';

const { useNavigate } = Router as any;

const Earnings = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { haptic, user } = useTelegram();
  const tonWallet = useTonWallet();
  const userFriendlyAddress = useTonAddress();
  const [activeTab, setActiveTab] = useState<'wallet' | 'revenue'>('wallet');
  const [stats, setStats] = useState<PromotionChannelStats[]>([]);
  const [wallet, setWallet] = useState<any>(null);
  const [tonRate, setTonRate] = useState(250);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    haptic('light');
    if (user?.id) {
        loadData();
    }
  }, [activeTab, user?.id]);

  // Real-time Supabase Subscription for Instant Updates
  useEffect(() => {
    if (!user?.id || activeTab !== 'revenue') return;

    // Listen for ANY change in promotion_channel_stats
    // This allows instant updates when a view count increases
    const channel = supabase
        .channel('realtime-earnings')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'promotion_channel_stats'
            },
            () => {
                // When any change happens, re-fetch stats immediately
                // We use a light version of toggle to check for updates
                DatabaseService.getPromotionChannelStats(user.id).then(statsData => {
                    const sortedStats = [...statsData].sort((a, b) => {
                        const getTimestamp = (item: any) => {
                            const dateStr = item.promotion?.sent_at || item.promotion?.created_at || item.updated_at;
                            return dateStr ? new Date(dateStr).getTime() : 0;
                        };
                        return getTimestamp(b) - getTimestamp(a);
                    });
                    setStats(sortedStats);
                });
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
  }, [user?.id, activeTab]);

  const loadData = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
        const [statsData, walletData, priceData] = await Promise.all([
            DatabaseService.getPromotionChannelStats(user.id),
            DatabaseService.getUserWallet(user.id),
            PriceService.getTonPrice()
        ]);
        
        // Sort stats by date (newest first)
        const sortedStats = [...statsData].sort((a, b) => {
            const getTimestamp = (item: any) => {
                const dateStr = item.promotion?.sent_at || item.promotion?.created_at || item.updated_at;
                return dateStr ? new Date(dateStr).getTime() : 0;
            };
            return getTimestamp(b) - getTimestamp(a);
        });
        
        setStats(sortedStats);
        setWallet(walletData);
        setTonRate(priceData.tonTry);
    } catch (e) {
        console.error("Data Load Error:", e);
    } finally {
        setIsLoading(false);
    }
  };

  const loadStats = async () => {
    await loadData();
  };

  const totalRevenue = stats.reduce((acc, curr) => acc + (curr.revenue || 0), 0);
  const totalViews = stats.reduce((acc, curr) => acc + (curr.views || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] p-4 pt-10 pb-32 flex flex-col transition-colors animate-in fade-in duration-300">
        <div className="flex items-center gap-4 mb-10 px-1">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Finansal Özet</h1>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Finance Engine v3</p>
            </div>
        </div>

        <div className="bg-white dark:bg-slate-900/40 p-1.5 rounded-[28px] flex mb-10 border border-black/5 dark:border-white/5 backdrop-blur-xl shadow-xl">
            <button onClick={()=>setActiveTab('wallet')} className={`flex-1 py-3.5 rounded-[22px] text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab==='wallet'?'bg-brand dark:bg-brand-light text-white shadow-lg shadow-blue-900/20':'text-slate-500 hover:bg-black/5 dark:hover:bg-white/5'}`}>Cüzdan Yönetimi</button>
            <button onClick={()=>setActiveTab('revenue')} className={`flex-1 py-3.5 rounded-[22px] text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab==='revenue'?'bg-brand dark:bg-brand-light text-white shadow-lg shadow-blue-900/20':'text-slate-500 hover:bg-black/5 dark:hover:bg-white/5'}`}>Performans Analitiği</button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-1">
            {activeTab === 'wallet' ? (
                <div className="animate-in slide-in-from-bottom-4">
                    {/* ... wallet content ... */}
                    <div className="bg-gradient-to-br from-brand to-indigo-700 p-8 rounded-[44px] mb-8 relative overflow-hidden shadow-2xl shadow-blue-900/20">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-10">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-lg">
                                    <Zap size={24} className="text-white" />
                                </div>
                                <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-xl border border-white/10 backdrop-blur-sm">
                                    <ShieldCheck size={12} className="text-emerald-400" />
                                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">Güvenli</span>
                                </div>
                            </div>
                            <p className="text-[11px] font-bold text-white/60 uppercase tracking-widest mb-2">Kullanılabilir Bakiye</p>
                            <h2 className="text-4xl font-bold text-white tracking-tight mb-1 leading-none">
                                {wallet ? (wallet.balance / tonRate).toFixed(3) : '0.000'} <span className="text-lg font-medium">TON</span>
                            </h2>
                            <p className="text-xs font-bold text-white/40 uppercase tracking-wider">
                                ≈ ₺{wallet ? wallet.balance.toLocaleString() : '0.00'} TRY
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-white dark:bg-slate-900/40 border border-black/5 dark:border-white/5 p-6 rounded-[32px] flex flex-col items-center gap-3 shadow-xl">
                            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-500 shadow-inner"><TrendingUp size={20} /></div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kümülatif Kazanç</p>
                            <h4 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">
                                ₺{wallet ? wallet.total_earned.toLocaleString() : '0.00'}
                            </h4>
                        </div>
                        <div className="bg-white dark:bg-slate-900/40 border border-black/5 dark:border-white/5 p-6 rounded-[32px] flex flex-col items-center gap-3 shadow-xl">
                            <div className="w-10 h-10 bg-brand/10 dark:bg-brand-light/10 rounded-xl flex items-center justify-center text-brand dark:text-brand-light shadow-inner"><PieChart size={20} /></div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Bağlı Kanallar</p>
                            <h4 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">
                                {new Set(stats.map(s => s.channel_id)).size}
                            </h4>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900/40 border border-black/5 dark:border-white/5 rounded-[40px] p-8 text-center backdrop-blur-md mb-8 shadow-xl">
                        <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-8 leading-relaxed px-4">
                            Ödemelerinizi almak ve lisans işlemleri yapmak için cüzdanınızı bağlayın.
                        </p>
                        <div className="flex justify-center scale-110 mb-2">
                            <TonConnectButton />
                        </div>
                    </div>

                    {tonWallet && (
                        <div className="bg-white dark:bg-slate-900/60 border border-brand/20 dark:border-brand-light/20 rounded-[32px] p-6 animate-in zoom-in-95 shadow-xl">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-10 h-10 bg-brand/10 dark:bg-brand-light/10 rounded-xl flex items-center justify-center text-brand dark:text-brand-light shadow-inner"><WalletIcon size={18} /></div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bağlı Adres</p>
                            </div>
                            <p className="text-[11px] text-slate-900 dark:text-white font-bold break-all bg-slate-50 dark:bg-black/40 p-5 rounded-2xl border border-black/5 dark:border-white/5 leading-relaxed tracking-tight shadow-inner">
                                {userFriendlyAddress}
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="animate-in slide-in-from-bottom-4">
                    <div className="flex justify-between items-center mb-6 px-4">
                        <div className="flex items-center gap-3">
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">Genel Performans Göstergeleri</p>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full animate-pulse-slow">
                                <div className="w-1 h-1 bg-emerald-500 rounded-full shadow-[0_0_5px_rgba(16,185,129,0.8)]"></div>
                                <span className="text-[8px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-tighter">Canlı</span>
                            </div>
                        </div>
                        <button 
                            onClick={loadStats} 
                            disabled={isLoading}
                            className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-900/80 border border-black/5 dark:border-white/5 rounded-xl text-slate-500 dark:text-slate-400 active:scale-90 transition-all disabled:opacity-30 shadow-lg"
                        >
                            <RefreshCw size={18} className={isLoading ? 'animate-spin text-brand dark:text-brand-light' : ''} />
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-white dark:bg-slate-900/40 border border-black/5 dark:border-white/5 p-6 rounded-[32px] flex flex-col items-center gap-3 shadow-xl">
                            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-500 shadow-inner"><ArrowUpRight size={20} /></div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kümülatif Kazanç</p>
                            <h4 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">₺{totalRevenue.toFixed(2)}</h4>
                        </div>
                        <div className="bg-white dark:bg-slate-900/40 border border-black/5 dark:border-white/5 p-6 rounded-[32px] flex flex-col items-center gap-3 shadow-xl">
                            <div className="w-10 h-10 bg-brand/10 dark:bg-brand-light/10 rounded-xl flex items-center justify-center text-brand dark:text-brand-light shadow-inner"><TrendingUp size={20} /></div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Toplam Etkileşim</p>
                            <h4 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">{totalViews.toLocaleString()}</h4>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="animate-spin text-brand dark:text-brand-light" size={32} />
                            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">Veriler Yükleniyor...</span>
                        </div>
                    ) : stats.length === 0 ? (
                        <div className="bg-white dark:bg-slate-900/40 border border-black/5 dark:border-white/5 rounded-[44px] p-10 flex flex-col items-center justify-center gap-8 relative overflow-hidden shadow-xl">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <PieChart size={120} className="text-brand dark:text-brand-light" />
                            </div>
                            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-950 rounded-full flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 shadow-inner">
                                <BarChart3 size={40} className="text-slate-300 dark:text-slate-800" />
                            </div>
                            <div className="text-center">
                                <p className="text-slate-400 dark:text-slate-500 text-sm font-bold uppercase tracking-wider mb-3">Henüz Veri Yok</p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-600 font-medium uppercase max-w-[180px] leading-relaxed mx-auto">
                                    Reklamlar kanallarınızda yayınlandığında detaylı istatistikler burada belirecek.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-4 ml-4">Kanal Bazlı Yayın Raporu</p>
                            {stats.map(s => (
                                <div key={s.id} className="bg-white dark:bg-slate-900/40 border border-black/5 dark:border-white/5 p-6 rounded-[32px] space-y-4 group hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-all shadow-xl">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-brand/10 dark:bg-brand-light/10 rounded-2xl flex items-center justify-center text-brand dark:text-brand-light shadow-inner">
                                                <Megaphone size={20} />
                                            </div>
                                            <div>
                                                <h5 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight truncate max-w-[150px]">
                                                    {s.promotion?.title || 'Bilinmeyen Reklam'}
                                                </h5>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                                                    Kaynak: {s.channel_name || s.channel_id}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 leading-none">+₺{s.revenue?.toFixed(3)}</p>
                                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-wider mt-1">Net Kazanç</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-black/5 dark:border-white/5">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <Eye size={14} />
                                            <span className="text-[11px] font-bold uppercase tracking-wider">{s.views?.toLocaleString()} Görüntülenme</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase">
                                            {new Date(s.promotion?.sent_at || s.promotion?.created_at || s.updated_at).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-8 flex items-center gap-4 p-6 bg-brand/5 dark:bg-brand-light/5 border border-brand/10 dark:border-brand-light/10 rounded-[32px] shadow-lg">
                        <div className="w-12 h-12 bg-brand/10 dark:bg-brand-light/10 rounded-2xl flex items-center justify-center text-brand dark:text-brand-light shadow-inner"><Clock size={22}/></div>
                        <div>
                            <p className="text-[11px] font-bold text-brand dark:text-brand-light uppercase tracking-widest mb-1">Ödeme ve Hakediş Döngüsü</p>
                            <p className="text-xs text-slate-500 font-medium">Hakedişler her ayın 15'inde cüzdana aktarılır.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default Earnings;

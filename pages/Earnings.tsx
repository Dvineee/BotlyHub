
import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownLeft, BarChart3, Wallet as WalletIcon, TrendingUp, Zap, Clock, ShieldCheck, PieChart, Eye, Megaphone, Loader2, RefreshCw, ChevronLeft } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-5 sm:px-8 pt-6 md:pt-10 pb-32 flex flex-col transition-colors animate-in fade-in duration-300">
        <div className="max-w-7xl mx-auto w-full">
            {/* Dynamic Sub Header */}
            <div className="w-full mb-10">
                <div className="flex items-center justify-between border-b border-black/[0.03] dark:border-white/5 pb-4">
                    <button 
                        onClick={() => { haptic('light'); navigate(-1); }}
                        className="group flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-blue-500 transition-colors bg-transparent border-none outline-none cursor-pointer"
                    >
                        <span className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-inner group-hover:bg-slate-50 dark:group-hover:bg-slate-800 transition-colors flex items-center justify-center">
                            <ChevronLeft size={16} />
                        </span>
                        Geri
                    </button>
                    
                    <div className="flex items-center gap-2 select-none">
                        <span className="text-[10px] sm:text-[11px] font-mono font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-100/60 dark:bg-slate-900/40 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
                            BOTLY HUB
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4 mb-10 px-1">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{t('earn_financial_summary')}</h1>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Finance Engine v3</p>
            </div>
        </div>

        <div className="bg-white dark:bg-slate-900/40 p-1.5 rounded-xl flex mb-10 border border-black/5 dark:border-white/5 backdrop-blur-xl ">
            <button onClick={()=>setActiveTab('wallet')} className={`flex-1 py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab==='wallet'?'bg-brand dark:bg-brand-light text-white  ':'text-slate-500 hover:bg-black/5 dark:hover:bg-white/5'}`}>{t('earn_wallet_mgmt')}</button>
            <button onClick={()=>setActiveTab('revenue')} className={`flex-1 py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab==='revenue'?'bg-brand dark:bg-brand-light text-white  ':'text-slate-500 hover:bg-black/5 dark:hover:bg-white/5'}`}>{t('earn_perf_analytics')}</button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-1">
            {activeTab === 'wallet' ? (
                <div className="animate-in slide-in-from-bottom-4">
                    {/* ... wallet content ... */}
                    <div className="bg-gradient-to-br from-brand to-indigo-700 p-8 rounded-xl mb-8 relative overflow-hidden  ">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-10">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30 ">
                                    <Zap size={24} className="text-white" />
                                </div>
                                <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-xl border border-white/10 backdrop-blur-sm">
                                    <ShieldCheck size={12} className="text-emerald-400" />
                                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">{t('earn_safe')}</span>
                                </div>
                            </div>
                            <p className="text-[11px] font-bold text-white/60 uppercase tracking-widest mb-2">{t('earn_avail_balance')}</p>
                            <h2 className="text-4xl font-bold text-white tracking-tight mb-1 leading-none">
                                {wallet ? (wallet.balance / tonRate).toFixed(3) : '0.000'} <span className="text-lg font-medium">TON</span>
                            </h2>
                            <p className="text-xs font-bold text-white/40 uppercase tracking-wider">
                                ≈ ₺{wallet ? wallet.balance.toLocaleString() : '0.00'} TRY
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-white dark:bg-slate-900/40 border border-black/5 dark:border-white/5 p-6 rounded-xl flex flex-col items-center gap-3 stats-card-bg">
                            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-500 "><TrendingUp size={20} /></div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('earn_total_earned')}</p>
                            <h4 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">
                                ₺{wallet ? wallet.total_earned.toLocaleString() : '0.00'}
                            </h4>
                        </div>
                        <div className="bg-white dark:bg-slate-900/40 border border-black/5 dark:border-white/5 p-6 rounded-xl flex flex-col items-center gap-3 stats-card-bg">
                            <div className="w-10 h-10 bg-brand/10 dark:bg-brand-light/10 rounded-xl flex items-center justify-center text-brand dark:text-brand-light "><PieChart size={20} /></div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('earn_connected_channels')}</p>
                            <h4 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">
                                {new Set(stats.map(s => s.channel_id)).size}
                            </h4>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900/40 border border-black/5 dark:border-white/5 rounded-xl p-8 text-center backdrop-blur-md mb-8 ">
                        <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-8 leading-relaxed px-4">
                            {t('earn_connect_wallet_desc')}
                        </p>
                        <div className="flex justify-center scale-110 mb-2">
                            <TonConnectButton />
                        </div>
                    </div>

                    {tonWallet && (
                        <div className="bg-white dark:bg-slate-900/60 border border-brand/20 dark:border-brand-light/20 rounded-xl p-6 animate-in zoom-in-95 ">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-10 h-10 bg-brand/10 dark:bg-brand-light/10 rounded-xl flex items-center justify-center text-brand dark:text-brand-light "><WalletIcon size={18} /></div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bağlı Adres</p>
                            </div>
                            <p className="text-[11px] text-slate-900 dark:text-white font-bold break-all bg-slate-50 dark:bg-black/40 p-5 rounded-xl border border-black/5 dark:border-white/5 leading-relaxed tracking-tight ">
                                {userFriendlyAddress}
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="animate-in slide-in-from-bottom-4">
                    <div className="flex justify-between items-center mb-6 px-4">
                        <div className="flex items-center gap-3">
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">{t('earn_perf_indicators')}</p>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full animate-pulse-slow">
                                <div className="w-1 h-1 bg-emerald-500 rounded-full "></div>
                                <span className="text-[8px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-tighter">{t('earn_live')}</span>
                            </div>
                        </div>
                        <button 
                            onClick={loadStats} 
                            disabled={isLoading}
                            className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-900/80 border border-black/5 dark:border-white/5 rounded-xl text-slate-500 dark:text-slate-400 active:scale-90 transition-all disabled:opacity-30 "
                        >
                            <RefreshCw size={18} className={isLoading ? 'animate-spin text-brand dark:text-brand-light' : ''} />
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-white dark:bg-slate-900/40 border border-black/5 dark:border-white/5 p-6 rounded-xl flex flex-col items-center gap-3 stats-card-bg">
                            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-500 "><ArrowUpRight size={20} /></div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('earn_total_earned')}</p>
                            <h4 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">₺{totalRevenue.toFixed(2)}</h4>
                        </div>
                        <div className="bg-white dark:bg-slate-900/40 border border-black/5 dark:border-white/5 p-6 rounded-xl flex flex-col items-center gap-3 stats-card-bg">
                            <div className="w-10 h-10 bg-brand/10 dark:bg-brand-light/10 rounded-xl flex items-center justify-center text-brand dark:text-brand-light "><TrendingUp size={20} /></div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('earn_total_interact')}</p>
                            <h4 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">{totalViews.toLocaleString()}</h4>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="animate-spin text-brand dark:text-brand-light" size={32} />
                            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">{t('earn_loading')}</span>
                        </div>
                    ) : stats.length === 0 ? (
                        <div className="bg-white dark:bg-slate-900/40 border border-black/5 dark:border-white/5 rounded-xl p-10 flex flex-col items-center justify-center gap-8 relative overflow-hidden ">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <PieChart size={120} className="text-brand dark:text-brand-light" />
                            </div>
                            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-950 rounded-full flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 ">
                                <BarChart3 size={40} className="text-slate-300 dark:text-slate-800" />
                            </div>
                            <div className="text-center">
                                <p className="text-slate-400 dark:text-slate-500 text-sm font-bold uppercase tracking-wider mb-3">{t('earn_no_data')}</p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-600 font-medium uppercase max-w-[180px] leading-relaxed mx-auto">
                                    {t('earn_no_data_desc')}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-4 ml-4">{t('earn_channel_report')}</p>
                            {stats.map(s => (
                                <div key={s.id} className="bg-white dark:bg-slate-900/40 border border-black/5 dark:border-white/5 p-6 rounded-xl space-y-4 group hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-all ">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-brand/10 dark:bg-brand-light/10 rounded-xl flex items-center justify-center text-brand dark:text-brand-light ">
                                                <Megaphone size={20} />
                                            </div>
                                            <div>
                                                <h5 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight truncate max-w-[150px]">
                                                    {s.promotion?.title || 'Bilinmeyen Reklam'}
                                                </h5>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                                                    {t('cat_source')}: {s.channel_name || s.channel_id}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 leading-none">+₺{s.revenue?.toFixed(3)}</p>
                                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-wider mt-1">{t('earn_net_gain')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-black/5 dark:border-white/5">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <Eye size={14} />
                                            <span className="text-[11px] font-bold uppercase tracking-wider">{s.views?.toLocaleString()} {t('earn_views')}</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase">
                                            {new Date(s.promotion?.sent_at || s.promotion?.created_at || s.updated_at).toLocaleString(t('locale') || 'tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-8 flex items-center gap-4 p-6 bg-brand/5 dark:bg-brand-light/5 border border-brand/10 dark:border-brand-light/10 rounded-xl ">
                        <div className="w-12 h-12 bg-brand/10 dark:bg-brand-light/10 rounded-xl flex items-center justify-center text-brand dark:text-brand-light "><Clock size={22}/></div>
                        <div>
                            <p className="text-[11px] font-bold text-brand dark:text-brand-light uppercase tracking-widest mb-1">{t('earn_cycle_title')}</p>
                            <p className="text-xs text-slate-500 font-medium">{t('earn_cycle_desc')}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Earnings;


import React, { useState, useEffect } from 'react';
import { ChevronLeft, ArrowUpRight, ArrowDownLeft, BarChart3, Wallet as WalletIcon, TrendingUp, Zap, Clock, ShieldCheck, PieChart } from 'lucide-react';
import * as Router from 'react-router-dom';
import { TonConnectButton, useTonWallet, useTonAddress } from '@tonconnect/ui-react';
import { useTranslation } from '../TranslationContext';
import { useTelegram } from '../hooks/useTelegram';

const { useNavigate } = Router as any;

const Earnings = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { haptic } = useTelegram();
  const tonWallet = useTonWallet();
  const userFriendlyAddress = useTonAddress();
  const [activeTab, setActiveTab] = useState<'wallet' | 'revenue'>('wallet');

  useEffect(() => {
    haptic('light');
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#020617] p-4 pt-10 pb-32 flex flex-col transition-colors animate-in fade-in">
        <div className="flex items-center gap-4 mb-10 px-2">
            <button onClick={() => navigate('/')} className="p-3 bg-slate-900/60 border border-slate-800 rounded-2xl text-slate-400 active:scale-90 transition-transform">
                <ChevronLeft size={20} />
            </button>
            <div>
                <h1 className="text-xl font-black text-white italic tracking-tighter uppercase leading-none">Varlıklarım</h1>
                <p className="text-[8px] font-black text-slate-700 uppercase tracking-[0.4em] mt-1.5 italic">Finance Engine v3</p>
            </div>
        </div>

        <div className="bg-slate-900/40 p-1 rounded-[24px] flex mb-10 border border-white/5 backdrop-blur-xl">
            <button onClick={()=>setActiveTab('wallet')} className={`flex-1 py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab==='wallet'?'bg-blue-600 text-white shadow-xl shadow-blue-900/30':'text-slate-500 hover:bg-white/5'}`}>Cüzdan</button>
            <button onClick={()=>setActiveTab('revenue')} className={`flex-1 py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab==='revenue'?'bg-blue-600 text-white shadow-xl shadow-blue-900/30':'text-slate-500 hover:bg-white/5'}`}>İstatistik</button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-1">
            {activeTab === 'wallet' ? (
                <div className="animate-in slide-in-from-bottom-4">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[44px] mb-8 relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-10">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
                                    <Zap size={24} className="text-white" />
                                </div>
                                <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-xl border border-white/10">
                                    <ShieldCheck size={12} className="text-emerald-400" />
                                    <span className="text-[8px] font-black text-white uppercase tracking-widest">Güvenli</span>
                                </div>
                            </div>
                            <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em] mb-2 italic">Mevcut Bakiye</p>
                            <h2 className="text-4xl font-black text-white italic tracking-tighter mb-1 leading-none">0.00 <span className="text-lg">TON</span></h2>
                            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">≈ ₺0.00 TRY</p>
                        </div>
                    </div>

                    <div className="bg-slate-900/40 border border-white/5 rounded-[40px] p-8 text-center backdrop-blur-md mb-8">
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-8 leading-relaxed italic px-4">
                            Ödemelerinizi almak ve lisans işlemleri yapmak için cüzdanınızı bağlayın.
                        </p>
                        <div className="flex justify-center scale-110 mb-2">
                            <TonConnectButton />
                        </div>
                    </div>

                    {tonWallet && (
                        <div className="bg-slate-900/60 border border-blue-500/20 rounded-[32px] p-6 animate-in zoom-in-95">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500"><WalletIcon size={18} /></div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Bağlı Adres</p>
                            </div>
                            <p className="text-[10px] text-white font-black break-all bg-black/40 p-5 rounded-2xl border border-white/5 leading-relaxed tracking-tighter italic">
                                {userFriendlyAddress}
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="animate-in slide-in-from-bottom-4">
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-slate-900/40 border border-white/5 p-6 rounded-[32px] flex flex-col items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500"><ArrowUpRight size={20} /></div>
                            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Toplam Gelir</p>
                            <h4 className="text-xl font-black text-white italic tracking-tighter leading-none">₺0.00</h4>
                        </div>
                        <div className="bg-slate-900/40 border border-white/5 p-6 rounded-[32px] flex flex-col items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500"><TrendingUp size={20} /></div>
                            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Kanal Hacmi</p>
                            <h4 className="text-xl font-black text-white italic tracking-tighter leading-none">0</h4>
                        </div>
                    </div>

                    <div className="bg-slate-900/40 border border-white/5 rounded-[44px] p-10 flex flex-col items-center justify-center gap-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <PieChart size={120} className="text-blue-500" />
                        </div>
                        <div className="w-24 h-24 bg-slate-950 rounded-full flex items-center justify-center border-2 border-dashed border-slate-800 shadow-inner">
                            <BarChart3 size={40} className="text-slate-800" />
                        </div>
                        <div className="text-center">
                            <p className="text-slate-500 text-xs font-black uppercase tracking-[0.2em] italic mb-3">Henüz Veri Yok</p>
                            <p className="text-[10px] text-slate-700 font-bold uppercase italic max-w-[180px] leading-relaxed mx-auto">
                                Botlarınız çalışmaya başladığında detaylı hasılat grafikleri burada belirecek.
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 flex items-center gap-4 p-5 bg-blue-600/5 border border-blue-500/10 rounded-3xl">
                        <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500"><Clock size={18}/></div>
                        <div>
                            <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1">Ödeme Takvimi</p>
                            <p className="text-[10px] text-slate-600 font-bold italic uppercase tracking-tighter">Hakedişler her ayın 15'inde cüzdana aktarılır.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default Earnings;

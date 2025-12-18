
import React, { useState } from 'react';
import { ChevronLeft, ArrowUpRight, ArrowDownLeft, BarChart3, Wallet as WalletIcon } from 'lucide-react';
// Fixed: Use namespace import for react-router-dom to resolve "no exported member" errors
import * as Router from 'react-router-dom';
import { TonConnectButton, useTonWallet, useTonAddress } from '@tonconnect/ui-react';
import { useTranslation } from '../TranslationContext';

const { useNavigate } = Router as any;

const Earnings = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const tonWallet = useTonWallet();
  const userFriendlyAddress = useTonAddress();
  const [activeTab, setActiveTab] = useState<'wallet' | 'revenue'>('wallet');

  return (
    <div className="min-h-screen bg-slate-950 p-4 pt-8 pb-24 flex flex-col transition-colors">
        <div className="flex items-center gap-4 mb-6">
            <button onClick={() => navigate('/')} className="p-2 hover:bg-slate-900 rounded-full text-slate-400"><ChevronLeft /></button>
            <h1 className="text-xl font-bold text-white">Gelirler ve Cüzdan</h1>
        </div>

        <div className="bg-slate-900 p-1 rounded-xl flex mb-6 border border-slate-800 shrink-0">
            <button onClick={()=>setActiveTab('wallet')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab==='wallet'?'bg-slate-800 text-white shadow-sm':'text-slate-500'}`}>Cüzdan</button>
            <button onClick={()=>setActiveTab('revenue')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab==='revenue'?'bg-slate-800 text-white shadow-sm':'text-slate-500'}`}>Gelirler</button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
            {activeTab === 'wallet' ? (
                <div className="flex flex-col items-center justify-center py-10">
                    <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 border border-blue-500/20">
                        <WalletIcon size={40} className="text-blue-500" />
                    </div>
                    
                    <h2 className="text-xl font-bold text-white mb-2">TON Cüzdan Bağlantısı</h2>
                    <p className="text-slate-500 text-sm text-center mb-8 px-6">Ödemelerinizi almak ve işlem yapmak için Tonkeeper veya MyTonWallet cüzdanınızı bağlayın.</p>
                    
                    <div className="flex justify-center scale-110">
                        <TonConnectButton />
                    </div>

                    {tonWallet && (
                        <div className="mt-10 w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 animate-in fade-in">
                            <p className="text-xs font-bold text-slate-500 uppercase mb-2">Bağlı Cüzdan</p>
                            <p className="text-sm text-white font-mono break-all bg-slate-950 p-3 rounded-xl border border-slate-800">{userFriendlyAddress}</p>
                            
                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-center">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold">Bakiye</p>
                                    <p className="text-lg font-bold text-white mt-1">0.00 TON</p>
                                </div>
                                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-center">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold">Durum</p>
                                    <p className="text-lg font-bold text-emerald-500 mt-1">Aktif</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                    <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-4">
                        <BarChart3 size={32} className="opacity-20" />
                    </div>
                    <p className="font-medium text-slate-300">Henüz gelir verisi yok.</p>
                    <p className="text-xs mt-2">Botlarınız çalıştıkça kazancınız burada listelenecek.</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default Earnings;

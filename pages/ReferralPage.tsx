
import React, { useState, useEffect } from 'react';
import { useTelegram } from '../hooks/useTelegram';
import { DatabaseService } from '../services/DatabaseService';
import { Referral, ReferralSettings } from '../types';
import { Users, Gift, Share2, Award, Clock, CheckCircle2, XCircle, Copy, ExternalLink, Loader2, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

const ReferralPage = () => {
    const { user } = useTelegram();
    const [referrals, setReferrals] = useState<Referral[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [settings, setSettings] = useState<ReferralSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [refList, refStats, refSettings] = await Promise.all([
                DatabaseService.getUserReferrals(user.id.toString()),
                DatabaseService.getReferralStats(user.id.toString()),
                DatabaseService.getReferralSettings()
            ]);
            setReferrals(refList);
            setStats(refStats);
            setSettings(refSettings);
        } catch (e) {
            console.error("Referral data load failed:", e);
        } finally {
            setIsLoading(false);
        }
    };

    const referralLink = `https://t.me/BotlyHubBot?start=ref_${user?.id}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = () => {
        const text = `🚀 BotlyHub V3'e katıl ve en iyi Telegram botlarını keşfet! Benim linkimle katılarak özel ödüller kazanabilirsin: ${referralLink}`;
        window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(text)}`);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
                <span className="text-xs font-black uppercase tracking-widest opacity-40">Veriler Yükleniyor</span>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 pb-24 animate-in fade-in">
            {/* Header */}
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600/20 rounded-2xl flex items-center justify-center border border-blue-500/20">
                        <Users className="text-blue-500" size={20} />
                    </div>
                    <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter">Referans <span className="text-blue-500">Sistemi</span></h1>
                </div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Arkadaşlarını davet et, birlikte kazan!</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/40 border border-white/5 p-5 rounded-[32px] space-y-1">
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">Toplam Davet</span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-white italic">{stats?.total || 0}</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Kişi</span>
                    </div>
                </div>
                <div className="bg-slate-900/40 border border-white/5 p-5 rounded-[32px] space-y-1">
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">Toplam Kazanç</span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-emerald-500 italic">{stats?.earnings || 0}</span>
                        <span className="text-[10px] font-bold text-emerald-500/50 uppercase tracking-tighter">Hub Puanı</span>
                    </div>
                </div>
            </div>

            {/* Referral Link Box */}
            <div className="bg-blue-600/10 border border-blue-500/20 p-6 rounded-[40px] space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Gift size={120} />
                </div>
                
                <div className="space-y-2 relative z-10">
                    <h3 className="text-sm font-black text-white uppercase italic">Senin Davet Linkin</h3>
                    <p className="text-[10px] font-bold text-blue-400/70 leading-relaxed uppercase italic">
                        Bu linki paylaşarak her yeni üye için {settings?.standard_reward} Hub Puanı, Premium üyeler için {settings?.premium_reward} Hub Puanı kazanabilirsin.
                    </p>
                </div>

                <div className="flex flex-col gap-3 relative z-10">
                    <div className="flex items-center gap-2 bg-slate-950/50 border border-white/5 p-4 rounded-2xl">
                        <input 
                            readOnly 
                            value={referralLink}
                            className="bg-transparent border-none outline-none text-[10px] font-bold text-slate-300 flex-1 truncate"
                        />
                        <button 
                            onClick={handleCopy}
                            className="p-2 hover:bg-white/5 rounded-lg transition-all text-blue-500"
                        >
                            {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                        </button>
                    </div>
                    
                    <button 
                        onClick={handleShare}
                        className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-900/20 active:scale-95"
                    >
                        <Share2 size={16} />
                        HEMEN PAYLAŞ
                    </button>
                </div>
            </div>

            {/* Security Info */}
            <div className="bg-blue-600/10 border border-blue-500/20 p-6 rounded-[32px] space-y-4">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="text-blue-500" size={18} />
                    <h4 className="text-[11px] font-black text-white uppercase italic">Nasıl Ödül Kazanılır?</h4>
                </div>
                <div className="space-y-3">
                    <div className="flex gap-3">
                        <div className="w-1 h-auto bg-blue-500/20 rounded-full" />
                        <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase italic">
                            1. Davet linkini arkadaşınla paylaş.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <div className="w-1 h-auto bg-emerald-500/20 rounded-full" />
                        <p className="text-[10px] font-bold text-emerald-400 leading-relaxed uppercase italic">
                            2. Arkadaşın botu başlattıktan sonra <span className="underline">resmi grubumuza</span> katılmalı.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <div className="w-1 h-auto bg-blue-500/20 rounded-full" />
                        <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase italic">
                            3. Katılım sağlandığı an ödülün otomatik olarak cüzdanına yansır.
                        </p>
                    </div>
                </div>
            </div>

            {/* Referral List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-[11px] font-black text-white uppercase italic tracking-widest">Davet Durumları</h3>
                    <div className="flex items-center gap-1 text-[9px] font-black text-slate-600 uppercase italic">
                        <Clock size={10} />
                        <span>OTOMATİK ONAY AKTİF</span>
                    </div>
                </div>

                <div className="space-y-3">
                    {referrals.length === 0 ? (
                        <div className="py-12 text-center bg-slate-900/20 border border-dashed border-white/5 rounded-[32px]">
                            <Users className="mx-auto text-slate-800 mb-3" size={32} />
                            <p className="text-[10px] font-black text-slate-700 uppercase italic tracking-widest">Henüz kimseyi davet etmedin</p>
                        </div>
                    ) : (
                        referrals.map((ref) => (
                            <div key={ref.id} className="bg-slate-900/40 border border-white/5 p-5 rounded-[28px] flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${ref.status === 'confirmed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : ref.status === 'pending' ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                                        {ref.status === 'confirmed' ? <CheckCircle2 size={18} /> : ref.status === 'pending' ? <Clock size={18} /> : <XCircle size={18} />}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] font-black text-white uppercase italic">Kullanıcı #{ref.referred_id.slice(-4)}</span>
                                            {ref.is_premium_referral && (
                                                <span className="px-2 py-0.5 bg-blue-600/20 border border-blue-500/20 text-[7px] font-black text-blue-400 rounded-full uppercase tracking-tighter">PREMIUM</span>
                                            )}
                                        </div>
                                        <span className="text-[9px] font-bold text-slate-600 uppercase italic">
                                            {ref.status === 'pending' ? 'Grup Katılımı Bekleniyor' : new Date(ref.created_at).toLocaleDateString('tr-TR')}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`text-xs font-black italic ${ref.status === 'confirmed' ? 'text-emerald-500' : 'text-slate-600'}`}>
                                        +{ref.reward_amount} HP
                                    </span>
                                    <p className={`text-[8px] font-black uppercase tracking-tighter italic ${ref.status === 'confirmed' ? 'text-emerald-500/50' : 'text-orange-500/50'}`}>
                                        {ref.status === 'confirmed' ? 'TAMAMLANDI' : ref.status === 'pending' ? 'BEKLEMEDE' : 'REDDEDİLDİ'}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReferralPage;

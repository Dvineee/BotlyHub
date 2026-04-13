
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
        DatabaseService.logActivity(user.id.toString(), 'system', 'referral_link_copied', 'Referans Linki Kopyalandı', 'Kullanıcı referans linkini kopyaladı.');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = () => {
        const text = `🚀 BotlyHub V3'e katıl ve en iyi Telegram botlarını keşfet! Benim linkimle katılarak özel ödüller kazanabilirsin: ${referralLink}`;
        DatabaseService.logActivity(user.id.toString(), 'system', 'referral_link_shared', 'Referans Linki Paylaşıldı', 'Kullanıcı referans linkini Telegram üzerinden paylaştı.');
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
        <div className="p-6 space-y-8 pb-32 bg-slate-50 dark:bg-[#020617] min-h-screen animate-in fade-in transition-colors duration-300">
            {/* Header */}
            <div className="flex items-center gap-5 mb-10 px-1">
                <div className="w-12 h-12 bg-white dark:bg-slate-900/80 border border-black/5 dark:border-white/5 rounded-full flex items-center justify-center shadow-lg">
                    <Users className="text-purple-600 dark:text-purple-500" size={22} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Referans <span className="text-purple-600">Sistemi</span></h1>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Arkadaşlarını davet et, birlikte kazan!</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-900/40 border border-black/5 dark:border-white/5 p-6 rounded-[32px] space-y-1 shadow-xl">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Toplam Davet</span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{stats?.total || 0}</span>
                        <span className="text-[11px] font-bold text-slate-500 uppercase">Kişi</span>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900/40 border border-black/5 dark:border-white/5 p-6 rounded-[32px] space-y-1 shadow-xl">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Toplam Kazanç</span>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-500 tracking-tight">{stats?.earnings || 0}</span>
                        <span className="text-[11px] font-bold text-emerald-600/50 dark:text-emerald-500/50 uppercase tracking-tight">HP</span>
                    </div>
                </div>
            </div>

            {/* Referral Link Box */}
            <div className="bg-purple-600/10 border border-purple-500/20 p-8 rounded-[40px] space-y-8 relative overflow-hidden shadow-2xl shadow-purple-900/10">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Gift size={140} />
                </div>
                
                <div className="space-y-3 relative z-10">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-tight">Senin Davet Linkin</h3>
                    <p className="text-[11px] font-medium text-purple-600 dark:text-purple-400/70 leading-relaxed uppercase">
                        Bu linki paylaşarak her yeni üye için {settings?.standard_reward} Hub Puanı, Premium üyeler için {settings?.premium_reward} Hub Puanı kazanabilirsin.
                    </p>
                </div>

                <div className="flex flex-col gap-4 relative z-10">
                    <div className="flex items-center gap-3 bg-white/50 dark:bg-slate-950/50 border border-black/5 dark:border-white/5 p-5 rounded-[24px] shadow-inner">
                        <input 
                            readOnly 
                            value={referralLink}
                            className="bg-transparent border-none outline-none text-[11px] font-bold text-slate-600 dark:text-slate-300 flex-1 truncate"
                        />
                        <button 
                            onClick={handleCopy}
                            className="w-10 h-10 flex items-center justify-center bg-purple-600/10 hover:bg-purple-600/20 rounded-xl transition-all text-purple-600 dark:text-purple-500 shadow-lg"
                        >
                            {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                        </button>
                    </div>
                    
                    <button 
                        onClick={handleShare}
                        className="w-full py-5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] uppercase tracking-widest rounded-[24px] transition-all flex items-center justify-center gap-3 shadow-2xl shadow-purple-900/30 active:scale-95"
                    >
                        <Share2 size={18} />
                        HEMEN PAYLAŞ
                    </button>
                </div>
            </div>

            {/* Security Info */}
            <div className="bg-white dark:bg-slate-900/40 border border-black/5 dark:border-white/5 p-8 rounded-[32px] space-y-6 shadow-xl">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-600/10 rounded-xl flex items-center justify-center">
                        <ShieldCheck className="text-purple-600 dark:text-purple-500" size={20} />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">Nasıl Ödül Kazanılır?</h4>
                </div>
                <div className="space-y-4">
                    <div className="flex gap-4">
                        <div className="w-1.5 h-1.5 mt-2 bg-purple-600 dark:bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed uppercase">
                            1. Davet linkini arkadaşınla paylaş.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-1.5 h-1.5 mt-2 bg-emerald-600 dark:bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                        <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 leading-relaxed uppercase">
                            2. Arkadaşın botu başlattıktan sonra <span className="underline">resmi grubumuza</span> katılmalı.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-1.5 h-1.5 mt-2 bg-purple-600 dark:bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed uppercase">
                            3. Katılım sağlandığı an ödülün otomatik olarak cüzdanına yansır.
                        </p>
                    </div>
                </div>
            </div>

            {/* Referral List */}
            <div className="space-y-5">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-widest">Davet Durumları</h3>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase">
                        <Clock size={12} />
                        <span>OTOMATİK ONAY AKTİF</span>
                    </div>
                </div>

                <div className="space-y-4">
                    {referrals.length === 0 ? (
                        <div className="py-16 text-center bg-white dark:bg-slate-900/20 border border-dashed border-black/5 dark:border-white/10 rounded-[40px] shadow-inner">
                            <Users className="mx-auto text-slate-200 dark:text-slate-800 mb-4" size={40} />
                            <p className="text-[11px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-widest">Henüz kimseyi davet etmedin</p>
                        </div>
                    ) : (
                        referrals.map((ref) => (
                            <div key={ref.id} className="bg-white dark:bg-slate-900/40 border border-black/5 dark:border-white/5 p-6 rounded-[32px] flex items-center justify-between shadow-xl">
                                <div className="flex items-center gap-5">
                                    {ref.referred_user?.avatar ? (
                                        <div className="relative">
                                            <img 
                                                src={ref.referred_user.avatar} 
                                                alt={ref.referred_user.name} 
                                                className="w-12 h-12 rounded-[18px] object-cover border border-black/5 dark:border-white/10 shadow-lg"
                                                referrerPolicy="no-referrer"
                                            />
                                            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-slate-50 dark:border-slate-950 flex items-center justify-center shadow-lg ${ref.status === 'confirmed' ? 'bg-emerald-500 text-white' : ref.status === 'pending' ? 'bg-orange-500 text-white' : 'bg-red-500 text-white'}`}>
                                                {ref.status === 'confirmed' ? <CheckCircle2 size={12} /> : ref.status === 'pending' ? <Clock size={12} /> : <XCircle size={12} />}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center border shadow-lg ${ref.status === 'confirmed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-500' : ref.status === 'pending' ? 'bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-500' : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-500'}`}>
                                            {ref.status === 'confirmed' ? <CheckCircle2 size={22} /> : ref.status === 'pending' ? <Clock size={22} /> : <XCircle size={22} />}
                                        </div>
                                    )}
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                                                {ref.referred_user?.name || `Kullanıcı #${ref.referred_id.slice(-4)}`}
                                            </span>
                                            {ref.is_premium_referral && (
                                                <span className="px-2.5 py-0.5 bg-purple-600/20 border border-purple-500/20 text-[8px] font-bold text-purple-600 dark:text-purple-400 rounded-full uppercase tracking-wider">PREMIUM</span>
                                            )}
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase">
                                            {ref.status === 'pending' ? 'Grup Katılımı Bekleniyor' : new Date(ref.created_at).toLocaleDateString('tr-TR')}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`text-sm font-bold tracking-tight ${ref.status === 'confirmed' ? 'text-emerald-600 dark:text-emerald-500' : 'text-slate-400 dark:text-slate-600'}`}>
                                        +{ref.reward_amount} HP
                                    </span>
                                    <p className={`text-[9px] font-bold uppercase tracking-wider mt-0.5 ${ref.status === 'confirmed' ? 'text-emerald-600/50 dark:text-emerald-500/50' : 'text-orange-600/50 dark:text-orange-500/50'}`}>
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

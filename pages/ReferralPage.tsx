
import React, { useState, useEffect } from 'react';
import { useTelegram } from '../hooks/useTelegram';
import { DatabaseService } from '../services/DatabaseService';
import { Referral, ReferralSettings } from '../types';
import { Users, Gift, Share2, Award, Clock, CheckCircle2, XCircle, Copy, ExternalLink, Loader2, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from '../TranslationContext';

const ReferralPage = () => {
    const { user } = useTelegram();
    const { t, language } = useTranslation();
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
        DatabaseService.logActivity(user.id.toString(), 'system', 'referral_link_copied', t('ref_link_copied_log_title') || 'Referans Linki Kopyalandı', t('ref_link_copied_log_desc') || 'Kullanıcı referans linkini kopyaladı.');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShare = () => {
        const text = `${t('ref_share_text')} ${referralLink}`;
        DatabaseService.logActivity(user.id.toString(), 'system', 'referral_link_shared', t('ref_link_shared_log_title') || 'Referans Linki Paylaşıldı', t('ref_link_shared_log_desc') || 'Kullanıcı referans linkini Telegram üzerinden paylaştı.');
        window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(text)}`);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
                <span className="text-xs font-black uppercase tracking-widest opacity-40">{t('ref_loading')}</span>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 pb-32 bg-slate-50 dark:bg-slate-950 min-h-screen animate-in fade-in transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
            <div className="flex items-center justify-between mb-10 px-1">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-xl border border-black/5 dark:border-white/5 flex items-center justify-center shadow-sm">
                        <Users className="text-brand dark:text-brand-light" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">{t('ref_title').split(' ')[0]} <span className="text-brand dark:text-brand-light">{t('ref_title').split(' ').slice(1).join(' ')}</span></h1>
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mt-1.5">HUB NETWORK v4.2.0</p>
                    </div>
                </div>
                <div className="w-10 h-10 bg-brand/10 border border-brand/20 rounded-xl flex items-center justify-center text-brand dark:text-brand-light animate-bounce">
                    <Gift size={18} />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-5">
                <div className="bg-white dark:bg-slate-900/40 border border-black/5 dark:border-white/5 p-8 rounded-xl space-y-2 fancy-glass-card stats-card-bg group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-slate-500/5 blur-2xl -mr-8 -mt-8 rounded-full" />
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] relative z-10">{t('ref_total_invites')}</span>
                    <div className="flex items-baseline gap-2 relative z-10">
                        <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic group-hover:scale-110 transition-transform duration-500">{stats?.total || 0}</span>
                        <span className="text-[11px] font-black text-slate-400 uppercase italic">{t('ref_person')}</span>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900/40 border border-black/5 dark:border-white/5 p-8 rounded-xl space-y-2 fancy-glass-card stats-card-bg group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 blur-2xl -mr-8 -mt-8 rounded-full" />
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] relative z-10">{t('ref_total_earnings')}</span>
                    <div className="flex items-baseline gap-2 relative z-10">
                        <span className="text-4xl font-black text-emerald-500 tracking-tighter italic group-hover:scale-110 transition-transform duration-500">{stats?.earnings || 0}</span>
                        <span className="text-[11px] font-black text-emerald-500/50 uppercase italic">HP</span>
                    </div>
                </div>
            </div>

            {/* Referral Link Box */}
            <div className="bg-brand/10 dark:bg-brand-light/5 border border-brand/20 dark:border-brand-light/20 p-10 rounded-xl space-y-10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-125 transition-transform duration-1000">
                    <Gift size={200} />
                </div>
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-brand/5 blur-[100px] rounded-full" />
                
                <div className="space-y-4 relative z-10 text-center md:text-left">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">{t('ref_your_link')}</h3>
                    <p className="text-[10px] font-black text-brand dark:text-brand-light/70 leading-relaxed uppercase tracking-widest max-w-sm px-4 md:px-0">
                        {t('ref_share_desc').replace('{reward}', settings?.standard_reward?.toString() || '0')}
                    </p>
                </div>

                <div className="flex flex-col gap-5 relative z-10">
                    <div className="flex items-center gap-4 bg-white/50 dark:bg-slate-950/50 border border-black/5 dark:border-white/5 p-2 pr-6 rounded-xl group-focus-within:border-brand/40 transition-all shadow-sm">
                        <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-brand transition-colors">
                            <ExternalLink size={20} />
                        </div>
                        <input 
                            readOnly 
                            value={referralLink}
                            className="bg-transparent border-none outline-none text-[11px] font-black text-slate-600 dark:text-slate-300 flex-1 truncate uppercase tracking-widest"
                        />
                        <button 
                            onClick={handleCopy}
                            className="w-12 h-12 flex items-center justify-center bg-brand/10 dark:bg-brand-light/10 hover:bg-brand/20 dark:hover:bg-brand-light/20 rounded-xl transition-all text-brand dark:text-brand-light group active:scale-90"
                        >
                            {copied ? <CheckCircle2 size={20} className="animate-in zoom-in" /> : <Copy size={20} />}
                        </button>
                    </div>
                    
                    <button 
                        onClick={handleShare}
                        className="w-full py-6 bg-brand dark:bg-brand-light hover:shadow-lg hover:shadow-brand/20 text-white font-black text-[12px] uppercase tracking-[0.3em] rounded-xl transition-all flex items-center justify-center gap-4 active:scale-95 border-b-8 border-brand-dark dark:border-brand-light/20 group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                        <Share2 size={20} className="relative z-10" />
                        <span className="relative z-10 italic">{t('ref_invite_friend')}</span>
                    </button>
                </div>
            </div>

            {/* Security Info */}
            <div className="bg-white dark:bg-slate-900/40 border border-black/5 dark:border-white/5 p-10 rounded-xl space-y-8 fancy-glass-card">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-xl flex items-center justify-center">
                        <ShieldCheck className="text-emerald-500" size={24} />
                    </div>
                    <h4 className="text-[15px] font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">{t('ref_how_to_earn')}</h4>
                </div>
                <div className="space-y-6">
                    {[
                        { step: '01', text: t('ref_step_1'), color: 'brand' },
                        { step: '02', text: t('ref_step_2'), color: 'emerald' },
                        { step: '03', text: t('ref_step_3'), color: 'brand' }
                    ].map((item, i) => (
                        <div key={i} className="flex gap-5 items-center group">
                            <span className={`text-[20px] font-black text-${item.color}-500 opacity-20 group-hover:opacity-100 transition-opacity italic`}>{item.step}</span>
                            <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 leading-relaxed uppercase tracking-widest">{item.text}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Referral List */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-4">
                    <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.4em]">{t('ref_statuses')}</h3>
                    <div className="flex items-center gap-2 text-[9px] font-black text-brand uppercase tracking-widest bg-brand/5 px-3 py-1 rounded-lg border border-brand/10">
                        <div className="w-1 h-1 bg-brand rounded-full animate-pulse" />
                        <span>{t('ref_auto_confirm')}</span>
                    </div>
                </div>

                <div className="space-y-3">
                    {referrals.length === 0 ? (
                        <div className="py-20 text-center bg-white dark:bg-slate-900/20 border border-dashed border-black/5 dark:border-white/10 rounded-xl fancy-glass-card">
                            <Users className="mx-auto text-slate-100 dark:text-slate-800 mb-6" size={56} />
                            <p className="text-[11px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.3em] italic">{t('ref_no_data')}</p>
                        </div>
                    ) : (
                        referrals.map((ref) => (
                            <div key={ref.id} className="bg-white dark:bg-slate-900/40 border border-black/5 dark:border-white/5 p-5 rounded-xl flex items-center justify-between fancy-glass-card group hover:border-brand/20 transition-all">
                                <div className="flex items-center gap-5">
                                    {ref.referred_user?.avatar ? (
                                        <div className="relative">
                                            <div className="w-14 h-14 rounded-xl p-0.5 bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700">
                                                <img 
                                                    src={ref.referred_user.avatar} 
                                                    alt={ref.referred_user.name} 
                                                    className="w-full h-full rounded-xl object-cover"
                                                    referrerPolicy="no-referrer"
                                                />
                                            </div>
                                            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-xl border-2 border-slate-50 dark:border-slate-950 flex items-center justify-center shadow-lg ${ref.status === 'confirmed' ? 'bg-emerald-500 text-white' : ref.status === 'pending' ? 'bg-orange-500 text-white' : 'bg-red-500 text-white'}`}>
                                                {ref.status === 'confirmed' ? <CheckCircle2 size={12} /> : ref.status === 'pending' ? <Clock size={12} /> : <XCircle size={12} />}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center border ${ref.status === 'confirmed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : ref.status === 'pending' ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                                            {ref.status === 'confirmed' ? <CheckCircle2 size={24} /> : ref.status === 'pending' ? <Clock size={24} /> : <XCircle size={24} />}
                                        </div>
                                    )}
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[15px] font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">
                                                {ref.referred_user?.name || `USR-${ref.referred_id.slice(-4).toUpperCase()}`}
                                            </span>
                                            {ref.is_premium_referral && (
                                                <div className="px-2 py-0.5 bg-brand/10 border border-brand/20 text-[7px] font-black text-brand rounded-md uppercase tracking-widest italic animate-pulse">PRO</div>
                                            )}
                                        </div>
                                        <span className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">
                                            {ref.status === 'pending' ? t('ref_waiting') : new Date(ref.created_at).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`text-[16px] font-black tracking-tighter italic ${ref.status === 'confirmed' ? 'text-emerald-500' : 'text-slate-400'}`}>
                                        +{ref.reward_amount} HP
                                    </span>
                                    <p className={`text-[8px] font-black uppercase tracking-[0.2em] mt-1 ${ref.status === 'confirmed' ? 'text-emerald-500/50' : 'text-orange-500/50'}`}>
                                        {ref.status === 'confirmed' ? t('ref_confirmed') : ref.status === 'pending' ? t('ref_pending') : t('ref_rejected')}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            </div>
        </div>
    );
};

export default ReferralPage;

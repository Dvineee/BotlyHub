
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { User, CreditCard, Bell, Globe, ChevronRight, Crown, Users, Sun, Moon } from 'lucide-react';
// Fixed: Use namespace import for react-router-dom to resolve "no exported member" errors
import * as Router from 'react-router-dom';
import { subscriptionPlans } from '../data';
import { useTelegram } from '../hooks/useTelegram';
import { useTheme } from '../ThemeContext';
import { useTranslation } from '../TranslationContext';
import { AnimatePresence, motion } from 'motion/react';

const { useNavigate } = Router as any;

const ProfileSettings = () => {
  const navigate = useNavigate();
  const { user } = useTelegram();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useTranslation();
  const [currentPlanName, setCurrentPlanName] = useState('Başlangıç');
  const [version, setVersion] = useState<string | null>(null);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);

  const languages = [
    { code: 'en', label: 'English (EN)', flag: '🇬🇧' },
    { code: 'ru', label: 'Russian (RU)', flag: '🇷🇺' },
    { code: 'fa', label: 'Persian / Farsi (FA)', flag: '🇮🇷' },
    { code: 'tr', label: 'Turkish (TR)', flag: '🇹🇷' },
    { code: 'uk', label: 'Ukrainian (UK)', flag: '🇺🇦' },
    { code: 'es', label: 'Spanish (ES)', flag: '🇪🇸' },
    { code: 'hi', label: 'Hindi (HI)', flag: '🇮🇳' },
    { code: 'ar', label: 'Arabic (AR)', flag: '🇸🇦' },
  ];

  const currentLangLabel = languages.find(l => l.code === language)?.label || 'Turkish (TR)';

  useEffect(() => {
      const planId = localStorage.getItem('userPlan');
      if (planId) {
          const plan = subscriptionPlans.find(p => p.id === planId);
          if (plan) setCurrentPlanName(plan.name);
      }
      
      // Fetch version
      import('../services/DatabaseService').then(({ DatabaseService }) => {
          DatabaseService.getSettings().then(settings => {
              if (settings?.version) setVersion(settings.version);
          });
      });
  }, []);

  // Kullanıcı adı veya isim yoksa varsayılan değerler
  const displayName = useMemo(() => user ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Misafir Kullanıcı', [user]);
  const displayUsername = useMemo(() => user?.username ? `@${user.username}` : (user?.id ? `ID: ${user.id}` : '@misafir'), [user]);
  
  // Profil fotoğrafı yoksa baş harflerden avatar oluşturma (Placeholder API)
  const avatarUrl = useMemo(() => user?.photo_url 
    ? user.photo_url 
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=334155&color=fff&size=200`, [user, displayName]);

  const MenuItem = React.memo(({ icon: Icon, label, value, hasArrow = true, onClick }: { icon: any, label: string, value?: string, hasArrow?: boolean, onClick?: () => void }) => (
    <div 
        onClick={onClick}
        className="flex items-center justify-between p-5 bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-all cursor-pointer group first:rounded-t-[32px] last:rounded-b-[32px] border-b border-black/5 dark:border-white/5 last:border-0 active:scale-[0.98]"
    >
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-950 group-hover:bg-brand/10 dark:group-hover:bg-brand-light/10 flex items-center justify-center transition-all border border-black/5 dark:border-white/5 group-hover:border-brand/20 dark:group-hover:border-brand-light/20 shadow-inner">
                <Icon size={20} className="text-slate-500 dark:text-slate-400 group-hover:text-brand dark:group-hover:text-brand-light transition-colors" />
            </div>
            <span className="font-bold text-[11px] text-slate-900 dark:text-white uppercase tracking-wider">{label}</span>
        </div>
        <div className="flex items-center gap-3">
            {value && <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">{value}</span>}
            {hasArrow && <ChevronRight size={18} className="text-slate-400 dark:text-slate-700 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />}
        </div>
    </div>
  ));

  return (
    <div className="min-h-screen p-6 pt-10 pb-32 bg-slate-50 dark:bg-slate-950 transition-colors animate-in fade-in">
         <div className="flex items-center gap-5 mb-10 px-1">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Profil Ayarları</h1>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">User Configuration v4</p>
            </div>
        </div>

        {/* Profile Card */}
        <div className="flex items-center gap-5 mb-10 p-6 bg-white dark:bg-slate-900/40 rounded-[32px] border border-black/5 dark:border-white/5 backdrop-blur-xl shadow-xl">
             <div className="w-20 h-20 rounded-[24px] bg-slate-100 dark:bg-slate-950 flex items-center justify-center overflow-hidden border border-black/10 dark:border-white/10 shadow-inner">
                 <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" loading="lazy" />
             </div>
             <div className="flex-1 min-w-0">
                 <h2 className="font-bold text-xl text-slate-900 dark:text-white tracking-tight truncate mb-1">{displayName}</h2>
                 <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-3">{displayUsername}</p>
                 <div className="inline-flex items-center gap-2 bg-brand/10 dark:bg-brand-light/10 text-brand dark:text-brand-light px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border border-brand/20 dark:border-brand-light/20 shadow-lg shadow-blue-900/20">
                    <Crown size={12} className="fill-brand/20 dark:fill-brand-light/20" />
                    <span>{currentPlanName}</span>
                 </div>
             </div>
        </div>

        <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-4 ml-4">Hesap Yönetimi</h3>
        <div className="mb-8 rounded-[32px] border border-black/5 dark:border-white/5 bg-white dark:bg-slate-900/20 overflow-hidden shadow-xl">
            <MenuItem 
                icon={User} 
                label="Hesap Bilgileri" 
                onClick={() => navigate('/account-settings')}
            />
            <MenuItem 
                icon={CreditCard} 
                label="Abonelik Yönetimi" 
                value={currentPlanName} 
                onClick={() => navigate('/premium')}
            />
            <MenuItem 
                icon={Users} 
                label="Referans Sistemi" 
                onClick={() => navigate('/referral')}
            />
        </div>

        <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-4 ml-4">Uygulama Tercihleri</h3>
        <div className="mb-8 rounded-[32px] border border-black/5 dark:border-white/5 bg-white dark:bg-slate-900/20 overflow-hidden shadow-xl">
            <MenuItem 
                icon={Bell} 
                label="Bildirimler" 
                onClick={() => navigate('/notifications')}
            />
            <MenuItem 
                icon={theme === 'dark' ? Moon : Sun} 
                label="Görünüm Modu" 
                value={theme === 'dark' ? 'Karanlık' : 'Aydınlık'} 
                onClick={toggleTheme}
            />
            <MenuItem 
                icon={Globe} 
                label="Dil Seçimi" 
                value={currentLangLabel} 
                onClick={() => setShowLanguagePicker(true)}
            />
        </div>

        {/* Language Picker Modal */}
        <AnimatePresence>
            {showLanguagePicker && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-6">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowLanguagePicker(false)}
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                    />
                    <motion.div 
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-t-[40px] sm:rounded-[40px] overflow-hidden shadow-2xl border-t sm:border border-black/10 dark:border-white/10"
                    >
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight uppercase tracking-widest">Dil Seçiniz</h3>
                                <button onClick={() => setShowLanguagePicker(false)} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500">
                                    <Globe size={20} />
                                </button>
                            </div>
                            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                {languages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => {
                                            setLanguage(lang.code as any);
                                            setShowLanguagePicker(false);
                                        }}
                                        className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                                            language === lang.code 
                                            ? 'bg-brand/10 border-brand/20 border' 
                                            : 'hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="text-2xl">{lang.flag}</span>
                                            <span className={`text-sm font-bold ${language === lang.code ? 'text-brand dark:text-brand-light' : 'text-slate-600 dark:text-slate-400'}`}>
                                                {lang.label}
                                            </span>
                                        </div>
                                        {language === lang.code && (
                                            <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>

        {version && (
            <div className="mt-12 text-center opacity-20">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">BOTLYHUB {version}</p>
            </div>
        )}
    </div>
  );
};

export default ProfileSettings;

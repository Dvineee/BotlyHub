
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { User, CreditCard, Bell, Globe, ChevronRight, Crown, Users, Sun, Moon, Settings, ChevronLeft } from 'lucide-react';
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
  const { user, haptic } = useTelegram();
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
        onClick={() => { haptic('light'); onClick?.(); }}
        className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-xl mb-2 transition-all cursor-pointer active:scale-[0.98]"
    >
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-black/5 dark:border-white/5">
                <Icon size={18} className="text-slate-500" />
            </div>
            <span className="font-bold text-[12px] text-slate-800 dark:text-slate-200 uppercase tracking-tight">{label}</span>
        </div>
        <div className="flex items-center gap-2">
            {value && <span className="text-slate-400 text-[10px] font-bold uppercase">{value}</span>}
            {hasArrow && <ChevronRight size={16} className="text-slate-300" />}
        </div>
    </div>
  ));

  return (
    <div className="min-h-screen px-5 sm:px-8 pt-6 md:pt-10 pb-32 bg-slate-50 dark:bg-slate-950 transition-colors animate-in fade-in">
        <div className="max-w-7xl mx-auto">
             <div className="flex items-center justify-between mb-8 px-1">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight uppercase tracking-widest">Ayarlar</h1>
            <div className="w-10 h-10" />
        </div>

        {/* Profile Card */}
        <div className="relative mb-8 p-6 bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-xl overflow-hidden group">
             <div className="relative z-10 flex items-center gap-6">
                <div className="relative">
                    <div className="w-20 h-20 rounded-xl p-0.5 bg-gradient-to-tr from-brand to-brand-light">
                        <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover rounded-xl border-4 border-white dark:border-slate-900" loading="lazy" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-lg border-2 border-white dark:border-slate-900 flex items-center justify-center" />
                </div>
                
                <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-xl text-slate-900 dark:text-white tracking-tight truncate leading-none mb-1">{displayName}</h2>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-3">{displayUsername}</p>
                    
                    <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-500 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-blue-500/20">
                        <Crown size={10} />
                        <span>{currentPlanName} Planı</span>
                    </div>
                </div>
             </div>
        </div>

        <div className="space-y-6">
            <div>
                <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-3 px-1">Hesap</h3>
                <MenuItem icon={User} label="Hesap Bilgileri" onClick={() => navigate('/account-settings')} />
                <MenuItem icon={CreditCard} label="Abonelik" value={currentPlanName} onClick={() => navigate('/premium')} />
                <MenuItem icon={Users} label="Referanslar" onClick={() => navigate('/referral')} />
            </div>

            <div>
                <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-3 px-1">Uygulama</h3>
                <MenuItem icon={Bell} label="Bildirimler" onClick={() => navigate('/notifications')} />
                <MenuItem icon={theme === 'dark' ? Moon : Sun} label="Görünüm" value={theme === 'dark' ? 'Karanlık' : 'Aydınlık'} onClick={toggleTheme} />
                <MenuItem icon={Globe} label="Dil" value={currentLangLabel} onClick={() => setShowLanguagePicker(true)} />
            </div>
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
                        className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-t-xl sm:rounded-xl overflow-hidden  border-t sm:border border-black/10 dark:border-white/10"
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
                                        className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
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
  </div>
  );
};

export default ProfileSettings;

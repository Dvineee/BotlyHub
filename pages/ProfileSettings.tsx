
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { User, CreditCard, Bell, Globe, ChevronRight, Crown, Users, Sun, Moon, Settings } from 'lucide-react';
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
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-950 group-hover:bg-brand/10 dark:group-hover:bg-brand-light/10 flex items-center justify-center transition-all border border-black/5 dark:border-white/5 group-hover:border-brand/20 dark:group-hover:border-brand-light/20 ">
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
        <div className="max-w-7xl mx-auto">
             <div className="flex items-center justify-between mb-10 px-1">
            <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase">Profil Ayarları</h1>
                <p className="text-[10px] font-black text-brand dark:text-brand-light uppercase tracking-[0.3em] mt-1">CONFIG v4.2.0</p>
            </div>
            <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center border border-black/5 dark:border-white/5 text-slate-400">
                <Settings size={20} />
            </div>
        </div>

        {/* Profile Card */}
        <div className="relative mb-10 p-8 bg-white dark:bg-slate-900/40 rounded-[44px] border border-black/5 dark:border-white/5 backdrop-blur-xl overflow-hidden fancy-glass-card group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 dark:bg-brand-light/5 blur-3xl -mr-16 -mt-16 rounded-full group-hover:bg-brand/10 transition-colors duration-700" />
             
             <div className="relative z-10 flex items-center gap-6">
                <div className="relative">
                    <div className="w-24 h-24 rounded-[32px] p-1 bg-gradient-to-tr from-brand to-brand-light">
                        <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover rounded-[28px] border-4 border-white dark:border-slate-900" loading="lazy" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-xl border-4 border-white dark:border-slate-900 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    </div>
                </div>
                
                <div className="flex-1 min-w-0">
                    <h2 className="font-black text-2xl text-slate-900 dark:text-white tracking-tighter truncate uppercase italic leading-none mb-2">{displayName}</h2>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">{displayUsername}</p>
                    
                    <div className="inline-flex items-center gap-2 bg-brand/10 dark:bg-brand-light/10 text-brand dark:text-brand-light px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-brand/20 dark:border-brand-light/20 shadow-sm animate-pulse">
                        <Crown size={12} className="fill-brand/20 dark:fill-brand-light/20" />
                        <span>{currentPlanName} LİSANSI</span>
                    </div>
                </div>
             </div>
        </div>

        <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between px-4">
                <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em]">HESAP YÖNETİMİ</h3>
                <div className="w-8 h-px bg-slate-200 dark:bg-slate-900" />
            </div>
            
            <div className="rounded-[40px] border border-black/5 dark:border-white/5 bg-white dark:bg-slate-900/20 overflow-hidden fancy-glass-card">
                <div className="p-2 space-y-1">
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
            </div>
        </div>

        <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between px-4">
                <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em]">UYGULAMA TERCIHLERI</h3>
                <div className="w-8 h-px bg-slate-200 dark:bg-slate-900" />
            </div>
            
            <div className="rounded-[40px] border border-black/5 dark:border-white/5 bg-white dark:bg-slate-900/20 overflow-hidden fancy-glass-card">
                <div className="p-2 space-y-1">
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
                        className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-t-[40px] sm:rounded-[40px] overflow-hidden  border-t sm:border border-black/10 dark:border-white/10"
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
  </div>
  );
};

export default ProfileSettings;

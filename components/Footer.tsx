
import React, { useState, useRef, useEffect } from 'react';
import { Send, ChevronRight, Share2, Globe, ChevronDown, Moon, Sun, X, ShieldAlert } from 'lucide-react';
import Logo from './Logo';
import { useTelegram } from '../hooks/useTelegram';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../TranslationContext';
import { useTheme } from '../ThemeContext';

const Footer: React.FC = () => {
    const navigate = useNavigate();
    const { haptic } = useTelegram();
    const { t, language, setLanguage } = useTranslation();
    const { theme, toggleTheme } = useTheme();

    const [isLangOpen, setIsLangOpen] = useState(false);
    const [isDocsOpen, setIsDocsOpen] = useState(false);
    const [isCookieSettingsOpen, setIsCookieSettingsOpen] = useState(false);
    const [cookieSettings, setCookieSettings] = useState(() => {
        const saved = localStorage.getItem('cookie_preferences');
        return saved ? JSON.parse(saved) : { essential: true, analytical: true, marketing: false };
    });

    const langRef = useRef<HTMLDivElement>(null);
    const docsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (langRef.current && !langRef.current.contains(event.target as Node)) {
                setIsLangOpen(false);
            }
            if (docsRef.current && !docsRef.current.contains(event.target as Node)) {
                setIsDocsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const saveCookieSettings = (settings: typeof cookieSettings) => {
        setCookieSettings(settings);
        localStorage.setItem('cookie_preferences', JSON.stringify(settings));
        setIsCookieSettingsOpen(false);
        if (haptic) haptic();
    };

    const languages = [
        { code: 'tr', name: 'Türkçe' },
        { code: 'en', name: 'İngilizce' },
        { code: 'ru', name: 'Русский' },
        { code: 'es', name: 'Español' },
        { code: 'fa', name: 'Farsi' },
        { code: 'uk', name: 'Українська' },
        { code: 'hi', name: 'हिन्दी' },
        { code: 'ar', name: 'العربية' }
    ];

    const currentLanguageName = languages.find(l => l.code === language)?.name || 'İngilizce';

  return (
    <footer className="mt-12 px-4 pb-32 max-w-7xl mx-auto w-full border-t border-black/5 dark:border-white/5 pt-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-2">
            <div className="flex items-center mb-4">
                <Logo />
            </div>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed max-w-xs mb-6">
                {t('footer_description')}
            </p>

            {/* Controls Area (Cookies, Language, Docs, Theme) */}
            <div className="flex flex-wrap items-center gap-2 mt-6">
                {/* Çerezleri Yönet */}
                <button
                    onClick={() => {
                        setIsCookieSettingsOpen(true);
                        if (haptic) haptic();
                    }}
                    className="h-9 px-4 flex items-center justify-center bg-slate-100 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/5 rounded-xl text-[12px] font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-all cursor-pointer shadow-sm select-none"
                    id="manage-cookies-btn"
                >
                    Çerezleri Yönet
                </button>

                {/* Dil Seçeceği (dropdown) */}
                <div className="relative" ref={langRef} id="language-switcher-dropdown">
                    <button
                        onClick={() => {
                            setIsLangOpen(!isLangOpen);
                            if (haptic) haptic();
                        }}
                        className="h-9 px-4 flex items-center gap-2 bg-slate-100 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/5 rounded-xl text-[12px] font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-all cursor-pointer shadow-sm select-none"
                    >
                        <Globe size={14} className="opacity-70" />
                        <span>{currentLanguageName}</span>
                        <ChevronDown size={12} className={`opacity-50 transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isLangOpen && (
                        <div className="absolute bottom-full mb-2 left-0 w-44 bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden py-1 divide-y divide-slate-100 dark:divide-white/5">
                            <div className="max-h-56 overflow-y-auto scrollbar-thin">
                                {languages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => {
                                            // @ts-ignore
                                            setLanguage(lang.code);
                                            setIsLangOpen(false);
                                            if (haptic) haptic();
                                        }}
                                        className={`w-full text-left px-4 py-2 text-[12px] font-medium transition-colors ${
                                            language === lang.code
                                                ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
                                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'
                                        }`}
                                    >
                                        {lang.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Docs (dropdown) */}
                <div className="relative" ref={docsRef} id="docs-dropdown">
                    <button
                        onClick={() => {
                            setIsDocsOpen(!isDocsOpen);
                            if (haptic) haptic();
                        }}
                        className="h-9 px-4 flex items-center gap-2 bg-slate-100 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/5 rounded-xl text-[12px] font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-all cursor-pointer shadow-sm select-none"
                    >
                        <span>Docs</span>
                        <ChevronDown size={12} className={`opacity-50 transition-transform duration-200 ${isDocsOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isDocsOpen && (
                        <div className="absolute bottom-full mb-2 left-0 w-40 bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden py-1">
                            <a
                                href="#docs-api"
                                className="block px-4 py-2 text-[12px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                                onClick={() => setIsDocsOpen(false)}
                            >
                                API Reference
                            </a>
                            <a
                                href="#docs-guide"
                                className="block px-4 py-2 text-[12px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                                onClick={() => setIsDocsOpen(false)}
                            >
                                User Guide
                            </a>
                            <a
                                href="#docs-partners"
                                className="block px-4 py-2 text-[12px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                                onClick={() => setIsDocsOpen(false)}
                            >
                                Team & Partner
                            </a>
                        </div>
                    )}
                </div>

                {/* Theme Switcher Toggle */}
                <button
                    onClick={() => {
                        toggleTheme();
                        if (haptic) haptic();
                    }}
                    className="h-9 w-9 flex items-center justify-center bg-slate-100 dark:bg-slate-900/40 border border-slate-200/50 dark:border-white/5 rounded-xl text-slate-800 dark:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-all cursor-pointer shadow-sm select-none"
                    title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    id="theme-toggle-footer"
                >
                    {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                </button>
            </div>
        </div>

        <div className="space-y-4">
            <h4 className="footer-title text-slate-900 dark:text-white">{t('footer_links')}</h4>
            <div className="flex flex-col gap-3">
                <button onClick={() => navigate('/')} className="text-[11px] font-bold text-slate-400 hover:text-blue-500 text-left uppercase tracking-widest transition-colors">{t('footer_home')}</button>
                <button onClick={() => navigate('/blog')} className="text-[11px] font-bold text-slate-400 hover:text-blue-500 text-left uppercase tracking-widest transition-colors">{t('footer_blog')}</button>
                <button onClick={() => navigate('/stats')} className="text-[11px] font-bold text-slate-400 hover:text-blue-500 text-left uppercase tracking-widest transition-colors">{t('footer_stats')}</button>
                <button onClick={() => navigate('/qa')} className="text-[11px] font-bold text-slate-400 hover:text-blue-500 text-left uppercase tracking-widest transition-colors">{t('footer_qa')}</button>
                <button onClick={() => navigate('/premium')} className="text-[11px] font-bold text-slate-400 hover:text-blue-500 text-left uppercase tracking-widest transition-colors">{t('footer_premium')}</button>
                <button onClick={() => navigate('/search?mode=apps')} className="text-[11px] font-bold text-slate-400 hover:text-blue-500 text-left uppercase tracking-widest transition-colors">{t('footer_apps')}</button>
            </div>
        </div>

        <div className="space-y-4">
            <h4 className="footer-title text-slate-900 dark:text-white">{t('footer_categories')}</h4>
            <div className="flex flex-col gap-3">
                <button onClick={() => navigate('/search?category=bots')} className="text-[11px] font-bold text-slate-400 hover:text-blue-500 text-left uppercase tracking-widest transition-colors">{t('footer_tg_bots')}</button>
                <button onClick={() => navigate('/search?category=apps')} className="text-[11px] font-bold text-slate-400 hover:text-blue-500 text-left uppercase tracking-widest transition-colors">{t('footer_mini_apps')}</button>
                <button onClick={() => navigate('/search?category=channels')} className="text-[11px] font-bold text-slate-400 hover:text-blue-500 text-left uppercase tracking-widest transition-colors">{t('footer_channels')}</button>
                <button onClick={() => navigate('/search?category=groups')} className="text-[11px] font-bold text-slate-400 hover:text-blue-500 text-left uppercase tracking-widest transition-colors">{t('footer_groups')}</button>
            </div>
        </div>

        <div className="space-y-4">
            <h4 className="footer-title text-slate-900 dark:text-white">{t('footer_contact')}</h4>
            <div className="flex flex-col gap-3">
                <a href="https://t.me/botlyhub" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[11px] font-bold text-slate-400 hover:text-blue-500 uppercase tracking-widest transition-colors"><Send size={14} /> {t('footer_tg_announcement')}</a>
                <a href="#" className="flex items-center gap-2 text-[11px] font-bold text-slate-400 hover:text-blue-500 uppercase tracking-widest transition-colors"><Share2 size={14} /> {t('footer_twitter')}</a>
            </div>
        </div>
      </div>

      <div className="pt-8 border-t border-black/5 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 opacity-40">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('footer_all_rights')}</p>
        <div className="flex items-center gap-6">
            <button className="text-[9px] font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white uppercase tracking-widest transition-all">{t('footer_privacy')}</button>
            <button className="text-[9px] font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white uppercase tracking-widest transition-all">{t('footer_terms')}</button>
        </div>
      </div>

      {/* Cookie settings modal */}
      {isCookieSettingsOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[999] p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsCookieSettingsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-lg"
            >
              <X size={18} />
            </button>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 bg-blue-100 dark:bg-blue-950/50 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 flex">
                <ShieldAlert className="m-auto" size={20} />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Çerez Tercihleriniz</h3>
            </div>
            
            <p className="text-[12px] text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              Size en iyi deneyimi sunabilmek için web sitemizde çerezler kullanıyoruz. Tercihlerinizi özelleştirerek hangi çerezlerin etkinleştirileceğini belirleyebilirsiniz.
            </p>
            
            <div className="space-y-4 mb-6">
              {/* Essential */}
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                <div>
                  <h4 className="text-[12px] font-bold text-slate-800 dark:text-slate-200">Zorunlu Çerezler</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">Sitenin düzgün çalışması için gereklidir.</p>
                </div>
                <div className="h-5 w-9 bg-blue-500 rounded-full flex items-center p-0.5 justify-end opacity-60 cursor-not-allowed">
                  <div className="h-4 w-4 bg-white rounded-full"></div>
                </div>
              </div>

              {/* Analytical */}
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                <div>
                  <h4 className="text-[12px] font-bold text-slate-800 dark:text-slate-200">Analitik Çerezler</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">Ziyaretçi sayılarını takip etmemize yardımcı olur.</p>
                </div>
                <button
                  onClick={() => setCookieSettings({ ...cookieSettings, analytical: !cookieSettings.analytical })}
                  className={`h-5 w-9 rounded-full flex items-center p-0.5 transition-colors cursor-pointer ${cookieSettings.analytical ? 'bg-blue-500 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'}`}
                >
                  <div className="h-4 w-4 bg-white rounded-full shadow-sm"></div>
                </button>
              </div>

              {/* Marketing */}
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                <div>
                  <h4 className="text-[12px] font-bold text-slate-800 dark:text-slate-200">Pazarlama Çerezi</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">Reklamları sizin için daha alakalı getirmeyi sağlar.</p>
                </div>
                <button
                  onClick={() => setCookieSettings({ ...cookieSettings, marketing: !cookieSettings.marketing })}
                  className={`h-5 w-9 rounded-full flex items-center p-0.5 transition-colors cursor-pointer ${cookieSettings.marketing ? 'bg-blue-500 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'}`}
                >
                  <div className="h-4 w-4 bg-white rounded-full shadow-sm"></div>
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => saveCookieSettings({ essential: true, analytical: true, marketing: true })}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-white/10 text-[12px] font-bold rounded-xl transition-all cursor-pointer"
              >
                Hepsini Kabul Et
              </button>
              <button
                onClick={() => saveCookieSettings(cookieSettings)}
                className="flex-1 py-2.5 bg-blue-600 text-white hover:bg-blue-500 text-[12px] font-bold rounded-xl shadow-lg shadow-blue-500/15 transition-all cursor-pointer"
              >
                Tercihleri Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;

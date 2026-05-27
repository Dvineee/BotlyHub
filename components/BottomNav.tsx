
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Store, Search, User, Wallet, Bell } from 'lucide-react';
import { motion } from 'motion/react';
import { useTelegram } from '../hooks/useTelegram';
import { useTranslation } from '../TranslationContext';

const BottomNav: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { haptic } = useTelegram();
    const { t } = useTranslation();

    const navItems = [
        { id: 'home', icon: Store, path: '/', label: t('nav_market') },
        { id: 'search', icon: Search, path: '/search', label: t('nav_explore') },
        { id: 'earnings', icon: Wallet, path: '/earnings', label: t('nav_wallet') },
        { id: 'notifications', icon: Bell, path: '/notifications', label: t('nav_announcements') },
        { id: 'profile', icon: User, path: '/profile', label: t('nav_profile') },
    ];

    const isActive = (path: string) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <div className="md:hidden fixed bottom-6 left-6 right-6 z-[100] pb-[env(safe-area-inset-bottom)]">
            <div className="bg-white/90 dark:bg-[#0f121a]/95 backdrop-blur-3xl border border-black/5 dark:border-white/10 rounded-[28px] p-1.5 flex items-center justify-between shadow-2xl shadow-blue-500/5 select-none">
                {navItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <button
                            key={item.id}
                            onClick={() => { haptic('light'); navigate(item.path); }}
                            className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-[20px] transition-all duration-200 ${active ? 'text-blue-500 bg-blue-500/8 dark:bg-blue-500/12' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                        >
                            <item.icon size={20} strokeWidth={active ? 2.5 : 2} />
                            {active && (
                                <motion.div
                                    layoutId="bottomNavBadge"
                                    className="absolute -bottom-0.5 w-1 h-1 bg-blue-500 rounded-full"
                                />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomNav;

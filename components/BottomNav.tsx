
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
        { id: 'profile', icon: User, path: '/settings', label: t('nav_profile') },
    ];

    const isActive = (path: string) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <div className="md:hidden fixed bottom-4 left-4 right-4 z-[100]">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-[32px] p-2 flex items-center justify-between shadow-2xl shadow-blue-500/10">
                {navItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <button
                            key={item.id}
                            onClick={() => { haptic('light'); navigate(item.path); }}
                            className={`relative flex flex-col items-center justify-center w-14 h-14 rounded-[22px] transition-all ${active ? 'text-blue-500 bg-blue-500/5' : 'text-slate-400'}`}
                        >
                            <item.icon size={22} strokeWidth={active ? 2.5 : 2} />
                            {active && (
                                <motion.div
                                    layoutId="bottomNavBadge"
                                    className="absolute -bottom-1 w-1 h-1 bg-blue-500 rounded-full"
                                />
                            )}
                        </button>
                    );
                })}
            </div>
            {/* Safe area padding */}
            <div className="h-[env(safe-area-inset-bottom)]" />
        </div>
    );
};

export default BottomNav;

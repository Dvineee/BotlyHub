
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
        { id: 'profile', icon: User, path: '/profile', label: t('nav_profile') },
    ];

    const isActive = (path: string) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <div className="bottom-nav-container md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/95 dark:bg-[#0c0e14]/98 backdrop-blur-3xl border-t border-slate-200/50 dark:border-white/10 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgba(0,0,0,0.03)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.4)] select-none">
            <div className="flex items-center justify-around h-16 max-w-md mx-auto px-1">
                {navItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <button
                            key={item.id}
                            onClick={() => { haptic('light'); navigate(item.path); }}
                            className="relative flex flex-col items-center justify-center flex-1 h-full pb-1 pt-2 outline-none transition-transform active:scale-95"
                        >
                            <div className={`flex items-center justify-center p-1.5 rounded-xl transition-all duration-200 ${active ? 'text-blue-500 bg-blue-50/50 dark:bg-blue-500/10' : 'text-slate-400 dark:text-slate-500'}`}>
                                <item.icon size={21} className="transition-all" strokeWidth={active ? 2.25 : 1.8} />
                            </div>
                            <span className={`text-[9.5px] font-bold tracking-wider uppercase transition-colors duration-150 whitespace-nowrap overflow-hidden text-ellipsis max-w-full px-1 mt-0.5 ${active ? 'text-blue-500' : 'text-slate-400 dark:text-slate-500'}`}>
                                {item.label}
                            </span>
                            {active && (
                                <motion.div
                                    layoutId="bottomNavBadge"
                                    className="absolute top-0 w-8 h-0.5 bg-blue-500 rounded-full"
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

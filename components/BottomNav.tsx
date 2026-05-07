
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Store, Search, User, Wallet, Bell } from 'lucide-react';
import { motion } from 'motion/react';
import { useTelegram } from '../hooks/useTelegram';

const BottomNav: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { haptic } = useTelegram();

    const navItems = [
        { id: 'home', icon: Store, path: '/', label: 'Market' },
        { id: 'search', icon: Search, path: '/search', label: 'Keşfet' },
        { id: 'earnings', icon: Wallet, path: '/earnings', label: 'Cüzdan' },
        { id: 'notifications', icon: Bell, path: '/notifications', label: 'Duyuru' },
        { id: 'profile', icon: User, path: '/settings', label: 'Profil' },
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

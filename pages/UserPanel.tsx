import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Shield, 
    LayoutDashboard, 
    Bot, 
    MessageSquare, 
    Wallet, 
    Settings, 
    LogOut, 
    ChevronRight,
    Search,
    Bell,
    User as UserIcon,
    Menu,
    TrendingUp,
    Activity
} from 'lucide-react';

import { useTelegram } from '../hooks/useTelegram';
import { useDraggableScroll } from '../hooks/useDraggableScroll';
import Logo from '../components/Logo';

const UserPanel: React.FC = () => {
    const [activeSection, setActiveSection] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const navigate = useNavigate();
    
    const contentScroll = useDraggableScroll();

    useEffect(() => {
        const storedUser = localStorage.getItem('panel_user');
        if (!storedUser) {
            navigate('/u/login');
            return;
        }
        setUser(JSON.parse(storedUser));
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('panel_user');
        navigate('/u/login');
    };

    if (!user) return null;

    const menuItems = [
        { id: 'dashboard', label: 'Panel Özeti', icon: LayoutDashboard, category: 'GENEL' },
        { id: 'bots', label: 'Botlarım', icon: Bot, category: 'GRUP YÖNETİMİ' },
        { id: 'channels', label: 'Kanallarım', icon: MessageSquare, category: 'GRUP YÖNETİMİ' },
        { id: 'earnings', label: 'Kazançlarım', icon: Wallet, category: 'KÜTÜPHANE' },
        { id: 'settings', label: 'Ayarlar', icon: Settings, category: 'KÜTÜPHANE' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex overflow-hidden">
            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50 w-80 bg-slate-900/80 backdrop-blur-2xl border-r border-white/5 transition-transform duration-300
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="p-10">
                        <div className="flex items-center gap-4">
                            <div className="shrink-0">
                                <Logo 
                                    style={{ width: '2.5rem', height: 'auto', display: 'block' }} 
                                    className="" 
                                />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white tracking-tight">BotlyHub</h1>
                                <p className="text-[9px] font-bold text-purple-500 uppercase tracking-widest mt-0.5">Kullanıcı Paneli</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-6 space-y-10 overflow-y-auto custom-scrollbar">
                        {['GENEL', 'GRUP YÖNETİMİ', 'KÜTÜPHANE'].map(category => (
                            <div key={category} className="space-y-3">
                                <p className="px-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest">{category}</p>
                                <div className="space-y-1.5">
                                    {menuItems.filter(item => item.category === category).map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                setActiveSection(item.id);
                                                setIsSidebarOpen(false);
                                            }}
                                            className={`
                                                w-full flex items-center justify-between px-5 py-4 rounded-xl transition-all group
                                                ${activeSection === item.id 
                                                    ? 'bg-purple-600 text-white  ' 
                                                    : 'hover:bg-white/5 text-slate-400 hover:text-white'}
                                            `}
                                        >
                                            <div className="flex items-center gap-4">
                                                <item.icon size={20} className={activeSection === item.id ? 'text-white' : 'text-slate-500 group-hover:text-purple-400'} />
                                                <span className="text-[11px] font-bold uppercase tracking-widest">{item.label}</span>
                                            </div>
                                            <ChevronRight size={16} className={`transition-transform ${activeSection === item.id ? 'rotate-90' : 'opacity-0 group-hover:opacity-100'}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </nav>

                    {/* Footer */}
                    <div className="p-6 border-t border-white/5">
                        <div className="bg-slate-950/50 rounded-xl p-5 mb-5 border border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center font-bold text-sm text-white uppercase border border-white/5 ">
                                    {user.username?.substring(0, 2)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-white truncate tracking-tight">@{user.username}</p>
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Kullanıcı</p>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-3 py-4 rounded-xl text-red-500 hover:bg-red-500/10 transition-all text-[11px] font-bold uppercase tracking-widest border border-transparent hover:border-red-500/20"
                        >
                            <LogOut size={18} />
                            GÜVENLİ ÇIKIŞ
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Top Header */}
                <header className="h-24 border-b border-white/5 flex items-center justify-between px-8 bg-slate-900/40 backdrop-blur-xl z-40">
                    <div className="flex items-center gap-6">
                        <button 
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-slate-400"
                        >
                            <Menu size={24} />
                        </button>
                        <div className="hidden md:flex items-center gap-3 px-5 h-12 bg-slate-950/50 rounded-xl border border-white/5 w-80">
                            <Search size={18} className="text-slate-500" />
                            <input type="text" placeholder="Panelde ara..." className="bg-transparent border-none outline-none text-xs font-bold text-white placeholder:text-slate-600 w-full uppercase tracking-widest" />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="w-12 h-12 bg-slate-950/50 rounded-xl border border-white/5 flex items-center justify-center text-slate-500 hover:text-purple-400 transition-colors relative">
                            <Bell size={20} />
                            <span className="absolute top-3 right-3 w-2 h-2 bg-purple-500 rounded-full border-2 border-slate-900"></span>
                        </button>
                        <div className="h-12 w-[1px] bg-white/5 mx-2"></div>
                        <div className="flex items-center gap-4 pl-2">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-bold text-white tracking-tight">@{user.username}</p>
                                <p className="text-[9px] font-bold text-purple-500 uppercase tracking-widest mt-0.5">Çevrimiçi</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-600/20 rounded-xl border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
                                <UserIcon size={20} />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div 
                    ref={contentScroll.ref}
                    onMouseDown={contentScroll.onMouseDown}
                    onMouseUp={contentScroll.onMouseUp}
                    onMouseMove={contentScroll.onMouseMove}
                    onMouseLeave={contentScroll.onMouseLeave}
                    onContextMenu={contentScroll.onContextMenu}
                    className={`flex-1 overflow-y-auto p-8 custom-scrollbar ${contentScroll.isDragging ? 'cursor-grabbing' : ''}`}
                >
                    <div className="max-w-7xl mx-auto space-y-8">
                        {/* Welcome Section */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h2 className="text-3xl font-bold text-white tracking-tight">Hoş geldin, {user.username}!</h2>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2">Bugün neler yapmak istersin?</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="px-5 py-3 bg-purple-600/10 border border-purple-500/20 rounded-xl flex items-center gap-3">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Sistem Durumu: Aktif</span>
                                </div>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: 'Toplam Bot', value: '12', icon: Bot, color: 'purple' },
                                { label: 'Aktif Kanallar', value: '4', icon: MessageSquare, color: 'blue' },
                                { label: 'Aylık Kazanç', value: '₺1,250', icon: TrendingUp, color: 'emerald' },
                                { label: 'Toplam Etkileşim', value: '45.2K', icon: Activity, color: 'orange' },
                            ].map((stat, i) => (
                                <div key={i} className="bg-slate-900/40 border border-white/5 p-8 rounded-xl backdrop-blur-xl group hover:border-purple-500/20 transition-all fancy-glass-card stats-card-bg relative overflow-hidden">
                                     <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}-500/5 blur-3xl -mr-12 -mt-12 rounded-full`} />
                                     <div className="flex items-center justify-between mb-6 relative z-10">
                                         <div className={`w-14 h-14 bg-${stat.color}-500/10 rounded-xl flex items-center justify-center text-${stat.color}-400 border border-${stat.color}-500/10`}>
                                             <stat.icon size={26} />
                                         </div>
                                         <div className="px-3 py-1 bg-white/5 rounded-full border border-white/5">
                                             <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">LIVE</span>
                                         </div>
                                     </div>
                                     <p className="text-4xl font-black text-white tracking-tighter mb-2 italic translate-y-0 group-hover:-translate-y-1 transition-transform duration-500">{stat.value}</p>
                                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{stat.label}</p>
                                 </div>
                            ))}
                        </div>

                        {/* Placeholder for sections */}
                        <div className="bg-slate-900/40 border border-white/5 rounded-xl p-20 flex flex-col items-center justify-center text-center space-y-8 min-h-[500px] fancy-glass-card relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-purple-500/5" />
                            <div className="w-24 h-24 bg-white/5 rounded-xl flex items-center justify-center text-slate-700 relative z-10 border border-white/5 animate-pulse">
                                <LayoutDashboard size={48} />
                            </div>
                            <div className="relative z-10 max-w-md">
                                <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic tracking-widest">Sistem Konfigüre Ediliyor</h3>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-3 leading-relaxed opacity-60">
                                    {activeSection.toUpperCase()} modülü şu anda çekirdek sistem ile senkronize ediliyor. Yakında burada gerçek zamanlı veriler göreceksiniz.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default UserPanel;

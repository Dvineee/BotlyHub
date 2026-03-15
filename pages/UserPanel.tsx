import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Users, 
    Settings, 
    Library, 
    Bot, 
    LogOut, 
    ChevronRight,
    Shield,
    Menu,
    X
} from 'lucide-react';
import { User } from '../types';

const UserPanel: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [activeSection, setActiveSection] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const navigate = useNavigate();

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
        { id: 'group-users', label: 'Kullanıcılar', icon: Users, category: 'GRUP YÖNETİMİ' },
        { id: 'group-settings', label: 'Grup Ayarları', icon: Settings, category: 'GRUP YÖNETİMİ' },
        { id: 'bot-management', label: 'Bot Yönetimi', icon: Bot, category: 'KÜTÜPHANE' },
        { id: 'library', label: 'Bot Arşivi', icon: Library, category: 'KÜTÜPHANE' },
    ];

    return (
        <div className="min-h-screen bg-slate-950 flex font-sans text-slate-200">
            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-white/5 transition-transform duration-300
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="p-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-600/20">
                                <Shield size={20} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black italic uppercase tracking-tighter text-white">BotlyHub</h1>
                                <p className="text-[8px] font-bold text-purple-500 uppercase tracking-[0.2em]">Kullanıcı Paneli</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 space-y-8 overflow-y-auto custom-scrollbar">
                        {['GENEL', 'GRUP YÖNETİMİ', 'KÜTÜPHANE'].map(category => (
                            <div key={category} className="space-y-2">
                                <p className="px-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">{category}</p>
                                <div className="space-y-1">
                                    {menuItems.filter(item => item.category === category).map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => setActiveSection(item.id)}
                                            className={`
                                                w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group
                                                ${activeSection === item.id 
                                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' 
                                                    : 'hover:bg-white/5 text-slate-400 hover:text-white'}
                                            `}
                                        >
                                            <div className="flex items-center gap-3">
                                                <item.icon size={18} className={activeSection === item.id ? 'text-white' : 'text-slate-500 group-hover:text-purple-400'} />
                                                <span className="text-xs font-bold uppercase tracking-wide">{item.label}</span>
                                            </div>
                                            <ChevronRight size={14} className={`transition-transform ${activeSection === item.id ? 'rotate-90' : 'opacity-0 group-hover:opacity-100'}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-white/5">
                        <div className="bg-slate-950/50 rounded-2xl p-4 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center font-black text-xs text-white uppercase italic border border-white/5">
                                    {user.username?.substring(0, 2)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-black text-white truncate italic">@{user.username}</p>
                                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Kullanıcı</p>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all text-[10px] font-black uppercase tracking-widest border border-transparent hover:border-red-500/20"
                        >
                            <LogOut size={16} />
                            GÜVENLİ ÇIKIŞ
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Topbar */}
                <header className="h-20 bg-slate-950/50 backdrop-blur-md border-bottom border-white/5 flex items-center justify-between px-8">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
                        >
                            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                        <h2 className="text-sm font-black text-white uppercase italic tracking-widest">
                            {menuItems.find(i => i.id === activeSection)?.label}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex flex-col items-end">
                            <p className="text-[10px] font-black text-white italic">HOŞ GELDİNİZ</p>
                            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">SON GİRİŞ: BUGÜN</p>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="max-w-6xl mx-auto space-y-8">
                        {activeSection === 'dashboard' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { label: 'Yönetilen Gruplar', value: '0', icon: Users, color: 'blue' },
                                    { label: 'Aktif Botlar', value: '0', icon: Bot, color: 'purple' },
                                    { label: 'Toplam Üye', value: '0', icon: Users, color: 'emerald' },
                                ].map((stat, i) => (
                                    <div key={i} className="bg-slate-900 border border-white/5 p-6 rounded-3xl relative overflow-hidden group">
                                        <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-${stat.color}-500/10 transition-all`} />
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`w-12 h-12 bg-${stat.color}-500/10 rounded-2xl flex items-center justify-center text-${stat.color}-500`}>
                                                <stat.icon size={24} />
                                            </div>
                                        </div>
                                        <p className="text-3xl font-black text-white italic mb-1">{stat.value}</p>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                                    </div>
                                ))}

                                <div className="md:col-span-3 bg-slate-900 border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden">
                                    <div className="relative z-10">
                                        <h3 className="text-xl font-black text-white italic uppercase mb-2">Panel Kullanımına Hazır Mısınız?</h3>
                                        <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
                                            BotlyHub Kullanıcı Paneli ile gruplarınızı ve botlarınızı tek bir merkezden yönetin. 
                                            Sol menüden istediğiniz bölüme geçiş yaparak işlemlerinize başlayabilirsiniz.
                                        </p>
                                    </div>
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 blur-[100px] -mr-32 -mt-32" />
                                </div>
                            </div>
                        )}

                        {activeSection !== 'dashboard' && (
                            <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                                <div className="w-24 h-24 bg-slate-900 rounded-[2rem] flex items-center justify-center border border-white/5 text-slate-700">
                                    {React.createElement(menuItems.find(i => i.id === activeSection)?.icon || LayoutDashboard, { size: 48 })}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-white italic uppercase">Yakında Sizlerle</h3>
                                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-2">Bu özellik şu an geliştirme aşamasındadır.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserPanel;

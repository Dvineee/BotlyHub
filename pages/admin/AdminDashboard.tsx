
import React, { useEffect, useState, useMemo } from 'react';
import * as Router from 'react-router-dom';
import { 
  LayoutDashboard, Users, Bot, LogOut, Menu, X, 
  Loader2, RefreshCw, Plus, Trash2, 
  Megaphone, Settings as SettingsIcon, 
  ShieldCheck, Globe, Send, Activity, 
  Wallet, ShieldAlert, Cpu, Ban, CheckCircle, 
  Search, Database, Hash, Wand2, History,
  Mail, BellRing, Sparkles, Eye, Zap, RefreshCcw, Star, Calendar, MessageSquare, ExternalLink, Layers, PlusCircle, Link2,
  Fingerprint, Info, TrendingUp, BarChart3, Radio,
  Layout, MousePointer2, Target, Bell, CheckCircle2, ChevronRight,
  DollarSign, Edit3, Save, AlertTriangle, Image as ImageIconLucide
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { DatabaseService, supabase } from '../../services/DatabaseService';
import PriceService from '../../services/PriceService';
import { User, Bot as BotType, Announcement, Notification, Channel, ActivityLog, Ad } from '../../types';

const { useNavigate, Routes, Route, Link, useLocation } = Router as any;

// --- MOCK DATA FOR CHARTS (Real data would be aggregated from DB) ---
const chartData = [
  { name: 'Pzt', users: 400, sales: 240 },
  { name: 'Sal', users: 300, sales: 139 },
  { name: 'Çar', users: 200, sales: 980 },
  { name: 'Per', users: 278, sales: 390 },
  { name: 'Cum', users: 189, sales: 480 },
  { name: 'Cmt', users: 239, sales: 380 },
  { name: 'Paz', users: 349, sales: 430 },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!DatabaseService.isAdminLoggedIn()) navigate('/a/admin');
  }, [navigate]);

  const NavItem = ({ to, icon: Icon, label }: any) => {
    const active = location.pathname === to || (to !== '/a/dashboard' && location.pathname.startsWith(to));
    return (
      <Link 
        to={to} 
        onClick={() => setSidebarOpen(false)}
        className={`flex items-center gap-4 px-6 py-4 rounded-[20px] transition-all duration-300 ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}
      >
        <Icon size={20} />
        <span className="font-bold text-[11px] uppercase tracking-widest">{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[#020617] flex text-slate-200 overflow-hidden font-sans">
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[65] lg:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-[70] w-72 bg-[#020617] border-r border-white/5 transition-transform duration-500 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-4 mb-12 px-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg"><Database size={20} className="text-white"/></div>
            <div>
                <h2 className="text-lg font-black text-white italic tracking-tighter uppercase leading-none">Botly<span className="text-blue-500">Hub</span></h2>
                <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em] mt-1 block">YÖNETİM PANELİ</span>
            </div>
          </div>
          
          <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
            <NavItem to="/a/dashboard" icon={LayoutDashboard} label="Genel Bakış" />
            <div className="pt-6 pb-2 px-6"><span className="text-[9px] font-black text-slate-800 uppercase tracking-widest">Kullanıcılar</span></div>
            <NavItem to="/a/dashboard/users" icon={Users} label="Üye Listesi" />
            <NavItem to="/a/dashboard/sales" icon={Wallet} label="Satışlar" />
            
            <div className="pt-6 pb-2 px-6"><span className="text-[9px] font-black text-slate-800 uppercase tracking-widest">İçerik</span></div>
            <NavItem to="/a/dashboard/bots" icon={Bot} label="Market Botları" />
            <NavItem to="/a/dashboard/ads" icon={Radio} label="Reklamlar" />
            <NavItem to="/a/dashboard/announcements" icon={Megaphone} label="Duyurular" />
            
            <div className="pt-6 pb-2 px-6"><span className="text-[9px] font-black text-slate-800 uppercase tracking-widest">Sistem</span></div>
            <NavItem to="/a/dashboard/logs" icon={Activity} label="Sistem Logları" />
            <NavItem to="/a/dashboard/settings" icon={SettingsIcon} label="Ayarlar" />
          </nav>

          <button onClick={() => { DatabaseService.logoutAdmin(); navigate('/a/admin'); }} className="mt-6 flex items-center gap-4 px-6 py-4 text-red-500 font-bold text-[11px] uppercase tracking-widest hover:bg-red-500/10 rounded-[20px] transition-all group">
            <LogOut size={18} /> Oturumu Kapat
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#020617]/80 backdrop-blur-xl z-50">
           <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-3 bg-slate-900 border border-white/5 rounded-xl text-slate-400"><Menu size={20}/></button>
           
           <div className="flex items-center gap-4 ml-auto">
              <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]"></div>
                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Sistem Aktif</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center font-black text-white italic">A</div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-10 no-scrollbar">
          <div className="max-w-6xl mx-auto space-y-10">
            <Routes>
              <Route path="/" element={<HomeView />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/bots" element={<BotManagement />} />
              <Route path="/sales" element={<SalesManagement />} />
              <Route path="/ads" element={<AdsManagement />} />
              <Route path="/announcements" element={<AnnouncementCenter />} />
              <Route path="/logs" element={<SystemLogs />} />
              <Route path="/settings" element={<SettingsManagement />} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
};

// --- HOME VIEW ---
const HomeView = () => {
    const [stats, setStats] = useState({ userCount: 0, botCount: 0, logCount: 0, salesCount: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        DatabaseService.getAdminStats().then(data => {
            setStats(data);
            setIsLoading(false);
        });
    }, []);

    const StatCard = ({ label, value, icon: Icon, color }: any) => (
        <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[32px] hover:border-blue-500/30 transition-all relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 -mr-8 -mt-8 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all"></div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 border border-white/5 ${color}`}>
                <Icon size={22} />
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">{value}</h3>
        </div>
    );

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Panel <span className="text-blue-500">Özeti</span></h1>
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest italic">Platform genel performansı ve istatistikler</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Toplam Üye" value={stats.userCount} icon={Users} color="text-blue-500" />
                <StatCard label="Aktif Botlar" value={stats.botCount} icon={Bot} color="text-purple-500" />
                <StatCard label="Toplam Satış" value={stats.salesCount} icon={Wallet} color="text-emerald-500" />
                <StatCard label="İşlem Kaydı" value={stats.logCount} icon={Activity} color="text-orange-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-slate-900/40 border border-white/5 p-8 rounded-[40px]">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8 flex items-center gap-2">
                        <TrendingUp size={16} className="text-blue-500" /> Büyüme Analizi
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '10px' }}
                                    itemStyle={{ fontWeight: '900', textTransform: 'uppercase' }}
                                />
                                <Area type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[40px] flex flex-col">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8">Hızlı Erişim</h3>
                    <div className="space-y-4 flex-1">
                        <QuickAction icon={Zap} label="Sistemi Optimize Et" color="bg-blue-600" />
                        <QuickAction icon={Bell} label="Global Duyuru Gönder" color="bg-purple-600" />
                        <QuickAction icon={ShieldAlert} label="Kayıtları Temizle" color="bg-red-600" />
                    </div>
                    <div className="mt-auto pt-6 border-t border-white/5">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-500">
                            <span>Sunucu Yükü</span>
                            <span className="text-emerald-500">Normal</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-950 rounded-full mt-2 overflow-hidden">
                            <div className="h-full bg-emerald-500 w-[24%]" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const QuickAction = ({ icon: Icon, label, color }: any) => (
    <button className="w-full p-4 bg-slate-950 border border-white/5 rounded-2xl flex items-center gap-4 hover:border-white/10 transition-all active:scale-95 group">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${color}`}>
            <Icon size={18} />
        </div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white">{label}</span>
    </button>
);

// --- USER MANAGEMENT ---
const UserManagement = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => { load(); }, []);
    const load = async () => {
        const data = await DatabaseService.getUsers();
        setUsers(data);
        setIsLoading(false);
    };

    const toggleStatus = async (user: User) => {
        const newStatus = user.status === 'Active' ? 'Passive' : 'Active';
        await DatabaseService.updateUserStatus(user.id, newStatus);
        load();
    };

    const filtered = useMemo(() => {
        return users.filter(u => 
            u.name.toLowerCase().includes(search.toLowerCase()) || 
            u.username.toLowerCase().includes(search.toLowerCase())
        );
    }, [users, search]);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <div className="flex justify-between items-center gap-4">
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Üye <span className="text-blue-500">Yönetimi</span></h2>
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                    <input 
                        type="text" 
                        placeholder="ARA..." 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-slate-900/40 border border-white/5 rounded-2xl py-3 pl-12 pr-6 text-[10px] font-black text-white uppercase outline-none focus:border-blue-600/50 shadow-xl" 
                    />
                </div>
            </div>

            <div className="bg-slate-900/40 border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                    <thead className="bg-slate-950/60 border-b border-white/5">
                        <tr>
                            <th className="px-8 py-6 text-[9px] font-black text-slate-600 uppercase tracking-widest">Kullanıcı</th>
                            <th className="px-8 py-6 text-[9px] font-black text-slate-600 uppercase tracking-widest">Kayıt Tarihi</th>
                            <th className="px-8 py-6 text-[9px] font-black text-slate-600 uppercase tracking-widest">Durum</th>
                            <th className="px-8 py-6 text-[9px] font-black text-slate-600 uppercase tracking-widest text-right">Eylem</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {isLoading ? (
                            <tr><td colSpan={4} className="py-20 text-center"><Loader2 className="animate-spin inline text-blue-500" /></td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={4} className="py-20 text-center text-[10px] text-slate-700 font-black uppercase">Sonuç Bulunamadı</td></tr>
                        ) : filtered.map(u => (
                            <tr key={u.id} className="hover:bg-white/[0.01] transition-colors">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <img src={u.avatar} className="w-10 h-10 rounded-xl border border-white/5 bg-slate-950" />
                                        <div>
                                            <p className="text-xs font-black text-white italic uppercase tracking-tight">{u.name}</p>
                                            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">@{u.username}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-[10px] text-slate-500 font-black uppercase tracking-widest">{new Date(u.joinDate).toLocaleDateString()}</td>
                                <td className="px-8 py-6">
                                    <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${u.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {u.status}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <button onClick={() => toggleStatus(u)} className="p-3 bg-slate-950 border border-white/5 rounded-xl text-slate-500 hover:text-white transition-all">
                                        {u.status === 'Active' ? <Ban size={16}/> : <CheckCircle size={16}/>}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- BOT MANAGEMENT ---
const BotManagement = () => {
    const [bots, setBots] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBot, setEditingBot] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => { load(); }, []);
    const load = async () => {
        const data = await DatabaseService.getBotsWithStats();
        setBots(data);
        setIsLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        await DatabaseService.saveBot(editingBot);
        setIsModalOpen(false);
        load();
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Bot <span className="text-blue-500">Envanteri</span></h2>
                <button 
                    onClick={() => { setEditingBot({ id: '', name: '', description: '', price: 0, category: 'productivity', bot_link: '' }); setIsModalOpen(true); }}
                    className="px-6 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
                >
                    <Plus size={18} className="inline mr-2" /> YENİ BOT EKLE
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? [1,2,3].map(i => <div key={i} className="h-[200px] bg-slate-900/40 animate-pulse rounded-[32px]" />) : bots.map(bot => (
                    <div key={bot.id} className="bg-slate-900/40 border border-white/5 p-8 rounded-[40px] hover:border-blue-500/20 transition-all shadow-xl group relative overflow-hidden">
                        <div className="flex items-center gap-5 mb-8">
                            <img 
                                src={bot.icon || `https://ui-avatars.com/api/?name=${encodeURIComponent(bot.name)}`} 
                                className="w-14 h-14 rounded-2xl border border-white/5 object-cover" 
                            />
                            <div>
                                <h4 className="font-black text-white text-md italic tracking-tighter uppercase">{bot.name}</h4>
                                <p className="text-[9px] text-blue-500 font-black uppercase tracking-widest mt-1">{bot.category}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-slate-950/60 p-4 rounded-2xl border border-white/5">
                                <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest mb-1">Kullanıcı</p>
                                <p className="text-sm font-black text-white">{bot.ownerCount}</p>
                            </div>
                            <div className="bg-slate-950/60 p-4 rounded-2xl border border-white/5">
                                <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest mb-1">Fiyat</p>
                                <p className="text-sm font-black text-emerald-500 italic">₺{bot.price}</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => { setEditingBot({...bot}); setIsModalOpen(true); }} className="flex-1 py-3.5 bg-slate-950 hover:bg-blue-600 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">DÜZENLE</button>
                            <button onClick={async () => { if(confirm("Bot silinecek?")) { await DatabaseService.deleteBot(bot.id); load(); } }} className="p-3.5 bg-slate-950 hover:bg-red-600 text-slate-700 hover:text-white rounded-xl transition-all"><Trash2 size={18}/></button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl">
                    <div className="bg-[#020617] w-full max-w-2xl rounded-[48px] border border-white/10 p-10 shadow-2xl relative overflow-y-auto max-h-[90vh] no-scrollbar">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 p-3 bg-slate-900 border border-white/5 rounded-xl text-slate-500 hover:text-white transition-all"><X size={20}/></button>
                        <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-10">Bot <span className="text-blue-500">Yapılandırması</span></h3>
                        
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <AdminInput label="BOT ID" value={editingBot.id} onChange={v => setEditingBot({...editingBot, id: v})} />
                                <AdminInput label="BOT İSMİ" value={editingBot.name} onChange={v => setEditingBot({...editingBot, name: v})} />
                                <AdminInput label="TELEGRAM LİNK" value={editingBot.bot_link} onChange={v => setEditingBot({...editingBot, bot_link: v})} />
                                <AdminInput label="FİYAT (TL)" type="number" value={editingBot.price} onChange={v => setEditingBot({...editingBot, price: Number(v)})} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">Bot Açıklaması</label>
                                <textarea 
                                    value={editingBot.description} 
                                    onChange={e => setEditingBot({...editingBot, description: e.target.value})} 
                                    className="w-full bg-slate-950 border border-white/5 rounded-3xl p-6 text-[11px] font-medium text-slate-400 h-32 resize-none outline-none focus:border-blue-600/50" 
                                />
                            </div>
                            <button type="submit" className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-3xl text-[11px] uppercase tracking-widest shadow-xl transition-all border-b-4 border-blue-800 active:translate-y-1 active:border-b-0">
                                DEĞİŞİKLİKLERİ KAYDET
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const AdminInput = ({ label, value, onChange, type = "text" }: any) => (
    <div className="space-y-2">
        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">{label}</label>
        <input 
            type={type} 
            value={value} 
            onChange={e => onChange(e.target.value)} 
            className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-[11px] font-black text-white outline-none focus:border-blue-600/50" 
        />
    </div>
);

// --- SALES MANAGEMENT ---
const SalesManagement = () => {
    const [sales, setSales] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        DatabaseService.getAllPurchases().then(data => {
            setSales(data);
            setIsLoading(false);
        });
    }, []);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Satış <span className="text-blue-600">Geçmişi</span></h2>
            <div className="bg-slate-900/40 border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                    <thead className="bg-slate-950/60 border-b border-white/5">
                        <tr>
                            <th className="px-8 py-6 text-[9px] font-black text-slate-600 uppercase tracking-widest">Alıcı</th>
                            <th className="px-8 py-6 text-[9px] font-black text-slate-600 uppercase tracking-widest">Bot</th>
                            <th className="px-8 py-6 text-[9px] font-black text-slate-600 uppercase tracking-widest">Tarih</th>
                            <th className="px-8 py-6 text-[9px] font-black text-slate-600 uppercase tracking-widest text-right">Durum</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {isLoading ? (
                            <tr><td colSpan={4} className="py-20 text-center"><Loader2 className="animate-spin inline text-blue-500" /></td></tr>
                        ) : sales.map((s, idx) => (
                            <tr key={idx} className="hover:bg-white/[0.01] transition-colors">
                                <td className="px-8 py-6">
                                    <p className="text-xs font-black text-white italic uppercase tracking-tight">{s.users?.name}</p>
                                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">@{s.users?.username}</p>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-600/20 flex items-center justify-center"><Bot size={14} className="text-blue-500"/></div>
                                        <span className="text-[10px] font-black text-white uppercase italic">{s.bots?.name}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-[10px] text-slate-500 font-black uppercase tracking-widest">{new Date(s.acquired_at).toLocaleDateString()}</td>
                                <td className="px-8 py-6 text-right">
                                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-[8px] font-black uppercase tracking-widest">Tamamlandı</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- ADS MANAGEMENT ---
const AdsManagement = () => {
    const [ads, setAds] = useState<Ad[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newAd, setNewAd] = useState<Partial<Ad>>({ title: '', content: '', button_text: '', button_link: '' });

    useEffect(() => { load(); }, []);
    const load = async () => setAds(await DatabaseService.getAds());

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        await DatabaseService.createAd(newAd);
        setIsModalOpen(false);
        load();
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Reklam <span className="text-blue-600">Sistemi</span></h2>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                >
                    <Plus size={18} className="inline mr-2" /> REKLAM OLUŞTUR
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ads.map(ad => (
                    <div key={ad.id} className="bg-slate-900/40 border border-white/5 p-10 rounded-[48px] shadow-xl relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 w-24 h-1 bg-gradient-to-l ${ad.status === 'sent' ? 'from-emerald-500' : 'from-blue-500'} to-transparent`}></div>
                        <h4 className="text-xl font-black text-white uppercase italic tracking-tighter mb-4">{ad.title}</h4>
                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mb-10 line-clamp-3 leading-relaxed">{ad.content}</p>
                        <div className="flex items-center justify-between border-t border-white/5 pt-8 mt-auto">
                            <div className="flex items-center gap-3">
                                <Users size={16} className="text-slate-600" />
                                <span className="text-[10px] font-black text-white tracking-widest">{ad.total_reach.toLocaleString()} ERİŞİM</span>
                            </div>
                            <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${ad.status === 'sent' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800 text-slate-600'}`}>{ad.status}</span>
                            <button onClick={async () => { if(confirm("Sil?")) { await DatabaseService.deleteAd(ad.id); load(); } }} className="text-red-500 hover:bg-red-500/10 p-2 rounded-xl transition-all"><Trash2 size={16}/></button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl">
                    <div className="bg-[#020617] w-full max-w-xl rounded-[48px] border border-white/10 p-10 shadow-2xl relative">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 p-3 bg-slate-900 rounded-xl text-slate-500"><X size={20}/></button>
                        <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-10">Reklam <span className="text-blue-500">Oluştur</span></h3>
                        <form onSubmit={handleCreate} className="space-y-6">
                            <AdminInput label="REKLAM BAŞLIĞI" value={newAd.title} onChange={v => setNewAd({...newAd, title: v})} />
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">Reklam Metni</label>
                                <textarea 
                                    value={newAd.content} 
                                    onChange={e => setNewAd({...newAd, content: e.target.value})} 
                                    className="w-full bg-slate-950 border border-white/5 rounded-3xl p-6 text-[11px] font-medium text-slate-400 h-32 resize-none outline-none focus:border-blue-600/50" 
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <AdminInput label="BUTON METNİ" value={newAd.button_text} onChange={v => setNewAd({...newAd, button_text: v})} />
                                <AdminInput label="BUTON LİNK" value={newAd.button_link} onChange={v => setNewAd({...newAd, button_link: v})} />
                            </div>
                            <button type="submit" className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-3xl text-[11px] uppercase tracking-widest shadow-xl transition-all border-b-4 border-blue-800">
                                YAYINA HAZIRLA
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- SYSTEM LOGS ---
const SystemLogs = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(50).then(({data}) => {
            setLogs(data || []);
            setIsLoading(false);
        });
    }, []);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">İşlem <span className="text-blue-600">Logları</span></h2>
            <div className="space-y-4">
                {isLoading ? [1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-900/40 animate-pulse rounded-3xl" />) : logs.map(log => (
                    <div key={log.id} className="flex items-center gap-6 p-6 bg-slate-900/40 rounded-3xl border border-white/5 hover:border-blue-500/10 transition-all group">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border border-white/5 ${log.type === 'payment' ? 'text-emerald-500' : 'text-blue-500'} bg-slate-950 group-hover:scale-105 transition-transform`}>
                            <History size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="text-xs font-black text-white uppercase italic tracking-tight">{log.title}</h4>
                                <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">{new Date(log.created_at).toLocaleString()}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest line-clamp-1">{log.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- SETTINGS MANAGEMENT ---
const SettingsManagement = () => {
    const [settings, setSettings] = useState<any>({ appName: 'BotlyHub V3', maintenanceMode: false, commissionRate: 20 });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => { DatabaseService.getSettings().then(s => s && setSettings(s)); }, []);
    
    const handleSave = async () => {
        setIsSaving(true);
        try {
            await DatabaseService.saveSettings(settings);
            alert("Yapılandırma kilitlendi.");
        } catch (e) { alert("Hata!"); }
        finally { setIsSaving(false); }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12 pb-20">
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Platform <span className="text-blue-600">Yapılandırması</span></h2>
            <div className="bg-slate-900/40 border border-white/5 p-12 rounded-[56px] space-y-12 shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <AdminInput label="PLATFORM İSMİ" value={settings.appName} onChange={v => setSettings({...settings, appName: v})} />
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">Sistem Durumu</label>
                        <button 
                            onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})} 
                            className={`w-full h-[54px] rounded-2xl flex items-center justify-center gap-3 transition-all border font-black text-[10px] uppercase tracking-widest ${settings.maintenanceMode ? 'bg-red-600/10 border-red-500/20 text-red-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}
                        >
                            {settings.maintenanceMode ? <ShieldAlert size={16}/> : <Globe size={16}/>}
                            {settings.maintenanceMode ? 'BAKIM MODU: AKTİF' : 'PLATFORM: CANLI'}
                        </button>
                    </div>
                    <AdminInput label="REKLAM KOMİSYONU (%)" type="number" value={settings.commissionRate} onChange={v => setSettings({...settings, commissionRate: Number(v)})} />
                    <AdminInput label="DESTEK PROTOKOLÜ" value={settings.supportLink} onChange={v => setSettings({...settings, supportLink: v})} placeholder="@destek_bot" />
                </div>
                <button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-3xl text-[11px] uppercase tracking-[0.3em] shadow-xl active:scale-95 transition-all border-b-4 border-blue-800 disabled:opacity-50"
                >
                    {isSaving ? <Loader2 className="animate-spin inline mr-2" /> : <Save size={18} className="inline mr-2" />}
                    SİSTEM YAPILANDIRMASINI KİLİTLE
                </button>
            </div>
        </div>
    );
};

// --- ANNOUNCEMENT CENTER (Simplified for logic) ---
const AnnouncementCenter = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    useEffect(() => { DatabaseService.getAnnouncements().then(setAnnouncements); }, []);
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Duyuru <span className="text-blue-600">Yönetimi</span></h2>
                <button className="px-6 py-4 bg-slate-900 border border-white/5 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-all">YENİ DUYURU EKLE</button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {announcements.map(ann => (
                    <div key={ann.id} className="bg-slate-900/40 border border-white/5 p-10 rounded-[48px] flex items-center justify-between group hover:border-blue-600/30 transition-all shadow-xl">
                        <div className="flex items-center gap-8">
                            <div className="w-16 h-16 bg-slate-950 rounded-[28px] flex items-center justify-center text-blue-500 border border-white/5 group-hover:rotate-6 transition-transform shadow-inner"><Megaphone size={24}/></div>
                            <div>
                                <h4 className="font-black text-white uppercase italic tracking-tighter text-xl mb-1">{ann.title}</h4>
                                <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${ann.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800 text-slate-600'}`}>{ann.is_active ? 'AKTİF' : 'PASİF'}</span>
                            </div>
                        </div>
                        <button className="p-4 bg-slate-950 border border-white/5 rounded-2xl text-slate-700 hover:text-white transition-all"><ChevronRight size={20}/></button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminDashboard;


import React, { useEffect, useState } from 'react';
// Fixed: Use namespace import for react-router-dom to resolve "no exported member" errors
import * as Router from 'react-router-dom';
import { 
  LayoutDashboard, Users, Bot, LogOut, Menu, X, 
  Package, Loader2, RefreshCw, Plus, Edit2, Trash2, 
  ImageIcon, Megaphone, Calendar,
  Settings as SettingsIcon, ShieldCheck, Percent, Globe, MessageSquare, AlertTriangle,
  Sparkles, Zap, Gift, Info, Star, ChevronRight, Eye, Send, Activity, Clock,
  Wallet, ShieldAlert, Cpu, Ban, CheckCircle
} from 'lucide-react';
import { DatabaseService } from '../../services/DatabaseService';
import { User, Bot as BotType, Announcement, Notification } from '../../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const { useNavigate, Routes, Route, Link, useLocation } = Router as any;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!DatabaseService.isAdminLoggedIn()) navigate('/a/admin');
  }, [navigate]);

  const NavItem = ({ to, icon: Icon, label }: any) => {
    const active = location.pathname === to;
    return (
      <Link 
        to={to} 
        onClick={() => setSidebarOpen(false)}
        className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800'}`}
      >
        <Icon size={18} />
        <span className="font-bold text-[10px] uppercase tracking-widest">{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[#020617] flex text-slate-200 font-sans overflow-hidden">
      <aside className={`fixed inset-y-0 left-0 z-[70] w-72 bg-[#0f172a] border-r border-slate-800/50 transition-transform lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 mb-12 px-2">
            <div className="p-2 bg-blue-600 rounded-xl"><Package size={22} className="text-white"/></div>
            <h2 className="text-xl font-black text-white italic tracking-tighter">BOTLY HUB <span className="text-blue-500">PRO</span></h2>
          </div>
          <nav className="flex-1 space-y-2">
            <NavItem to="/a/dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavItem to="/a/dashboard/users" icon={Users} label="Kullanıcılar" />
            <NavItem to="/a/dashboard/bots" icon={Bot} label="Market" />
            <NavItem to="/a/dashboard/notifications" icon={Send} label="Bildirimler" />
            <NavItem to="/a/dashboard/announcements" icon={Megaphone} label="Duyurular" />
            <NavItem to="/a/dashboard/settings" icon={SettingsIcon} label="Ayarlar" />
          </nav>
          <button onClick={() => { DatabaseService.logoutAdmin(); navigate('/a/admin'); }} className="mt-auto flex items-center gap-3 px-4 py-4 text-red-500 font-black text-[10px] tracking-widest uppercase hover:bg-red-500/5 rounded-2xl">
            <LogOut size={18} /> Çıkış Yap
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 border-b border-slate-800/50 flex items-center justify-between px-8 bg-[#020617]/50 backdrop-blur-xl">
           <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2.5 bg-slate-800 rounded-xl text-slate-400"><Menu size={20}/></button>
           <div className="hidden sm:flex items-center gap-6 text-[10px] font-black text-slate-600 uppercase tracking-widest">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Sistem Aktif</div>
              <div className="w-px h-4 bg-slate-800"></div>
              <div className="flex items-center gap-2"><Activity size={14}/> Live Sync</div>
           </div>
           <div className="flex items-center gap-4 ml-auto">
              <div className="text-right mr-2 hidden sm:block">
                  <p className="text-xs font-black text-white">Administrator</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Full Control</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white shadow-lg shadow-blue-900/20">AD</div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-[#020617] no-scrollbar">
          <div className="max-w-[1400px] mx-auto">
            <Routes>
              <Route path="/" element={<HomeView />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/bots" element={<BotManagement />} />
              <Route path="/notifications" element={<NotificationCenter />} />
              <Route path="/announcements" element={<AnnouncementManagement />} />
              <Route path="/settings" element={<SettingsManagement />} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
};

const HomeView = () => {
    const mockChartData = [
        { name: 'Pzt', users: 120 }, { name: 'Sal', users: 180 }, { name: 'Çar', users: 150 },
        { name: 'Per', users: 280 }, { name: 'Cum', users: 310 }, { name: 'Cmt', users: 450 }, { name: 'Paz', users: 410 }
    ];
    return (
        <div className="animate-in fade-in space-y-10">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Kontrol <span className="text-blue-500">Paneli</span></h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Platform Performans Özeti</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-6 py-3 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all">Export Data</button>
                    <button className="px-6 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-900/20 active:scale-95 transition-all">Re-Sync</button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Aktif Üye" value="4.8K" icon={Users} color="blue" trend="+12%" />
                <StatCard label="Bot Sayısı" value="142" icon={Bot} color="purple" trend="+4%" />
                <StatCard label="Günlük Kazanç" value="₺12.4K" icon={Wallet} color="emerald" trend="+18%" />
                <StatCard label="Platform Sağlığı" value="99%" icon={ShieldCheck} color="orange" trend="Stable" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-[#0f172a] border border-slate-800 rounded-[32px] p-8">
                    <h3 className="text-lg font-black text-white mb-6 uppercase tracking-tight italic">Haftalık Büyüme</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={mockChartData}>
                                <defs>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                                <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px' }} />
                                <Area type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-[#0f172a] border border-slate-800 rounded-[32px] p-8">
                    <h3 className="text-lg font-black text-white mb-6 uppercase tracking-tight italic flex items-center gap-2"><Clock size={18} className="text-blue-500"/> Canlı Log</h3>
                    <div className="space-y-6 max-h-[300px] overflow-y-auto no-scrollbar">
                        <LogItem time="Şimdi" action="Global Bildirim Gönderildi" status="Success" />
                        <LogItem time="5 dk" action="Yeni Bot Onaylandı" status="Info" />
                        <LogItem time="12 dk" action="Sistem Ayarları Güncellendi" status="Update" />
                        <LogItem time="45 dk" action="Yeni Kullanıcı Kaydı: @mert" status="User" />
                        <LogItem time="1 sa" action="Bakım Modu Kapatıldı" status="Update" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, icon: Icon, color, trend }: any) => {
    const colors: any = {
        blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
        purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
        emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20'
    };
    return (
        <div className="bg-[#0f172a] border border-slate-800 p-8 rounded-[40px] hover:border-slate-700 transition-all group">
            <div className="flex justify-between items-start mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-xl group-hover:scale-110 transition-transform ${colors[color]}`}>
                    <Icon size={28} />
                </div>
                <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${trend.startsWith('+') ? 'text-emerald-500 bg-emerald-500/10' : 'text-blue-500 bg-blue-500/10'}`}>{trend}</span>
            </div>
            <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">{label}</p>
            <h3 className="text-3xl font-black text-white mt-2 tracking-tighter">{value}</h3>
        </div>
    );
};

const LogItem = ({ time, action, status }: any) => {
    const dots: any = { Success: 'bg-emerald-500', Info: 'bg-blue-500', Update: 'bg-orange-500', User: 'bg-purple-500' };
    return (
        <div className="flex gap-4 items-start">
            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${dots[status]}`}></div>
            <div>
                <p className="text-xs font-bold text-white">{action}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{time} önce</p>
            </div>
        </div>
    );
};

// --- Bot Management Module ---
const BotManagement = () => {
    const [bots, setBots] = useState<BotType[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBot, setEditingBot] = useState<Partial<BotType> | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => { load(); }, []);
    const load = async () => { setIsLoading(true); setBots(await DatabaseService.getBots()); setIsLoading(false); };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBot) return;
        await DatabaseService.saveBot(editingBot);
        setIsModalOpen(false);
        load();
    };

    return (
        <div className="animate-in fade-in space-y-10">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black text-white italic tracking-tighter">MARKET <span className="text-blue-500">BOTLARI</span></h2>
                <button onClick={() => { setEditingBot({ name: '', description: '', price: 0, category: 'productivity', bot_link: '', icon: '', screenshots: [] }); setIsModalOpen(true); }} className="px-6 py-4 bg-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-2 shadow-lg shadow-blue-900/20 active:scale-95 transition-all">
                    <Plus size={18}/> Yeni Bot Ekle
                </button>
            </div>

            {isLoading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" /></div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bots.map(b => (
                        <div key={b.id} className="bg-[#0f172a] border border-slate-800 p-6 rounded-[32px] hover:border-blue-500/40 transition-all flex flex-col group shadow-xl">
                            <div className="flex gap-5 mb-6">
                                <img src={b.icon} className="w-16 h-16 rounded-[24px] object-cover border border-slate-800 bg-slate-900" />
                                <div className="min-w-0">
                                    <h4 className="font-bold text-white text-base truncate">{b.name}</h4>
                                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1">{b.category}</p>
                                    <div className="flex items-center gap-1.5 mt-2 text-yellow-500">
                                        <Star size={12} fill="currentColor"/>
                                        <span className="font-black text-xs">{b.price} Stars</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-auto border-t border-slate-800 pt-6">
                                <button onClick={() => { setEditingBot(b); setIsModalOpen(true); }} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all">Düzenle</button>
                                <button onClick={async () => { if(confirm("Bot silinsin mi?")) { await DatabaseService.deleteBot(b.id); load(); } }} className="p-3 bg-slate-800 hover:bg-red-500/10 text-red-500 rounded-xl transition-all"><Trash2 size={16}/></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && editingBot && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md animate-in fade-in" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[40px] p-10 relative shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white"><X size={22}/></button>
                        <h3 className="text-2xl font-black mb-10 text-white italic tracking-tighter uppercase">{editingBot.id ? 'Botu Düzenle' : 'Yeni Bot Oluştur'}</h3>
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Bot İsmi</label>
                                <input type="text" required value={editingBot.name} onChange={e => setEditingBot({...editingBot, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-bold text-white focus:border-blue-500 outline-none transition-all" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Kategori</label>
                                    <select value={editingBot.category} onChange={e => setEditingBot({...editingBot, category: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-bold text-white focus:border-blue-500 outline-none">
                                        <option value="productivity">Üretkenlik</option>
                                        <option value="games">Oyun</option>
                                        <option value="utilities">Araçlar</option>
                                        <option value="finance">Finans</option>
                                        <option value="music">Müzik</option>
                                        <option value="moderation">Moderasyon</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Fiyat (Stars)</label>
                                    <input type="number" required value={editingBot.price} onChange={e => setEditingBot({...editingBot, price: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-bold text-white focus:border-blue-500 outline-none" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Açıklama</label>
                                <textarea required value={editingBot.description} onChange={e => setEditingBot({...editingBot, description: e.target.value})} className="w-full h-24 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm resize-none focus:border-blue-500 outline-none font-medium" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Bot Linki (@username)</label>
                                <input type="text" required value={editingBot.bot_link} onChange={e => setEditingBot({...editingBot, bot_link: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-bold text-white focus:border-blue-500 outline-none" placeholder="https://t.me/example_bot" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">İkon URL</label>
                                <input type="text" required value={editingBot.icon} onChange={e => setEditingBot({...editingBot, icon: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-bold text-white focus:border-blue-500 outline-none" />
                            </div>
                            <button type="submit" className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-3xl text-[10px] tracking-[0.2em] uppercase shadow-2xl shadow-blue-900/20 active:scale-95 transition-all">DEĞİŞİKLİKLERİ KAYDET</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- User Management Module (NEW & FULLY FUNCTIONAL) ---
const UserManagement = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => { load(); }, []);
    const load = async () => { setIsLoading(true); setUsers(await DatabaseService.getUsers()); setIsLoading(false); };

    const toggleStatus = async (user: User) => {
        const nextStatus = user.status === 'Active' ? 'Passive' : 'Active';
        await DatabaseService.updateUserStatus(user.id, nextStatus);
        load();
    };

    const filteredUsers = users.filter(u => 
        u.name?.toLowerCase().includes(search.toLowerCase()) || 
        u.username?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="animate-in fade-in space-y-10">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">KULLANICI <span className="text-blue-500">YÖNETİMİ</span></h2>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Sistemdeki Tüm Üyeleri Denetle</p>
                </div>
                <div className="relative">
                    <input 
                        type="text" 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Ara..." 
                        className="bg-slate-900 border border-slate-800 rounded-2xl px-6 py-3.5 text-xs outline-none focus:border-blue-500 transition-all w-full sm:w-64" 
                    />
                </div>
            </div>

            <div className="bg-[#0f172a] border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left">
                        <thead className="bg-slate-950/50 border-b border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            <tr>
                                <th className="px-8 py-6">Kullanıcı</th>
                                <th className="px-8 py-6">E-posta / Tel</th>
                                <th className="px-8 py-6">Rol</th>
                                <th className="px-8 py-6">Durum</th>
                                <th className="px-8 py-6 text-right">Eylemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {filteredUsers.map(u => (
                                <tr key={u.id} className="hover:bg-slate-800/20 transition-all group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <img src={u.avatar} className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800" />
                                            <div>
                                                <p className="font-bold text-white text-sm">@{u.username}</p>
                                                <p className="text-[10px] text-slate-500 uppercase font-black">{u.name}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-xs text-slate-300 font-bold">{u.email || '-'}</p>
                                        <p className="text-[10px] text-slate-500 font-medium">{u.phone || '-'}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest border ${u.role === 'Admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${u.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                            <span className="text-[11px] font-bold text-slate-400 uppercase">{u.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button onClick={() => toggleStatus(u)} className={`p-2 rounded-xl transition-all ${u.status === 'Active' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                                {u.status === 'Active' ? <Ban size={16}/> : <CheckCircle size={16}/>}
                                            </button>
                                            <button className="p-2 bg-slate-800 text-slate-400 rounded-xl hover:bg-slate-700">
                                                <Eye size={16}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// --- Notification Center Module (FULLY FUNCTIONAL) ---
const NotificationCenter = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState({ title: '', message: '', type: 'system' as any });
    const [history, setHistory] = useState<Notification[]>([]);

    useEffect(() => { load(); }, []);
    const load = async () => { setHistory(await DatabaseService.getNotifications()); };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Fixed: target_type now exists on Notification interface as per types.ts update, removed 'as any' cast
        await DatabaseService.sendNotification({
            ...form,
            target_type: 'global'
        });
        setIsLoading(false);
        setForm({ title: '', message: '', type: 'system' });
        load();
        alert("Global bildirim tüm kullanıcılara gönderildi.");
    };

    return (
        <div className="animate-in fade-in space-y-12">
            <div className="flex flex-col sm:flex-row justify-between gap-6">
                <div className="bg-[#0f172a] border border-slate-800 p-8 rounded-[40px] flex-1 max-w-xl">
                    <h3 className="text-xl font-black text-white italic tracking-tighter uppercase mb-8 flex items-center gap-3"><Megaphone className="text-blue-500"/> Global Yayın</h3>
                    <form onSubmit={handleSend} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tip</label>
                                <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-bold focus:border-blue-500 outline-none">
                                    <option value="system">Sistem</option>
                                    <option value="payment">Ödeme</option>
                                    <option value="security">Güvenlik</option>
                                    <option value="bot">Bot</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Başlık</label>
                                <input required type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-bold focus:border-blue-500 outline-none" placeholder="Duyuru başlığı..." />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Mesaj</label>
                            <textarea required value={form.message} onChange={e => setForm({...form, message: e.target.value})} className="w-full h-32 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm resize-none focus:border-blue-500 outline-none font-medium" placeholder="Mesaj içeriği..." />
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-3xl text-[10px] tracking-[0.2em] uppercase shadow-2xl shadow-blue-900/20 active:scale-95 transition-all">
                            {isLoading ? <Loader2 className="animate-spin mx-auto"/> : 'ŞİMDİ YAYINLA'}
                        </button>
                    </form>
                </div>

                <div className="flex-1 space-y-6">
                    <h3 className="text-xl font-black text-white italic tracking-tighter uppercase flex items-center gap-3"><Clock className="text-purple-500"/> Yayın Geçmişi</h3>
                    <div className="space-y-4 max-h-[500px] overflow-y-auto no-scrollbar pr-2">
                        {/* Fixed: Removed 'as any' since target_type is now properly defined in the Notification type */}
                        {history.filter(n => n.target_type === 'global').map(n => (
                            <div key={n.id} className="bg-slate-900/50 border border-slate-800 p-5 rounded-3xl flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                                    <Send size={16} className="text-blue-500"/>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-white truncate">{n.title}</p>
                                    <p className="text-xs text-slate-500 line-clamp-1">{n.message}</p>
                                    <p className="text-[9px] text-slate-600 font-black uppercase mt-2 tracking-widest">{new Date(n.date).toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Announcement Management Module (FULLY FUNCTIONAL) ---
const AnnouncementManagement = () => {
    const [anns, setAnns] = useState<Announcement[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAnn, setEditingAnn] = useState<Partial<Announcement> | null>(null);

    useEffect(() => { load(); }, []);
    const load = async () => setAnns(await DatabaseService.getAnnouncements());

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingAnn) return;
        await DatabaseService.saveAnnouncement(editingAnn);
        setIsModalOpen(false);
        load();
    };

    return (
        <div className="animate-in fade-in space-y-10">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">DUYURU <span className="text-blue-500">YÖNETİMİ</span></h2>
                <button onClick={() => { setEditingAnn({ title: '', description: '', button_text: 'İncele', button_link: '', icon_name: 'Megaphone', color_scheme: 'purple', is_active: true, action_type: 'link' }); setIsModalOpen(true); }} className="px-6 py-4 bg-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-2 shadow-lg shadow-blue-900/20 active:scale-95 transition-all">
                    <Plus size={18}/> Yeni Duyuru
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {anns.map(a => (
                    <div key={a.id} className="bg-[#0f172a] border border-slate-800 p-8 rounded-[40px] group relative overflow-hidden transition-all hover:border-blue-500/50 flex flex-col shadow-xl">
                        <div className={`w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-6`}>
                            <Megaphone size={20} className="text-blue-500"/>
                        </div>
                        <h4 className="font-black text-lg text-white mb-2 italic">{a.title}</h4>
                        <p className="text-xs text-slate-500 line-clamp-2 mb-8 font-medium">{a.description}</p>
                        <div className="flex justify-between items-center mt-auto border-t border-slate-800 pt-6">
                            <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border border-slate-800 text-slate-400`}>{a.color_scheme}</span>
                            <div className="flex gap-2">
                                <button onClick={() => { setEditingAnn(a); setIsModalOpen(true); }} className="p-2.5 bg-slate-800 rounded-xl hover:bg-slate-700 transition-all"><Edit2 size={16}/></button>
                                <button onClick={async () => { if(confirm("Duyuru silinsin mi?")) { await DatabaseService.deleteAnnouncement(a.id); load(); } }} className="p-2.5 bg-slate-800 rounded-xl text-red-500 hover:bg-red-500/10 transition-all"><Trash2 size={16}/></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && editingAnn && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md animate-in fade-in" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[40px] p-10 relative shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white"><X size={22}/></button>
                        <h3 className="text-2xl font-black mb-10 text-white italic tracking-tighter uppercase">{editingAnn.id ? 'Duyuruyu Düzenle' : 'Yeni Duyuru'}</h3>
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Duyuru Başlığı</label>
                                <input type="text" required value={editingAnn.title} onChange={e => setEditingAnn({...editingAnn, title: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-bold text-white focus:border-blue-500 outline-none transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Kısa Açıklama</label>
                                <textarea required value={editingAnn.description} onChange={e => setEditingAnn({...editingAnn, description: e.target.value})} className="w-full h-24 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm resize-none focus:border-blue-500 outline-none font-medium" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Buton Metni</label>
                                    <input type="text" required value={editingAnn.button_text} onChange={e => setEditingAnn({...editingAnn, button_text: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-bold text-white focus:border-blue-500 outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Renk Şeması</label>
                                    <select value={editingAnn.color_scheme} onChange={e => setEditingAnn({...editingAnn, color_scheme: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-bold text-white focus:border-blue-500 outline-none">
                                        <option value="purple">Mor</option>
                                        <option value="blue">Mavi</option>
                                        <option value="emerald">Yeşil</option>
                                        <option value="orange">Turuncu</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Hedef Link / Pop-up İçeriği</label>
                                <input type="text" value={editingAnn.button_link} onChange={e => setEditingAnn({...editingAnn, button_link: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-bold text-white focus:border-blue-500 outline-none" placeholder="@username veya /link" />
                            </div>
                            <div className="flex items-center gap-6 p-6 bg-slate-950 border border-slate-800 rounded-2xl">
                                <div>
                                    <p className="text-xs font-black text-white uppercase">Aksiyon Tipi</p>
                                    <p className="text-[10px] text-slate-600 font-bold uppercase mt-1">Butona basınca ne olsun?</p>
                                </div>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => setEditingAnn({...editingAnn, action_type: 'link'})} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${editingAnn.action_type === 'link' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'}`}>LINK</button>
                                    <button type="button" onClick={() => setEditingAnn({...editingAnn, action_type: 'popup'})} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${editingAnn.action_type === 'popup' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'}`}>POPUP</button>
                                </div>
                            </div>
                            <button type="submit" className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-3xl text-[10px] tracking-[0.2em] uppercase shadow-2xl shadow-blue-900/20 active:scale-95 transition-all">DEĞİŞİKLİKLERİ KAYDET</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const SettingsManagement = () => {
    const [settings, setSettings] = useState({
        appName: 'BotlyHub V3',
        maintenanceMode: false,
        commissionRate: 5,
        supportLink: 'https://t.me/support',
        globalLang: 'tr'
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => { load(); }, []);
    const load = async () => {
        const data = await DatabaseService.getSettings();
        if (data) setSettings(data);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await DatabaseService.saveSettings(settings);
            localStorage.setItem('maintenance_mode', settings.maintenanceMode.toString());
            alert("Sistem ayarları veritabanına kaydedildi.");
        } catch (e) {
            alert("Kayıt sırasında hata oluştu.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="animate-in fade-in space-y-10">
            <div>
                <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">SİSTEM <span className="text-blue-500">YAPILANDIRMASI</span></h2>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Platform Çekirdek Parametreleri</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[#0f172a] border border-slate-800 p-10 rounded-[40px] space-y-8">
                    <h3 className="font-black text-lg text-white mb-6 uppercase italic flex items-center gap-3"><Globe size={20} className="text-blue-500"/> Genel Bilgiler</h3>
                    <div className="space-y-6">
                        <div className="space-y-2"> 
                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Uygulama Adı</label> 
                            <input type="text" value={settings.appName} onChange={e => setSettings({...settings, appName: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-bold text-white focus:border-blue-500 outline-none" /> 
                        </div>
                        <div className="space-y-2"> 
                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Destek Kanalı</label> 
                            <input type="text" value={settings.supportLink} onChange={e => setSettings({...settings, supportLink: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-bold text-white focus:border-blue-500 outline-none" /> 
                        </div>
                    </div>
                </div>

                <div className="bg-[#0f172a] border border-slate-800 p-10 rounded-[40px] space-y-8">
                    <h3 className="font-black text-lg text-white mb-6 uppercase italic flex items-center gap-3"><Percent size={20} className="text-emerald-500"/> Ekonomi & Güvenlik</h3>
                    <div className="space-y-8">
                        <div className="flex items-center justify-between p-6 bg-slate-950 border border-slate-800 rounded-2xl">
                            <div> 
                                <p className="text-sm font-black text-white">BAKIM MODU</p> 
                                <p className="text-[10px] text-slate-600 font-bold uppercase mt-1">Erişimi kısıtla</p> 
                            </div>
                            <button onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})} className={`w-14 h-7 rounded-full relative transition-all ${settings.maintenanceMode ? 'bg-red-600' : 'bg-slate-800'}`}> 
                                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${settings.maintenanceMode ? 'left-8' : 'left-1'}`} /> 
                            </button>
                        </div>
                        <div className="space-y-2"> 
                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Komisyon Oranı (%)</label> 
                            <input type="number" value={settings.commissionRate} onChange={e => setSettings({...settings, commissionRate: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-bold text-white focus:border-emerald-500 outline-none" /> 
                        </div>
                    </div>
                </div>
            </div>

            <button onClick={handleSave} disabled={isSaving} className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white font-black text-[11px] uppercase tracking-[0.3em] rounded-3xl shadow-2xl shadow-blue-900/40 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"> 
                {isSaving ? <Loader2 className="animate-spin" /> : <ShieldCheck size={20} />} TÜM AYARLARI VERİTABANINA YAYINLA
            </button>
        </div>
    );
}

export default AdminDashboard;
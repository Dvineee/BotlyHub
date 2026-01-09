
import React, { useEffect, useState, useCallback } from 'react';
import * as Router from 'react-router-dom';
import { 
  LayoutDashboard, Users, Bot, LogOut, Menu, X, 
  Loader2, Plus, Trash2, Megaphone, Send, Activity, 
  Wallet, Search, Database, Radio, Bell, Edit3, Image as ImageIcon,
  CheckCircle2, AlertTriangle, TrendingUp, BarChart3, RadioIcon, Sparkles, UserPlus,
  ShieldCheck, Globe, Zap, Clock, ExternalLink, Filter, PieChart, Layers, 
  Settings as SettingsIcon, History
} from 'lucide-react';
import { DatabaseService } from '../../services/DatabaseService';
import { User, Bot as BotType, Announcement, Promotion, ActivityLog } from '../../types';

const { useNavigate, Routes, Route, Link, useLocation } = Router as any;

const getLiveBotIcon = (bot: Partial<BotType>) => {
    if (bot.icon && bot.icon.startsWith('http')) return bot.icon;
    if (bot.bot_link) {
        const username = bot.bot_link.replace('@', '').replace('https://t.me/', '').split('/').pop()?.trim();
        if (username) return `https://t.me/i/userpic/320/${username}.jpg`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(bot.name || 'Bot')}&background=1e293b&color=fff&bold=true`;
};

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
        className={`flex items-center gap-4 px-6 py-4 rounded-[24px] transition-all duration-300 ${active ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/40' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}
      >
        <Icon size={18} />
        <span className="font-black text-[10px] uppercase tracking-[0.2em]">{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[#020617] flex text-slate-200 overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[65] lg:hidden animate-in fade-in" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-[70] w-72 bg-[#020617] border-r border-white/5 transition-transform duration-500 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-8">
          <div className="flex items-center gap-4 mb-14">
            <div className="w-12 h-12 bg-blue-600 rounded-[20px] flex items-center justify-center shadow-2xl shadow-blue-600/20 rotate-3">
                <Database size={24} className="text-white"/>
            </div>
            <div>
                <h2 className="text-xl font-black text-white italic tracking-tighter uppercase leading-none">Botly<span className="text-blue-500">Hub</span></h2>
                <span className="text-[8px] font-black text-slate-700 uppercase tracking-[0.4em] mt-1.5 block">SaaS Management</span>
            </div>
          </div>
          
          <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
            <NavItem to="/a/dashboard" icon={LayoutDashboard} label="Panel Özeti" />
            <div className="pt-8 pb-3 px-6"><span className="text-[9px] font-black text-slate-800 uppercase tracking-widest italic">Monitoring</span></div>
            <NavItem to="/a/dashboard/users" icon={Users} label="Kullanıcılar" />
            <NavItem to="/a/dashboard/logs" icon={History} label="Aktivite Günlüğü" />
            <NavItem to="/a/dashboard/sales" icon={Wallet} label="Ödeme Kayıtları" />
            
            <div className="pt-8 pb-3 px-6"><span className="text-[9px] font-black text-slate-800 uppercase tracking-widest italic">Core Engine</span></div>
            <NavItem to="/a/dashboard/bots" icon={Bot} label="Market Botları" />
            <NavItem to="/a/dashboard/promotions" icon={RadioIcon} label="Tanıtım Motoru" />
            <NavItem to="/a/dashboard/announcements" icon={Megaphone} label="Duyuru Merkezi" />
            <NavItem to="/a/dashboard/notifications" icon={Bell} label="Global Bildirim" />
          </nav>

          <button onClick={() => { DatabaseService.logoutAdmin(); navigate('/a/admin'); }} className="mt-8 flex items-center gap-4 px-8 py-5 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-500/10 rounded-[24px] transition-all group border border-transparent hover:border-red-500/20">
            <LogOut size={18} /> Güvenli Çıkış
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-24 border-b border-white/5 flex items-center justify-between px-10 bg-[#020617]/80 backdrop-blur-2xl z-50">
           <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-4 bg-slate-900 border border-white/5 rounded-2xl text-slate-400"><Menu size={20}/></button>
           
           <div className="flex items-center gap-8 ml-auto">
              <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Server: Online</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-black text-white italic text-xl shadow-xl shadow-blue-600/20 cursor-pointer hover:scale-105 transition-all">A</div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 lg:p-12 no-scrollbar bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent">
          <div className="max-w-7xl mx-auto space-y-12 pb-24">
            <Routes>
              <Route path="/" element={<HomeView />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="logs" element={<ActivityCenter />} />
              <Route path="bots" element={<BotManagement />} />
              <Route path="sales" element={<SalesManagement />} />
              <Route path="promotions" element={<PromotionManagement />} />
              <Route path="announcements" element={<AnnouncementCenter />} />
              <Route path="notifications" element={<AdminNotifications />} />
            </Routes>
          </div>
        </div>
      </main>
    </div>
  );
};

// --- VIEWS ---

const HomeView = () => {
    const [stats, setStats] = useState({ userCount: 0, botCount: 0, logCount: 0, salesCount: 0, totalRevenue: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => { 
        DatabaseService.getAdminStats().then(s => {
            setStats(s);
            setIsLoading(false);
        }); 
    }, []);

    if (isLoading) return <div className="flex justify-center py-24"><Loader2 className="animate-spin text-blue-500" size={40} /></div>;

    return (
        <div className="animate-in fade-in duration-700 space-y-12">
            <div className="flex flex-col gap-3">
                <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter">Enterprise <span className="text-blue-500">Overview</span></h1>
                <p className="text-xs font-black text-slate-700 uppercase tracking-[0.5em]">Platform performans ve büyüme metrikleri</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard icon={Users} label="Toplam Üye" value={stats.userCount} color="blue" />
                <StatCard icon={Bot} label="Aktif Botlar" value={stats.botCount} color="purple" />
                <StatCard icon={BarChart3} label="Satış Adedi" value={stats.salesCount} color="orange" />
                <StatCard icon={TrendingUp} label="Toplam Ciro" value={`₺${stats.totalRevenue.toLocaleString()}`} color="emerald" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-slate-900/40 border border-white/5 p-12 rounded-[56px] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-all">
                        <PieChart size={120} className="text-blue-500" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-xl font-black italic uppercase tracking-tight mb-8">Platform Büyüme Hızı</h3>
                        <div className="h-48 flex items-end gap-3 px-4">
                            {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
                                <div key={i} className="flex-1 bg-gradient-to-t from-blue-600 to-indigo-400 rounded-t-2xl transition-all duration-1000 animate-in slide-in-from-bottom" style={{ height: `${h}%` }}></div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-6 px-4 text-[10px] font-black text-slate-700 uppercase tracking-widest">
                            <span>Pazartesi</span><span>Pazar</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-600/20 to-transparent border border-blue-500/10 p-12 rounded-[56px] flex flex-col justify-center relative overflow-hidden">
                    <Sparkles className="absolute -top-6 -right-6 text-blue-500/20 w-32 h-32" />
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em] mb-6 italic">GÜNLÜK RAPOR</p>
                    <p className="text-white text-3xl font-black italic uppercase tracking-tighter leading-none mb-4">Sistemler <span className="text-emerald-500">Optimum</span></p>
                    <p className="text-slate-500 text-sm font-bold leading-relaxed">Tüm botlar ve kanal yayınları sorunsuz çalışıyor. Kayıt hızı %14 arttı.</p>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon: Icon, label, value, color }: any) => {
    const colors: any = {
        blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
        purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
        emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
        orange: 'text-orange-500 bg-orange-500/10 border-orange-500/20'
    };
    return (
        <div className="bg-slate-900/40 border border-white/5 p-12 rounded-[56px] hover:border-white/10 transition-all group relative overflow-hidden">
            <div className={`w-16 h-16 ${colors[color]} rounded-[24px] border flex items-center justify-center mb-8 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all`}><Icon size={32} /></div>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">{label}</p>
            <h3 className="text-4xl font-black text-white tracking-tighter italic">{typeof value === 'number' ? value.toLocaleString() : value}</h3>
        </div>
    );
};

const UserManagement = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const load = useCallback(async () => {
        setIsLoading(true);
        const data = await DatabaseService.getUsers();
        setUsers(data);
        setIsLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const toggleStatus = async (user: User) => {
        const nextStatus: 'Active' | 'Passive' = user.status === 'Active' ? 'Passive' : 'Active';
        await DatabaseService.updateUserStatus(user.id, nextStatus);
        load();
    };

    const filtered = users.filter(u => 
        (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        (u.username || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-10 animate-in fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Kullanıcı <span className="text-blue-500">Yönetimi</span></h2>
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700" size={20} />
                    <input type="text" placeholder="Üye ara..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-slate-900 border border-white/5 rounded-[28px] py-5 pl-16 pr-8 text-sm outline-none focus:border-blue-500/50 text-white font-bold" />
                </div>
            </div>

            <div className="bg-slate-900/40 border border-white/5 rounded-[56px] overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-[10px] uppercase tracking-[0.4em] text-slate-700 font-black">
                        <tr><th className="px-12 py-8">Kimlik & Üye</th><th className="px-12 py-8">Rol</th><th className="px-12 py-8">Durum</th><th className="px-12 py-8 text-right">Aksiyonlar</th></tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filtered.map(u => (
                            <tr key={u.id} className="hover:bg-white/5 transition-all group">
                                <td className="px-12 py-8">
                                    <div className="flex items-center gap-5">
                                        <img src={u.avatar || `https://ui-avatars.com/api/?name=${u.name}`} className="w-14 h-14 rounded-[22px] bg-slate-950 object-cover shadow-2xl border border-white/5" />
                                        <div>
                                            <p className="font-black text-white italic text-base">@{u.username}</p>
                                            <p className="text-[10px] text-slate-700 font-black uppercase tracking-widest mt-1">{u.name}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-12 py-8"><span className="bg-slate-800 text-slate-500 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/5">{u.role}</span></td>
                                <td className="px-12 py-8">
                                    <div className={`flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest ${u.status === 'Active' ? 'text-emerald-500' : 'text-red-500'}`}>
                                        <div className={`w-2.5 h-2.5 rounded-full ${u.status === 'Active' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`}></div>{u.status}
                                    </div>
                                </td>
                                <td className="px-12 py-8 text-right">
                                    <button onClick={() => toggleStatus(u)} className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 ${u.status === 'Active' ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-600 hover:text-white' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white'}`}>
                                        {u.status === 'Active' ? 'PASİFE AL' : 'AKTİF ET'}
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

const ActivityCenter = () => {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        DatabaseService.getActivityLogs().then(data => {
            setLogs(data);
            setIsLoading(false);
        });
    }, []);

    const typeColors: any = { payment: 'text-emerald-500', bot_manage: 'text-blue-500', security: 'text-red-500', system: 'text-slate-500' };

    return (
        <div className="space-y-10 animate-in fade-in">
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Aktivite <span className="text-blue-500">Günlüğü</span></h2>
            {isLoading ? <div className="flex justify-center py-24"><Loader2 className="animate-spin text-blue-500" /></div> : (
                <div className="space-y-4">
                    {logs.map(log => (
                        <div key={log.id} className="bg-slate-900/40 border border-white/5 p-8 rounded-[36px] flex items-center gap-8 group hover:border-white/10 transition-all">
                            <div className={`w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center ${typeColors[log.type] || 'text-white'}`}><Activity size={24} /></div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className="font-black text-white italic text-base uppercase">{log.title}</h4>
                                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{new Date(log.created_at).toLocaleString()}</span>
                                </div>
                                <p className="text-slate-500 text-xs font-bold uppercase italic opacity-80">{log.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const BotManagement = () => {
    const [bots, setBots] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBot, setEditingBot] = useState<any>(null);

    const load = useCallback(async () => {
        setIsLoading(true);
        setBots(await DatabaseService.getBotsWithStats());
        setIsLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    return (
        <div className="space-y-10 animate-in fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Market <span className="text-blue-500">Envanteri</span></h2>
                <button onClick={() => { setEditingBot({ id: '', name: '', description: '', price: 0, category: 'utilities', bot_link: '', icon: '', screenshots: [], is_premium: false }); setIsModalOpen(true); }} className="bg-blue-600 px-10 py-5 rounded-[28px] text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl hover:bg-blue-500 active:scale-95 transition-all">YENİ ÜRÜN EKLE</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {bots.map(b => (
                    <div key={b.id} className="bg-slate-900/40 border border-white/5 rounded-[56px] p-10 flex flex-col gap-8 group hover:border-blue-500/30 transition-all relative overflow-hidden shadow-2xl">
                        <div className="flex justify-between items-start">
                            <img src={getLiveBotIcon(b)} className="w-20 h-20 rounded-[32px] border border-white/10 shadow-2xl object-cover bg-slate-950 group-hover:rotate-6 transition-transform" />
                            <div className="flex gap-3">
                                <button onClick={() => { setEditingBot(b); setIsModalOpen(true); }} className="p-4 bg-white/5 rounded-2xl hover:bg-blue-600 text-slate-500 hover:text-white transition-all"><Edit3 size={18}/></button>
                                <button onClick={async () => { if(confirm('Sistemden silinecek. Onaylıyor musunuz?')) { await DatabaseService.deleteBot(b.id); load(); } }} className="p-4 bg-white/5 rounded-2xl text-red-500 hover:bg-red-600 hover:text-white transition-all"><Trash2 size={18}/></button>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">{b.name}</h4>
                            <p className="text-xs text-slate-600 mt-4 line-clamp-2 leading-relaxed font-bold uppercase italic">{b.description}</p>
                        </div>
                        <div className="flex items-center justify-between pt-8 border-t border-white/5">
                            <div className="flex flex-col">
                                <p className="text-[8px] font-black text-slate-800 uppercase tracking-[0.4em] mb-1">LİSANS BEDELİ</p>
                                <p className="text-lg font-black uppercase text-blue-500 italic">{b.price > 0 ? `${b.price} TL` : 'ÜCRETSİZ'}</p>
                            </div>
                            <div className="flex flex-col text-right">
                                <p className="text-[8px] font-black text-slate-800 uppercase tracking-[0.4em] mb-1">USER BASE</p>
                                <p className="text-lg font-black uppercase text-white italic">{b.ownerCount || 0}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && editingBot && (
                <div className="fixed inset-0 z-[110] bg-black/98 flex items-center justify-center p-6 backdrop-blur-3xl overflow-y-auto animate-in fade-in">
                    <div className="bg-[#020617] p-12 rounded-[64px] w-full max-w-4xl border border-white/10 shadow-2xl relative">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-12 right-12 p-5 bg-white/5 rounded-3xl hover:bg-red-600 hover:text-white transition-all"><X size={24}/></button>
                        <h3 className="text-3xl font-black mb-12 uppercase italic tracking-tighter">Bot <span className="text-blue-500">Konfigürasyonu</span></h3>
                        <form onSubmit={async (e) => { e.preventDefault(); await DatabaseService.saveBot(editingBot); setIsModalOpen(false); load(); }} className="grid grid-cols-1 md:grid-cols-2 gap-10 text-white">
                            <div className="space-y-8">
                                <AdminInput label="SİSTEM ID (EŞSİZ)" value={editingBot.id} onChange={(v:any)=>setEditingBot({...editingBot, id:v})}/>
                                <AdminInput label="BOT ADI" value={editingBot.name} onChange={(v:any)=>setEditingBot({...editingBot, name:v})}/>
                                <AdminInput label="TELEGRAM ENDPOINT" value={editingBot.bot_link} onChange={(v:any)=>setEditingBot({...editingBot, bot_link:v})}/>
                                <AdminInput label="TL FİYATI" type="number" value={editingBot.price} onChange={(v:any)=>setEditingBot({...editingBot, price:v})}/>
                            </div>
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] ml-6">HİZMET KATEGORİSİ</label>
                                    <select value={editingBot.category} onChange={e => setEditingBot({...editingBot, category: e.target.value})} className="w-full h-18 bg-slate-950 border border-white/10 rounded-[28px] px-8 text-xs font-black text-white outline-none focus:border-blue-500 uppercase italic">
                                        <option value="utilities">Araçlar</option><option value="finance">Finans</option><option value="games">Eğlence</option><option value="productivity">Verimlilik</option><option value="moderation">Moderasyon</option>
                                    </select>
                                </div>
                                <AdminInput label="İKON (URL)" value={editingBot.icon} onChange={(v:any)=>setEditingBot({...editingBot, icon:v})}/>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] ml-6">TEKNİK AÇIKLAMA</label>
                                    <textarea value={editingBot.description} onChange={e => setEditingBot({...editingBot, description: e.target.value})} className="w-full bg-slate-950 border border-white/10 p-8 rounded-[36px] text-xs font-bold h-40 outline-none text-slate-300 focus:border-blue-500/50 uppercase italic leading-relaxed" />
                                </div>
                                <button type="submit" className="w-full bg-blue-600 py-8 rounded-[32px] font-black text-[11px] uppercase tracking-[0.6em] shadow-2xl border-b-8 border-blue-800 active:translate-y-1 active:border-b-4 transition-all">VERİYİ KAYDET</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const PromotionManagement = () => {
    const [promos, setPromos] = useState<Promotion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPromo, setEditingPromo] = useState<Partial<Promotion> | null>(null);

    const load = useCallback(async () => {
        setIsLoading(true);
        setPromos(await DatabaseService.getPromotions());
        setIsLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleToggle = async (promo: Promotion) => {
        const next = promo.status === 'sending' ? 'pending' : 'sending';
        await DatabaseService.updatePromotionStatus(promo.id, next);
        load();
    };

    return (
        <div className="space-y-12 animate-in fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Tanıtım <span className="text-blue-500">Motoru</span></h2>
                <button onClick={() => { setEditingPromo({ title: '', content: '', status: 'pending', button_text: 'İncele', processed_channels: [] }); setIsModalOpen(true); }} className="bg-emerald-600 px-10 py-5 rounded-[28px] text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl hover:bg-emerald-500 transition-all">YENİ KAMPANYA</button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {promos.map(p => (
                    <div key={p.id} className="bg-slate-900/40 border border-white/5 rounded-[48px] p-10 flex flex-col md:flex-row items-center gap-10 group hover:border-blue-500/20 transition-all shadow-2xl">
                        <div className="w-32 h-32 rounded-[36px] bg-slate-950 border border-white/10 overflow-hidden shadow-2xl shrink-0">
                            {p.image_url ? <img src={p.image_url} className="w-full h-full object-cover"/> : <ImageIcon className="w-full h-full p-8 text-slate-800"/>}
                        </div>
                        <div className="flex-1">
                            <h4 className="text-2xl font-black italic uppercase mb-4 tracking-tight">{p.title}</h4>
                            <div className="grid grid-cols-3 gap-6">
                                <div className="flex flex-col"><p className="text-[8px] font-black text-slate-700 uppercase tracking-widest mb-1">KANALLAR</p><p className="text-lg font-black italic text-white">{p.channel_count}</p></div>
                                <div className="flex flex-col"><p className="text-[8px] font-black text-slate-700 uppercase tracking-widest mb-1">NET ERİŞİM</p><p className="text-lg font-black italic text-blue-500">{p.total_reach.toLocaleString()}</p></div>
                                <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-center self-center ${p.status === 'sending' ? 'bg-emerald-500/10 text-emerald-500 animate-pulse' : 'bg-slate-800 text-slate-600'}`}>{p.status}</div>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => handleToggle(p)} className={`px-10 py-5 rounded-[24px] text-[10px] font-black uppercase tracking-[0.4em] transition-all shadow-xl ${p.status === 'sending' ? 'bg-orange-600/10 text-orange-500 border border-orange-500/20' : 'bg-emerald-600 text-white shadow-emerald-600/30'}`}>{p.status === 'sending' ? 'DURDUR' : 'YAYINLA'}</button>
                            <button onClick={() => { setEditingPromo(p); setIsModalOpen(true); }} className="p-5 bg-white/5 rounded-2xl hover:bg-blue-600 text-slate-600 hover:text-white transition-all"><Edit3 size={20}/></button>
                            <button onClick={async () => { if(confirm('Silinsin mi?')) { await DatabaseService.deletePromotion(p.id); load(); } }} className="p-5 bg-white/5 rounded-2xl text-red-500 hover:bg-red-600 hover:text-white transition-all"><Trash2 size={20}/></button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && editingPromo && (
                <div className="fixed inset-0 z-[110] bg-black/98 flex items-center justify-center p-6 backdrop-blur-3xl overflow-y-auto animate-in fade-in">
                    <div className="bg-[#020617] p-12 rounded-[64px] w-full max-w-3xl border border-white/10 shadow-2xl relative">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-12 right-12 p-5 bg-white/5 rounded-3xl hover:bg-red-600 hover:text-white transition-all"><X size={24}/></button>
                        <h3 className="text-3xl font-black mb-10 uppercase italic tracking-tighter">Yayın <span className="text-emerald-500">Editörü</span></h3>
                        <form onSubmit={async (e) => { e.preventDefault(); await DatabaseService.savePromotion(editingPromo); setIsModalOpen(false); load(); }} className="space-y-8 text-white">
                            <AdminInput label="REKLAM BAŞLIĞI" value={editingPromo.title} onChange={(v:any)=>setEditingPromo({...editingPromo, title:v})}/>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] ml-6">İÇERİK (HTML)</label>
                                <textarea value={editingPromo.content} onChange={(e)=>setEditingPromo({...editingPromo, content:e.target.value})} className="w-full bg-slate-950 border border-white/10 p-10 rounded-[40px] text-xs font-bold h-48 outline-none text-slate-300 focus:border-blue-500/50 uppercase italic leading-relaxed" />
                            </div>
                            <AdminInput label="MEDYA (URL)" value={editingPromo.image_url} onChange={(v:any)=>setEditingPromo({...editingPromo, image_url:v})}/>
                            <div className="grid grid-cols-2 gap-8">
                                <AdminInput label="BUTON TEXT" value={editingPromo.button_text} onChange={(v:any)=>setEditingPromo({...editingPromo, button_text:v})}/>
                                <AdminInput label="BUTON LINK" value={editingPromo.button_link} onChange={(v:any)=>setEditingPromo({...editingPromo, button_link:v})}/>
                            </div>
                            <button type="submit" className="w-full bg-emerald-600 py-8 rounded-[32px] font-black text-[11px] uppercase tracking-[0.5em] shadow-2xl border-b-8 border-emerald-800">KAMPANYAYI BAŞLAT</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const SalesManagement = () => {
    const [sales, setSales] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => { 
        DatabaseService.getAllPurchases().then(s => {
            setSales(s);
            setIsLoading(false);
        }); 
    }, []);

    return (
        <div className="space-y-10 animate-in fade-in">
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Finans <span className="text-blue-500">Kayıtları</span></h2>
            <div className="bg-slate-900/40 border border-white/5 rounded-[56px] overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                    <thead className="bg-white/5 text-[10px] uppercase tracking-[0.4em] text-slate-700 font-black">
                        <tr><th className="px-12 py-8">Müşteri</th><th className="px-12 py-8">Ürün</th><th className="px-12 py-8">İşlem</th><th className="px-12 py-8 text-right">Hasılat</th></tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {sales.map((s, idx) => (
                            <tr key={idx} className="hover:bg-white/5 transition-all text-white">
                                <td className="px-12 py-8 font-black italic text-sm">@{s.users?.username || 'Guest'}</td>
                                <td className="px-12 py-8 font-black uppercase text-xs tracking-tight">{s.bots?.name || 'Paket'}</td>
                                <td className="px-12 py-8 font-bold text-slate-600 uppercase text-[10px] tracking-widest">{new Date(s.acquired_at).toLocaleDateString()}</td>
                                <td className="px-12 py-8 text-right font-black text-emerald-500 italic text-lg">₺{s.bots?.price || 0}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const AnnouncementCenter = () => {
    const [anns, setAnns] = useState<Announcement[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAnn, setEditingAnn] = useState<any>(null);

    const load = useCallback(async () => setAnns(await DatabaseService.getAnnouncements()), []);
    useEffect(() => { load(); }, [load]);

    return (
        <div className="space-y-10 animate-in fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Duyuru <span className="text-blue-500">Yönetimi</span></h2>
                <button onClick={() => { setEditingAnn({ id: '', title: '', description: '', button_text: 'İncele', button_link: '', icon_name: 'Megaphone', color_scheme: 'purple', is_active: true, action_type: 'link' }); setIsModalOpen(true); }} className="bg-blue-600 px-10 py-5 rounded-[28px] text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl">YENİ DUYURU</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {anns.map(a => (
                    <div key={a.id} className="bg-slate-900/40 border border-white/5 rounded-[56px] p-10 flex flex-col gap-8 group overflow-hidden shadow-2xl">
                        <div className="flex justify-between items-start">
                             <div className={`p-5 rounded-3xl bg-blue-600/20 text-blue-500 shadow-2xl`}>{a.icon_name}</div>
                             <div className="flex gap-3">
                                <button onClick={() => { setEditingAnn(a); setIsModalOpen(true); }} className="p-4 bg-white/5 rounded-2xl hover:bg-blue-600 transition-all text-white"><Edit3 size={18}/></button>
                                <button onClick={async () => { if(confirm('Silinsin mi?')) { await DatabaseService.deleteAnnouncement(a.id); load(); } }} className="p-4 bg-white/5 rounded-2xl text-red-500 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18}/></button>
                             </div>
                        </div>
                        <h4 className="text-2xl font-black text-white italic uppercase">{a.title}</h4>
                    </div>
                ))}
            </div>
            {isModalOpen && editingAnn && (
                <div className="fixed inset-0 z-[110] bg-black/98 flex items-center justify-center p-6 backdrop-blur-3xl">
                    <div className="bg-[#020617] p-12 rounded-[64px] w-full max-w-2xl border border-white/10 shadow-2xl relative text-white">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-12 right-12 p-5 bg-white/5 rounded-3xl hover:bg-red-600 transition-all"><X size={24}/></button>
                        <h3 className="text-2xl font-black mb-12 uppercase italic">Duyuru Editörü</h3>
                        <form onSubmit={async (e) => { e.preventDefault(); await DatabaseService.saveAnnouncement(editingAnn); setIsModalOpen(false); load(); }} className="space-y-6">
                            <AdminInput label="BAŞLIK" value={editingAnn.title} onChange={(v:any)=>setEditingAnn({...editingAnn, title:v})}/>
                            <AdminInput label="AÇIKLAMA" value={editingAnn.description} onChange={(v:any)=>setEditingAnn({...editingAnn, description:v})}/>
                            <AdminInput label="HEDEF LİNK" value={editingAnn.button_link} onChange={(v:any)=>setEditingAnn({...editingAnn, button_link:v})}/>
                            <button type="submit" className="w-full bg-blue-600 py-8 rounded-[32px] font-black text-[11px] uppercase tracking-[0.6em] shadow-2xl">SİSTEME KAYDET</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const AdminNotifications = () => {
    const [title, setTitle] = useState('');
    const [msg, setMsg] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleSend = async () => {
        if (!title || !msg) return;
        setIsSending(true);
        try {
            await DatabaseService.sendGlobalNotification(title, msg, 'system');
            setTitle(''); setMsg(''); alert('Gönderildi!');
        } catch(e) { alert('Hata oluştu.'); }
        finally { setIsSending(false); }
    };

    return (
        <div className="animate-in fade-in space-y-12">
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Global <span className="text-blue-500">Bildirim</span></h2>
            <div className="bg-slate-900/40 border border-white/5 p-12 rounded-[64px] shadow-2xl max-w-3xl space-y-10 text-white">
                <AdminInput label="KONU BAŞLIĞI" value={title} onChange={setTitle} />
                <div className="space-y-3"><label className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em] ml-6">BİLDİRİM GÖVDESİ</label>
                    <textarea value={msg} onChange={e => setMsg(e.target.value)} className="w-full bg-slate-950 border border-white/10 p-10 rounded-[40px] text-xs font-bold h-48 outline-none text-slate-400 focus:border-blue-500/50 uppercase italic leading-relaxed" />
                </div>
                <button onClick={handleSend} disabled={isSending} className="w-full bg-blue-600 h-24 rounded-[36px] font-black text-[12px] uppercase tracking-[0.6em] flex items-center justify-center gap-4 active:scale-[0.98] transition-all disabled:opacity-50 text-white shadow-2xl border-b-8 border-blue-800">
                    {isSending ? <Loader2 className="animate-spin" size={24} /> : <><Send size={24}/> GLOBAL YAYINLA</>}
                </button>
            </div>
        </div>
    );
};

const AdminInput = ({ label, value, onChange, type = "text" }: any) => (
    <div className="space-y-3 text-white">
        <label className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em] ml-6">{label}</label>
        <input type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full h-18 bg-slate-950 border border-white/10 rounded-[28px] px-10 text-xs font-black text-white outline-none focus:border-blue-500/50 transition-all uppercase italic" />
    </div>
);

export default AdminDashboard;


import React, { useEffect, useState, useCallback } from 'react';
import * as Router from 'react-router-dom';
import { 
  LayoutDashboard, Users, Bot, LogOut, Menu, X, 
  Loader2, Plus, Trash2, Megaphone, Send, Activity, 
  Wallet, Search, Database, Radio, Bell, Edit3, Image as ImageIcon,
  CheckCircle2, AlertTriangle, TrendingUp, BarChart3, RadioIcon, Sparkles, UserPlus
} from 'lucide-react';
import { DatabaseService } from '../../services/DatabaseService';
import { User, Bot as BotType, Announcement, Promotion } from '../../types';

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
        className={`flex items-center gap-4 px-6 py-4 rounded-[22px] transition-all duration-300 ${active ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/40' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}
      >
        <Icon size={20} />
        <span className="font-black text-[10px] uppercase tracking-[0.2em]">{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[#020617] flex text-slate-200 overflow-hidden font-sans">
      {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[65] lg:hidden animate-in fade-in" onClick={() => setSidebarOpen(false)}></div>
      )}

      <aside className={`fixed inset-y-0 left-0 z-[70] w-72 bg-[#020617] border-r border-white/5 transition-transform duration-500 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-4 mb-12 px-2">
            <div className="w-12 h-12 bg-blue-600 rounded-[20px] flex items-center justify-center shadow-2xl rotate-3">
                <Database size={24} className="text-white"/>
            </div>
            <div>
                <h2 className="text-xl font-black text-white italic tracking-tighter uppercase leading-none">Botly<span className="text-blue-500">Hub</span></h2>
                <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.4em] mt-1.5 block">ADMIN PANEL</span>
            </div>
          </div>
          
          <nav className="flex-1 space-y-1.5 overflow-y-auto no-scrollbar">
            <NavItem to="/a/dashboard" icon={LayoutDashboard} label="İstatistikler" />
            <div className="pt-8 pb-3 px-6"><span className="text-[9px] font-black text-slate-800 uppercase tracking-widest italic">Kullanıcı Yönetimi</span></div>
            <NavItem to="/a/dashboard/users" icon={Users} label="Üye Listesi" />
            <NavItem to="/a/dashboard/sales" icon={Wallet} label="Ödeme Kayıtları" />
            
            <div className="pt-8 pb-3 px-6"><span className="text-[9px] font-black text-slate-800 uppercase tracking-widest italic">Platform İçeriği</span></div>
            <NavItem to="/a/dashboard/bots" icon={Bot} label="Market Botları" />
            <NavItem to="/a/dashboard/promotions" icon={RadioIcon} label="Tanıtım (Reklam)" />
            <NavItem to="/a/dashboard/announcements" icon={Megaphone} label="Duyuru Paneli" />
            <NavItem to="/a/dashboard/notifications" icon={Bell} label="Bildirim Gönder" />
          </nav>

          <button onClick={() => { DatabaseService.logoutAdmin(); navigate('/a/admin'); }} className="mt-8 flex items-center gap-4 px-6 py-5 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-500/10 rounded-[24px] transition-all group border border-transparent hover:border-red-500/20">
            <LogOut size={18} /> Oturumu Kapat
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-24 border-b border-white/5 flex items-center justify-between px-10 bg-[#020617]/80 backdrop-blur-2xl z-50">
           <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-4 bg-slate-900 border border-white/5 rounded-2xl text-slate-400"><Menu size={20}/></button>
           <div className="flex items-center gap-6 ml-auto">
              <div className="text-right hidden sm:block">
                  <p className="text-xs font-black text-white italic uppercase leading-none">Sistem Yöneticisi</p>
                  <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mt-1">Çevrimiçi</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-black text-white italic text-xl shadow-xl shadow-blue-600/20">A</div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 lg:p-12 no-scrollbar bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/5 via-transparent to-transparent">
          <div className="max-w-6xl mx-auto space-y-12 pb-24">
            <Routes>
              <Route path="/" element={<HomeView />} />
              <Route path="users" element={<UserManagement />} />
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

const HomeView = () => {
    const [stats, setStats] = useState({ userCount: 0, botCount: 0, logCount: 0, salesCount: 0 });
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
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Sistem <span className="text-blue-500">Durumu</span></h1>
                <p className="text-xs font-black text-slate-600 uppercase tracking-[0.3em]">Gerçek zamanlı altyapı verileri</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard icon={Users} label="Üyeler" value={stats.userCount} color="blue" />
                <StatCard icon={Bot} label="Botlar" value={stats.botCount} color="purple" />
                <StatCard icon={Wallet} label="Satışlar" value={stats.salesCount} color="emerald" />
                <StatCard icon={Activity} label="Sinyaller" value={stats.logCount} color="orange" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-900/40 border border-white/5 p-10 rounded-[48px] shadow-2xl">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-lg font-black italic uppercase tracking-tight">Hızlı Erişim</h3>
                        <Sparkles size={18} className="text-blue-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <QuickAction icon={UserPlus} label="Üye Yönet" to="/a/dashboard/users" />
                        <QuickAction icon={TrendingUp} label="Reklamlar" to="/a/dashboard/promotions" />
                        <QuickAction icon={BarChart3} label="Finans" to="/a/dashboard/sales" />
                        <QuickAction icon={Bell} label="Duyuru" to="/a/dashboard/announcements" />
                    </div>
                </div>
                <div className="bg-gradient-to-br from-blue-600/10 to-transparent border border-blue-500/10 p-10 rounded-[48px] flex flex-col justify-center">
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em] mb-4">SİSTEM MESAJI</p>
                    <p className="text-white text-xl font-black italic uppercase tracking-tight leading-snug">BotlyHub V3 Paneline Hoş Geldiniz. Tüm sistemler aktif ve stabil.</p>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon: Icon, label, value, color }: any) => {
    const colors: any = {
        blue: 'text-blue-500 bg-blue-500/10',
        purple: 'text-purple-500 bg-purple-500/10',
        emerald: 'text-emerald-500 bg-emerald-500/10',
        orange: 'text-orange-500 bg-orange-500/10'
    };
    return (
        <div className="bg-slate-900/40 border border-white/5 p-10 rounded-[48px] hover:border-white/10 transition-all group">
            <div className={`w-14 h-14 ${colors[color]} rounded-[20px] flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 transition-transform`}><Icon size={28} /></div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
            <h3 className="text-4xl font-black text-white tracking-tighter italic">{value.toLocaleString()}</h3>
        </div>
    );
};

const QuickAction = ({ icon: Icon, label, to }: any) => (
    <Link to={to} className="bg-white/5 border border-white/5 p-6 rounded-3xl flex flex-col items-center gap-3 hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all group">
        <Icon size={24} className="text-slate-500 group-hover:text-white" />
        <span className="text-[10px] font-black uppercase tracking-widest text-center">{label}</span>
    </Link>
);

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
                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Üye <span className="text-blue-500">Kütüphanesi</span></h2>
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                    <input type="text" placeholder="Üye ara..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-slate-900 border border-white/5 rounded-[24px] py-4 pl-14 pr-6 text-sm outline-none focus:border-blue-500/50 text-white font-bold" />
                </div>
            </div>

            {isLoading ? <div className="flex justify-center py-24"><Loader2 className="animate-spin text-blue-500" size={40}/></div> : (
                <div className="bg-slate-900/40 border border-white/5 rounded-[48px] overflow-hidden shadow-2xl">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-[9px] uppercase tracking-[0.3em] text-slate-600 font-black">
                            <tr><th className="px-10 py-6">Kimlik / Üye</th><th className="px-10 py-6">Yetki</th><th className="px-10 py-6">Durum</th><th className="px-10 py-6 text-right">Eylemler</th></tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filtered.map(u => (
                                <tr key={u.id} className="hover:bg-white/5 transition-all group">
                                    <td className="px-10 py-6">
                                        <div className="flex items-center gap-4">
                                            <img src={u.avatar || `https://ui-avatars.com/api/?name=${u.name}`} className="w-12 h-12 rounded-[18px] bg-slate-950 object-cover shadow-lg" />
                                            <div>
                                                <p className="font-black text-white italic text-sm">@{u.username}</p>
                                                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-0.5">{u.name}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6"><span className="bg-slate-800 text-slate-400 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">{u.role}</span></td>
                                    <td className="px-10 py-6">
                                        <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${u.status === 'Active' ? 'text-emerald-500' : 'text-red-500'}`}>
                                            <div className={`w-2 h-2 rounded-full ${u.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>{u.status}
                                        </div>
                                    </td>
                                    <td className="px-10 py-6 text-right">
                                        <button onClick={() => toggleStatus(u)} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 ${u.status === 'Active' ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white'}`}>
                                            {u.status === 'Active' ? 'KISITLA' : 'AKTİF ET'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Market <span className="text-blue-500">Kataloğu</span></h2>
                <button onClick={() => { setEditingBot({ id: '', name: '', description: '', price: 0, category: 'utilities', bot_link: '', icon: '', screenshots: [], is_premium: false }); setIsModalOpen(true); }} className="bg-blue-600 px-10 py-5 rounded-[28px] text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl hover:bg-blue-500 active:scale-95 transition-all">YENİ BOT EKLE</button>
            </div>

            {isLoading ? <div className="flex justify-center py-24"><Loader2 className="animate-spin text-blue-500" size={40}/></div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {bots.map(b => (
                        <div key={b.id} className="bg-slate-900/40 border border-white/5 rounded-[56px] p-10 flex flex-col gap-8 group hover:border-blue-500/30 transition-all relative overflow-hidden shadow-2xl">
                            <div className="flex justify-between items-start">
                                <img src={getLiveBotIcon(b)} className="w-20 h-20 rounded-[32px] border border-white/10 shadow-2xl object-cover bg-slate-950 group-hover:rotate-3 transition-transform" />
                                <div className="flex gap-3">
                                    <button onClick={() => { setEditingBot(b); setIsModalOpen(true); }} className="p-4 bg-white/5 rounded-2xl hover:bg-blue-600 text-slate-400 hover:text-white transition-all"><Edit3 size={18}/></button>
                                    <button onClick={async () => { if(confirm('Bot silinecek. Emin misiniz?')) { await DatabaseService.deleteBot(b.id); load(); } }} className="p-4 bg-white/5 rounded-2xl text-red-500 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18}/></button>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">{b.name}</h4>
                                <p className="text-xs text-slate-500 mt-4 line-clamp-2 leading-relaxed font-bold uppercase italic opacity-70">{b.description}</p>
                            </div>
                            <div className="flex items-center justify-between pt-8 border-t border-white/5">
                                <div className="flex flex-col">
                                    <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest mb-1">FİYAT</p>
                                    <p className="text-lg font-black uppercase text-blue-500 italic">{b.price > 0 ? `${b.price} TL` : 'Ücretsiz'}</p>
                                </div>
                                <div className="flex flex-col text-right">
                                    <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest mb-1">KULLANICI</p>
                                    <p className="text-lg font-black uppercase text-white italic">{b.ownerCount || 0}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && editingBot && (
                <div className="fixed inset-0 z-[110] bg-black/98 flex items-center justify-center p-6 backdrop-blur-2xl overflow-y-auto animate-in fade-in">
                    <div className="bg-[#020617] p-12 rounded-[64px] w-full max-w-4xl border border-white/10 shadow-2xl relative">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-12 right-12 p-5 bg-white/5 rounded-3xl hover:bg-red-600 hover:text-white transition-all"><X size={24}/></button>
                        <h3 className="text-3xl font-black mb-12 uppercase italic tracking-tighter">Market <span className="text-blue-500">Yapılandırma</span></h3>
                        <form onSubmit={async (e) => { e.preventDefault(); await DatabaseService.saveBot(editingBot); setIsModalOpen(false); load(); }} className="grid grid-cols-1 md:grid-cols-2 gap-10 text-white">
                            <div className="space-y-8">
                                <AdminInput label="BENZERSİZ BOT ID" value={editingBot.id} onChange={(v:any)=>setEditingBot({...editingBot, id:v})}/>
                                <AdminInput label="GÖRÜNÜR İSİM" value={editingBot.name} onChange={(v:any)=>setEditingBot({...editingBot, name:v})}/>
                                <AdminInput label="TELEGRAM @USER / LİNK" value={editingBot.bot_link} onChange={(v:any)=>setEditingBot({...editingBot, bot_link:v})}/>
                                <AdminInput label="SATIŞ FİYATI (TL)" type="number" value={editingBot.price} onChange={(v:any)=>setEditingBot({...editingBot, price:v})}/>
                            </div>
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] ml-6">KATEGORİ</label>
                                    <select value={editingBot.category} onChange={e => setEditingBot({...editingBot, category: e.target.value})} className="w-full h-18 bg-slate-950 border border-white/10 rounded-[28px] px-8 text-xs font-black text-white outline-none focus:border-blue-500 uppercase italic">
                                        <option value="utilities">🛠 Araçlar</option><option value="finance">💰 Finans</option><option value="games">🎮 Eğlence</option><option value="productivity">🚀 Verimlilik</option><option value="moderation">🛡 Moderasyon</option>
                                    </select>
                                </div>
                                <AdminInput label="İKON URL (OPSİYONEL)" value={editingBot.icon} onChange={(v:any)=>setEditingBot({...editingBot, icon:v})}/>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] ml-6">BOT AÇIKLAMASI</label>
                                    <textarea value={editingBot.description} onChange={e => setEditingBot({...editingBot, description: e.target.value})} className="w-full bg-slate-950 border border-white/10 p-8 rounded-[36px] text-xs font-bold h-40 outline-none text-slate-300 focus:border-blue-500/50 uppercase italic leading-relaxed" />
                                </div>
                                <button type="submit" className="w-full bg-blue-600 py-8 rounded-[32px] font-black text-[11px] uppercase tracking-[0.5em] shadow-2xl shadow-blue-900/40 hover:bg-blue-500 transition-all border-b-8 border-blue-800 active:translate-y-1 active:border-b-4">MARKET KAYDINI ONAYLA</button>
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
    const [activeChannelsCount, setActiveChannelsCount] = useState(0);

    const load = useCallback(async () => {
        setIsLoading(true);
        const [p, c] = await Promise.all([DatabaseService.getPromotions(), DatabaseService.getChannelsCount(true)]);
        setPromos(p);
        setActiveChannelsCount(c);
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
                <button onClick={() => { setEditingPromo({ title: '', content: '', status: 'pending', button_text: 'İncele', processed_channels: [] }); setIsModalOpen(true); }} className="bg-emerald-600 px-10 py-5 rounded-[28px] text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl hover:bg-emerald-500 transition-all">YENİ YAYIN OLUŞTUR</button>
            </div>

            {isLoading ? <div className="flex justify-center py-24"><Loader2 className="animate-spin text-blue-500" size={40}/></div> : (
                <div className="space-y-6">
                    {promos.map(p => (
                        <div key={p.id} className="bg-slate-900/40 border border-white/5 rounded-[48px] p-10 flex flex-col md:flex-row items-center gap-10 group hover:border-blue-500/20 transition-all shadow-2xl">
                            <div className="w-32 h-32 rounded-[36px] bg-slate-950 border border-white/10 overflow-hidden shadow-2xl shrink-0">
                                {p.image_url ? <img src={p.image_url} className="w-full h-full object-cover"/> : <ImageIcon className="w-full h-full p-8 text-slate-800"/>}
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
                                    <h4 className="text-2xl font-black italic uppercase tracking-tight leading-none">{p.title}</h4>
                                    <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest ${p.status === 'sending' ? 'bg-emerald-500 text-white animate-pulse shadow-lg shadow-emerald-600/20' : 'bg-slate-800 text-slate-500'}`}>{p.status === 'sending' ? 'YAYINDA' : 'PASİF'}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-6 mt-6 max-w-md">
                                    <div className="flex flex-col"><p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">KANAL</p><p className="text-lg font-black italic text-white">{p.channel_count} / {activeChannelsCount}</p></div>
                                    <div className="flex flex-col"><p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">ERİŞİM</p><p className="text-lg font-black italic text-blue-500">{p.total_reach.toLocaleString()}</p></div>
                                    <div className="flex flex-col"><p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">OLUŞTURMA</p><p className="text-lg font-black italic text-slate-400">{new Date(p.created_at).toLocaleDateString()}</p></div>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => handleToggle(p)} className={`h-16 px-10 rounded-[24px] text-[10px] font-black uppercase tracking-[0.3em] transition-all active:scale-95 shadow-xl ${p.status === 'sending' ? 'bg-orange-600/10 text-orange-500 border border-orange-500/20 hover:bg-orange-600 hover:text-white' : 'bg-emerald-600 text-white shadow-emerald-600/30 hover:bg-emerald-500'}`}>{p.status === 'sending' ? 'DURDUR' : 'YAYINLA'}</button>
                                <button onClick={() => { setEditingPromo(p); setIsModalOpen(true); }} className="p-5 bg-white/5 rounded-2xl hover:bg-blue-600 text-slate-400 hover:text-white transition-all"><Edit3 size={20}/></button>
                                <button onClick={async () => { if(confirm('Tanıtım silinsin mi?')) { await DatabaseService.deletePromotion(p.id); load(); } }} className="p-5 bg-white/5 rounded-2xl text-red-500 hover:bg-red-600 hover:text-white transition-all"><Trash2 size={20}/></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && editingPromo && (
                <div className="fixed inset-0 z-[110] bg-black/98 flex items-center justify-center p-6 backdrop-blur-2xl overflow-y-auto animate-in fade-in">
                    <div className="bg-[#020617] p-12 rounded-[64px] w-full max-w-3xl border border-white/10 shadow-2xl relative">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-12 right-12 p-5 bg-white/5 rounded-3xl hover:bg-red-600 hover:text-white transition-all"><X size={24}/></button>
                        <h3 className="text-3xl font-black mb-10 uppercase italic tracking-tighter">Tanıtım <span className="text-emerald-500">Editörü</span></h3>
                        <form onSubmit={async (e) => { e.preventDefault(); await DatabaseService.savePromotion(editingPromo); setIsModalOpen(false); load(); }} className="space-y-8 text-white">
                            <AdminInput label="REKLAM BAŞLIĞI" value={editingPromo.title} onChange={(v:any)=>setEditingPromo({...editingPromo, title:v})}/>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] ml-6">İÇERİK (HTML SERBEST)</label>
                                <textarea value={editingPromo.content} onChange={(e)=>setEditingPromo({...editingPromo, content:e.target.value})} className="w-full bg-slate-950 border border-white/10 p-10 rounded-[40px] text-xs font-bold h-48 outline-none text-slate-300 focus:border-blue-500/50 uppercase italic leading-relaxed" placeholder="Reklam mesajı buraya gelecek..."/>
                            </div>
                            <AdminInput label="GÖRSEL URL (HTTP)" value={editingPromo.image_url} onChange={(v:any)=>setEditingPromo({...editingPromo, image_url:v})}/>
                            <div className="grid grid-cols-2 gap-8">
                                <AdminInput label="BUTON METNİ" value={editingPromo.button_text} onChange={(v:any)=>setEditingPromo({...editingPromo, button_text:v})}/>
                                <AdminInput label="BUTON LİNKİ" value={editingPromo.button_link} onChange={(v:any)=>setEditingPromo({...editingPromo, button_link:v})}/>
                            </div>
                            <button type="submit" className="w-full bg-emerald-600 py-8 rounded-[32px] font-black text-[11px] uppercase tracking-[0.5em] shadow-2xl shadow-emerald-900/40 hover:bg-emerald-500 transition-all border-b-8 border-emerald-800">TANITIM TASLAĞINI KAYDET</button>
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
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Finansal <span className="text-blue-500">Kayıtlar</span></h2>
            {isLoading ? <div className="flex justify-center py-24"><Loader2 className="animate-spin text-blue-500" size={40}/></div> : (
                <div className="bg-slate-900/40 border border-white/5 rounded-[48px] overflow-hidden shadow-2xl">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-[9px] uppercase tracking-[0.3em] text-slate-600 font-black">
                            <tr><th className="px-10 py-6">Müşteri</th><th className="px-10 py-6">Ürün / Paket</th><th className="px-10 py-6">İşlem Tarihi</th><th className="px-10 py-6 text-right">Tutar</th></tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {sales.map((s, idx) => (
                                <tr key={idx} className="hover:bg-white/5 transition-all">
                                    <td className="px-10 py-6 font-black text-slate-300 italic text-sm">@{s.users?.username || 'Misafir'}</td>
                                    <td className="px-10 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-center"><Bot size={18} className="text-blue-500"/></div>
                                            <p className="font-black italic uppercase text-white text-sm tracking-tight">{s.bots?.name || 'Abonelik'}</p>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6 font-bold text-slate-500 uppercase text-[10px] tracking-widest">{new Date(s.acquired_at).toLocaleString('tr-TR')}</td>
                                    <td className="px-10 py-6 text-right font-black text-emerald-500 italic text-lg">{s.bots?.price || 0} TL</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const AnnouncementCenter = () => {
    const [anns, setAnns] = useState<Announcement[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAnn, setEditingAnn] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const load = useCallback(async () => {
        setIsLoading(true);
        setAnns(await DatabaseService.getAnnouncements());
        setIsLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    return (
        <div className="space-y-12 animate-in fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Duyuru <span className="text-blue-500">Paneli</span></h2>
                <button onClick={() => { setEditingAnn({ id: '', title: '', description: '', button_text: 'İncele', button_link: '', icon_name: 'Megaphone', color_scheme: 'purple', is_active: true, action_type: 'link' }); setIsModalOpen(true); }} className="bg-purple-600 px-10 py-5 rounded-[28px] text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl hover:bg-purple-500 active:scale-95 transition-all">YENİ DUYURU</button>
            </div>
            {isLoading ? <div className="flex justify-center py-24"><Loader2 className="animate-spin text-blue-500" size={40}/></div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {anns.map(a => (
                        <div key={a.id} className="bg-slate-900/40 border border-white/5 rounded-[56px] p-10 flex flex-col gap-8 group overflow-hidden shadow-2xl relative">
                            <div className="flex justify-between items-start">
                                 <div className={`p-5 rounded-3xl bg-blue-600/20 text-blue-500 shadow-2xl border border-blue-500/10`}>{a.icon_name === 'Megaphone' ? <Megaphone size={24}/> : <Sparkles size={24}/>}</div>
                                 <div className="flex gap-3">
                                    <button onClick={() => { setEditingAnn(a); setIsModalOpen(true); }} className="p-4 bg-white/5 rounded-2xl hover:bg-blue-600 text-white transition-all"><Edit3 size={18}/></button>
                                    <button onClick={async () => { if(confirm('Duyuru silinsin mi?')) { await DatabaseService.deleteAnnouncement(a.id); load(); } }} className="p-4 bg-white/5 rounded-2xl text-red-500 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18}/></button>
                                 </div>
                            </div>
                            <div>
                                <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">{a.title}</h4>
                                <p className="text-xs text-slate-500 mt-4 font-bold uppercase italic leading-relaxed opacity-70">{a.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${a.is_active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-700'}`}></div>
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{a.is_active ? 'YAYINDA' : 'PASİF'}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {isModalOpen && editingAnn && (
                <div className="fixed inset-0 z-[110] bg-black/98 flex items-center justify-center p-6 backdrop-blur-2xl overflow-y-auto animate-in fade-in">
                    <div className="bg-[#020617] p-12 rounded-[64px] w-full max-w-2xl border border-white/10 shadow-2xl relative text-white">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-12 right-12 p-5 bg-white/5 rounded-3xl hover:bg-red-600 hover:text-white transition-all"><X size={24}/></button>
                        <h3 className="text-3xl font-black mb-12 uppercase italic tracking-tighter">Duyuru <span className="text-purple-500">Editörü</span></h3>
                        <form onSubmit={async (e) => { e.preventDefault(); await DatabaseService.saveAnnouncement(editingAnn); setIsModalOpen(false); load(); }} className="space-y-8">
                            <AdminInput label="ANA BAŞLIK" value={editingAnn.title} onChange={(v:any)=>setEditingAnn({...editingAnn, title:v})}/>
                            <AdminInput label="KISA AÇIKLAMA" value={editingAnn.description} onChange={(v:any)=>setEditingAnn({...editingAnn, description:v})}/>
                            <AdminInput label="EYLEM LİNKİ" value={editingAnn.button_link} onChange={(v:any)=>setEditingAnn({...editingAnn, button_link:v})}/>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-3"><label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] ml-6">ROZET</label>
                                    <select value={editingAnn.icon_name} onChange={e => setEditingAnn({...editingAnn, icon_name: e.target.value})} className="w-full h-18 bg-slate-950 border border-white/10 rounded-[28px] px-8 text-xs font-black text-white outline-none">
                                        <option value="Megaphone">📣 Megafon</option><option value="Sparkles">✨ Efekt</option><option value="Zap">⚡️ Şimşek</option><option value="Star">⭐️ Yıldız</option>
                                    </select>
                                </div>
                                <div className="space-y-3"><label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] ml-6">YAYIN DURUMU</label>
                                    <button type="button" onClick={()=>setEditingAnn({...editingAnn, is_active:!editingAnn.is_active})} className={`w-full h-18 rounded-[28px] font-black text-[10px] uppercase tracking-widest transition-all ${editingAnn.is_active ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-slate-800 text-slate-500'}`}>{editingAnn.is_active ? 'ŞİMDİ YAYINLA' : 'PASİFE AL'}</button>
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-purple-600 py-8 rounded-[32px] font-black text-[11px] uppercase tracking-[0.5em] shadow-2xl hover:bg-purple-500 border-b-8 border-purple-800">SİSTEM DUYURUSUNU KAYDET</button>
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
            setTitle(''); setMsg(''); alert('Global bildirim başarıyla kuyruğa alındı!');
        } catch(e) { alert('Hata oluştu.'); }
        finally { setIsSending(false); }
    };

    return (
        <div className="animate-in fade-in space-y-12">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Global <span className="text-blue-500">Bildirim</span></h2>
                <p className="text-xs font-black text-slate-600 uppercase tracking-[0.3em]">Tüm platform üyelerine anlık mesaj gönderin</p>
            </div>

            <div className="bg-slate-900/40 border border-white/5 p-12 rounded-[64px] shadow-2xl max-w-3xl space-y-10 text-white">
                <AdminInput label="BİLDİRİM BAŞLIĞI" value={title} onChange={setTitle} />
                <div className="space-y-3"><label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] ml-6">MESAJ GÖVDESİ</label>
                    <textarea value={msg} onChange={e => setMsg(e.target.value)} className="w-full bg-slate-950 border border-white/10 p-10 rounded-[40px] text-xs font-bold h-48 outline-none text-slate-400 focus:border-blue-500/50 uppercase italic leading-relaxed" placeholder="Tüm üyelere iletilecek önemli mesaj..." />
                </div>
                <button onClick={handleSend} disabled={isSending} className="w-full bg-blue-600 h-24 rounded-[36px] font-black text-[12px] uppercase tracking-[0.4em] flex items-center justify-center gap-4 active:scale-[0.98] transition-all disabled:opacity-50 text-white shadow-2xl shadow-blue-600/30 border-b-8 border-blue-800">
                    {isSending ? <Loader2 className="animate-spin" size={24} /> : <><Send size={24}/> SİSTEM GENELİNDE YAYINLA</>}
                </button>
            </div>
        </div>
    );
};

const AdminInput = ({ label, value, onChange, type = "text" }: any) => (
    <div className="space-y-3 text-white">
        <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] ml-6">{label}</label>
        <input type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full h-18 bg-slate-950 border border-white/10 rounded-[28px] px-8 text-xs font-black text-white outline-none focus:border-blue-500/50 transition-all uppercase italic" />
    </div>
);

export default AdminDashboard;

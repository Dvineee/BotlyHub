
import React, { useEffect, useState, useCallback } from 'react';
import * as Router from 'react-router-dom';
import { 
  LayoutDashboard, Users, Bot, LogOut, Menu, X, 
  Loader2, Plus, Trash2, Megaphone, Send, Activity, 
  Wallet, Search, Database, Radio, Bell, Edit3, Image as ImageIcon
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
        className={`flex items-center gap-4 px-6 py-4 rounded-[20px] transition-all duration-300 ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}
      >
        <Icon size={20} />
        <span className="font-bold text-[11px] uppercase tracking-widest">{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[#020617] flex text-slate-200 overflow-hidden font-sans">
      {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[65] lg:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}

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
            <NavItem to="/a/dashboard/promotions" icon={Radio} label="Tanıtımlar" />
            <NavItem to="/a/dashboard/announcements" icon={Megaphone} label="Duyurular" />
            <NavItem to="/a/dashboard/notifications" icon={Bell} label="Bildirim Gönder" />
          </nav>

          <button onClick={() => { DatabaseService.logoutAdmin(); navigate('/a/admin'); }} className="mt-6 flex items-center gap-4 px-6 py-4 text-red-500 font-bold text-[11px] uppercase tracking-widest hover:bg-red-500/10 rounded-[20px] transition-all group">
            <LogOut size={18} /> Çıkış Yap
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#020617]/80 backdrop-blur-xl z-50">
           <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-3 bg-slate-900 border border-white/5 rounded-xl text-slate-400"><Menu size={20}/></button>
           <div className="flex items-center gap-4 ml-auto">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center font-black text-white italic">A</div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-10 no-scrollbar">
          <div className="max-w-6xl mx-auto space-y-10 pb-20">
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
    useEffect(() => { DatabaseService.getAdminStats().then(setStats); }, []);
    return (
        <div className="animate-in fade-in duration-500 space-y-10">
            <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Panel <span className="text-blue-500">Özeti</span></h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[32px]"><Users className="text-blue-500 mb-4"/><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Üyeler</p><h3 className="text-2xl font-black">{stats.userCount}</h3></div>
                <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[32px]"><Bot className="text-purple-500 mb-4"/><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Botlar</p><h3 className="text-2xl font-black">{stats.botCount}</h3></div>
                <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[32px]"><Wallet className="text-emerald-500 mb-4"/><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Satışlar</p><h3 className="text-2xl font-black">{stats.salesCount}</h3></div>
                <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[32px]"><Activity className="text-orange-500 mb-4"/><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Loglar</p><h3 className="text-2xl font-black">{stats.logCount}</h3></div>
            </div>
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
        <div className="space-y-8 animate-in fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Üye <span className="text-blue-500">Yönetimi</span></h2>
                <div className="relative w-64">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                    <input type="text" placeholder="Ara..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-slate-900/40 border border-white/5 rounded-2xl py-3 pl-10 pr-4 text-xs outline-none focus:border-blue-500/30 text-white" />
                </div>
            </div>
            {isLoading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" /></div> : (
                <div className="bg-slate-900/40 border border-white/5 rounded-[40px] overflow-hidden">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-white/5 text-[9px] uppercase tracking-widest text-slate-500 font-black">
                            <tr><th className="px-8 py-5">Üye</th><th className="px-8 py-5">Rol</th><th className="px-8 py-5">Durum</th><th className="px-8 py-5 text-right">Eylem</th></tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filtered.map(u => (
                                <tr key={u.id} className="hover:bg-white/5 transition-all group">
                                    <td className="px-8 py-5 flex items-center gap-4">
                                        <img src={u.avatar || `https://ui-avatars.com/api/?name=${u.name}`} className="w-10 h-10 rounded-xl bg-slate-950 object-cover" />
                                        <div><p className="font-black text-white italic">@{u.username}</p><p className="text-[10px] text-slate-600">{u.name}</p></div>
                                    </td>
                                    <td className="px-8 py-5"><span className="bg-slate-800 px-2 py-1 rounded text-[9px] font-black uppercase">{u.role}</span></td>
                                    <td className="px-8 py-5">
                                        <span className={`flex items-center gap-1.5 text-[9px] font-black uppercase ${u.status === 'Active' ? 'text-emerald-500' : 'text-red-500'}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${u.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>{u.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <button onClick={() => toggleStatus(u)} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${u.status === 'Active' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                            {u.status === 'Active' ? 'Kısıtla' : 'Aktif Et'}
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
        <div className="space-y-8 animate-in fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Market <span className="text-blue-500">Envanteri</span></h2>
                <button onClick={() => { setEditingBot({ id: '', name: '', description: '', price: 0, category: 'utilities', bot_link: '', icon: '', screenshots: [], is_premium: false }); setIsModalOpen(true); }} className="bg-blue-600 px-8 py-5 rounded-[28px] text-[10px] font-black uppercase tracking-widest shadow-2xl">YENİ BOT EKLE</button>
            </div>
            {isLoading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" /></div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bots.map(b => (
                        <div key={b.id} className="bg-slate-900/40 border border-white/5 rounded-[44px] p-8 flex flex-col gap-6 group hover:border-blue-500/30 transition-all relative overflow-hidden">
                            <div className="flex justify-between items-start">
                                <img src={getLiveBotIcon(b)} className="w-16 h-16 rounded-[24px] border border-white/10 shadow-2xl object-cover bg-slate-950" />
                                <div className="flex gap-2">
                                    <button onClick={() => { setEditingBot(b); setIsModalOpen(true); }} className="p-3 bg-white/5 rounded-xl hover:bg-blue-600 transition-all"><Edit3 size={16}/></button>
                                    <button onClick={async () => { if(confirm('Silinsin mi?')) { await DatabaseService.deleteBot(b.id); load(); } }} className="p-3 bg-white/5 rounded-xl text-red-500 hover:bg-red-500 transition-all hover:text-white"><Trash2 size={16}/></button>
                                </div>
                            </div>
                            <div><h4 className="text-xl font-black text-white italic uppercase tracking-tighter">{b.name}</h4><p className="text-xs text-slate-500 mt-2 line-clamp-2">{b.description}</p></div>
                            <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                <div className="text-[10px] font-black uppercase text-blue-500">{b.price > 0 ? `${b.price} TL` : 'ÜCRETSİZ'}</div>
                                <div className="text-[10px] font-black uppercase text-slate-600">{b.ownerCount || 0} Kullanıcı</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {isModalOpen && editingBot && (
                <div className="fixed inset-0 z-[110] bg-black/98 flex items-center justify-center p-6 backdrop-blur-xl overflow-y-auto">
                    <div className="bg-[#020617] p-12 rounded-[56px] w-full max-w-4xl border border-white/10 shadow-2xl relative">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 p-4 bg-white/5 rounded-2xl hover:bg-red-600 transition-all"><X size={20}/></button>
                        <h3 className="text-3xl font-black mb-8 uppercase italic">Bot Yapılandırma</h3>
                        <form onSubmit={async (e) => { e.preventDefault(); await DatabaseService.saveBot(editingBot); setIsModalOpen(false); load(); }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <AdminInput label="BOT ID" value={editingBot.id} onChange={(v:any)=>setEditingBot({...editingBot, id:v})}/>
                                <AdminInput label="İSİM" value={editingBot.name} onChange={(v:any)=>setEditingBot({...editingBot, name:v})}/>
                                <AdminInput label="TELEGRAM LİNK" value={editingBot.bot_link} onChange={(v:any)=>setEditingBot({...editingBot, bot_link:v})}/>
                                <AdminInput label="FİYAT (TL)" type="number" value={editingBot.price} onChange={(v:any)=>setEditingBot({...editingBot, price:v})}/>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-600 uppercase ml-4">KATEGORİ</label>
                                    <select value={editingBot.category} onChange={e => setEditingBot({...editingBot, category: e.target.value})} className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-xs font-black text-white outline-none">
                                        <option value="utilities">Araçlar</option><option value="finance">Finans</option><option value="games">Eğlence</option><option value="productivity">Verimlilik</option><option value="moderation">Moderasyon</option>
                                    </select>
                                </div>
                                <AdminInput label="İKON URL" value={editingBot.icon} onChange={(v:any)=>setEditingBot({...editingBot, icon:v})}/>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-600 uppercase ml-4">AÇIKLAMA</label>
                                    <textarea value={editingBot.description} onChange={e => setEditingBot({...editingBot, description: e.target.value})} className="w-full bg-slate-950 border border-white/5 p-6 rounded-3xl text-xs h-32 outline-none text-slate-300 focus:border-blue-500/50" />
                                </div>
                                <button type="submit" className="w-full bg-blue-600 py-8 rounded-[32px] font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl border-b-4 border-blue-800">KAYDET</button>
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
        <div className="space-y-10 animate-in fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Tanıtım <span className="text-blue-500">Merkezi</span></h2>
                <button onClick={() => { setEditingPromo({ title: '', content: '', status: 'pending', button_text: 'İncele', processed_channels: [] }); setIsModalOpen(true); }} className="bg-blue-600 px-8 py-5 rounded-[28px] text-[10px] font-black uppercase tracking-widest shadow-2xl">YENİ TANITIM</button>
            </div>
            {isLoading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" /></div> : (
                <div className="grid grid-cols-1 gap-6">
                    {promos.map(p => (
                        <div key={p.id} className="bg-slate-900/40 border border-white/5 rounded-[44px] p-8 flex items-center gap-8 group hover:border-blue-500/30 transition-all">
                            <div className="w-24 h-24 rounded-3xl bg-slate-950 border border-white/5 overflow-hidden shadow-2xl">
                                {p.image_url ? <img src={p.image_url} className="w-full h-full object-cover"/> : <ImageIcon className="w-full h-full p-6 text-slate-800"/>}
                            </div>
                            <div className="flex-1">
                                <h4 className="text-xl font-black italic uppercase mb-1">{p.title}</h4>
                                <div className="flex items-center gap-4 mt-3">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{p.channel_count} KANAL</p>
                                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{p.total_reach.toLocaleString()} ERİŞİM</p>
                                    <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${p.status === 'sending' ? 'bg-emerald-500/10 text-emerald-500 animate-pulse' : 'bg-slate-800 text-slate-500'}`}>{p.status}</span>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => handleToggle(p)} className={`px-6 py-4 rounded-2xl text-[9px] font-black uppercase transition-all ${p.status === 'sending' ? 'bg-orange-600/20 text-orange-500 border border-orange-500/20' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20'}`}>{p.status === 'sending' ? 'DURAKLAT' : 'YAYINLA'}</button>
                                <button onClick={() => { setEditingPromo(p); setIsModalOpen(true); }} className="p-4 bg-white/5 rounded-2xl text-slate-400 hover:text-white transition-all"><Edit3 size={18}/></button>
                                <button onClick={async () => { if(confirm('Silinsin mi?')) { await DatabaseService.deletePromotion(p.id); load(); } }} className="p-4 bg-white/5 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all"><Trash2 size={18}/></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {isModalOpen && editingPromo && (
                <div className="fixed inset-0 z-[110] bg-black/98 flex items-center justify-center p-6 backdrop-blur-xl overflow-y-auto">
                    <div className="bg-[#020617] p-12 rounded-[56px] w-full max-w-2xl border border-white/10 shadow-2xl relative">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 p-4 bg-white/5 rounded-2xl hover:bg-red-600 transition-all"><X size={20}/></button>
                        <h3 className="text-3xl font-black mb-8 uppercase italic">Tanıtım Düzenle</h3>
                        <form onSubmit={async (e) => { e.preventDefault(); await DatabaseService.savePromotion(editingPromo); setIsModalOpen(false); load(); }} className="space-y-6">
                            <AdminInput label="BAŞLIK" value={editingPromo.title} onChange={(v:any)=>setEditingPromo({...editingPromo, title:v})}/>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-600 uppercase ml-4">İÇERİK</label>
                                <textarea value={editingPromo.content} onChange={(e)=>setEditingPromo({...editingPromo, content:e.target.value})} className="w-full bg-slate-950 border border-white/5 p-6 rounded-3xl text-xs h-40 outline-none text-slate-300 focus:border-blue-500/50" placeholder="HTML destekli mesaj içeriği..."/>
                            </div>
                            <AdminInput label="RESİM URL" value={editingPromo.image_url} onChange={(v:any)=>setEditingPromo({...editingPromo, image_url:v})}/>
                            <div className="grid grid-cols-2 gap-6">
                                <AdminInput label="BUTON METNİ" value={editingPromo.button_text} onChange={(v:any)=>setEditingPromo({...editingPromo, button_text:v})}/>
                                <AdminInput label="BUTON LİNKİ" value={editingPromo.button_link} onChange={(v:any)=>setEditingPromo({...editingPromo, button_link:v})}/>
                            </div>
                            <button type="submit" className="w-full bg-blue-600 py-8 rounded-[32px] font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl">KAYDET</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const SalesManagement = () => {
    const [sales, setSales] = useState<any[]>([]);
    useEffect(() => { DatabaseService.getAllPurchases().then(setSales); }, []);
    return (
        <div className="space-y-8 animate-in fade-in">
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Satış <span className="text-blue-500">Kayıtları</span></h2>
            <div className="bg-slate-900/40 border border-white/5 rounded-[40px] overflow-hidden">
                <table className="w-full text-left text-xs text-white">
                    <thead className="bg-white/5 text-[9px] uppercase tracking-widest text-slate-500 font-black">
                        <tr><th className="px-8 py-5">Müşteri</th><th className="px-8 py-5">Ürün</th><th className="px-8 py-5">Tarih</th><th className="px-8 py-5 text-right">Tutar</th></tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {sales.map((s, idx) => (
                            <tr key={idx} className="hover:bg-white/5 transition-all">
                                <td className="px-8 py-5 font-black text-slate-300">@{s.users?.username || 'Anonim'}</td>
                                <td className="px-8 py-5 font-black italic uppercase text-white">{s.bots?.name || 'Ürün'}</td>
                                <td className="px-8 py-5 font-bold text-slate-500">{new Date(s.acquired_at).toLocaleString()}</td>
                                <td className="px-8 py-5 text-right font-black text-emerald-500 italic">{s.bots?.price || 0} TL</td>
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
                <button onClick={() => { setEditingAnn({ id: '', title: '', description: '', button_text: 'İncele', button_link: '', icon_name: 'Megaphone', color_scheme: 'purple', is_active: true, action_type: 'link' }); setIsModalOpen(true); }} className="bg-blue-600 px-8 py-5 rounded-[28px] text-[10px] font-black uppercase tracking-widest shadow-2xl">YENİ DUYURU</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {anns.map(a => (
                    <div key={a.id} className="bg-slate-900/40 border border-white/5 rounded-[44px] p-8 flex flex-col gap-6 group overflow-hidden">
                        <div className="flex justify-between items-start">
                             <div className={`p-4 rounded-2xl bg-blue-600/20 text-blue-500 shadow-2xl`}>{a.icon_name}</div>
                             <div className="flex gap-2">
                                <button onClick={() => { setEditingAnn(a); setIsModalOpen(true); }} className="p-3 bg-white/5 rounded-xl hover:bg-blue-600 transition-all text-white"><Edit3 size={16}/></button>
                                <button onClick={async () => { if(confirm('Silinsin mi?')) { await DatabaseService.deleteAnnouncement(a.id); load(); } }} className="p-3 bg-white/5 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16}/></button>
                             </div>
                        </div>
                        <h4 className="text-xl font-black text-white italic uppercase">{a.title}</h4>
                    </div>
                ))}
            </div>
            {isModalOpen && editingAnn && (
                <div className="fixed inset-0 z-[110] bg-black/98 flex items-center justify-center p-6 backdrop-blur-xl">
                    <div className="bg-[#020617] p-12 rounded-[56px] w-full max-w-2xl border border-white/10 shadow-2xl relative">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 p-4 bg-white/5 rounded-2xl hover:bg-red-600 transition-all"><X size={20}/></button>
                        <h3 className="text-2xl font-black mb-8 uppercase italic">Duyuru Editörü</h3>
                        <form onSubmit={async (e) => { e.preventDefault(); await DatabaseService.saveAnnouncement(editingAnn); setIsModalOpen(false); load(); }} className="space-y-6 text-white">
                            <AdminInput label="BAŞLIK" value={editingAnn.title} onChange={(v:any)=>setEditingAnn({...editingAnn, title:v})}/>
                            <AdminInput label="AÇIKLAMA" value={editingAnn.description} onChange={(v:any)=>setEditingAnn({...editingAnn, description:v})}/>
                            <AdminInput label="LİNK" value={editingAnn.button_link} onChange={(v:any)=>setEditingAnn({...editingAnn, button_link:v})}/>
                            <button type="submit" className="w-full bg-blue-600 py-8 rounded-[32px] font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl">KAYDET</button>
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
        <div className="animate-in fade-in space-y-10">
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Global <span className="text-blue-500">Bildirim</span></h2>
            <div className="bg-slate-900/40 border border-white/5 p-12 rounded-[56px] shadow-2xl max-w-2xl space-y-8">
                <AdminInput label="BİLDİRİM BAŞLIĞI" value={title} onChange={setTitle} />
                <div className="space-y-2 text-white"><label className="text-[9px] font-black text-slate-600 ml-4">MESAJ</label>
                    <textarea value={msg} onChange={e => setMsg(e.target.value)} className="w-full bg-slate-950 border border-white/5 p-6 rounded-3xl text-xs h-32 outline-none text-slate-400" />
                </div>
                <button onClick={handleSend} disabled={isSending} className="w-full bg-blue-600 h-20 rounded-[32px] font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 text-white">
                    {isSending ? <Loader2 className="animate-spin" /> : <><Send size={20}/> GLOBAL YAYINLA</>}
                </button>
            </div>
        </div>
    );
};

const AdminInput = ({ label, value, onChange, type = "text" }: any) => (
    <div className="space-y-2 text-white">
        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4">{label}</label>
        <input type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full bg-slate-950 border border-white/5 rounded-2xl p-4 text-xs font-black text-white outline-none focus:border-blue-500/50 transition-all shadow-inner" />
    </div>
);

export default AdminDashboard;

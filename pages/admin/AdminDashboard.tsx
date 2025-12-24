
import React, { useEffect, useState, useCallback } from 'react';
import * as Router from 'react-router-dom';
import { 
  LayoutDashboard, Users, Bot, LogOut, Menu, X, 
  Loader2, RefreshCw, Plus, Trash2, 
  Megaphone, Settings as SettingsIcon, 
  ShieldCheck, Globe, Send, Activity, 
  Wallet, ShieldAlert, Cpu, Ban, CheckCircle, 
  Search, Database, Hash, Wand2, Image as ImageIcon, History,
  Mail, BellRing, Sparkles, Eye, Zap, RefreshCcw, Star, Calendar, MessageSquare, ExternalLink, Layers, PlusCircle, Link2,
  Fingerprint, Info, TrendingUp, BarChart3, Radio,
  Layout, MousePointer2, Target, Bell, CheckCircle2, ChevronRight,
  GripVertical, DollarSign, LifeBuoy, FileText, Instagram, Clock, Smartphone, MoreVertical,
  ChevronLeft, Edit3, Save, AlertTriangle, Image
} from 'lucide-react';
import { DatabaseService, supabase } from '../../services/DatabaseService';
import PriceService from '../../services/PriceService';
import { User, Bot as BotType, Announcement, Notification, Channel, ActivityLog, Ad } from '../../types';

const { useNavigate, Routes, Route, Link, useLocation } = Router as any;

const getLiveBotIcon = (botLink: string) => {
    if (!botLink) return '';
    const username = botLink.replace('@', '').replace('https://t.me/', '').split('/').pop()?.trim();
    if (username) return `https://t.me/i/userpic/320/${username}.jpg`;
    return '';
};

const StatCard = ({ label, value, icon: Icon, color }: any) => {
  const colors: Record<string, string> = {
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    orange: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
  };
  
  return (
    <div className="bg-[#0f172a]/50 backdrop-blur-md border border-white/5 p-6 rounded-3xl shadow-xl relative overflow-hidden group hover:border-blue-500/30 transition-all duration-500">
      <div className="absolute top-0 right-0 w-24 h-24 bg-current opacity-[0.02] -mr-8 -mt-8 rounded-full blur-2xl group-hover:opacity-[0.05] transition-opacity"></div>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border ${colors[color] || colors.blue}`}>
        <Icon size={24} />
      </div>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase mt-1">{value}</h3>
      </div>
    </div>
  );
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
        className={`flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-300 ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30 translate-x-1' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
      >
        <Icon size={18} />
        <span className="font-bold text-[10px] uppercase tracking-[0.2em]">{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[#020617] flex text-slate-200 font-sans overflow-hidden">
      {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[65] lg:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}

      <aside className={`fixed inset-y-0 left-0 z-[70] w-72 bg-[#0f172a] border-r border-white/5 transition-transform duration-500 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-8">
          <div className="flex items-center gap-4 mb-12 px-2">
            <div className="p-2.5 bg-blue-600 rounded-2xl shadow-2xl shadow-blue-600/30 rotate-6"><Database size={22} className="text-white"/></div>
            <div>
                <h2 className="text-xl font-black text-white italic tracking-tighter uppercase leading-none">BotlyHub</h2>
                <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.3em]">Administrator</span>
            </div>
          </div>
          
          <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
            <NavItem to="/a/dashboard" icon={LayoutDashboard} label="Kontrol Paneli" />
            <div className="pt-6 pb-2 px-5"><span className="text-[9px] font-black text-slate-700 uppercase tracking-[0.4em]">Yönetim</span></div>
            <NavItem to="/a/dashboard/ads" icon={Radio} label="Reklam Yayını" />
            <NavItem to="/a/dashboard/sales" icon={Wallet} label="Kütüphane" />
            <NavItem to="/a/dashboard/users" icon={Users} label="Üye Listesi" />
            <NavItem to="/a/dashboard/bots" icon={Bot} label="Bot Pazarı" />
            <div className="pt-6 pb-2 px-5"><span className="text-[9px] font-black text-slate-700 uppercase tracking-[0.4em]">Sistem</span></div>
            <NavItem to="/a/dashboard/announcements" icon={Megaphone} label="Duyurular" />
            <NavItem to="/a/dashboard/settings" icon={SettingsIcon} label="Yapılandırma" />
          </nav>

          <button onClick={() => { DatabaseService.logoutAdmin(); navigate('/a/admin'); }} className="mt-8 flex items-center gap-3 px-6 py-4 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-500/10 rounded-2xl transition-all border border-transparent hover:border-red-500/20 group">
            <LogOut size={18} /> Güvenli Çıkış
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 bg-[#0f172a]/40 backdrop-blur-xl shrink-0 z-50">
           <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-3 bg-slate-900 border border-white/5 rounded-2xl text-slate-400 active:scale-90 transition-all"><Menu size={22}/></button>
           <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Altyapı Stabil</span>
              </div>
           </div>
           <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-[11px] font-black text-white uppercase italic tracking-tighter">Root Admin</p>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Full Access</p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-black text-white shadow-2xl border border-white/10 italic text-lg rotate-3">A</div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-12 no-scrollbar bg-[#020617] relative">
          <div className="max-w-7xl mx-auto pb-24">
            <Routes>
              <Route path="/" element={<HomeView />} />
              <Route path="/ads" element={<AdsManagement />} />
              <Route path="/sales" element={<SalesManagement />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/bots" element={<BotManagement />} />
              <Route path="/announcements" element={<AnnouncementCenter />} />
              <Route path="/settings" element={<SettingsManagement />} />
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

    useEffect(() => { load(); }, []);
    const load = async () => {
        setIsLoading(true);
        try {
            const statData = await DatabaseService.getAdminStats();
            setStats(statData);
        } catch (e) { console.error(e); } finally { setIsLoading(false); }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Sistem <span className="text-blue-500">Analitiği</span></h1>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.3em]">Gerçek zamanlı sunucu ve platform verileri</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard label="Platform Üyesi" value={stats.userCount} icon={Users} color="blue" />
                <StatCard label="Market Botu" value={stats.botCount} icon={Bot} color="purple" />
                <StatCard label="Kütüphane Kaydı" value={stats.salesCount} icon={Wallet} color="emerald" />
                <StatCard label="Log Hareketleri" value={stats.logCount} icon={Activity} color="orange" />
            </div>
        </div>
    );
};

const AdsManagement = () => {
    const [ads, setAds] = useState<Ad[]>([]);
    useEffect(() => { loadAds(); }, []);
    const loadAds = async () => { setAds(await DatabaseService.getAds()); };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10 pb-20">
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Reklam <span className="text-blue-500">Merkezi</span></h2>
            <div className="bg-[#0f172a]/40 border border-white/5 rounded-[48px] overflow-hidden shadow-2xl">
                <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/50 border-b border-white/5 text-slate-500 font-black uppercase tracking-[0.1em]">
                        <tr><th className="px-10 py-8">İçerik</th><th className="px-10 py-8">Durum</th><th className="px-10 py-8 text-right">Eylem</th></tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {ads.map(ad => (
                            <tr key={ad.id} className="hover:bg-white/[0.02]">
                                <td className="px-10 py-8 font-black text-white uppercase italic">{ad.title}</td>
                                <td className="px-10 py-8"><span className="px-3 py-1 bg-blue-600/10 text-blue-500 rounded-lg font-bold text-[9px] uppercase">{ad.status}</span></td>
                                <td className="px-10 py-8 text-right">
                                    <button onClick={async () => { if(confirm("Sil?")) { await DatabaseService.deleteAd(ad.id); loadAds(); } }} className="p-3 bg-red-600/10 text-red-500 rounded-xl"><Trash2 size={18}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const SalesManagement = () => {
    const [sales, setSales] = useState<any[]>([]);
    useEffect(() => { DatabaseService.getAllPurchases().then(setSales); }, []);
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Kütüphane <span className="text-blue-500">Hareketleri</span></h2>
            <div className="bg-[#0f172a]/40 border border-white/5 rounded-[48px] overflow-hidden shadow-2xl">
                <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/50 border-b border-white/5 text-slate-500 font-black uppercase tracking-[0.1em]">
                        <tr><th className="px-10 py-8">Kullanıcı</th><th className="px-10 py-8">Bot</th><th className="px-10 py-8 text-right">Tarih</th></tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {sales.map((s, idx) => (
                            <tr key={idx} className="hover:bg-white/[0.02]">
                                <td className="px-10 py-8 font-black text-white italic">@{s.users?.username}</td>
                                <td className="px-10 py-8 font-black text-blue-400 italic">{s.bots?.name}</td>
                                <td className="px-10 py-8 text-right font-bold text-slate-500">{new Date(s.acquired_at).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const UserManagement = () => {
    const [users, setUsers] = useState<User[]>([]);
    useEffect(() => { DatabaseService.getUsers().then(setUsers); }, []);
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Üye <span className="text-blue-500">Denetimi</span></h2>
            <div className="bg-[#0f172a]/40 border border-white/5 rounded-[48px] overflow-hidden shadow-2xl">
                <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/50 border-b border-white/5 text-slate-500 font-black uppercase tracking-[0.1em]">
                        <tr><th className="px-10 py-8">Profil</th><th className="px-10 py-8">Statü</th><th className="px-10 py-8 text-right">Eylem</th></tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-white/[0.02]">
                                <td className="px-10 py-8 font-black text-white italic">@{u.username}</td>
                                <td className="px-10 py-8"><span className={`px-3 py-1 rounded-lg text-[9px] font-bold ${u.status === 'Active' ? 'bg-emerald-600/10 text-emerald-500' : 'bg-red-600/10 text-red-500'}`}>{u.status}</span></td>
                                <td className="px-10 py-8 text-right"><button className="p-3 bg-slate-800 rounded-xl hover:bg-red-600/10"><Ban size={18}/></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const BotManagement = () => {
    const [bots, setBots] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBot, setEditingBot] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [tonPrice, setTonPrice] = useState(250); // Varsayılan

    useEffect(() => { 
        load(); 
        PriceService.getTonPrice().then(p => setTonPrice(p.tonTry));
    }, []);

    const load = async () => { setBots(await DatabaseService.getBotsWithStats()); };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await DatabaseService.saveBot(editingBot);
            setIsModalOpen(false);
            load();
            alert("Bot başarıyla protokol altına alındı.");
        } catch (err: any) { alert("Sistem Hatası!"); } finally { setIsLoading(false); }
    };

    const currentConversions = editingBot ? PriceService.convert(editingBot.price, tonPrice) : { stars: 0, ton: 0 };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Market <span className="text-blue-500">Envanteri</span></h2>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.3em]">Market botlarını yönetin</p>
                </div>
                <button onClick={() => { setEditingBot({ id: '', name: '', description: '', short_desc: '', price: 0, category: 'productivity', bot_link: '', is_premium: false, screenshots: [] }); setIsModalOpen(true); }} className="px-10 py-5 bg-blue-600 hover:bg-blue-500 rounded-[28px] text-[10px] font-black text-white uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all">
                    <Plus size={20} className="inline mr-2"/> YENİ BOT TANIMLA
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {bots.map(b => (
                    <div key={b.id} className="bg-[#0f172a]/40 border border-white/5 p-10 rounded-[56px] hover:border-blue-500/30 transition-all shadow-2xl relative overflow-hidden group">
                        <div className="flex items-center gap-8 mb-10 relative z-10">
                            <img 
                                src={getLiveBotIcon(b.bot_link) || `https://ui-avatars.com/api/?name=${encodeURIComponent(b.name)}&background=334155&color=fff&bold=true`} 
                                className="w-20 h-20 rounded-[28px] object-cover bg-slate-950 border-2 border-white/10 shadow-2xl" 
                                onError={(e) => { (e.target as any).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(b.name)}&background=334155&color=fff&bold=true`; }}
                            />
                            <div className="min-w-0 flex-1">
                                <h4 className="font-black text-white text-lg truncate italic uppercase tracking-tighter mb-1">{b.name}</h4>
                                <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">{b.price} TL</p>
                            </div>
                        </div>
                        <div className="flex gap-4 relative z-10">
                            <button onClick={() => { 
                                setEditingBot({
                                    ...b, 
                                    screenshots: Array.isArray(b.screenshots) ? b.screenshots.join(', ') : b.screenshots
                                }); 
                                setIsModalOpen(true); 
                            }} className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white font-black text-[10px] rounded-2xl uppercase tracking-widest transition-all border border-white/5">DÜZENLE</button>
                            <button onClick={async () => { if(confirm("Sil?")) { await DatabaseService.deleteBot(b.id); load(); } }} className="p-4 bg-slate-800 hover:bg-red-600 text-slate-500 hover:text-white rounded-2xl transition-all border border-white/5"><Trash2 size={18}/></button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && editingBot && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/98 backdrop-blur-3xl animate-in fade-in overflow-y-auto no-scrollbar">
                    <div className="bg-[#020617] w-full max-w-5xl my-auto rounded-[72px] border border-white/10 p-12 shadow-2xl relative">
                        <div className="flex justify-between items-center mb-10 px-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-600/10 rounded-2xl text-blue-500"><Wand2 size={24}/></div>
                                <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Bot <span className="text-blue-500">Protokolü</span></h3>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-4 bg-slate-900 border border-white/5 rounded-2xl text-slate-500 hover:text-white transition-all shadow-xl"><X size={28}/></button>
                        </div>
                        
                        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-16 p-4">
                            {/* Sol Bölüm: Kimlik ve Görsel */}
                            <div className="space-y-10">
                                <div className="flex flex-col items-center gap-6 p-10 bg-slate-900/40 border border-white/5 rounded-[48px] shadow-inner text-center">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-blue-600/20 blur-[30px] rounded-full"></div>
                                        <img 
                                            src={getLiveBotIcon(editingBot.bot_link) || `https://ui-avatars.com/api/?name=B&background=334155&color=fff`} 
                                            className="w-36 h-36 rounded-[44px] border-4 border-slate-800 shadow-2xl object-cover relative z-10 bg-slate-900" 
                                            onError={(e) => { (e.target as any).src = `https://ui-avatars.com/api/?name=B&background=334155&color=fff`; }}
                                        />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black text-white uppercase tracking-[0.3em] italic">TELEGRAM AVATAR ÖNİZLEMESİ</p>
                                        <p className="text-[9px] text-slate-600 font-bold uppercase mt-1">Username değiştikçe anlık güncellenir</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">Telegram @Username</label>
                                        <div className="relative">
                                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500 font-black text-xs">@</div>
                                            <input required type="text" value={editingBot.bot_link?.replace('@','')} onChange={e => setEditingBot({...editingBot, bot_link: '@' + e.target.value.trim()})} className="w-full bg-slate-900/40 border border-white/5 rounded-[28px] p-7 pl-12 text-xs font-bold text-white outline-none focus:border-blue-500/40 shadow-inner" placeholder="bot_id_buraya" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">Veritabanı Kimliği</label>
                                            <input required type="text" value={editingBot.id} onChange={e => setEditingBot({...editingBot, id: e.target.value.toLowerCase().trim()})} className="w-full bg-slate-900/40 border border-white/5 rounded-[28px] p-7 text-xs font-bold text-white outline-none focus:border-blue-500/40 shadow-inner" placeholder="örn: premium_gpt" />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">Pazar İsmi</label>
                                            <input required type="text" value={editingBot.name} onChange={e => setEditingBot({...editingBot, name: e.target.value})} className="w-full bg-slate-900/40 border border-white/5 rounded-[28px] p-7 text-xs font-bold text-white outline-none focus:border-blue-500/40 shadow-inner" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sağ Bölüm: Fiyat ve Detay */}
                            <div className="space-y-10">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 italic">Açıklama & Fonksiyonlar</label>
                                    <textarea required value={editingBot.description} onChange={e => setEditingBot({...editingBot, description: e.target.value})} className="w-full h-32 bg-slate-900/40 border border-white/5 rounded-[32px] p-8 text-xs font-medium text-slate-300 outline-none focus:border-blue-500/40 shadow-inner resize-none leading-relaxed" placeholder="Botun temel özelliklerini girin..." />
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between px-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Fiyatlandırma (₺ TL)</label>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                                            <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest italic">Canlı Borsa: 1 TON = {tonPrice} TL</span>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500"><DollarSign size={20}/></div>
                                        <input type="number" value={editingBot.price} onChange={e => setEditingBot({...editingBot, price: Number(e.target.value)})} className="w-full bg-slate-900/40 border border-white/5 rounded-[28px] p-7 pl-16 text-sm font-black text-white outline-none focus:border-blue-500/40 shadow-inner" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="p-6 bg-slate-950/60 border border-white/5 rounded-[28px] flex flex-col items-center">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Star size={14} className="text-blue-500" fill="currentColor"/>
                                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Stars</span>
                                            </div>
                                            <p className="text-xl font-black text-blue-500 italic tracking-tighter">{currentConversions.stars}</p>
                                        </div>
                                        <div className="p-6 bg-slate-950/60 border border-white/5 rounded-[28px] flex flex-col items-center">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Wallet size={14} className="text-indigo-500" />
                                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">TON</span>
                                            </div>
                                            <p className="text-xl font-black text-indigo-500 italic tracking-tighter">{currentConversions.ton}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2 italic flex items-center gap-2"><Image size={14}/> Ekran Görüntüleri (URL, URL...)</label>
                                        <input type="text" value={editingBot.screenshots} onChange={e => setEditingBot({...editingBot, screenshots: e.target.value})} className="w-full bg-slate-900/40 border border-white/5 rounded-[28px] p-7 text-[10px] font-bold text-slate-500 outline-none focus:border-blue-500/40 shadow-inner" placeholder="https://resim1.jpg, https://resim2.jpg" />
                                    </div>
                                </div>

                                <button type="submit" disabled={isLoading} className="w-full py-8 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-[40px] text-[12px] uppercase tracking-[0.5em] shadow-2xl shadow-blue-600/30 active:scale-95 transition-all flex items-center justify-center gap-4">
                                    {isLoading ? <Loader2 className="animate-spin" size={24}/> : <><Save size={20}/> KAYIT PROTOKOLÜNÜ ONAYLA</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const AnnouncementCenter = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    useEffect(() => { DatabaseService.getAnnouncements().then(setAnnouncements); }, []);
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Duyuru <span className="text-blue-500">Kontrolü</span></h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {announcements.map(ann => (
                    <div key={ann.id} className="bg-[#0f172a]/40 border border-white/5 p-10 rounded-[56px] flex items-center justify-between group hover:border-blue-500/30 transition-all shadow-2xl">
                        <div className="flex items-center gap-8">
                            <div className="w-16 h-16 bg-slate-950 rounded-[32px] flex items-center justify-center text-blue-500 border border-white/5 shadow-inner"><Megaphone size={28}/></div>
                            <div>
                                <h4 className="font-black text-white uppercase italic tracking-tight text-xl">{ann.title}</h4>
                                <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${ann.is_active ? 'text-emerald-500' : 'text-slate-600'}`}>{ann.is_active ? 'YAYINDA' : 'PASİF'}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const SettingsManagement = () => {
    const [settings, setSettings] = useState<any>({ appName: 'BotlyHub V3', maintenanceMode: false, commissionRate: 20 });
    useEffect(() => { DatabaseService.getSettings().then(s => s && setSettings(s)); }, []);
    
    const handleSave = async () => {
        try {
            await DatabaseService.saveSettings(settings);
            alert("Ayarlar güncellendi.");
        } catch (e) { alert("Hata!"); }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-16">
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Global <span className="text-blue-500">Yapılandırma</span></h2>
            <div className="bg-[#0f172a]/40 border border-white/5 p-14 rounded-[64px] space-y-12 shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-3 italic">Uygulama İsmi</label>
                        <input type="text" value={settings.appName} onChange={e => setSettings({...settings, appName: e.target.value})} className="w-full bg-slate-950 border border-white/5 rounded-[28px] p-7 text-sm font-black text-white outline-none focus:border-blue-500 shadow-inner" />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-3 italic">Bakım Modu</label>
                        <button onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})} className={`w-full py-7 rounded-[28px] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all border border-white/5 shadow-2xl ${settings.maintenanceMode ? 'bg-red-600 text-white' : 'bg-slate-900 text-slate-400'}`}>
                            {settings.maintenanceMode ? <ShieldAlert size={20}/> : <Globe size={20}/>}
                            {settings.maintenanceMode ? 'BAKIMDA' : 'AKTİF'}
                        </button>
                    </div>
                </div>
                <button onClick={handleSave} className="w-full py-8 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-[40px] text-[11px] uppercase tracking-[0.5em] shadow-2xl active:scale-95 transition-all">AYARLARI KİLİTLE</button>
            </div>
        </div>
    );
};

export default AdminDashboard;

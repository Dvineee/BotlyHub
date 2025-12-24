
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

/**
 * Telegram profil resmini kullanıcı adına göre çeken yardımcı fonksiyon
 */
const getLiveBotIcon = (botLink: string) => {
    if (!botLink) return '';
    const username = botLink.replace('@', '').replace('https://t.me/', '').split('/').pop()?.trim();
    if (username) return `https://t.me/i/userpic/320/${username}.jpg`;
    return '';
};

const StatCard = ({ label, value, icon: Icon, color }: any) => {
  const colors: Record<string, string> = {
    blue: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    purple: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    emerald: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    orange: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  };
  
  return (
    <div className="bg-[#0f172a]/40 backdrop-blur-xl border border-white/5 p-8 rounded-[40px] shadow-2xl relative overflow-hidden group hover:border-blue-500/30 transition-all duration-500">
      <div className="absolute top-0 right-0 w-32 h-32 bg-current opacity-[0.03] -mr-12 -mt-12 rounded-full blur-3xl group-hover:opacity-[0.07] transition-opacity"></div>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border-2 ${colors[color] || colors.blue}`}>
        <Icon size={28} />
      </div>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">{label}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">{value}</h3>
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
        className={`flex items-center gap-4 px-6 py-4.5 rounded-[24px] transition-all duration-300 ${active ? 'bg-blue-600 text-white shadow-2xl shadow-blue-600/40 translate-x-2' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}
      >
        <Icon size={20} />
        <span className="font-black text-[10px] uppercase tracking-[0.25em]">{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[#020617] flex text-slate-200 font-sans overflow-hidden">
      {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[65] lg:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}

      <aside className={`fixed inset-y-0 left-0 z-[70] w-80 bg-[#0f172a] border-r border-white/5 transition-transform duration-500 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-8">
          <div className="flex items-center gap-5 mb-16 px-2">
            <div className="p-3 bg-blue-600 rounded-[20px] shadow-2xl shadow-blue-600/40 rotate-12 transition-transform hover:rotate-0"><Database size={24} className="text-white"/></div>
            <div>
                <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">BotlyHub</h2>
                <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.4em] mt-1 block">ADMIN V3</span>
            </div>
          </div>
          
          <nav className="flex-1 space-y-3 overflow-y-auto no-scrollbar">
            <NavItem to="/a/dashboard" icon={LayoutDashboard} label="Kontrol Merkezi" />
            <div className="pt-8 pb-3 px-6"><span className="text-[9px] font-black text-slate-700 uppercase tracking-[0.5em]">Operasyon</span></div>
            <NavItem to="/a/dashboard/ads" icon={Radio} label="Reklam Yayını" />
            <NavItem to="/a/dashboard/sales" icon={Wallet} label="Kütüphane" />
            <NavItem to="/a/dashboard/users" icon={Users} label="Üye Yönetimi" />
            <NavItem to="/a/dashboard/bots" icon={Bot} label="Bot Pazarı" />
            <div className="pt-8 pb-3 px-6"><span className="text-[9px] font-black text-slate-700 uppercase tracking-[0.5em]">Sistem</span></div>
            <NavItem to="/a/dashboard/announcements" icon={Megaphone} label="Duyuru Paneli" />
            <NavItem to="/a/dashboard/settings" icon={SettingsIcon} label="Yapılandırma" />
          </nav>

          <button onClick={() => { DatabaseService.logoutAdmin(); navigate('/a/admin'); }} className="mt-8 flex items-center gap-4 px-7 py-5 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-500/10 rounded-[24px] transition-all border border-transparent hover:border-red-500/20 group">
            <LogOut size={20} /> Protokolü Kapat
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-24 border-b border-white/5 flex items-center justify-between px-12 bg-[#0f172a]/30 backdrop-blur-2xl shrink-0 z-50">
           <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-4 bg-slate-900 border border-white/5 rounded-2xl text-slate-400 active:scale-90 transition-all"><Menu size={24}/></button>
           <div className="hidden md:flex items-center gap-8">
              <div className="flex items-center gap-4 px-5 py-2.5 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.9)]"></div>
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Sunucu Aktif</span>
              </div>
           </div>
           <div className="flex items-center gap-5">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-white uppercase italic tracking-tighter">Root Administrator</p>
                <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Sistem Yetkisi: Full</p>
              </div>
              <div className="w-12 h-12 rounded-[18px] bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center font-black text-white shadow-2xl border border-white/10 italic text-xl rotate-6 transition-transform hover:rotate-0">A</div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 lg:p-16 no-scrollbar bg-[#020617] relative">
          <div className="max-w-7xl mx-auto pb-32">
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
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-16">
            <div className="flex flex-col gap-3">
                <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Sistem <span className="text-blue-600">Analitiği</span></h1>
                <p className="text-[12px] font-bold text-slate-600 uppercase tracking-[0.4em]">Canlı Platform ve Veri Akışı</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                <StatCard label="Aktif Kullanıcı" value={stats.userCount} icon={Users} color="blue" />
                <StatCard label="Yayındaki Bot" value={stats.botCount} icon={Bot} color="purple" />
                <StatCard label="Toplam Satış" value={stats.salesCount} icon={Wallet} color="emerald" />
                <StatCard label="İşlem Kaydı" value={stats.logCount} icon={Activity} color="orange" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-16">
                <div className="lg:col-span-2 bg-[#0f172a]/40 border border-white/5 p-10 rounded-[56px] shadow-2xl">
                    <h3 className="text-xl font-black text-white italic tracking-tighter uppercase mb-8">Son Platform Aktiviteleri</h3>
                    <div className="space-y-6">
                        {[1,2,3,4].map(i => (
                            <div key={i} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
                                <div className="flex items-center gap-5">
                                    <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500"><Zap size={18}/></div>
                                    <div>
                                        <p className="text-xs font-bold text-white uppercase tracking-tight italic">Yeni Bot Satın Alımı</p>
                                        <p className="text-[9px] text-slate-500 uppercase font-black">@user_name • 10 dakika önce</p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-black text-emerald-500 uppercase">+14.50 TON</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-gradient-to-br from-blue-600 to-indigo-900 p-12 rounded-[56px] shadow-2xl flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    <div>
                        <ShieldCheck size={48} className="text-white mb-6" />
                        <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-4 leading-tight">Güvenlik Protokolü Aktif</h3>
                        <p className="text-white/60 text-[11px] font-bold uppercase tracking-widest leading-relaxed">Tüm blokzinciri ve veritabanı işlemleri 256-bit şifreleme ile korunmaktadır.</p>
                    </div>
                    <button className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest transition-all">Detaylı Rapor</button>
                </div>
            </div>
        </div>
    );
};

const AdsManagement = () => {
    const [ads, setAds] = useState<Ad[]>([]);
    useEffect(() => { loadAds(); }, []);
    const loadAds = async () => { setAds(await DatabaseService.getAds()); };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-12 pb-24">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Reklam <span className="text-blue-600">Yönetimi</span></h2>
                <button className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest transition-all active:scale-95 shadow-2xl shadow-blue-600/20">Yeni Reklam Tanımla</button>
            </div>
            <div className="bg-[#0f172a]/40 border border-white/5 rounded-[56px] overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                    <thead className="bg-slate-950/60 border-b border-white/5 text-slate-500 font-black uppercase tracking-[0.2em]">
                        <tr><th className="px-12 py-10 text-[9px]">Başlık & İçerik</th><th className="px-12 py-10 text-[9px]">Erişim</th><th className="px-12 py-10 text-[9px]">Durum</th><th className="px-12 py-10 text-[9px] text-right">Aksiyon</th></tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {ads.length > 0 ? ads.map(ad => (
                            <tr key={ad.id} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="px-12 py-10">
                                    <p className="font-black text-white uppercase italic tracking-tight">{ad.title}</p>
                                    <p className="text-[10px] text-slate-600 mt-1 truncate max-w-xs">{ad.content}</p>
                                </td>
                                <td className="px-12 py-10">
                                    <div className="flex items-center gap-3">
                                        <Users size={14} className="text-slate-700" />
                                        <span className="text-xs font-black text-white italic">{ad.total_reach}</span>
                                    </div>
                                </td>
                                <td className="px-12 py-10"><span className={`px-4 py-1.5 rounded-full font-black text-[9px] uppercase tracking-widest ${ad.status === 'sent' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>{ad.status}</span></td>
                                <td className="px-12 py-10 text-right">
                                    <button onClick={async () => { if(confirm("Kaydı kalıcı olarak silmek istediğinizden emin misiniz?")) { await DatabaseService.deleteAd(ad.id); loadAds(); } }} className="p-4 bg-red-600/10 text-red-500 rounded-2xl hover:bg-red-600 hover:text-white transition-all"><Trash2 size={20}/></button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={4} className="py-24 text-center text-[11px] font-black text-slate-700 uppercase tracking-widest italic">Henüz reklam kaydı bulunmuyor.</td></tr>
                        )}
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
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-12">
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Kütüphane <span className="text-blue-600">Verileri</span></h2>
            <div className="bg-[#0f172a]/40 border border-white/5 rounded-[56px] overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                    <thead className="bg-slate-950/60 border-b border-white/5 text-slate-500 font-black uppercase tracking-[0.2em]">
                        <tr><th className="px-12 py-10 text-[9px]">Üye Bilgisi</th><th className="px-12 py-10 text-[9px]">Ürün</th><th className="px-12 py-10 text-[9px]">İşlem Tipi</th><th className="px-12 py-10 text-[9px] text-right">Tarih</th></tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {sales.map((s, idx) => (
                            <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                                <td className="px-12 py-10 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 overflow-hidden">
                                        <img src={s.users?.avatar} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <p className="font-black text-white italic">@{s.users?.username}</p>
                                        <p className="text-[9px] text-slate-600 uppercase font-bold">ID: {s.user_id}</p>
                                    </div>
                                </td>
                                <td className="px-12 py-10 font-black text-blue-400 italic tracking-tight">{s.bots?.name}</td>
                                <td className="px-12 py-10"><span className="px-3 py-1 bg-white/5 text-slate-400 rounded-lg text-[9px] font-black uppercase tracking-widest">Sahiplik Kaydı</span></td>
                                <td className="px-12 py-10 text-right font-black text-slate-600 text-[11px] italic">{new Date(s.acquired_at).toLocaleString()}</td>
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
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-12">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Üye <span className="text-blue-600">Veritabanı</span></h2>
                <div className="relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                    <input type="text" placeholder="KULLANICI ARA..." className="bg-slate-900/60 border border-white/5 rounded-2xl py-4 pl-14 pr-10 text-[10px] font-black uppercase text-white outline-none focus:border-blue-500/40 w-80 shadow-inner" />
                </div>
            </div>
            <div className="bg-[#0f172a]/40 border border-white/5 rounded-[56px] overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                    <thead className="bg-slate-950/60 border-b border-white/5 text-slate-500 font-black uppercase tracking-[0.2em]">
                        <tr><th className="px-12 py-10 text-[9px]">Üye</th><th className="px-12 py-10 text-[9px]">E-Posta</th><th className="px-12 py-10 text-[9px]">Statü</th><th className="px-12 py-10 text-[9px] text-right">Aksiyon</th></tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="px-12 py-10">
                                    <p className="font-black text-white italic uppercase tracking-tight">@{u.username}</p>
                                    <p className="text-[9px] text-slate-600 uppercase font-black">{u.name}</p>
                                </td>
                                <td className="px-12 py-10 font-bold text-slate-500 italic text-[11px]">{u.email || 'TANIMSIZ'}</td>
                                <td className="px-12 py-10"><span className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest ${u.status === 'Active' ? 'bg-emerald-600/10 text-emerald-500' : 'bg-red-600/10 text-red-500'}`}>{u.status.toUpperCase()}</span></td>
                                <td className="px-12 py-10 text-right">
                                    <div className="flex justify-end gap-3">
                                        <button className="p-4 bg-slate-900 text-slate-500 rounded-2xl hover:text-red-500 hover:bg-red-500/10 transition-all"><Ban size={18}/></button>
                                        <button className="p-4 bg-slate-900 text-slate-500 rounded-2xl hover:text-blue-400 hover:bg-blue-400/10 transition-all"><ChevronRight size={18}/></button>
                                    </div>
                                </td>
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
    const [tonPrice, setTonPrice] = useState(250); 

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
            alert("Bot veritabanına güvenli bir şekilde kaydedildi.");
        } catch (err: any) { alert("Sistem Kayıt Hatası!"); } finally { setIsLoading(false); }
    };

    const addScreenshotBox = () => {
        const current = Array.isArray(editingBot.screenshots) ? editingBot.screenshots : [];
        setEditingBot({ ...editingBot, screenshots: [...current, ''] });
    };

    const updateScreenshot = (index: number, val: string) => {
        const current = [...editingBot.screenshots];
        current[index] = val;
        setEditingBot({ ...editingBot, screenshots: current });
    };

    const removeScreenshot = (index: number) => {
        const current = [...editingBot.screenshots];
        current.splice(index, 1);
        setEditingBot({ ...editingBot, screenshots: current });
    };

    // Stars/Premium sistemden kaldırıldı, sadece TON hesaplanıyor
    const currentConversions = editingBot ? PriceService.convert(editingBot.price, tonPrice) : { ton: 0 };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8">
                <div className="flex flex-col gap-3">
                    <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Bot <span className="text-blue-600">Pazarı</span></h2>
                    <p className="text-[12px] font-bold text-slate-600 uppercase tracking-[0.4em]">Market Ürünleri ve Fiyatlandırma</p>
                </div>
                <button onClick={() => { setEditingBot({ id: '', name: '', description: '', short_desc: '', price: 0, category: 'productivity', bot_link: '', screenshots: [] }); setIsModalOpen(true); }} className="px-12 py-6 bg-blue-600 hover:bg-blue-500 rounded-[32px] text-[10px] font-black text-white uppercase tracking-[0.3em] shadow-2xl shadow-blue-600/20 active:scale-95 transition-all">
                    <Plus size={24} className="inline mr-2"/> YENİ ÜRÜN TANIMLA
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {bots.map(b => (
                    <div key={b.id} className="bg-[#0f172a]/40 border border-white/5 p-12 rounded-[64px] hover:border-blue-600/30 transition-all shadow-2xl relative overflow-hidden group">
                        <div className="flex items-center gap-8 mb-12 relative z-10">
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-600/10 blur-xl rounded-full"></div>
                                <img 
                                    src={getLiveBotIcon(b.bot_link) || `https://ui-avatars.com/api/?name=${encodeURIComponent(b.name)}&background=334155&color=fff&bold=true`} 
                                    className="w-24 h-24 rounded-[32px] object-cover bg-slate-950 border-2 border-white/10 shadow-2xl relative z-10" 
                                    onError={(e) => { (e.target as any).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(b.name)}&background=334155&color=fff&bold=true`; }}
                                />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h4 className="font-black text-white text-xl truncate italic uppercase tracking-tighter mb-2">{b.name}</h4>
                                <div className="flex items-center gap-2">
                                    <Zap size={14} className="text-blue-500" />
                                    <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">{b.price} TL</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-4 relative z-10">
                            <button onClick={() => { 
                                setEditingBot({
                                    ...b, 
                                    screenshots: Array.isArray(b.screenshots) ? b.screenshots : []
                                }); 
                                setIsModalOpen(true); 
                            }} className="flex-1 py-5 bg-slate-900 hover:bg-blue-600 text-white font-black text-[10px] rounded-2xl uppercase tracking-[0.2em] transition-all border border-white/5 active:scale-95">DÜZENLE</button>
                            <button onClick={async () => { if(confirm("Ürünü kalıcı olarak silmek istediğinizden emin misiniz?")) { await DatabaseService.deleteBot(b.id); load(); } }} className="p-5 bg-slate-900 hover:bg-red-600 text-slate-700 hover:text-white rounded-2xl transition-all border border-white/5"><Trash2 size={20}/></button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && editingBot && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/98 backdrop-blur-3xl animate-in fade-in overflow-y-auto no-scrollbar">
                    <div className="bg-[#020617] w-full max-w-6xl my-auto rounded-[80px] border border-white/10 p-16 shadow-2xl relative">
                        <div className="flex justify-between items-center mb-16 px-6">
                            <div className="flex items-center gap-5">
                                <div className="p-4 bg-blue-600/10 rounded-[24px] text-blue-500"><Wand2 size={28}/></div>
                                <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter">Bot <span className="text-blue-600">Yapılandırması</span></h3>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-5 bg-slate-900 border border-white/5 rounded-[24px] text-slate-600 hover:text-white transition-all shadow-xl active:scale-90"><X size={32}/></button>
                        </div>
                        
                        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-20 p-6">
                            <div className="space-y-12">
                                <div className="flex flex-col items-center gap-8 p-12 bg-slate-900/30 border border-white/5 rounded-[56px] shadow-inner text-center">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-blue-600/30 blur-[40px] rounded-full"></div>
                                        <img 
                                            src={getLiveBotIcon(editingBot.bot_link) || `https://ui-avatars.com/api/?name=B&background=334155&color=fff`} 
                                            className="w-44 h-44 rounded-[48px] border-4 border-slate-950 shadow-2xl object-cover relative z-10 bg-slate-900" 
                                            onError={(e) => { (e.target as any).src = `https://ui-avatars.com/api/?name=B&background=334155&color=fff`; }}
                                        />
                                    </div>
                                    <div>
                                        <p className="text-[12px] font-black text-white uppercase tracking-[0.4em] italic">Native Telegram Sync</p>
                                        <p className="text-[10px] text-slate-700 font-bold uppercase mt-2">Görseller Telegram Sunucularından Çekilir</p>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <label className="text-[11px] font-black text-slate-700 uppercase tracking-widest ml-4 italic">Telegram @Username</label>
                                        <div className="relative">
                                            <div className="absolute left-7 top-1/2 -translate-y-1/2 text-blue-600 font-black text-sm">@</div>
                                            <input required type="text" value={editingBot.bot_link?.replace('@','')} onChange={e => setEditingBot({...editingBot, bot_link: '@' + e.target.value.trim()})} className="w-full bg-slate-900/30 border border-white/5 rounded-[32px] p-8 pl-14 text-sm font-black text-white outline-none focus:border-blue-600/40 shadow-inner italic" placeholder="bot_username" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-10">
                                        <div className="space-y-4">
                                            <label className="text-[11px] font-black text-slate-700 uppercase tracking-widest ml-4 italic">Benzersiz ID</label>
                                            <input required type="text" value={editingBot.id} onChange={e => setEditingBot({...editingBot, id: e.target.value.toLowerCase().trim()})} className="w-full bg-slate-900/30 border border-white/5 rounded-[32px] p-8 text-sm font-black text-white outline-none focus:border-blue-600/40 shadow-inner" placeholder="örn: gpt_v4" />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[11px] font-black text-slate-700 uppercase tracking-widest ml-4 italic">Pazar İsmi</label>
                                            <input required type="text" value={editingBot.name} onChange={e => setEditingBot({...editingBot, name: e.target.value})} className="w-full bg-slate-900/30 border border-white/5 rounded-[32px] p-8 text-sm font-black text-white outline-none focus:border-blue-600/40 shadow-inner" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-12">
                                <div className="space-y-4">
                                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-widest ml-4 italic">Operasyonel Detaylar</label>
                                    <textarea required value={editingBot.description} onChange={e => setEditingBot({...editingBot, description: e.target.value})} className="w-full h-40 bg-slate-900/30 border border-white/5 rounded-[40px] p-10 text-xs font-medium text-slate-400 outline-none focus:border-blue-600/40 shadow-inner resize-none leading-loose" placeholder="Botun yeteneklerini ve komutlarını buraya girin..." />
                                </div>

                                <div className="space-y-8">
                                    <div className="flex items-center justify-between px-4">
                                        <label className="text-[11px] font-black text-slate-700 uppercase tracking-widest italic">Fiyat (TL karşılığı)</label>
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
                                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic">1 TON = {tonPrice} TL</span>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute left-8 top-1/2 -translate-y-1/2 text-emerald-600"><DollarSign size={24}/></div>
                                        <input type="number" value={editingBot.price} onChange={e => setEditingBot({...editingBot, price: Number(e.target.value)})} className="w-full bg-slate-900/30 border border-white/5 rounded-[32px] p-8 pl-20 text-lg font-black text-white outline-none focus:border-emerald-600/40 shadow-inner italic" />
                                    </div>

                                    <div className="p-10 bg-slate-950 border border-white/5 rounded-[40px] flex items-center justify-between shadow-inner">
                                        <div className="flex items-center gap-5">
                                            <div className="p-4 bg-blue-600/10 rounded-2xl text-blue-500"><Zap size={24}/></div>
                                            <div>
                                                <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">TON Karşılığı</span>
                                                <p className="text-3xl font-black text-blue-500 italic tracking-tighter">{currentConversions.ton} TON</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between px-4">
                                            <label className="text-[11px] font-black text-slate-700 uppercase tracking-widest italic flex items-center gap-3"><ImageIcon size={16}/> Arayüz Önizleme</label>
                                            <button type="button" onClick={addScreenshotBox} className="text-[10px] font-black text-blue-600 hover:text-white transition-all uppercase flex items-center gap-2"><PlusCircle size={16}/> Görsel Ekle</button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-6 max-h-[220px] overflow-y-auto no-scrollbar pr-3">
                                            {editingBot.screenshots && editingBot.screenshots.map((s: string, idx: number) => (
                                                <div key={idx} className="relative group animate-in slide-in-from-right-4 duration-300">
                                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-800"><Link2 size={16}/></div>
                                                    <input 
                                                        type="text" 
                                                        value={s} 
                                                        onChange={e => updateScreenshot(idx, e.target.value)} 
                                                        className="w-full bg-slate-900/40 border border-white/5 rounded-[24px] p-5 pl-12 pr-12 text-[10px] font-bold text-slate-500 outline-none focus:border-blue-600/40 shadow-inner" 
                                                        placeholder="https://..." 
                                                    />
                                                    <button type="button" onClick={() => removeScreenshot(idx)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700 hover:text-red-500 transition-colors active:scale-90"><Trash2 size={18}/></button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <button type="submit" disabled={isLoading} className="w-full py-10 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-[48px] text-[13px] uppercase tracking-[0.6em] shadow-2xl shadow-blue-600/40 active:scale-[0.98] transition-all flex items-center justify-center gap-5 border-b-8 border-blue-800">
                                    {isLoading ? <Loader2 className="animate-spin" size={28}/> : <><Save size={24}/> SİSTEME KAYDET</>}
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
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-16">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Duyuru <span className="text-blue-600">Paneli</span></h2>
                <button className="px-8 py-4 bg-slate-900 border border-white/5 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-all">Yeni Duyuru</button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {announcements.map(ann => (
                    <div key={ann.id} className="bg-[#0f172a]/40 border border-white/5 p-12 rounded-[64px] flex items-center justify-between group hover:border-blue-600/30 transition-all shadow-2xl relative overflow-hidden">
                        <div className="flex items-center gap-10">
                            <div className="w-20 h-20 bg-slate-950 rounded-[32px] flex items-center justify-center text-blue-500 border border-white/5 shadow-inner group-hover:rotate-6 transition-transform"><Megaphone size={32}/></div>
                            <div>
                                <h4 className="font-black text-white uppercase italic tracking-tighter text-2xl mb-2">{ann.title}</h4>
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${ann.is_active ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-slate-700'}`}></div>
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${ann.is_active ? 'text-emerald-500' : 'text-slate-700'}`}>{ann.is_active ? 'AKTİF YAYIN' : 'PASİF'}</p>
                                </div>
                            </div>
                        </div>
                        <button className="p-5 bg-slate-900 border border-white/5 rounded-2xl text-slate-700 hover:text-white transition-all"><ChevronRight size={24}/></button>
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
            alert("Sistem ayarları başarıyla protokol altına alındı.");
        } catch (e) { alert("Yetki Hatası!"); }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-20">
            <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">Sistem <span className="text-blue-600">Yapılandırması</span></h2>
            <div className="bg-[#0f172a]/40 border border-white/5 p-16 rounded-[80px] space-y-16 shadow-2xl relative overflow-hidden">
                <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-blue-600/5 rounded-full blur-[100px]"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                    <div className="space-y-6">
                        <label className="text-[11px] font-black text-slate-700 uppercase tracking-widest ml-5 italic">Platform İsmi</label>
                        <input type="text" value={settings.appName} onChange={e => setSettings({...settings, appName: e.target.value})} className="w-full bg-slate-950 border border-white/5 rounded-[32px] p-8 text-sm font-black text-white outline-none focus:border-blue-600 shadow-inner italic" />
                    </div>
                    <div className="space-y-6">
                        <label className="text-[11px] font-black text-slate-700 uppercase tracking-widest ml-5 italic">Sistem Durumu</label>
                        <button onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})} className={`w-full py-8 rounded-[32px] text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-4 transition-all border shadow-2xl ${settings.maintenanceMode ? 'bg-red-600 border-red-500 text-white' : 'bg-slate-900 border-white/5 text-slate-500'}`}>
                            {settings.maintenanceMode ? <ShieldAlert size={24}/> : <Globe size={24}/>}
                            {settings.maintenanceMode ? 'BAKIM MODU: AKTİF' : 'PLATFORM: CANLI'}
                        </button>
                    </div>
                    <div className="space-y-6">
                        <label className="text-[11px] font-black text-slate-700 uppercase tracking-widest ml-5 italic">Reklam Komisyonu (%)</label>
                        <div className="relative">
                            <div className="absolute left-8 top-1/2 -translate-y-1/2 text-blue-600"><Percent size={20}/></div>
                            <input type="number" value={settings.commissionRate} onChange={e => setSettings({...settings, commissionRate: Number(e.target.value)})} className="w-full bg-slate-950 border border-white/5 rounded-[32px] p-8 pl-20 text-sm font-black text-white outline-none focus:border-blue-600 shadow-inner" />
                        </div>
                    </div>
                    <div className="space-y-6">
                        <label className="text-[11px] font-black text-slate-700 uppercase tracking-widest ml-5 italic">Teknik Destek Protokolü</label>
                        <input type="text" value={settings.supportLink} onChange={e => setSettings({...settings, supportLink: e.target.value})} className="w-full bg-slate-950 border border-white/5 rounded-[32px] p-8 text-sm font-black text-white outline-none focus:border-blue-600 shadow-inner italic" placeholder="@destek_bot" />
                    </div>
                </div>
                <button onClick={handleSave} className="w-full py-10 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-[48px] text-[13px] uppercase tracking-[0.6em] shadow-2xl active:scale-[0.98] transition-all border-b-8 border-blue-800">YAPILANDIRMAYI KİLİTLE</button>
            </div>
        </div>
    );
};

// Basit Icon Bileşeni (PriceService kullanımı için)
const Percent = ({ size, className }: any) => <span className={`font-black italic text-lg ${className}`}>%</span>;

export default AdminDashboard;

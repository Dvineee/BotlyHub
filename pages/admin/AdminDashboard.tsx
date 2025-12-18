
import React, { useEffect, useState } from 'react';
// Fixed: Use namespace import for react-router-dom to resolve "no exported member" errors
import * as Router from 'react-router-dom';
import { 
  LayoutDashboard, Users, Bot, LogOut, Menu, X, 
  Package, Loader2, RefreshCw, Plus, Edit2, Trash2, 
  ImageIcon, Megaphone, Calendar,
  Settings as SettingsIcon, ShieldCheck, Percent, Globe, MessageSquare, AlertTriangle,
  Sparkles, Zap, Gift, Info, Star, ChevronRight, Eye, Send, Activity, Clock,
  Wallet, ShieldAlert, Cpu
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
      {/* Sidebar logic and layout... */}
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
              <div className="flex items-center gap-2"><Activity size={14}/> 42ms Gecikme</div>
           </div>
           <div className="flex items-center gap-4 ml-auto">
              <div className="text-right mr-2 hidden sm:block">
                  <p className="text-xs font-black text-white">Administrator</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Root Access</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white">AD</div>
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
                    <button className="px-6 py-3 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all">Export Report</button>
                    <button className="px-6 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-900/20 active:scale-95 transition-all">Sync Database</button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Aktif Üye" value="4.8K" icon={Users} color="blue" trend="+12%" />
                <StatCard label="Bot Sayısı" value="142" icon={Bot} color="purple" trend="+4%" />
                <StatCard label="Günlük Kazanç" value="₺12.4K" icon={Wallet} color="emerald" trend="+18%" />
                <StatCard label="Server Load" value="24%" icon={Cpu} color="orange" trend="-2%" />
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
                <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${trend.startsWith('+') ? 'text-emerald-500 bg-emerald-500/10' : 'text-red-500 bg-red-500/10'}`}>{trend}</span>
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
                <button onClick={() => { setEditingBot({ name: '', description: '', price: 0, category: 'productivity', bot_link: '', icon: '', screenshots: [] }); setIsModalOpen(true); }} className="px-6 py-4 bg-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-2 shadow-lg shadow-blue-900/20 active:scale-95">
                    <Plus size={18}/> Yeni Bot Ekle
                </button>
            </div>

            {isLoading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" /></div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bots.map(b => (
                        <div key={b.id} className="bg-[#0f172a] border border-slate-800 p-6 rounded-[32px] hover:border-blue-500/40 transition-all flex flex-col group">
                            <div className="flex gap-5 mb-6">
                                <img src={b.icon} className="w-16 h-16 rounded-[24px] object-cover border border-slate-800" />
                                <div className="min-w-0">
                                    <h4 className="font-bold text-white text-base truncate">{b.name}</h4>
                                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1">{b.category}</p>
                                    <div className="flex items-center gap-1.5 mt-2">
                                        <Star size={12} className="text-yellow-500" fill="currentColor"/>
                                        <span className="text-white font-black text-xs">{b.price} Stars</span>
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
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[40px] p-10 relative shadow-2xl overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white"><X size={22}/></button>
                        <h3 className="text-2xl font-black mb-10 text-white italic tracking-tighter uppercase">{editingBot.id ? 'Botu Düzenle' : 'Yeni Bot Oluştur'}</h3>
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Bot İsmi</label>
                                <input type="text" required value={editingBot.name} onChange={e => setEditingBot({...editingBot, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-bold text-white focus:border-blue-500 outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Kategori</label>
                                    <select value={editingBot.category} onChange={e => setEditingBot({...editingBot, category: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-bold text-white focus:border-blue-500 outline-none">
                                        <option value="productivity">Üretkenlik</option>
                                        <option value="games">Oyun</option>
                                        <option value="utilities">Araçlar</option>
                                        <option value="finance">Finans</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Fiyat (Stars)</label>
                                    <input type="number" required value={editingBot.price} onChange={e => setEditingBot({...editingBot, price: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-bold text-white focus:border-blue-500 outline-none" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Açıklama</label>
                                <textarea required value={editingBot.description} onChange={e => setEditingBot({...editingBot, description: e.target.value})} className="w-full h-24 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm resize-none focus:border-blue-500 outline-none" />
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

// --- Settings Management Module ---
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

// --- Placeholder Components for other routes ---
const UserManagement = () => <div className="py-20 text-center opacity-40 font-black italic">Kullanıcı Yönetimi - Yakında Aktif</div>;
const NotificationCenter = () => <div className="py-20 text-center opacity-40 font-black italic">Bildirim Merkezi - Yakında Aktif</div>;
const AnnouncementManagement = () => <div className="py-20 text-center opacity-40 font-black italic">Duyuru Yönetimi - Yakında Aktif</div>;

export default AdminDashboard;

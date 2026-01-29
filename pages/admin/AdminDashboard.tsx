
import React, { useEffect, useState, useCallback, useRef } from 'react';
import * as Router from 'react-router-dom';
import { 
  LayoutDashboard, Users, Bot, LogOut, Menu, X, 
  Loader2, Plus, Trash2, Megaphone, Send, Activity, 
  Wallet, Search, Database, Radio, Bell, Edit3, Image as ImageIcon,
  CheckCircle2, AlertTriangle, TrendingUp, BarChart3, RadioIcon, Sparkles, UserPlus,
  ShieldCheck, Globe, Zap, Clock, ExternalLink, Filter, PieChart, Layers, 
  Settings as SettingsIcon, History, Copy, Check, Eye, ChevronRight, Monitor, Smartphone, Cpu,
  Info, Star
} from 'lucide-react';
import { DatabaseService } from '../../services/DatabaseService';
import { User, Bot as BotType, Announcement, Promotion, ActivityLog, Notification } from '../../types';

const { useNavigate, Routes, Route, Link, useLocation } = Router as any;

const getLiveBotIcon = (botLink: string) => {
    if (!botLink || botLink === '@') return "https://ui-avatars.com/api/?name=Bot&background=1e293b&color=fff";
    const username = botLink.replace('@', '').replace('https://t.me/', '').split('/').pop()?.trim();
    if (username && username.length > 2) {
        return `https://t.me/i/userpic/320/${username}.jpg`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(username || 'Bot')}&background=1e293b&color=fff&bold=true`;
};

const generateUniqueId = () => `BOT-${Math.floor(10000 + Math.random() * 90000)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

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
      {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[65] lg:hidden animate-in fade-in" onClick={() => setSidebarOpen(false)}></div>
      )}

      <aside className={`fixed inset-y-0 left-0 z-[70] w-72 bg-[#020617] border-r border-white/5 transition-transform duration-500 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-8">
          <div className="flex items-center gap-4 mb-14">
            <div className="w-12 h-12 bg-blue-600 rounded-[20px] flex items-center justify-center shadow-2xl shadow-blue-600/20 rotate-3">
                <Database size={24} className="text-white"/>
            </div>
            <div>
                <h2 className="text-xl font-black text-white italic tracking-tighter uppercase leading-none">Botly<span className="text-blue-500">Hub</span></h2>
                <span className="text-[8px] font-black text-slate-700 uppercase tracking-[0.4em] mt-1.5 block">Enterprise Console</span>
            </div>
          </div>
          
          <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
            <NavItem to="/a/dashboard" icon={LayoutDashboard} label="Dashboard" />
            <div className="pt-8 pb-3 px-6"><span className="text-[9px] font-black text-slate-800 uppercase tracking-widest italic">İzleme</span></div>
            <NavItem to="/a/dashboard/users" icon={Users} label="Kullanıcılar" />
            <NavItem to="/a/dashboard/logs" icon={History} label="Aktiviteler" />
            <NavItem to="/a/dashboard/sales" icon={Wallet} label="Satışlar" />
            
            <div className="pt-8 pb-3 px-6"><span className="text-[9px] font-black text-slate-800 uppercase tracking-widest italic">İçerik</span></div>
            <NavItem to="/a/dashboard/bots" icon={Bot} label="Market Botları" />
            <NavItem to="/a/dashboard/promotions" icon={RadioIcon} label="Tanıtım Motoru" />
            <NavItem to="/a/dashboard/announcements" icon={Megaphone} label="Duyuru Merkezi" />
            <NavItem to="/a/dashboard/notifications" icon={Bell} label="Bildirim Gönder" />
          </nav>

          <button onClick={() => { DatabaseService.logoutAdmin(); navigate('/a/admin'); }} className="mt-8 flex items-center gap-4 px-8 py-5 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-500/10 rounded-[24px] transition-all group border border-transparent hover:border-red-500/20">
            <LogOut size={18} /> Çıkış Yap
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-24 border-b border-white/5 flex items-center justify-between px-6 lg:px-10 bg-[#020617]/80 backdrop-blur-2xl z-50">
           <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-3 bg-slate-900 border border-white/5 rounded-xl text-slate-400 active:scale-95 transition-all">
              <Menu size={20}/>
           </button>
           
           <div className="flex items-center gap-4 lg:gap-8 ml-auto">
              <div className="hidden sm:flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Live Core</span>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-black text-white italic text-xl shadow-xl shadow-blue-600/20">A</div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-12 no-scrollbar">
          <div className="max-w-7xl mx-auto space-y-12 pb-24">
            <Routes>
              <Route path="/" element={<HomeView />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="logs" element={<ActivityCenter />} />
              <Route path="bots" element={<BotManagement />} />
              <Route path="sales" element={<SalesManagement />} />
              <Route path="promotions" element={<PromotionManagement />} />
              <Route path="announcements" element={<AnnouncementCenter />} />
              <Route path="notifications" element={<NotificationCenter />} />
            </Routes>
          </div>
        </div>
      </main>
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
        <div className="bg-slate-900/40 border border-white/5 p-6 lg:p-10 rounded-[32px] lg:rounded-[48px] hover:border-white/10 transition-all group overflow-hidden">
            <div className={`w-10 h-10 lg:w-14 lg:h-14 ${colors[color]} rounded-[18px] lg:rounded-[20px] border flex items-center justify-center mb-4 lg:mb-8 shadow-xl group-hover:scale-110 transition-all`}><Icon size={24} /></div>
            <p className="text-[8px] lg:text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">{label}</p>
            <h3 className="text-xl lg:text-3xl font-black text-white tracking-tighter italic leading-none">{typeof value === 'number' ? value.toLocaleString() : value}</h3>
        </div>
    );
};

const AdminInput = ({ label, value, onChange, type = "text" }: any) => (
    <div className="space-y-2 text-white group">
        <label className="text-[9px] font-black text-slate-700 uppercase tracking-widest ml-4 group-focus-within:text-blue-500 transition-colors italic">{label}</label>
        <div className="relative">
            <input 
                type={type} 
                value={value} 
                onChange={e => onChange(e.target.value)} 
                className="w-full h-14 lg:h-18 bg-slate-950 border border-white/5 rounded-[22px] lg:rounded-[28px] px-8 text-[11px] font-black text-white outline-none focus:border-blue-500 transition-all uppercase italic shadow-inner" 
            />
        </div>
    </div>
);

const HomeView = () => {
    const [stats, setStats] = useState({ userCount: 0, botCount: 0, logCount: 0, salesCount: 0, totalRevenue: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => { 
        DatabaseService.getAdminStats().then(s => { setStats(s); setIsLoading(false); }); 
    }, []);

    if (isLoading) return <div className="flex justify-center py-24"><Loader2 className="animate-spin text-blue-500" size={32} /></div>;

    return (
        <div className="animate-in fade-in duration-700 space-y-12">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl lg:text-5xl font-black text-white uppercase italic tracking-tighter leading-none">Enterprise <span className="text-blue-500">Overview</span></h1>
                <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.5em] italic">Platform büyüme ve performans metrikleri</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
                <StatCard icon={Users} label="Toplam Üye" value={stats.userCount} color="blue" />
                <StatCard icon={Bot} label="Aktif Botlar" value={stats.botCount} color="purple" />
                <StatCard icon={BarChart3} label="Satış Adedi" value={stats.salesCount} color="orange" />
                <StatCard icon={TrendingUp} label="Toplam Ciro" value={`₺${stats.totalRevenue.toLocaleString()}`} color="emerald" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                <div className="lg:col-span-2 bg-slate-900/40 border border-white/5 p-8 lg:p-12 rounded-[40px] lg:rounded-[56px] shadow-2xl relative overflow-hidden group">
                    <h3 className="text-base lg:text-xl font-black italic uppercase tracking-tight mb-8">Büyüme Hızı (Haftalık)</h3>
                    <div className="h-32 lg:h-48 flex items-end gap-2 lg:gap-3 px-2">
                        {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
                            <div key={i} className="flex-1 bg-gradient-to-t from-blue-600 to-indigo-400 rounded-t-xl transition-all duration-1000" style={{ height: `${h}%` }}></div>
                        ))}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-600/20 to-transparent border border-blue-500/10 p-8 lg:p-12 rounded-[40px] lg:rounded-[56px] flex flex-col justify-center relative overflow-hidden">
                    <Sparkles className="absolute -top-6 -right-6 text-blue-500/20 w-32 h-32" />
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em] mb-4 italic">GÜNLÜK RAPOR</p>
                    <p className="text-white text-xl lg:text-3xl font-black italic uppercase tracking-tighter leading-none mb-3">Sistemler <span className="text-emerald-500">Optimum</span></p>
                    <p className="text-slate-500 text-[10px] lg:text-sm font-bold leading-relaxed uppercase opacity-70">Operasyonel verimlilik %99.8. Kayıt hızı artışı %14.</p>
                </div>
            </div>
        </div>
    );
};

const BotManagement = () => {
    const [bots, setBots] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBot, setEditingBot] = useState<any>(null);
    const [copiedId, setCopiedId] = useState(false);
    const [activeTab, setActiveTab] = useState<'info' | 'media' | 'pricing'>('info');

    const load = useCallback(async () => {
        setIsLoading(true);
        setBots(await DatabaseService.getBotsWithStats());
        setIsLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const openCreateModal = () => {
        setEditingBot({
            id: generateUniqueId(),
            name: '',
            description: '',
            price: 0,
            category: 'utilities',
            bot_link: '@',
            icon: '',
            screenshots: [],
            is_premium: false
        });
        setIsModalOpen(true);
        setActiveTab('info');
    };

    const copyId = () => {
        if (!editingBot) return;
        navigator.clipboard.writeText(editingBot.id);
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
    };

    const handleScreenshotAdd = (url: string) => {
        if (!url) return;
        setEditingBot({ ...editingBot, screenshots: [...(editingBot.screenshots || []), url] });
    };

    const removeScreenshot = (index: number) => {
        const next = [...editingBot.screenshots];
        next.splice(index, 1);
        setEditingBot({ ...editingBot, screenshots: next });
    };

    return (
        <div className="space-y-12 animate-in fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl lg:text-4xl font-black text-white italic uppercase tracking-tighter leading-none">Market <span className="text-blue-500">Inventory</span></h2>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mt-2 italic">Platform envanterini profesyonelce yönetin</p>
                </div>
                <button 
                    onClick={openCreateModal}
                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 px-8 py-5 rounded-[24px] text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl shadow-blue-900/40 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                    <Plus size={18} /> YENİ ÜRÜN TANIMLA
                </button>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                    <Loader2 className="animate-spin text-blue-500" size={40} />
                    <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest italic">Veriler Senkronize Ediliyor...</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {bots.map(b => (
                        <div key={b.id} className="bg-slate-900/40 border border-white/5 rounded-[44px] lg:rounded-[56px] p-8 lg:p-10 flex flex-col gap-6 lg:gap-8 group hover:border-blue-500/30 transition-all relative overflow-hidden shadow-2xl backdrop-blur-sm">
                            <div className="flex justify-between items-start relative z-10">
                                <div className="relative">
                                    <img 
                                        src={getLiveBotIcon(b.bot_link)} 
                                        className="w-16 h-16 lg:w-20 lg:h-20 rounded-[28px] lg:rounded-[32px] border border-white/10 shadow-2xl object-cover bg-slate-950 group-hover:rotate-6 group-hover:scale-105 transition-all" 
                                        onError={(e) => (e.target as any).src = `https://ui-avatars.com/api/?name=${b.name}`}
                                    />
                                    {b.price > 0 && <div className="absolute -top-2 -right-2 w-7 h-7 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg border-4 border-[#020617]"><Zap size={12} fill="currentColor" /></div>}
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => { setEditingBot(b); setIsModalOpen(true); }} className="p-3 bg-white/5 rounded-xl hover:bg-blue-600 text-slate-500 hover:text-white transition-all"><Edit3 size={18}/></button>
                                    <button onClick={async () => { if(confirm('Silsin mi?')) { await DatabaseService.deleteBot(b.id); load(); } }} className="p-3 bg-white/5 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18}/></button>
                                </div>
                            </div>

                            <div className="relative z-10">
                                <h4 className="text-xl lg:text-2xl font-black text-white italic uppercase tracking-tighter truncate leading-none mb-3">{b.name}</h4>
                                <p className="text-[10px] text-slate-600 line-clamp-2 leading-relaxed font-bold uppercase italic h-10">{b.description}</p>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-white/5 relative z-10">
                                <p className="text-lg font-black uppercase text-blue-500 italic tracking-tighter leading-none">{b.price > 0 ? `${b.price} TL` : 'ÜCRETSİZ'}</p>
                                <p className="text-lg font-black uppercase text-white italic tracking-tighter leading-none">{b.ownerCount || 0} <span className="text-[8px] text-slate-700">LİSANS</span></p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && editingBot && (
                <div className="fixed inset-0 z-[110] bg-black/95 flex items-end lg:items-center justify-center p-0 lg:p-8 backdrop-blur-3xl animate-in slide-in-from-bottom lg:fade-in">
                    <div className="bg-[#020617] border-t lg:border border-white/10 rounded-t-[40px] lg:rounded-[64px] w-full max-w-7xl h-[94vh] lg:h-auto lg:max-h-[90vh] flex flex-col lg:flex-row overflow-hidden shadow-2xl relative">
                        
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 lg:top-8 lg:right-8 z-[120] p-3 lg:p-4 bg-white/5 rounded-2xl hover:bg-red-600 transition-all active:scale-90">
                            <X size={20} />
                        </button>

                        <div className="flex-1 flex flex-col h-full overflow-hidden">
                            <div className="p-8 lg:p-12 pb-4 lg:pb-0 space-y-8">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-[20px] flex items-center justify-center shadow-xl rotate-3">
                                        <Cpu size={24} className="text-white"/>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl lg:text-3xl font-black uppercase italic tracking-tighter">Product <span className="text-blue-500">Forge</span></h3>
                                        <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.4em] mt-1 italic">V3.5 ENGINE</p>
                                    </div>
                                </div>

                                <div className="flex gap-2 bg-white/5 p-1.5 rounded-3xl border border-white/5">
                                    {['info', 'pricing', 'media'].map(tab => (
                                        <button 
                                            key={tab}
                                            onClick={() => setActiveTab(tab as any)}
                                            className={`flex-1 py-3 lg:py-4 rounded-[20px] lg:rounded-[22px] text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40' : 'text-slate-500 hover:bg-white/5'}`}
                                        >
                                            {tab === 'info' ? 'DETAY' : tab === 'pricing' ? 'LİSANS' : 'GALERİ'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-8 no-scrollbar pb-32 lg:pb-12">
                                <form onSubmit={async (e) => { e.preventDefault(); await DatabaseService.saveBot(editingBot); setIsModalOpen(false); load(); }} className="space-y-8">
                                    {activeTab === 'info' && (
                                        <div className="space-y-8 animate-in slide-in-from-left-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black text-slate-700 uppercase tracking-widest ml-4">SİSTEM ID</label>
                                                    <div className="relative group">
                                                        <input type="text" value={editingBot.id} readOnly className="w-full h-14 lg:h-18 bg-slate-950 border border-white/5 rounded-[22px] lg:rounded-[28px] px-8 text-[11px] font-black text-slate-600 outline-none uppercase italic" />
                                                        <button type="button" onClick={copyId} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/5 rounded-xl hover:bg-blue-600 text-slate-500 hover:text-white transition-all">
                                                            {copiedId ? <Check size={14} /> : <Copy size={14} />}
                                                        </button>
                                                    </div>
                                                </div>
                                                <AdminInput label="BOT İSMİ" value={editingBot.name} onChange={(v:any)=>setEditingBot({...editingBot, name:v})} />
                                                <AdminInput label="@KULLANICIADI" value={editingBot.bot_link} onChange={(v:any)=>setEditingBot({...editingBot, bot_link:v})} />
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black text-slate-700 uppercase tracking-widest ml-4">KATEGORİ</label>
                                                    <select value={editingBot.category} onChange={e => setEditingBot({...editingBot, category: e.target.value})} className="w-full h-14 lg:h-18 bg-slate-950 border border-white/5 rounded-[22px] lg:rounded-[28px] px-8 text-[11px] font-black text-white outline-none focus:border-blue-500 uppercase italic appearance-none">
                                                        <option value="utilities">Araçlar & Servisler</option>
                                                        <option value="finance">Finans & Ekonomi</option>
                                                        <option value="games">Eğlence & Oyun</option>
                                                        <option value="productivity">Verimlilik & İş</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-slate-700 uppercase tracking-widest ml-4">MARKET AÇIKLAMASI</label>
                                                <textarea value={editingBot.description} onChange={e => setEditingBot({...editingBot, description: e.target.value})} className="w-full bg-slate-950 border border-white/5 p-8 rounded-[36px] lg:rounded-[44px] text-[11px] font-black h-32 lg:h-40 outline-none text-slate-400 focus:border-blue-500/30 uppercase italic leading-relaxed" />
                                            </div>
                                        </div>
                                    )}
                                    {activeTab === 'pricing' && (
                                        <div className="space-y-8 animate-in slide-in-from-left-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <AdminInput label="LİSANS TUTARI (TRY)" type="number" value={editingBot.price} onChange={(v:any)=>setEditingBot({...editingBot, price:v})} />
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black text-slate-700 uppercase tracking-widest ml-4">PLATFORM STATÜSÜ</label>
                                                    <button type="button" onClick={()=>setEditingBot({...editingBot, is_premium: !editingBot.is_premium})} className={`w-full h-14 lg:h-18 rounded-[22px] lg:rounded-[28px] flex items-center justify-center gap-3 transition-all font-black text-[10px] tracking-widest ${editingBot.is_premium ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40' : 'bg-slate-950 text-slate-600 border border-white/5'}`}>
                                                        {editingBot.is_premium ? 'PREMIUM ACCESS' : 'STANDARD ACCESS'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {activeTab === 'media' && (
                                        <div className="space-y-8 animate-in slide-in-from-left-4">
                                            <div className="space-y-6">
                                                <label className="text-[9px] font-black text-slate-700 uppercase tracking-widest ml-4">VARLIKLAR (URL)</label>
                                                <div className="flex gap-3">
                                                    <input type="text" id="scr_input" placeholder="https://cdn.example.com/..." className="flex-1 h-14 lg:h-16 bg-slate-950 border border-white/5 rounded-2xl px-6 text-[10px] text-white outline-none italic font-black" />
                                                    <button type="button" onClick={() => { const inp = document.getElementById('scr_input') as HTMLInputElement; handleScreenshotAdd(inp.value); inp.value = ''; }} className="h-14 lg:h-16 px-8 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">EKLE</button>
                                                </div>
                                                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-6 px-2">
                                                    {(editingBot.screenshots || []).map((url: string, idx: number) => (
                                                        <div key={idx} className="relative w-28 lg:w-32 h-44 lg:h-52 shrink-0 bg-slate-950 rounded-2xl lg:rounded-[28px] border border-white/5 overflow-hidden group shadow-2xl">
                                                            <img src={url} className="w-full h-full object-cover transition-all group-hover:scale-110" />
                                                            <div className="absolute inset-0 bg-red-600/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer" onClick={() => removeScreenshot(idx)}>
                                                                <Trash2 size={24} className="text-white" />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="fixed lg:relative bottom-0 left-0 right-0 p-6 lg:p-0 bg-gradient-to-t from-[#020617] lg:from-transparent via-[#020617]/90 lg:via-transparent to-transparent z-[130]">
                                        <button type="submit" className="w-full h-16 lg:h-24 bg-blue-600 text-white rounded-2xl lg:rounded-[32px] font-black text-[12px] uppercase tracking-[0.4em] shadow-2xl shadow-blue-900/40 transition-all border-b-8 border-blue-800 active:translate-y-1 active:border-b-4 flex items-center justify-center gap-4">
                                            <Database size={20} /> SİSTEMİ GÜNCELLE
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
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

    const filtered = users.filter(u => 
        (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        (u.username || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-10 animate-in fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">User <span className="text-blue-500">Registry</span></h2>
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-700" size={18} />
                    <input type="text" placeholder="Üye ara..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full h-14 bg-slate-900 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-[10px] outline-none focus:border-blue-500 text-white font-black italic uppercase" />
                </div>
            </div>
            <div className="bg-slate-900/40 border border-white/5 rounded-[44px] overflow-hidden shadow-2xl">
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-[9px] uppercase tracking-[0.4em] text-slate-700 font-black">
                            <tr><th className="px-10 py-8">KİMLİK & ÜYE</th><th className="px-10 py-8">ROL</th><th className="px-10 py-8">DURUM</th><th className="px-10 py-8 text-right">AKSİYONLAR</th></tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filtered.map(u => (
                                <tr key={u.id} className="hover:bg-white/5 transition-all text-white">
                                    <td className="px-10 py-8 font-black italic text-sm truncate max-w-[200px]">@{u.username}</td>
                                    <td className="px-10 py-8"><span className="text-[10px] font-black text-slate-500 uppercase italic">{u.role}</span></td>
                                    <td className="px-10 py-8">
                                        <div className={`flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest ${u.status === 'Active' ? 'text-emerald-500' : 'text-red-500'}`}>
                                            <div className={`w-2 h-2 rounded-full ${u.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>{u.status}
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <button onClick={async () => { await DatabaseService.updateUserStatus(u.id, u.status === 'Active' ? 'Passive' : 'Active'); load(); }} className="px-6 py-3 bg-white/5 rounded-xl text-[9px] font-black uppercase hover:bg-white/10 transition-all tracking-widest">GÜNCELLE</button>
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

const ActivityCenter = () => {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => { DatabaseService.getActivityLogs().then(data => { setLogs(data); setIsLoading(false); }); }, []);
    const typeColors: any = { payment: 'text-emerald-500', bot_manage: 'text-blue-500', security: 'text-red-500', system: 'text-slate-500' };
    return (
        <div className="space-y-10 animate-in fade-in">
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">Global <span className="text-blue-500">Activity</span></h2>
            {isLoading ? <div className="flex justify-center py-24"><Loader2 className="animate-spin text-blue-500" /></div> : (
                <div className="space-y-4">
                    {logs.map(log => (
                        <div key={log.id} className="bg-slate-900/40 border border-white/5 p-6 lg:p-8 rounded-[32px] lg:rounded-[40px] flex items-center gap-6 group hover:border-white/10 transition-all">
                            <div className={`w-12 h-12 shrink-0 bg-white/5 rounded-2xl flex items-center justify-center ${typeColors[log.type] || 'text-white'}`}><Activity size={20} /></div>
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-1">
                                    <h4 className="font-black text-white italic text-sm lg:text-base uppercase truncate">{log.title}</h4>
                                    <span className="text-[8px] lg:text-[10px] font-black text-slate-700 uppercase tracking-widest">{new Date(log.created_at).toLocaleString()}</span>
                                </div>
                                <p className="text-slate-500 text-[10px] font-bold uppercase italic truncate opacity-80">{log.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const SalesManagement = () => {
    const [sales, setSales] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => { DatabaseService.getAllPurchases().then(s => { setSales(s); setIsLoading(false); }); }, []);
    return (
        <div className="space-y-10 animate-in fade-in">
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">Financial <span className="text-blue-500">Center</span></h2>
            <div className="bg-slate-900/40 border border-white/5 rounded-[44px] overflow-hidden shadow-2xl">
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-[9px] uppercase tracking-[0.4em] text-slate-700 font-black">
                            <tr><th className="px-10 py-8">MÜŞTERİ</th><th className="px-10 py-8">ÜRÜN</th><th className="px-10 py-8">TARİH</th><th className="px-10 py-8 text-right">HASILAT</th></tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {sales.map((s, idx) => (
                                <tr key={idx} className="hover:bg-white/5 transition-all text-white">
                                    <td className="px-10 py-8 font-black italic text-sm">@{s.users?.username || 'Guest'}</td>
                                    <td className="px-10 py-8 font-black uppercase text-xs tracking-tight">{s.bots?.name || 'Paket'}</td>
                                    <td className="px-10 py-8 font-bold text-slate-600 uppercase text-[9px] tracking-widest">{new Date(s.acquired_at).toLocaleDateString()}</td>
                                    <td className="px-10 py-8 text-right font-black text-emerald-500 italic text-lg">₺{s.bots?.price || 0}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const AnnouncementCenter = () => {
    const [anns, setAnns] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAnn, setEditingAnn] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'info' | 'style' | 'action'>('info');

    const load = useCallback(async () => {
        setIsLoading(true);
        setAnns(await DatabaseService.getAnnouncements());
        setIsLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const openCreateModal = () => {
        setEditingAnn({
            id: '',
            title: '',
            description: '',
            button_text: 'İNCELE',
            button_link: '',
            icon_name: 'Megaphone',
            color_scheme: 'purple',
            is_active: true,
            action_type: 'link',
            content_detail: ''
        });
        setIsModalOpen(true);
        setActiveTab('info');
    };

    const previewColors: Record<string, string> = {
        purple: 'from-[#6366f1] to-[#a855f7]',
        blue: 'from-[#3b82f6] to-[#60a5fa]',
        emerald: 'from-[#10b981] to-[#34d399]',
        orange: 'from-[#f59e0b] to-[#ef4444]'
    };

    return (
        <div className="space-y-12 animate-in fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl lg:text-4xl font-black text-white italic uppercase tracking-tighter leading-none">Broadcast <span className="text-blue-500">Center</span></h2>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mt-2 italic">Global platform duyurularını yönetin</p>
                </div>
                <button 
                    onClick={openCreateModal}
                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 px-8 py-5 rounded-[24px] text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl shadow-blue-900/40 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                    <Plus size={18} /> YENİ DUYURU OLUŞTUR
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-32"><Loader2 className="animate-spin text-blue-500" size={40} /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {anns.map(a => (
                        <div key={a.id} className="bg-slate-900/40 border border-white/5 rounded-[44px] p-8 lg:p-10 flex flex-col gap-6 group hover:border-blue-500/30 transition-all relative overflow-hidden shadow-2xl backdrop-blur-sm">
                            <div className="flex justify-between items-start relative z-10">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl border border-white/5 ${a.is_active ? `bg-gradient-to-br ${previewColors[a.color_scheme] || 'bg-blue-600'} text-white` : 'bg-slate-800 text-slate-600'}`}>
                                    {a.icon_name === 'Megaphone' ? <Megaphone size={24}/> : a.icon_name === 'Sparkles' ? <Sparkles size={24}/> : a.icon_name === 'Zap' ? <Zap size={24}/> : <Star size={24}/>}
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => { setEditingAnn(a); setIsModalOpen(true); }} className="p-3 bg-white/5 rounded-xl hover:bg-blue-600 text-slate-500 hover:text-white transition-all"><Edit3 size={18}/></button>
                                    <button onClick={async () => { if(confirm('Silsin mi?')) { await DatabaseService.deleteAnnouncement(a.id); load(); } }} className="p-3 bg-white/5 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18}/></button>
                                </div>
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-3">
                                    <h4 className="text-xl lg:text-2xl font-black text-white italic uppercase tracking-tighter truncate leading-none">{a.title}</h4>
                                    {!a.is_active && <span className="text-[8px] font-black bg-red-500/10 text-red-500 px-2 py-0.5 rounded-md">PASİF</span>}
                                </div>
                                <p className="text-[10px] text-slate-600 line-clamp-2 leading-relaxed font-bold uppercase italic h-10">{a.description}</p>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-white/5 relative z-10">
                                <span className={`text-[9px] font-black uppercase tracking-widest ${a.color_scheme === 'purple' ? 'text-purple-500' : a.color_scheme === 'emerald' ? 'text-emerald-500' : a.color_scheme === 'orange' ? 'text-orange-500' : 'text-blue-500'}`}>
                                    {a.color_scheme.toUpperCase()} SCHEME
                                </span>
                                <ChevronRight size={18} className="text-slate-800" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && editingAnn && (
                <div className="fixed inset-0 z-[110] bg-black/95 flex items-end lg:items-center justify-center p-0 lg:p-8 backdrop-blur-3xl animate-in slide-in-from-bottom lg:fade-in">
                    <div className="bg-[#020617] border-t lg:border border-white/10 rounded-t-[40px] lg:rounded-[64px] w-full max-w-6xl h-[94vh] lg:h-auto lg:max-h-[90vh] flex flex-col lg:flex-row overflow-hidden shadow-2xl relative">
                        
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 lg:top-8 lg:right-8 z-[120] p-3 lg:p-4 bg-white/5 rounded-2xl hover:bg-red-600 transition-all active:scale-90">
                            <X size={20} />
                        </button>

                        <div className="flex-1 flex flex-col h-full overflow-hidden">
                            <div className="p-8 lg:p-12 pb-4 lg:pb-0 space-y-8">
                                <div className="flex items-center gap-5">
                                    <div className={`w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br ${previewColors[editingAnn.color_scheme] || 'from-purple-600 to-indigo-600'} rounded-[20px] flex items-center justify-center shadow-xl rotate-3 transition-all duration-500`}>
                                        <Megaphone size={24} className="text-white"/>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl lg:text-3xl font-black uppercase italic tracking-tighter">Broadcast <span className="text-blue-500">Forge</span></h3>
                                        <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.4em] mt-1 italic">V3.1 BROADCASTER</p>
                                    </div>
                                </div>

                                <div className="flex gap-2 bg-white/5 p-1.5 rounded-3xl border border-white/5">
                                    {['info', 'style', 'action'].map(tab => (
                                        <button 
                                            key={tab}
                                            onClick={() => setActiveTab(tab as any)}
                                            className={`flex-1 py-3 lg:py-4 rounded-[20px] lg:rounded-[22px] text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40' : 'text-slate-500 hover:bg-white/5'}`}
                                        >
                                            {tab === 'info' ? 'İÇERİK' : tab === 'style' ? 'GÖRÜNÜM' : 'EYLEM'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-8 no-scrollbar pb-32 lg:pb-12">
                                <form onSubmit={async (e) => { e.preventDefault(); await DatabaseService.saveAnnouncement(editingAnn); setIsModalOpen(false); load(); }} className="space-y-8">
                                    
                                    {activeTab === 'info' && (
                                        <div className="space-y-8 animate-in slide-in-from-left-4">
                                            <AdminInput label="BAŞLIK" value={editingAnn.title} onChange={(v:any)=>setEditingAnn({...editingAnn, title:v})} />
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-slate-700 uppercase tracking-widest ml-4 italic">KISA AÇIKLAMA</label>
                                                <input value={editingAnn.description} onChange={e => setEditingAnn({...editingAnn, description: e.target.value})} className="w-full h-14 lg:h-18 bg-slate-950 border border-white/5 rounded-[22px] lg:rounded-[28px] px-8 text-[11px] font-black text-white outline-none focus:border-blue-500 uppercase italic shadow-inner" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-slate-700 uppercase tracking-widest ml-4 italic">DETAYLI İÇERİK (POPUP)</label>
                                                <textarea value={editingAnn.content_detail} onChange={e => setEditingAnn({...editingAnn, content_detail: e.target.value})} className="w-full bg-slate-950 border border-white/5 p-8 rounded-[36px] lg:rounded-[44px] text-[11px] font-black h-32 lg:h-40 outline-none text-slate-400 focus:border-blue-500/30 uppercase italic leading-relaxed" />
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'style' && (
                                        <div className="space-y-10 animate-in slide-in-from-left-4">
                                            {/* Renk Seçimi */}
                                            <div className="space-y-4">
                                                <label className="text-[9px] font-black text-slate-700 uppercase tracking-widest ml-4 italic">RENK ŞEMASI (GÖRSEL ÖNİZLEME)</label>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                    {[
                                                        { id: 'purple', label: 'Hologram Purple', class: 'from-[#6366f1] to-[#a855f7]' },
                                                        { id: 'blue', label: 'Deep Sea Blue', class: 'from-[#3b82f6] to-[#60a5fa]' },
                                                        { id: 'emerald', label: 'Neon Emerald', class: 'from-[#10b981] to-[#34d399]' },
                                                        { id: 'orange', label: 'Cyber Orange', class: 'from-[#f59e0b] to-[#ef4444]' }
                                                    ].map(scheme => (
                                                        <button
                                                            key={scheme.id}
                                                            type="button"
                                                            onClick={() => setEditingAnn({ ...editingAnn, color_scheme: scheme.id })}
                                                            className={`group relative h-24 rounded-3xl border transition-all overflow-hidden ${
                                                                editingAnn.color_scheme === scheme.id 
                                                                ? 'border-white ring-2 ring-white/20' 
                                                                : 'border-white/5 hover:border-white/20'
                                                            }`}
                                                        >
                                                            <div className={`absolute inset-0 bg-gradient-to-br ${scheme.class} opacity-80 group-hover:opacity-100 transition-opacity`}></div>
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <span className="text-[8px] font-black text-white uppercase tracking-tighter drop-shadow-lg">{scheme.label}</span>
                                                            </div>
                                                            {editingAnn.color_scheme === scheme.id && (
                                                                <div className="absolute top-2 right-2 bg-white text-black rounded-full p-1 shadow-xl">
                                                                    <Check size={8} />
                                                                </div>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* İkon Seçimi */}
                                            <div className="space-y-4">
                                                <label className="text-[9px] font-black text-slate-700 uppercase tracking-widest ml-4 italic">İKON TİPİ</label>
                                                <div className="grid grid-cols-4 gap-4">
                                                    {[
                                                        { id: 'Megaphone', icon: Megaphone },
                                                        { id: 'Sparkles', icon: Sparkles },
                                                        { id: 'Zap', icon: Zap },
                                                        { id: 'Star', icon: Star }
                                                    ].map(item => (
                                                        <button
                                                            key={item.id}
                                                            type="button"
                                                            onClick={() => setEditingAnn({ ...editingAnn, icon_name: item.id })}
                                                            className={`h-16 rounded-2xl flex items-center justify-center transition-all border ${
                                                                editingAnn.icon_name === item.id 
                                                                ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-900/40' 
                                                                : 'bg-slate-950 border-white/5 text-slate-600 hover:text-slate-400'
                                                            }`}
                                                        >
                                                            <item.icon size={20} />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'action' && (
                                        <div className="space-y-8 animate-in slide-in-from-left-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <AdminInput label="BUTON METNİ" value={editingAnn.button_text} onChange={(v:any)=>setEditingAnn({...editingAnn, button_text:v})} />
                                                <AdminInput label="HEDEF URL / KULLANICIADI" value={editingAnn.button_link} onChange={(v:any)=>setEditingAnn({...editingAnn, button_link:v})} />
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black text-slate-700 uppercase tracking-widest ml-4 italic">AKSİYON TİPİ</label>
                                                    <div className="flex gap-2">
                                                        {['link', 'popup'].map(type => (
                                                            <button 
                                                                key={type}
                                                                type="button" 
                                                                onClick={()=>setEditingAnn({...editingAnn, action_type: type})} 
                                                                className={`flex-1 h-14 rounded-2xl font-black text-[10px] uppercase transition-all ${editingAnn.action_type === type ? 'bg-blue-600 text-white shadow-xl' : 'bg-slate-950 text-slate-700 border border-white/5'}`}
                                                            >
                                                                {type === 'link' ? 'DIŞ BAĞLANTI' : 'İÇ POPUP'}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black text-slate-700 uppercase tracking-widest ml-4 italic">DURUM</label>
                                                    <button type="button" onClick={()=>setEditingAnn({...editingAnn, is_active: !editingAnn.is_active})} className={`w-full h-14 rounded-2xl flex items-center justify-center gap-3 transition-all font-black text-[10px] tracking-widest ${editingAnn.is_active ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-900/40' : 'bg-red-950/20 text-red-500 border border-red-500/20'}`}>
                                                        {editingAnn.is_active ? 'YAYINDA' : 'DURDURULDU'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="fixed lg:relative bottom-0 left-0 right-0 p-6 lg:p-0 bg-gradient-to-t from-[#020617] lg:from-transparent via-[#020617]/90 lg:via-transparent to-transparent z-[130]">
                                        <button type="submit" className="w-full h-16 lg:h-24 bg-blue-600 text-white rounded-2xl lg:rounded-[32px] font-black text-[12px] uppercase tracking-[0.4em] shadow-2xl shadow-blue-900/40 transition-all border-b-8 border-blue-800 active:translate-y-1 active:border-b-4 flex items-center justify-center gap-4">
                                            <Send size={20} /> DUYURUYU YAYINLA
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* RIGHT: LIVE HOLOGRAPHIC PREVIEW SIMULATOR */}
                        <div className="hidden lg:flex w-[440px] bg-slate-950/40 border-l border-white/5 p-12 flex-col items-center justify-center bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent">
                            <div className="text-center mb-16 space-y-3">
                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.6em] italic block">LIVE PREVIEW</span>
                                <h4 className="text-xl font-black text-white italic tracking-widest opacity-20 uppercase">Display Simulator</h4>
                            </div>

                            <div className="w-full max-w-[320px] h-44 rounded-[40px] bg-gradient-to-br transition-all duration-700 p-8 relative overflow-hidden shadow-2xl transform hover:rotate-2 group" style={{ background: 'transparent' }}>
                                {/* Dinamik Arkaplan */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${previewColors[editingAnn.color_scheme] || previewColors.purple} transition-all duration-700`}></div>
                                
                                <div className="relative z-10 flex flex-col h-full justify-between">
                                    <div>
                                        <h3 className="text-white font-black text-xl mb-1 tracking-tighter italic uppercase">{editingAnn.title || 'Başlık Yok'}</h3>
                                        <p className="text-white/70 text-[9px] font-bold uppercase tracking-tight line-clamp-2">{editingAnn.description || 'Açıklama girilmedi.'}</p>
                                    </div>
                                    <div className="bg-white/20 backdrop-blur-md text-white text-[8px] font-black py-2.5 px-6 rounded-xl w-fit border border-white/30 uppercase tracking-widest">
                                        {editingAnn.button_text}
                                    </div>
                                </div>
                                <div className="absolute -right-6 -bottom-6 opacity-20 transform rotate-12 transition-all duration-700 group-hover:scale-125">
                                    {editingAnn.icon_name === 'Megaphone' ? <Megaphone size={140} className="text-white" /> : 
                                     editingAnn.icon_name === 'Sparkles' ? <Sparkles size={140} className="text-white" /> : 
                                     editingAnn.icon_name === 'Zap' ? <Zap size={140} className="text-white" /> : 
                                     <Star size={140} className="text-white" />}
                                </div>
                            </div>

                            <p className="text-[9px] font-black text-slate-800 uppercase tracking-widest mt-10 italic">Gerçek zamanlı görünüm simülasyonu</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const NotificationCenter = () => {
    const [notes, setNotes] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newNote, setNewNote] = useState<any>({
        title: '',
        message: '',
        type: 'system',
        target_type: 'global',
        user_id: ''
    });

    const load = useCallback(async () => {
        setIsLoading(true);
        const data = await DatabaseService.getNotifications();
        setNotes(data);
        setIsLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (newNote.target_type === 'global') {
                await DatabaseService.sendGlobalNotification(newNote.title, newNote.message, newNote.type);
            } else {
                if (!newNote.user_id) return alert('Kullanıcı ID gereklidir.');
                await DatabaseService.sendUserNotification(newNote.user_id, newNote.title, newNote.message, newNote.type);
            }
            setIsModalOpen(false);
            load();
        } catch (e) { alert('Hata oluştu.'); }
    };

    return (
        <div className="space-y-12 animate-in fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl lg:text-4xl font-black text-white italic uppercase tracking-tighter leading-none">Inbox <span className="text-blue-500">Controller</span></h2>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mt-2 italic">Kullanıcı bildirimlerini anlık yönetin</p>
                </div>
                <button 
                    onClick={() => { setNewNote({ title: '', message: '', type: 'system', target_type: 'global', user_id: '' }); setIsModalOpen(true); }}
                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 px-8 py-5 rounded-[24px] text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl shadow-blue-900/40 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                    <Plus size={18} /> YENİ BİLDİRİM TETİKLE
                </button>
            </div>

            <div className="bg-slate-900/40 border border-white/5 rounded-[44px] overflow-hidden shadow-2xl">
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-[9px] uppercase tracking-[0.4em] text-slate-700 font-black">
                            <tr>
                                <th className="px-10 py-8">BAŞLIK & TİP</th>
                                <th className="px-10 py-8">HEDEF</th>
                                <th className="px-10 py-8 text-center">GÖRÜNTÜLENME</th>
                                <th className="px-10 py-8">TARİH</th>
                                <th className="px-10 py-8 text-right">AKSİYON</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {notes.map(n => (
                                <tr key={n.id} className="hover:bg-white/5 transition-all text-white group">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-xl bg-white/5 ${n.type === 'payment' ? 'text-emerald-500' : n.type === 'security' ? 'text-red-500' : 'text-blue-500'}`}>
                                                {n.type === 'payment' ? <Wallet size={16}/> : n.type === 'security' ? <ShieldCheck size={16}/> : <Bell size={16}/>}
                                            </div>
                                            <div>
                                                <p className="font-black italic uppercase text-sm">{n.title}</p>
                                                <p className="text-[9px] text-slate-600 font-bold uppercase">{n.type} LOG</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8"><span className="text-[10px] font-black text-slate-400 uppercase italic">{n.target_type === 'global' ? 'GLOBAL' : `USER: ${n.user_id}`}</span></td>
                                    <td className="px-10 py-8 text-center">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/5">
                                            <Eye size={12} className="text-blue-500" />
                                            <span className="text-[11px] font-black text-white">{n.view_count || 0}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-slate-600 text-[10px] font-bold uppercase">{new Date(n.date).toLocaleString()}</td>
                                    <td className="px-10 py-8 text-right">
                                        <button onClick={async () => { if(confirm('Silsin mi?')) { await DatabaseService.deleteNotification(n.id); load(); } }} className="p-3 bg-white/5 rounded-xl text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card List */}
                <div className="lg:hidden p-4 space-y-3">
                    {notes.map(n => (
                        <div key={n.id} className="p-6 bg-white/5 rounded-3xl space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg bg-white/5 ${n.type === 'payment' ? 'text-emerald-500' : n.type === 'security' ? 'text-red-500' : 'text-blue-500'}`}><Bell size={14}/></div>
                                    <p className="font-black text-white italic uppercase text-xs">{n.title}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-500">
                                        <Eye size={10}/> {n.view_count || 0}
                                    </div>
                                    <button onClick={async () => { await DatabaseService.deleteNotification(n.id); load(); }} className="text-red-500"><Trash2 size={14}/></button>
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-600 uppercase font-black italic">{n.message}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* NOTIFICATION FORGE MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[110] bg-black/95 flex items-end lg:items-center justify-center p-0 lg:p-8 backdrop-blur-3xl animate-in slide-in-from-bottom lg:fade-in">
                    <div className="bg-[#020617] border-t lg:border border-white/10 rounded-t-[40px] lg:rounded-[64px] w-full max-w-6xl h-[94vh] lg:h-auto lg:max-h-[90vh] flex flex-col lg:flex-row overflow-hidden shadow-2xl relative">
                        
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 lg:top-8 lg:right-8 z-[120] p-3 lg:p-4 bg-white/5 rounded-2xl hover:bg-red-600 transition-all active:scale-90">
                            <X size={20} />
                        </button>

                        <div className="flex-1 flex flex-col h-full overflow-hidden">
                            <div className="p-8 lg:p-12 pb-4 lg:pb-0 space-y-8">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-[20px] flex items-center justify-center shadow-xl rotate-3">
                                        <Bell size={24} className="text-white"/>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl lg:text-3xl font-black uppercase italic tracking-tighter">Inbox <span className="text-blue-500">Forge</span></h3>
                                        <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.4em] mt-1 italic">V3.5 NOTIFIER</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-8 no-scrollbar pb-32 lg:pb-12">
                                <form onSubmit={handleSend} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-700 uppercase tracking-widest ml-4 italic">BİLDİRİM TİPİ</label>
                                            <div className="flex gap-2">
                                                {['system', 'payment', 'security', 'bot'].map(t => (
                                                    <button key={t} type="button" onClick={()=>setNewNote({...newNote, type: t})} className={`flex-1 py-4 rounded-2xl text-[8px] font-black uppercase tracking-widest transition-all ${newNote.type === t ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40' : 'bg-slate-950 text-slate-600 border border-white/5'}`}>{t}</button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-700 uppercase tracking-widest ml-4 italic">HEDEF KİTLE</label>
                                            <div className="flex gap-2">
                                                {['global', 'user'].map(t => (
                                                    <button key={t} type="button" onClick={()=>setNewNote({...newNote, target_type: t})} className={`flex-1 py-4 rounded-2xl text-[8px] font-black uppercase tracking-widest transition-all ${newNote.target_type === t ? 'bg-white text-black shadow-xl' : 'bg-slate-950 text-slate-600 border border-white/5'}`}>{t === 'global' ? 'HERKESE' : 'SPESİFİK'}</button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {newNote.target_type === 'user' && (
                                        <AdminInput label="HEDEF KULLANICI ID" value={newNote.user_id} onChange={(v:any)=>setNewNote({...newNote, user_id:v})} />
                                    )}

                                    <AdminInput label="BİLDİRİM BAŞLIĞI" value={newNote.title} onChange={(v:any)=>setNewNote({...newNote, title:v})} />
                                    
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-700 uppercase tracking-widest ml-4 italic">BİLDİRİM MESAJI</label>
                                        <textarea value={newNote.message} onChange={e => setNewNote({...newNote, message: e.target.value})} className="w-full bg-slate-950 border border-white/5 p-8 rounded-[36px] lg:rounded-[44px] text-[11px] font-black h-32 lg:h-40 outline-none text-slate-400 focus:border-blue-500/30 uppercase italic leading-relaxed shadow-inner" />
                                    </div>

                                    <div className="fixed lg:relative bottom-0 left-0 right-0 p-6 lg:p-0 bg-gradient-to-t from-[#020617] lg:from-transparent via-[#020617]/90 lg:via-transparent to-transparent z-[130]">
                                        <button type="submit" className="w-full h-16 lg:h-24 bg-blue-600 text-white rounded-2xl lg:rounded-[32px] font-black text-[12px] uppercase tracking-[0.4em] shadow-2xl shadow-blue-900/40 transition-all border-b-8 border-blue-800 active:translate-y-1 active:border-b-4 flex items-center justify-center gap-4">
                                            <Send size={20} /> BİLDİRİMİ TETİKLE
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* RIGHT: LIVE HOLOGRAPHIC INBOX SIMULATOR */}
                        <div className="hidden lg:flex w-[480px] bg-slate-950/40 border-l border-white/5 p-12 flex-col items-center justify-center bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent">
                            <div className="text-center mb-16 space-y-3">
                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.6em] italic block">INBOX SYNC</span>
                                <h4 className="text-xl font-black text-white italic tracking-widest opacity-20 uppercase">Simulator</h4>
                            </div>

                            <div className="w-full max-w-[340px] perspective-1000 group">
                                <div className="bg-slate-900/80 border border-white/10 rounded-[56px] p-8 shadow-[0_50px_100px_rgba(0,0,0,0.5)] transition-all duration-700 hover:rotate-1 hover:scale-105 backdrop-blur-md relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.8)]"></div>
                                    <div className="flex gap-5 mb-6 relative z-10">
                                        <div className="w-14 h-14 bg-slate-950 rounded-2xl border border-white/5 flex items-center justify-center text-blue-500 shadow-inner">
                                            {newNote.type === 'payment' ? <Wallet size={24}/> : <Bell size={24}/>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h5 className="text-sm font-black text-white italic uppercase tracking-tighter truncate leading-none">{newNote.title || 'Bildirim Başlığı'}</h5>
                                                <span className="text-[8px] text-slate-600 font-bold uppercase mt-1">NOW</span>
                                            </div>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase italic leading-relaxed line-clamp-2">{newNote.message || 'Bildirim içeriği burada görünecek...'}</p>
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-white/5 flex justify-between items-center relative z-10">
                                        <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">{newNote.type} LOG</span>
                                        <div className="flex gap-1">
                                            <div className="w-1 h-1 rounded-full bg-blue-600"></div>
                                            <div className="w-1 h-1 rounded-full bg-slate-800"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const PromotionManagement = () => {
    const [promos, setPromos] = useState<Promotion[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPromo, setEditingPromo] = useState<any>(null);
    const load = useCallback(async () => setPromos(await DatabaseService.getPromotions()), []);
    useEffect(() => { load(); }, [load]);
    return (
        <div className="space-y-8 animate-in fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6"><h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">Promo <span className="text-blue-500">Engine</span></h2><button onClick={() => { setEditingPromo({ title: '', content: '', status: 'pending', button_text: 'İncele', processed_channels: [] }); setIsModalOpen(true); }} className="w-full sm:w-auto bg-emerald-600 px-8 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95">YENİ YAYIN</button></div>
            <div className="grid grid-cols-1 gap-6">
                {promos.map(p => (
                    <div key={p.id} className="bg-slate-900/40 border border-white/5 rounded-[40px] p-6 lg:p-10 flex flex-col md:flex-row items-center gap-8 group shadow-2xl relative overflow-hidden">
                        <div className="flex-1 text-center md:text-left"><h4 className="text-xl lg:text-2xl font-black italic uppercase mb-4 truncate">{p.title}</h4></div>
                        <div className="flex w-full md:w-auto gap-2">
                            <button onClick={async () => { await DatabaseService.updatePromotionStatus(p.id, p.status === 'sending' ? 'pending' : 'sending'); load(); }} className={`flex-1 md:flex-none px-6 py-4 rounded-xl text-[9px] font-black uppercase tracking-widest ${p.status === 'sending' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 'bg-emerald-600 text-white'}`}>{p.status === 'sending' ? 'DURDUR' : 'BAŞLAT'}</button>
                            <button onClick={async () => { if(confirm('Silsin mi?')) { await DatabaseService.deletePromotion(p.id); load(); } }} className="p-4 bg-white/5 rounded-xl text-red-500 hover:bg-red-600 hover:text-white transition-all"><Trash2 size={18}/></button>
                        </div>
                    </div>
                ))}
            </div>
            {isModalOpen && editingPromo && (
                <div className="fixed inset-0 z-[110] bg-black/98 flex items-end lg:items-center justify-center p-0 lg:p-8 backdrop-blur-3xl animate-in slide-in-from-bottom">
                    <div className="bg-[#020617] p-8 lg:p-16 rounded-t-[40px] lg:rounded-[64px] w-full max-w-3xl border-t lg:border border-white/10 shadow-2xl relative h-[90vh] lg:h-auto overflow-y-auto no-scrollbar pb-24">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 p-4 bg-white/5 rounded-2xl hover:bg-red-600 transition-all active:scale-90"><X size={20}/></button>
                        <h3 className="text-2xl lg:text-3xl font-black mb-10 uppercase italic tracking-tighter">Yayın <span className="text-emerald-500">Forge</span></h3>
                        <form onSubmit={async (e) => { e.preventDefault(); await DatabaseService.savePromotion(editingPromo); setIsModalOpen(false); load(); }} className="space-y-6">
                            <AdminInput label="BAŞLIK" value={editingPromo.title} onChange={(v:any)=>setEditingPromo({...editingPromo, title:v})}/><AdminInput label="İÇERİK" value={editingPromo.content} onChange={(v:any)=>setEditingPromo({...editingPromo, content:v})}/><button type="submit" className="w-full h-16 lg:h-20 bg-emerald-600 py-6 rounded-[28px] lg:rounded-[32px] font-black text-[11px] uppercase tracking-widest shadow-2xl active:scale-95 border-b-4 border-emerald-800">ŞİMDİ YAYINLA</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;

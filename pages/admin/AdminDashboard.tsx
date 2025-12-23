
import React, { useEffect, useState } from 'react';
import * as Router from 'react-router-dom';
import { 
  LayoutDashboard, Users, Bot, LogOut, Menu, X, 
  Loader2, RefreshCw, Plus, Trash2, 
  Megaphone, Settings as SettingsIcon, 
  ShieldCheck, Globe, Send, Activity, 
  Wallet, ShieldAlert, Cpu, Ban, CheckCircle, 
  Search, Database, Hash, Wand2, Image as ImageIcon, History,
  Mail, BellRing, Sparkles, Eye, Zap, RefreshCcw, Star, Calendar, MessageSquare, ExternalLink, Layers, PlusCircle, Link2,
  Fingerprint, Info
} from 'lucide-react';
import { DatabaseService, supabase } from '../../services/DatabaseService';
import { User, Bot as BotType, Announcement, Notification, Channel, ActivityLog } from '../../types';

const { useNavigate, Routes, Route, Link, useLocation } = Router as any;

const CATEGORY_NAMES: Record<string, string> = {
    'productivity': 'Üretkenlik',
    'games': 'Eğlence & Oyun',
    'utilities': 'Araçlar & Servisler',
    'finance': 'Finans & Ekonomi',
    'music': 'Müzik & Ses',
    'moderation': 'Grup Yönetimi'
};

/**
 * CANLI TELEGRAM GÖRSELİ:
 * Veritabanındaki icon linkine bakmaz, her zaman o anki kullanıcı adından çeker.
 */
const getLiveBotIcon = (bot: Partial<BotType>) => {
    if (bot.bot_link) {
        const username = bot.bot_link.replace('@', '').replace('https://t.me/', '').trim();
        if (username) return `https://t.me/i/userpic/320/${username}.jpg`;
    }
    // Eğer kullanıcı adı yoksa isimden avatar üret
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(bot.name || 'Bot')}&background=1e293b&color=fff&bold=true`;
};

const StatCard = ({ label, value, icon: Icon, color }: any) => {
  const colors: any = {
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    orange: 'text-orange-500 bg-orange-500/10 border-orange-500/20'
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg border ${colors[color]}`}>
          <Icon size={20} />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
          <p className="text-2xl font-black text-white">{value}</p>
        </div>
      </div>
    </div>
  );
};

const LogItem = ({ log }: { log: any }) => {
  const getLogStyle = (type: string) => {
    switch(type) {
        case 'auth': return { icon: Hash, color: 'text-blue-400', bg: 'bg-blue-400/10' };
        case 'bot_manage': return { icon: Bot, color: 'text-purple-400', bg: 'bg-purple-400/10' };
        case 'channel_sync': return { icon: RefreshCcw, color: 'text-emerald-400', bg: 'bg-emerald-400/10' };
        case 'payment': return { icon: Wallet, color: 'text-yellow-400', bg: 'bg-yellow-400/10' };
        case 'security': return { icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-400/10' };
        default: return { icon: Activity, color: 'text-slate-400', bg: 'bg-slate-400/10' };
    }
  };

  const style = getLogStyle(log.type);
  const Icon = style.icon;
  const logUser = log.users;

  return (
    <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl mb-3 hover:border-slate-700 transition-all group overflow-hidden">
      <div className="flex justify-between items-start mb-2 relative z-10">
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${style.bg} ${style.color} group-hover:scale-110 transition-transform`}>
                <Icon size={16} />
            </div>
            <div>
                <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white leading-none">{log.title}</p>
                    {logUser && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-950 border border-slate-800 rounded-md">
                            <span className="text-[9px] font-black text-blue-400 italic">@{logUser.username}</span>
                        </div>
                    )}
                </div>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tight mt-1">{log.type}</p>
            </div>
        </div>
        <div className="text-right">
            <p className="text-[10px] text-slate-600 font-bold italic leading-none">{new Date(log.created_at).toLocaleTimeString('tr-TR')}</p>
        </div>
      </div>
      <p className="text-xs text-slate-400 mb-1 ml-11 leading-relaxed border-l-2 border-slate-800 pl-3 py-0.5">{log.description}</p>
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
    const active = location.pathname === to;
    return (
      <Link 
        to={to} 
        onClick={() => setSidebarOpen(false)}
        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}
      >
        <Icon size={18} />
        <span className="font-bold text-xs uppercase tracking-widest">{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[#020617] flex text-slate-200 font-sans overflow-hidden">
      <aside className={`fixed inset-y-0 left-0 z-[70] w-64 bg-slate-900 border-r border-slate-800 transition-transform lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="p-2 bg-blue-600 rounded-lg shadow-lg rotate-3"><Database size={20} className="text-white"/></div>
            <h2 className="text-lg font-black text-white italic tracking-tighter uppercase">BotlyHub <span className="text-blue-500">Adm</span></h2>
          </div>
          <nav className="flex-1 space-y-1">
            <NavItem to="/a/dashboard" icon={LayoutDashboard} label="Genel Bakış" />
            <NavItem to="/a/dashboard/sales" icon={Wallet} label="Kütüphaneler" />
            <NavItem to="/a/dashboard/users" icon={Users} label="Üyeler" />
            <NavItem to="/a/dashboard/bots" icon={Bot} label="Market" />
            <NavItem to="/a/dashboard/notifications" icon={BellRing} label="Duyurular" />
            <NavItem to="/a/dashboard/settings" icon={SettingsIcon} label="Ayarlar" />
          </nav>
          <button onClick={() => { DatabaseService.logoutAdmin(); navigate('/a/admin'); }} className="mt-auto flex items-center gap-3 px-4 py-3 text-red-500 font-bold text-xs uppercase hover:bg-red-500/10 rounded-xl transition-all">
            <LogOut size={18} /> Güvenli Çıkış
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-950/50 backdrop-blur-md shrink-0 z-50">
           <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 bg-slate-900 rounded-lg text-slate-400"><Menu size={20}/></button>
           <div className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-4">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
              Sistem Durumu: Çevrimiçi
           </div>
           <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white shadow-lg italic border border-white/10">A</div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8 no-scrollbar bg-[#020617]">
          <div className="max-w-[1400px] mx-auto pb-20">
            <Routes>
              <Route path="/" element={<HomeView />} />
              <Route path="/sales" element={<SalesManagement />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/bots" element={<BotManagement />} />
              <Route path="/notifications" element={<NotificationCenter />} />
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
    const [combinedLogs, setCombinedLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => { load(); }, []);

    const load = async () => {
        setIsLoading(true);
        try {
            const statData = await DatabaseService.getAdminStats();
            setStats(statData);
            const { data: logs } = await supabase.from('activity_logs').select('*, users(username, avatar)').order('created_at', { ascending: false }).limit(10);
            setCombinedLogs(logs || []);
        } catch (e) { console.error(e); } finally { setIsLoading(false); }
    };

    return (
        <div className="animate-in fade-in space-y-8">
            <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter">Komuta <span className="text-blue-500">Paneli</span></h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Platform Üyesi" value={stats.userCount} icon={Users} color="blue" />
                <StatCard label="Aktif Botlar" value={stats.botCount} icon={Bot} color="purple" />
                <StatCard label="Kütüphane Kaydı" value={stats.salesCount} icon={Wallet} color="emerald" />
                <StatCard label="Denetim Kaydı" value={stats.logCount} icon={Activity} color="orange" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2 relative z-10"><ShieldCheck size={16} className="text-blue-500" /> Audit Log (Son İşlemler)</h3>
                <div className="space-y-1 relative z-10">
                    {isLoading ? <div className="py-20 text-center text-slate-700 animate-pulse font-bold uppercase text-xs">Yükleniyor...</div> : 
                    combinedLogs.map(log => <LogItem key={log.id} log={log} />)}
                </div>
            </div>
        </div>
    );
};

const SalesManagement = () => {
    const [sales, setSales] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => { load(); }, []);
    const load = async () => { setIsLoading(true); setSales(await DatabaseService.getAllPurchases()); setIsLoading(false); };
    return (
        <div className="animate-in fade-in space-y-6">
            <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Envanter Hareketleri</h2>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/50 border-b border-slate-800 text-slate-600 font-bold uppercase">
                        <tr><th className="px-6 py-5">Üye</th><th className="px-6 py-5">Bot</th><th className="px-6 py-5 text-right">Tarih</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {sales.map((s, idx) => (
                            <tr key={idx} className="hover:bg-slate-800/20 transition-colors"><td className="px-6 py-5">@{s.users?.username}</td><td className="px-6 py-5 font-bold">{s.bots?.name}</td><td className="px-6 py-5 text-right">{new Date(s.acquired_at).toLocaleDateString()}</td></tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- MARKET YÖNETİMİ ---

const BotManagement = () => {
    const [bots, setBots] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBot, setEditingBot] = useState<Partial<BotType> | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => { load(); }, []);
    const load = async () => { setBots(await DatabaseService.getBotsWithStats()); };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBot?.id) return alert("Bot ID gereklidir.");
        
        setIsLoading(true);
        try {
            await DatabaseService.saveBot(editingBot!);
            setIsModalOpen(false);
            load();
            alert("Sistem başarıyla güncellendi!");
        } catch (err: any) {
            console.error("Bot kaydetme hatası:", err);
            alert("Kayıt başarısız! Veritabanı sütunlarıyla eşleşmeyen bir veri gönderiliyor olabilir. Detay: " + (err.message || 'Supabase Connection Error'));
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Kullanıcı adı değiştiğinde önizleme görselini canlı güncelle
     */
    const handleTelegramUsernameChange = (val: string) => {
        const username = val.replace('@', '').trim();
        const tgLink = username ? `@${username}` : '';
        setEditingBot(prev => ({ 
            ...prev, 
            bot_link: tgLink 
        }));
    };

    const addScreenshot = () => {
        const screens = [...(editingBot?.screenshots || [])];
        screens.push("");
        setEditingBot({ ...editingBot, screenshots: screens });
    };

    const updateScreenshot = (index: number, val: string) => {
        const screens = [...(editingBot?.screenshots || [])];
        screens[index] = val;
        setEditingBot({ ...editingBot, screenshots: screens });
    };

    const removeScreenshot = (index: number) => {
        const screens = (editingBot?.screenshots || []).filter((_, i) => i !== index);
        setEditingBot({ ...editingBot, screenshots: screens });
    };

    return (
        <div className="animate-in fade-in space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Market Yönetimi</h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 italic">Bot mülkiyetlerini ve canlı görselleri yönetin.</p>
                </div>
                <button onClick={() => { setEditingBot({ id: 'bot_' + Math.random().toString(36).substr(2, 5), name: '', description: '', price: 0, category: 'productivity', bot_link: '', screenshots: [] }); setIsModalOpen(true); }} className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-500 rounded-2xl text-xs font-black text-white flex items-center justify-center gap-3 shadow-xl shadow-blue-900/20 active:scale-95 transition-all">
                    <Plus size={18}/> YENİ BOT OLUŞTUR
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {bots.map(b => (
                    <div key={b.id} className="bg-slate-900 border border-slate-800 p-6 rounded-[32px] hover:border-slate-700 transition-all shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 flex flex-col items-end gap-1">
                            <span className={`text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-tighter ${b.price > 0 ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                                {b.price > 0 ? 'PREMIUM' : 'ÜCRETSİZ'}
                            </span>
                            <span className="text-[8px] font-bold text-slate-600 tracking-tighter uppercase">ID: {b.id}</span>
                        </div>
                        <div className="flex gap-5 mb-6">
                            <img src={getLiveBotIcon(b)} className="w-16 h-16 rounded-[22px] object-cover bg-slate-800 border-2 border-slate-800 group-hover:scale-105 transition-transform shadow-lg" />
                            <div className="min-w-0 flex-1">
                                <h4 className="font-black text-white text-base truncate italic uppercase tracking-tighter">{b.name}</h4>
                                <p className="text-[10px] text-blue-500 font-black mt-1 uppercase tracking-widest">{b.price} STARS</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <Users size={12} className="text-slate-600" />
                                    <span className="text-[10px] text-slate-500 font-bold">{b.ownerCount} Sahip</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => { setEditingBot(b); setIsModalOpen(true); }} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-black text-[10px] rounded-xl uppercase tracking-widest transition-all">DÜZENLE</button>
                            <button onClick={async () => { if(confirm("Bu botu silmek istediğine emin misin?")) { await DatabaseService.deleteBot(b.id); load(); } }} className="p-3 bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white rounded-xl transition-all"><Trash2 size={16}/></button>
                        </div>
                    </div>
                ))}
            </div>

            {/* BOT MODAL */}
            {isModalOpen && editingBot && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-6 bg-black/95 backdrop-blur-md animate-in fade-in overflow-y-auto">
                    <div className="bg-[#020617] w-full max-w-6xl my-auto rounded-[32px] lg:rounded-[48px] border border-slate-800 overflow-hidden flex flex-col shadow-2xl max-h-[95vh] relative">
                        
                        <div className="p-6 lg:p-10 border-b border-slate-800 flex justify-between items-center bg-slate-900/30 shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-600 rounded-2xl shadow-lg"><Bot className="text-white" size={28}/></div>
                                <div>
                                    <h3 className="text-xl lg:text-2xl font-black text-white uppercase italic tracking-tighter">Bot Yapılandırma</h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest hidden sm:block">Sistem mülkiyet ve görsel ayarları.</p>
                                </div>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-800 text-slate-400 hover:text-white rounded-2xl transition-all"><X size={24}/></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 lg:p-12 no-scrollbar">
                            <form id="bot-form" onSubmit={handleSave} className="flex flex-col lg:grid lg:grid-cols-12 gap-10 lg:gap-16">
                                
                                <div className="lg:col-span-7 space-y-10">
                                    <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-[32px] space-y-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                                <Fingerprint size={12} className="text-blue-500"/> Bot Benzersiz ID (Veritabanı Kimliği)
                                            </label>
                                            <input required type="text" value={editingBot.id} onChange={e => setEditingBot({...editingBot, id: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono font-bold text-blue-500 outline-none focus:border-blue-500 bg-blue-500/5 transition-all" placeholder="bot_id_unique" />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Bot Görünen Adı</label>
                                                <input required type="text" value={editingBot.name} onChange={e => setEditingBot({...editingBot, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all" placeholder="Örn: Mod Manager" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex justify-between">
                                                    <span>Telegram Kullanıcı Adı</span>
                                                    <span className="text-emerald-500 text-[8px] animate-pulse">CANLI SYNC AKTİF</span>
                                                </label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 font-black text-sm">@</span>
                                                    <input required type="text" value={editingBot.bot_link?.replace('@','')} onChange={e => handleTelegramUsernameChange(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 pl-10 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all" placeholder="bot_username" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Kategori</label>
                                                <select value={editingBot.category} onChange={e => setEditingBot({...editingBot, category: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all appearance-none">
                                                    {Object.entries(CATEGORY_NAMES).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Fiyat (Stars)</label>
                                                <input required type="number" value={editingBot.price} onChange={e => setEditingBot({...editingBot, price: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all" placeholder="0 = Ücretsiz" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Market Tanıtım Yazısı</label>
                                        <textarea required value={editingBot.description} onChange={e => setEditingBot({...editingBot, description: e.target.value})} className="w-full h-40 bg-slate-900/40 border border-slate-800 rounded-[32px] p-6 text-sm font-medium text-slate-300 outline-none focus:border-blue-500 resize-none leading-relaxed transition-all" placeholder="Bot özellikleri ve kullanımı..." />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center px-1">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Ekran Görüntüsü Galerisi</label>
                                            <button type="button" onClick={addScreenshot} className="text-[10px] font-black text-blue-500 uppercase flex items-center gap-1">
                                                <PlusCircle size={14}/> YENİ EKLE
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            {(editingBot.screenshots || []).map((s, idx) => (
                                                <div key={idx} className="flex gap-3">
                                                    <input type="text" value={s} onChange={e => updateScreenshot(idx, e.target.value)} className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-5 text-xs font-medium text-white outline-none focus:border-blue-500" placeholder="https://resim-url.com" />
                                                    <button type="button" onClick={() => removeScreenshot(idx)} className="p-4 bg-red-600/10 text-red-500 rounded-2xl hover:bg-red-600 hover:text-white transition-all"><Trash2 size={18}/></button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* ÖNİZLEME */}
                                <div className="lg:col-span-5 space-y-8">
                                    <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-[48px] shadow-2xl space-y-8 lg:sticky lg:top-10 text-center">
                                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 flex items-center justify-center gap-2">
                                            <Eye size={18} className="text-blue-500" /> MARKET ÖNİZLEME
                                        </h3>
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-blue-500/10 blur-[50px] rounded-full opacity-40"></div>
                                            <img 
                                                src={getLiveBotIcon(editingBot)} 
                                                className="w-32 h-32 rounded-[40px] border-4 border-slate-800 shadow-2xl object-cover bg-slate-950 mx-auto mb-6 relative z-10" 
                                                onError={(e) => { (e.target as any).src = `https://ui-avatars.com/api/?name=${editingBot.name || 'Bot'}&background=1e293b&color=fff&bold=true`; }}
                                            />
                                        </div>
                                        <h4 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-2">{editingBot.name || 'Bot Adı'}</h4>
                                        <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest">{editingBot.price} STARS</p>
                                        
                                        <div className="pt-8 border-t border-slate-800 text-left">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Galeri Önizleme</p>
                                            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                                                {(editingBot.screenshots || []).map((s, i) => (
                                                    s && <img key={i} src={s} className="w-24 h-40 rounded-2xl object-cover border border-slate-800 bg-slate-950 shrink-0" onError={(e) => { (e.target as any).style.display = 'none'; }} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-8 lg:p-10 border-t border-slate-800 bg-slate-900/50 backdrop-blur-xl flex flex-col sm:flex-row justify-end gap-4 shrink-0">
                            <button onClick={() => setIsModalOpen(false)} className="px-10 py-5 text-slate-500 font-black text-[11px] uppercase tracking-widest hover:bg-slate-800 rounded-[20px] transition-all">İptal</button>
                            <button form="bot-form" type="submit" disabled={isLoading} className="px-12 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-[20px] text-[11px] uppercase tracking-[0.4em] shadow-2xl shadow-blue-900/30 active:scale-95 transition-all flex items-center justify-center gap-4">
                                {isLoading ? <Loader2 className="animate-spin" size={20}/> : <><ShieldCheck size={20} /> Kayıt Et ve Yayınla</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const UserManagement = () => {
    const [users, setUsers] = useState<User[]>([]);
    useEffect(() => { load(); }, []);
    const load = async () => { setUsers(await DatabaseService.getUsers()); };
    return (
        <div className="animate-in fade-in space-y-6">
            <h2 className="text-xl font-black text-white uppercase italic">Platform Üyeleri</h2>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[600px]">
                    <thead className="bg-slate-950/50 border-b border-slate-800 text-slate-600 font-bold uppercase">
                        <tr><th className="px-6 py-5">Üye</th><th className="px-6 py-5">Durum</th><th className="px-6 py-5 text-right">Aksiyon</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-slate-800/20 transition-all">
                                <td className="px-6 py-5 flex items-center gap-3"><img src={u.avatar} className="w-8 h-8 rounded-lg" /> <div><p className="font-bold">@{u.username}</p><p className="text-[10px] text-slate-500">{u.id}</p></div></td>
                                <td className="px-6 py-5"><span className="text-emerald-500 font-black px-2 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20">{u.status}</span></td>
                                <td className="px-6 py-5 text-right"><button onClick={async () => { await DatabaseService.updateUserStatus(u.id, u.status === 'Active' ? 'Passive' : 'Active'); load(); }} className="p-2 bg-slate-800 rounded-xl hover:bg-red-500/20 hover:text-red-500 transition-all"><Ban size={16}/></button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const NotificationCenter = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState({ title: '', message: '', type: 'system' as any });
    const [recentNotes, setRecentNotes] = useState<Notification[]>([]);

    useEffect(() => { loadRecentNotes(); }, []);

    const loadRecentNotes = async () => {
        const { data } = await supabase.from('notifications').select('*').eq('target_type', 'global').order('date', { ascending: false }).limit(5);
        setRecentNotes(data || []);
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await DatabaseService.sendNotification({ ...form, target_type: 'global' });
            setForm({ title: '', message: '', type: 'system' });
            loadRecentNotes();
            alert("Duyuru başarıyla gönderildi!");
        } catch (e: any) {
            console.error("Gönderim Hatası:", e);
        } finally {
            setIsLoading(false);
        }
    };

    const categories = [
        { id: 'system', label: 'Duyuru', icon: BellRing, color: 'text-blue-400' },
        { id: 'payment', label: 'Kampanya', icon: Zap, color: 'text-yellow-400' },
        { id: 'security', label: 'Güvenlik', icon: ShieldAlert, color: 'text-red-400' },
        { id: 'bot', label: 'Güncelleme', icon: RefreshCcw, color: 'text-emerald-400' }
    ];

    const getIcon = (type: string) => categories.find(c => c.id === type)?.icon || BellRing;

    return (
        <div className="animate-in fade-in space-y-8">
            <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Yayın Merkezi</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[32px] shadow-2xl">
                    <form onSubmit={handleSend} className="space-y-6">
                        <div className="grid grid-cols-2 gap-3">
                            {categories.map(cat => (
                                <button key={cat.id} type="button" onClick={() => setForm({...form, type: cat.id as any})}
                                    className={`p-4 rounded-2xl border transition-all flex items-center gap-3 text-left ${form.type === cat.id ? 'bg-blue-600/10 border-blue-600/50 text-white shadow-lg' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'}`}>
                                    <cat.icon size={18} className={form.type === cat.id ? cat.color : ''} />
                                    <span className="text-[10px] font-black uppercase tracking-tight">{cat.label}</span>
                                </button>
                            ))}
                        </div>
                        <input required type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-bold text-white outline-none focus:border-blue-500" placeholder="Yayın Başlığı" />
                        <textarea required value={form.message} onChange={e => setForm({...form, message: e.target.value})} className="w-full h-40 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-medium text-slate-300 outline-none focus:border-blue-500 resize-none leading-relaxed" placeholder="Yayın içeriği..." />
                        <button type="submit" disabled={isLoading} className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.4em] shadow-xl transition-all flex items-center justify-center gap-3">
                            {isLoading ? <Loader2 className="animate-spin" size={20}/> : <><Send size={18} /> YAYINI GÖNDER</>}
                        </button>
                    </form>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[32px] shadow-xl flex flex-col">
                    <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-3"><History size={16} className="text-blue-400" /> Son Duyurular</h3>
                    <div className="space-y-4 overflow-y-auto max-h-[500px] no-scrollbar pr-2">
                        {recentNotes.map((note) => {
                            const Icon = getIcon(note.type);
                            return (
                                <div key={note.id} className="bg-slate-950 border border-slate-800/50 rounded-2xl p-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800"><Icon size={18} className="text-blue-400" /></div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-1">
                                                <h4 className="text-[11px] font-black text-white truncate uppercase tracking-tight">{note.title}</h4>
                                                <span className="text-[9px] text-slate-600 font-bold">{new Date(note.date).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-[10px] text-slate-500 font-medium line-clamp-2 leading-relaxed">{note.message}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

const SettingsManagement = () => {
    const [settings, setSettings] = useState({ appName: 'BotlyHub V3', maintenanceMode: false });
    useEffect(() => { DatabaseService.getSettings().then(data => { if (data) setSettings({ appName: data.appName, maintenanceMode: data.MaintenanceMode }); }); }, []);
    const handleSave = async () => { await DatabaseService.saveSettings(settings); alert("Sistem ayarları güncellendi."); };
    return (
        <div className="animate-in fade-in space-y-6">
            <h2 className="text-xl font-black text-white uppercase italic">Sistem Yapılandırması</h2>
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md shadow-2xl space-y-6">
                <input type="text" value={settings.appName} onChange={e => setSettings({...settings, appName: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-white outline-none focus:border-blue-500" />
                <button onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})} className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${settings.maintenanceMode ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'}`}>BAKIM MODU: {settings.maintenanceMode ? 'AÇIK' : 'KAPALI'}</button>
                <button onClick={handleSave} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-[10px] uppercase tracking-widest shadow-xl transition-all">Yapılandırmayı Kaydet</button>
            </div>
        </div>
    );
}

export default AdminDashboard;

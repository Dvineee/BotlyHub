
import React, { useEffect, useState, useCallback } from 'react';
import * as Router from 'react-router-dom';
import { 
  LayoutDashboard, Users, Bot, LogOut, Menu, X, 
  Loader2, Plus, Trash2, Megaphone, Send, Activity, 
  Wallet, Search, Database, Radio, Bell, Edit3, Image as ImageIcon,
  CheckCircle2, AlertTriangle, TrendingUp, BarChart3, RadioIcon, Sparkles, UserPlus,
  ShieldCheck, Globe, Zap, Clock, ExternalLink, Filter, PieChart, Layers, 
  Settings as SettingsIcon, History, Copy, Check, Eye, ChevronRight, Monitor, Smartphone, Cpu,
  Info, Star, Play, Pause, ListChecks, RefreshCw
} from 'lucide-react';
import { DatabaseService } from '../../services/DatabaseService';
import { Promotion, User, Bot as BotType } from '../../types';

const { useNavigate, Routes, Route, Link, useLocation } = Router as any;

/**
 * AdminInput: Panel genelinde kullanılan giriş bileşeni
 */
const AdminInput = ({ label, value, onChange, type = "text", placeholder = "" }: any) => (
  <div className="space-y-2">
    <label className="text-[9px] font-black text-slate-700 uppercase tracking-widest ml-4 italic">{label}</label>
    <input 
      type={type} 
      value={value} 
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)} 
      className="w-full h-18 bg-slate-950 border border-white/5 px-8 rounded-[28px] lg:rounded-[36px] text-[11px] font-black outline-none text-slate-200 focus:border-emerald-500/30 uppercase italic tracking-widest shadow-inner transition-all" 
    />
  </div>
);

/**
 * HomeView: Dashboard İstatistikleri
 */
const HomeView = () => (
  <div className="space-y-12 animate-in fade-in">
    <div>
        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">Sistem <span className="text-blue-500">Özeti</span></h2>
        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mt-2 italic">Global platform anlık metrikleri</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        { label: 'Toplam Kullanıcı', value: '1,284', icon: Users, color: 'text-blue-500' },
        { label: 'Aktif Botlar', value: '42', icon: Bot, color: 'text-emerald-500' },
        { label: 'Günlük Gelir', value: '₺2,450', icon: Wallet, color: 'text-purple-500' },
        { label: 'Yayındaki Reklam', value: '8', icon: Megaphone, color: 'text-orange-500' },
      ].map((stat, i) => (
        <div key={i} className="bg-slate-900/40 border border-white/5 p-8 rounded-[40px] flex items-center gap-6 shadow-xl backdrop-blur-sm transition-all hover:scale-[1.02]">
          <div className={`p-4 bg-slate-950 rounded-2xl ${stat.color} border border-white/5 shadow-inner`}><stat.icon size={24} /></div>
          <div>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-white italic tracking-tighter leading-none">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-900/40 border border-white/5 rounded-[44px] p-10 h-80 flex items-center justify-center">
            <div className="text-center opacity-20">
                <BarChart3 size={64} className="mx-auto mb-4 text-slate-600" />
                <p className="text-xs font-black uppercase tracking-widest">İstatistik Grafiği Hazırlanıyor</p>
            </div>
        </div>
        <div className="bg-slate-900/40 border border-white/5 rounded-[44px] p-10 h-80 flex flex-col">
            <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-6 border-b border-white/5 pb-4 italic">Son Aktiviteler</h4>
            <div className="flex-1 space-y-6 overflow-y-auto no-scrollbar">
                {[1,2,3,4].map(i => (
                    <div key={i} className="flex gap-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1"></div>
                        <div>
                            <p className="text-[10px] font-black text-slate-300 uppercase italic">Sistem Kaydı #00{i}</p>
                            <p className="text-[8px] text-slate-600 font-bold">Birkaç dakika önce</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  </div>
);

/**
 * UserManagement: Kullanıcı Listesi
 */
const UserManagement = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await DatabaseService.getUsers();
                setUsers(data);
            } catch (e) { console.error(e); }
            setIsLoading(false);
        };
        fetchUsers();
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in">
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Kullanıcı <span className="text-blue-500">Yönetimi</span></h2>
            {isLoading ? (
                <div className="flex justify-center py-24"><Loader2 className="animate-spin text-blue-500" /></div>
            ) : (
                <div className="bg-slate-900/40 border border-white/5 rounded-[44px] overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 border-b border-white/5">
                            <tr className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                                <th className="px-8 py-6">Kullanıcı</th>
                                <th className="px-8 py-6">Durum</th>
                                <th className="px-8 py-6">Katılım</th>
                                <th className="px-8 py-6 text-right">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {users.map(u => (
                                <tr key={u.id} className="group hover:bg-white/5 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <img src={u.avatar} className="w-10 h-10 rounded-xl bg-slate-950 object-cover" />
                                            <div>
                                                <p className="text-xs font-black text-white italic uppercase tracking-tight">{u.name}</p>
                                                <p className="text-[10px] text-slate-500">@{u.username}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase ${u.status === 'Active' ? 'text-emerald-500 bg-emerald-500/10' : 'text-red-500 bg-red-500/10'}`}>
                                            {u.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-[10px] text-slate-400 font-bold">{new Date(u.joinDate).toLocaleDateString()}</td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="p-2 text-slate-500 hover:text-white"><SettingsIcon size={16}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

/**
 * BotManagement: Mağaza Bot Yönetimi
 */
const BotManagement = () => {
    const [bots, setBots] = useState<BotType[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const load = async () => {
        setIsLoading(true);
        const data = await DatabaseService.getBots();
        setBots(data);
        setIsLoading(false);
    };

    useEffect(() => { load(); }, []);

    return (
        <div className="space-y-12 animate-in fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Bot <span className="text-emerald-500">Kataloğu</span></h2>
                <button onClick={() => alert('Yakalama')} className="bg-blue-600 hover:bg-blue-500 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                    <Plus size={16} /> YENİ BOT EKLE
                </button>
            </div>
            {isLoading ? (
                <div className="flex justify-center py-24"><Loader2 className="animate-spin text-emerald-500" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bots.map(bot => (
                        <div key={bot.id} className="bg-slate-900/40 border border-white/5 p-8 rounded-[40px] flex flex-col gap-6 group hover:border-blue-500/30 transition-all">
                            <div className="flex items-start justify-between">
                                <img src={bot.icon} className="w-16 h-16 rounded-[24px] object-cover bg-slate-950 shadow-xl" />
                                <div className="text-right">
                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{bot.category}</p>
                                    <p className="text-lg font-black text-white italic">₺{bot.price}</p>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-lg font-black text-white uppercase italic tracking-tighter mb-1">{bot.name}</h4>
                                <p className="text-[10px] text-slate-500 line-clamp-2 uppercase italic font-bold leading-relaxed">{bot.description}</p>
                            </div>
                            <div className="flex gap-2 mt-auto">
                                <button className="flex-1 py-3 bg-white/5 rounded-xl text-[9px] font-black uppercase text-slate-400 hover:bg-white/10 transition-all border border-white/5">DÜZENLE</button>
                                <button onClick={async () => { if(confirm('Sil?')){ await DatabaseService.deleteBot(bot.id); load(); } }} className="p-3 bg-red-600/10 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all border border-red-500/20"><Trash2 size={16}/></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/**
 * PromotionManagement: Reklam Motoru (Fiziksel Veritabanı Bağlantılı)
 */
const PromotionManagement = () => {
    const [promos, setPromos] = useState<Promotion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPromo, setEditingPromo] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'content' | 'action' | 'media'>('content');

    const load = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await DatabaseService.getPromotions();
            setPromos(data);
        } catch (e) { console.error(e); }
        setIsLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await DatabaseService.savePromotion(editingPromo);
            setIsModalOpen(false);
            load();
        } catch (e) { alert("Veritabanına kaydedilemedi."); }
    };

    const toggleStatus = async (p: Promotion) => {
        const nextStatus = p.status === 'sending' ? 'pending' : 'sending';
        try {
            await DatabaseService.updatePromotionStatus(p.id, nextStatus);
            load();
        } catch (e) { alert("Durum güncellenemedi."); }
    };

    return (
        <div className="space-y-12 animate-in fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl lg:text-4xl font-black text-white italic uppercase tracking-tighter leading-none">Reklam <span className="text-emerald-500">Forge</span></h2>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mt-2 italic">Global ağ üzerinden tanıtım dağıtımı</p>
                </div>
                <button 
                    onClick={() => {
                        setEditingPromo({ id: `PROM-${Date.now()}`, title: '', content: '', status: 'pending', total_reach: 0, channel_count: 0, processed_channels: [], button_text: 'İNCELE', button_link: '', image_url: '' });
                        setIsModalOpen(true);
                        setActiveTab('content');
                    }}
                    className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-500 px-8 py-5 rounded-[24px] text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                    <Plus size={18} /> YENİ REKLAM FORGE ET
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-32"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {promos.map(p => (
                        <div key={p.id} className="bg-slate-900/40 border border-white/5 rounded-[44px] p-6 lg:p-10 flex flex-col md:flex-row items-center gap-8 group hover:border-emerald-500/30 transition-all shadow-2xl backdrop-blur-sm relative overflow-hidden">
                            <div className={`w-16 h-16 shrink-0 rounded-[28px] flex items-center justify-center border ${p.status === 'sending' ? 'bg-orange-500/10 border-orange-500/30 text-orange-500' : 'bg-slate-950 border-white/5 text-slate-700'}`}>
                                {p.status === 'sending' ? <RefreshCw className="animate-spin" size={24}/> : <RadioIcon size={24}/>}
                            </div>

                            <div className="flex-1 min-w-0 text-center md:text-left">
                                <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
                                    <h4 className="text-xl font-black text-white italic uppercase tracking-tighter truncate leading-none">{p.title}</h4>
                                    <span className={`px-2 py-1 rounded-lg text-[7px] font-black uppercase border tracking-widest ${p.status === 'sending' ? 'text-orange-500 border-orange-500/20 bg-orange-500/10' : 'text-slate-500 border-white/5 bg-slate-950'}`}>{p.status}</span>
                                </div>
                                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                    <div className="flex items-center gap-2"><Layers size={12} className="text-slate-700"/><span className="text-[10px] font-black text-slate-500 uppercase">{p.channel_count} KANAL</span></div>
                                    <div className="flex items-center gap-2"><Users size={12} className="text-slate-700"/><span className="text-[10px] font-black text-slate-500 uppercase">{p.total_reach.toLocaleString()} ERİŞİM</span></div>
                                </div>
                            </div>

                            <div className="flex gap-3 w-full md:w-auto">
                                <button 
                                    onClick={() => toggleStatus(p)}
                                    className={`flex-1 md:flex-none px-6 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${p.status === 'sending' ? 'bg-orange-500 text-white shadow-xl' : 'bg-emerald-600 text-white shadow-xl'}`}
                                >
                                    {p.status === 'sending' ? <Pause size={14}/> : <Play size={14}/>}
                                </button>
                                <button onClick={() => { setEditingPromo(p); setIsModalOpen(true); }} className="p-4 bg-white/5 rounded-2xl text-slate-500 border border-white/5 hover:text-white transition-colors"><Edit3 size={18}/></button>
                                <button onClick={async () => { if(window.confirm('Reklam silinecek?')) { await DatabaseService.deletePromotion(p.id); load(); } }} className="p-4 bg-white/5 rounded-2xl text-red-500 border border-white/5 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18}/></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && editingPromo && (
                <div className="fixed inset-0 z-[110] bg-black/95 flex items-end lg:items-center justify-center p-0 lg:p-8 backdrop-blur-3xl animate-in slide-in-from-bottom lg:fade-in">
                    <div className="bg-[#020617] border-t lg:border border-white/10 rounded-t-[40px] lg:rounded-[64px] w-full max-w-7xl h-[94vh] lg:h-auto lg:max-h-[90vh] flex flex-col lg:flex-row overflow-hidden shadow-2xl relative">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 z-[120] p-3 bg-white/5 rounded-2xl hover:bg-red-600 transition-all"><X size={20} /></button>
                        
                        <div className="flex-1 flex flex-col h-full overflow-hidden">
                            <div className="p-8 lg:p-12 pb-4 lg:pb-0 space-y-6">
                                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">Promotion <span className="text-emerald-500">Forge</span></h3>
                                <div className="flex gap-2 bg-white/5 p-1.5 rounded-3xl border border-white/5">
                                    {['content', 'action', 'media'].map(tab => (
                                        <button key={tab} onClick={() => setActiveTab(tab as any)} className={`flex-1 py-3 lg:py-4 rounded-[20px] lg:rounded-[22px] text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-emerald-600 text-white shadow-xl' : 'text-slate-500 hover:bg-white/5'}`}>
                                            {tab === 'content' ? 'İçerik' : tab === 'action' ? 'Buton' : 'Medya'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-8 no-scrollbar pb-32 lg:pb-12">
                                <form onSubmit={handleSave} className="space-y-8">
                                    {activeTab === 'content' && (
                                        <div className="space-y-8 animate-in slide-in-from-left-4">
                                            <AdminInput label="REKLAM BAŞLIĞI" value={editingPromo.title} onChange={(v:any)=>setEditingPromo({...editingPromo, title:v})} placeholder="Örn: Hafta Sonu Kampanyası" />
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-slate-700 uppercase tracking-widest ml-4 italic">MESAJ İÇERİĞİ</label>
                                                <textarea value={editingPromo.content} onChange={e => setEditingPromo({...editingPromo, content: e.target.value})} className="w-full bg-slate-950 border border-white/5 p-8 rounded-[36px] text-[11px] font-black h-48 lg:h-64 outline-none text-slate-400 focus:border-emerald-500/30 uppercase italic leading-relaxed shadow-inner" placeholder="Reklam metnini buraya giriniz..." />
                                            </div>
                                        </div>
                                    )}
                                    {activeTab === 'action' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-left-4">
                                            <AdminInput label="BUTON METNİ" value={editingPromo.button_text} onChange={(v:any)=>setEditingPromo({...editingPromo, button_text:v})} placeholder="ŞİMDİ İNCELE" />
                                            <AdminInput label="HEDEF LİNK" value={editingPromo.button_link} onChange={(v:any)=>setEditingPromo({...editingPromo, button_link:v})} placeholder="https://t.me/..." />
                                        </div>
                                    )}
                                    {activeTab === 'media' && (
                                        <div className="space-y-8 animate-in slide-in-from-left-4">
                                            <AdminInput label="GÖRSEL URL (JPG/PNG)" value={editingPromo.image_url} onChange={(v:any)=>setEditingPromo({...editingPromo, image_url:v})} placeholder="https://resim-linki.com/gorsel.jpg" />
                                        </div>
                                    )}
                                    <button type="submit" className="w-full h-16 lg:h-24 bg-emerald-600 text-white rounded-[32px] font-black text-[12px] uppercase tracking-[0.4em] shadow-2xl border-b-8 border-emerald-800 active:translate-y-1 active:border-b-4 transition-all">REKLAMI SİSTEME KAYDET</button>
                                </form>
                            </div>
                        </div>

                        {/* LIVE TELEGRAM PREVIEW */}
                        <div className="hidden lg:flex w-[480px] bg-slate-950/40 border-l border-white/5 p-12 flex-col items-center justify-center bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/10 via-transparent to-transparent">
                            <div className="w-full max-w-[340px] bg-[#17212b] rounded-[32px] overflow-hidden shadow-2xl border border-white/10 relative">
                                {editingPromo.image_url && <img src={editingPromo.image_url} className="w-full aspect-video object-cover" />}
                                <div className="p-6 space-y-4">
                                    <div className="space-y-1">
                                        <p className="text-[13px] text-white font-bold leading-tight">{editingPromo.title || 'Reklam Başlığı'}</p>
                                        <p className="text-[12px] text-slate-300 whitespace-pre-wrap leading-relaxed">{editingPromo.content || 'Reklam içeriği önizlemesi...'}</p>
                                    </div>
                                    {editingPromo.button_text && <div className="bg-[#242f3d] py-3 rounded-lg text-center text-blue-400 text-[12px] font-bold border border-white/5 shadow-inner">{editingPromo.button_text}</div>}
                                </div>
                                <div className="px-6 py-2 bg-black/20 flex justify-end"><span className="text-[9px] text-slate-500 font-black">12:45 PM</span></div>
                            </div>
                            <p className="text-[9px] font-black text-slate-800 uppercase tracking-widest mt-10 italic">TELEGRAM CANLI SİMÜLASYON</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * AdminDashboard: Ana Giriş Noktası
 */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/a/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/a/dashboard/users', icon: Users, label: 'Kullanıcılar' },
    { path: '/a/dashboard/bots', icon: Bot, label: 'Botlar' },
    { path: '/a/dashboard/promos', icon: Megaphone, label: 'Reklamlar' },
  ];

  return (
    <div className="flex min-h-screen bg-[#020617] font-sans">
      {/* Sidebar - Desktop */}
      <div className="w-72 border-r border-white/5 flex flex-col hidden lg:flex shrink-0 bg-[#020617]">
        <div className="p-10">
          <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">Botly<span className="text-blue-500">Hub</span></h1>
          <p className="text-[8px] font-black text-slate-700 uppercase tracking-[0.5em] mt-2 italic">ADMIN ENGINE V3.5</p>
        </div>
        
        <nav className="flex-1 px-6 space-y-3 mt-8">
          {menuItems.map(item => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`flex items-center gap-5 px-8 py-5 rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] transition-all border-l-4 ${
                location.pathname === item.path || (item.path === '/a/dashboard' && location.pathname === '/a/dashboard/') 
                ? 'bg-blue-600 text-white shadow-2xl shadow-blue-900/40 border-white' 
                : 'text-slate-500 hover:bg-white/5 border-transparent'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-10">
            <button 
                onClick={() => { localStorage.removeItem('admin_token'); navigate('/a/admin'); }} 
                className="w-full flex items-center justify-center gap-4 px-6 py-5 rounded-[24px] text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-600/10 transition-all border border-red-500/10 hover:border-red-500/30"
            >
                <LogOut size={18} /> Çıkış Yap
            </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto h-screen relative bg-[#020617]">
          {/* Mobile Header */}
          <div className="lg:hidden h-24 px-8 flex items-center justify-between border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl sticky top-0 z-[100]">
              <h1 className="text-xl font-black text-white italic uppercase tracking-tighter">Botly<span className="text-blue-500">Hub</span></h1>
              <button className="p-4 bg-slate-900 border border-white/5 rounded-2xl text-slate-400"><Menu size={24} /></button>
          </div>

          <div className="p-8 lg:p-16 max-w-7xl mx-auto pb-40 lg:pb-16">
              <Routes>
                  <Route index element={<HomeView />} />
                  <Route path="users" element={<UserManagement />} />
                  <Route path="bots" element={<BotManagement />} />
                  <Route path="promos" element={<PromotionManagement />} />
              </Routes>
          </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

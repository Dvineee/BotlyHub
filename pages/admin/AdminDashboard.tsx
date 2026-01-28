
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
import { Promotion } from '../../types';

const { useNavigate, Routes, Route, Link, useLocation } = Router as any;

/**
 * AdminInput: Standardized input component for the admin panel.
 */
const AdminInput = ({ label, value, onChange, type = "text" }: any) => (
  <div className="space-y-2">
    <label className="text-[9px] font-black text-slate-700 uppercase tracking-widest ml-4 italic">{label}</label>
    <input 
      type={type} 
      value={value} 
      onChange={e => onChange(e.target.value)} 
      className="w-full h-18 bg-slate-950 border border-white/5 px-8 rounded-[28px] lg:rounded-[36px] text-[11px] font-black outline-none text-slate-200 focus:border-emerald-500/30 uppercase italic tracking-widest shadow-inner" 
    />
  </div>
);

/**
 * HomeView: Overview of system statistics.
 */
const HomeView = () => (
  <div className="space-y-8 animate-in fade-in">
    <div className="flex justify-between items-center">
      <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Sistem <span className="text-blue-500">Özeti</span></h2>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        { label: 'Toplam Kullanıcı', value: '1,284', icon: Users, color: 'text-blue-500' },
        { label: 'Aktif Botlar', value: '42', icon: Bot, color: 'text-emerald-500' },
        { label: 'Günlük Gelir', value: '₺2,450', icon: Wallet, color: 'text-purple-500' },
        { label: 'Bekleyen Talepler', value: '12', icon: Activity, color: 'text-orange-500' },
      ].map((stat, i) => (
        <div key={i} className="bg-slate-900/40 border border-white/5 p-8 rounded-[40px] flex items-center gap-6">
          <div className={`p-4 bg-slate-950 rounded-2xl ${stat.color} border border-white/5`}>
            <stat.icon size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-white italic tracking-tighter leading-none">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const UserManagement = () => <div className="text-white p-8">Kullanıcı Yönetimi Ekranı</div>;
const BotManagement = () => <div className="text-white p-8">Bot Yönetimi Ekranı</div>;

const generateUniqueId = () => `PROM-${Math.floor(10000 + Math.random() * 90000)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

const PromotionManagement = () => {
    const [promos, setPromos] = useState<Promotion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPromo, setEditingPromo] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'content' | 'action' | 'media'>('content');

    const load = useCallback(async () => {
        setIsLoading(true);
        const data = await DatabaseService.getPromotions();
        setPromos(data);
        setIsLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const openCreateModal = () => {
        setEditingPromo({
            id: generateUniqueId(),
            title: '',
            content: '',
            image_url: '',
            button_text: 'ŞİMDİ İNCELE',
            button_link: '',
            status: 'pending',
            total_reach: 0,
            channel_count: 0,
            processed_channels: []
        });
        setIsModalOpen(true);
        setActiveTab('content');
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'sending': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
            case 'sent': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            case 'failed': return 'text-red-500 bg-red-500/10 border-red-500/20';
            default: return 'text-slate-500 bg-slate-900 border-white/5';
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl lg:text-4xl font-black text-white italic uppercase tracking-tighter leading-none">Promo <span className="text-emerald-500">Engine</span></h2>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mt-2 italic">Global reklam dağıtımını yönetin</p>
                </div>
                <button 
                    onClick={openCreateModal}
                    className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-500 px-8 py-5 rounded-[24px] text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl shadow-emerald-900/40 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                    <Plus size={18} /> YENİ TANITIM FORGE ET
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-32"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {promos.map(p => (
                        <div key={p.id} className="bg-slate-900/40 border border-white/5 rounded-[44px] p-6 lg:p-10 flex flex-col md:flex-row items-center gap-8 group hover:border-emerald-500/30 transition-all relative overflow-hidden shadow-2xl backdrop-blur-sm">
                            <div className={`w-16 h-16 lg:w-20 lg:h-20 shrink-0 rounded-[28px] lg:rounded-[32px] flex items-center justify-center border ${p.status === 'sending' ? 'bg-orange-500/10 border-orange-500/30 text-orange-500' : 'bg-slate-950 border-white/5 text-slate-700'}`}>
                                {p.status === 'sending' ? <RefreshCw className="animate-spin" size={28}/> : <RadioIcon size={28}/>}
                            </div>

                            <div className="flex-1 min-w-0 text-center md:text-left">
                                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                                    <h4 className="text-xl lg:text-2xl font-black text-white italic uppercase tracking-tighter truncate leading-none">{p.title}</h4>
                                    <span className={`inline-flex px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${getStatusColor(p.status)}`}>
                                        {p.status.toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                    <div className="flex items-center gap-2">
                                        <Layers size={12} className="text-slate-700" />
                                        <span className="text-[10px] font-black text-slate-500 uppercase">{p.channel_count} KANAL</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users size={12} className="text-slate-700" />
                                        <span className="text-[10px] font-black text-slate-500 uppercase">{p.total_reach.toLocaleString()} ERİŞİM</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex w-full md:w-auto gap-3">
                                <button 
                                    onClick={async () => { await DatabaseService.updatePromotionStatus(p.id, p.status === 'sending' ? 'pending' : 'sending'); load(); }} 
                                    className={`flex-1 md:flex-none px-8 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${p.status === 'sending' ? 'bg-orange-500 text-white shadow-xl shadow-orange-900/40' : 'bg-emerald-600 text-white shadow-xl shadow-emerald-900/40'}`}
                                >
                                    {p.status === 'sending' ? <><Pause className="inline mr-2" size={14}/> DURDUR</> : <><Play className="inline mr-2" size={14}/> BAŞLAT</>}
                                </button>
                                <button onClick={() => { setEditingPromo(p); setIsModalOpen(true); }} className="p-4 bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all border border-white/5"><Edit3 size={18}/></button>
                                <button onClick={async () => { if(window.confirm('Bu tanıtımı silmek istediğinizden emin misiniz?')) { await DatabaseService.deletePromotion(p.id); load(); } }} className="p-4 bg-white/5 rounded-2xl text-red-500 hover:bg-red-500 hover:text-white transition-all border border-white/5"><Trash2 size={18}/></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && editingPromo && (
                <div className="fixed inset-0 z-[110] bg-black/95 flex items-end lg:items-center justify-center p-0 lg:p-8 backdrop-blur-3xl animate-in slide-in-from-bottom lg:fade-in">
                    <div className="bg-[#020617] border-t lg:border border-white/10 rounded-t-[40px] lg:rounded-[64px] w-full max-w-7xl h-[94vh] lg:h-auto lg:max-h-[90vh] flex flex-col lg:flex-row overflow-hidden shadow-2xl relative">
                        
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 lg:top-8 lg:right-8 z-[120] p-3 lg:p-4 bg-white/5 rounded-2xl hover:bg-red-600 transition-all active:scale-90">
                            <X size={20} />
                        </button>

                        <div className="flex-1 flex flex-col h-full overflow-hidden">
                            <div className="p-8 lg:p-12 pb-4 lg:pb-0 space-y-8">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-[20px] flex items-center justify-center shadow-xl rotate-3">
                                        <Radio size={24} className="text-white"/>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl lg:text-3xl font-black uppercase italic tracking-tighter">Promotion <span className="text-emerald-500">Forge</span></h3>
                                        <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.4em] mt-1 italic">V3.5 AD ENGINE</p>
                                    </div>
                                </div>

                                <div className="flex gap-2 bg-white/5 p-1.5 rounded-3xl border border-white/5">
                                    {['content', 'action', 'media'].map(tab => (
                                        <button 
                                            key={tab}
                                            onClick={() => setActiveTab(tab as any)}
                                            className={`flex-1 py-3 lg:py-4 rounded-[20px] lg:rounded-[22px] text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-900/40' : 'text-slate-500 hover:bg-white/5'}`}
                                        >
                                            {tab === 'content' ? 'İÇERİK' : tab === 'action' ? 'EYLEM' : 'MEDYA'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-8 no-scrollbar pb-32 lg:pb-12">
                                <form onSubmit={async (e) => { e.preventDefault(); await DatabaseService.savePromotion(editingPromo); setIsModalOpen(false); load(); }} className="space-y-8">
                                    
                                    {activeTab === 'content' && (
                                        <div className="space-y-8 animate-in slide-in-from-left-4">
                                            <AdminInput label="REKLAM BAŞLIĞI" value={editingPromo.title} onChange={(v:any)=>setEditingPromo({...editingPromo, title:v})} />
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-slate-700 uppercase tracking-widest ml-4 italic">MESAJ İÇERİĞİ (HTML DESTEKLİ)</label>
                                                <textarea value={editingPromo.content} onChange={e => setEditingPromo({...editingPromo, content: e.target.value})} className="w-full bg-slate-950 border border-white/5 p-8 rounded-[36px] lg:rounded-[44px] text-[11px] font-black h-48 lg:h-64 outline-none text-slate-400 focus:border-emerald-500/30 uppercase italic leading-relaxed shadow-inner" placeholder="Reklam metninizi buraya yazın..." />
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'action' && (
                                        <div className="space-y-8 animate-in slide-in-from-left-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <AdminInput label="BUTON METNİ" value={editingPromo.button_text} onChange={(v:any)=>setEditingPromo({...editingPromo, button_text:v})} />
                                                <AdminInput label="HEDEF LİNK" value={editingPromo.button_link} onChange={(v:any)=>setEditingPromo({...editingPromo, button_link:v})} />
                                            </div>
                                            <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-[28px] flex items-center gap-4">
                                                <Info className="text-emerald-500 shrink-0" size={20} />
                                                <p className="text-[10px] font-black text-emerald-400 uppercase italic">Bağlantı t.me/ veya http:// ile başlamalıdır.</p>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'media' && (
                                        <div className="space-y-8 animate-in slide-in-from-left-4">
                                            <AdminInput label="GÖRSEL URL (OPSİYONEL)" value={editingPromo.image_url} onChange={(v:any)=>setEditingPromo({...editingPromo, image_url:v})} />
                                            {editingPromo.image_url && (
                                                <div className="w-full max-w-md aspect-video bg-slate-950 rounded-[32px] border border-white/5 overflow-hidden shadow-2xl">
                                                    <img src={editingPromo.image_url} className="w-full h-full object-cover" onError={(e) => (e.target as any).src = 'https://placehold.co/600x400/020617/slate-600?text=Gecersiz+Gorsel'} />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="fixed lg:relative bottom-0 left-0 right-0 p-6 lg:p-0 bg-gradient-to-t from-[#020617] lg:from-transparent via-[#020617]/90 lg:via-transparent to-transparent z-[130]">
                                        <button type="submit" className="w-full h-16 lg:h-24 bg-emerald-600 text-white rounded-2xl lg:rounded-[32px] font-black text-[12px] uppercase tracking-[0.4em] shadow-2xl shadow-emerald-900/40 transition-all border-b-8 border-emerald-800 active:translate-y-1 active:border-b-4 flex items-center justify-center gap-4">
                                            <Send size={20} /> REKLAMI SİSTEME KAYDET
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* RIGHT: LIVE TELEGRAM PREVIEW SIMULATOR */}
                        <div className="hidden lg:flex w-[480px] bg-slate-950/40 border-l border-white/5 p-12 flex-col items-center justify-center bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/10 via-transparent to-transparent">
                            <div className="text-center mb-16 space-y-3">
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.6em] italic block">TG PREVIEW</span>
                                <h4 className="text-xl font-black text-white italic tracking-widest opacity-20 uppercase">Simulator</h4>
                            </div>

                            <div className="w-full max-w-[340px] bg-[#17212b] rounded-[32px] overflow-hidden shadow-2xl border border-white/10 relative">
                                {editingPromo.image_url && (
                                    <div className="w-full aspect-video">
                                        <img src={editingPromo.image_url} className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="p-6 space-y-4">
                                    <div className="space-y-1">
                                        <p className="text-[13px] text-white font-bold leading-relaxed">{editingPromo.title || 'Reklam Başlığı'}</p>
                                        <p className="text-[12px] text-slate-300 whitespace-pre-wrap">{editingPromo.content || 'Reklam içeriği burada Telegram mesajı formunda görünecek...'}</p>
                                    </div>
                                    {editingPromo.button_text && (
                                        <div className="bg-[#242f3d] py-3 rounded-lg text-center text-blue-400 text-[12px] font-bold border border-white/5 shadow-inner">
                                            {editingPromo.button_text}
                                        </div>
                                    )}
                                </div>
                                <div className="px-6 py-2 bg-black/20 flex justify-end">
                                    <span className="text-[9px] text-slate-500 uppercase font-black">12:45 PM</span>
                                </div>
                            </div>

                            <p className="text-[9px] font-black text-slate-800 uppercase tracking-widest mt-10 italic">Telegram mesaj görünümü simülasyonu</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * AdminDashboard: Main entry point for the administrative panel.
 */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/a/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/a/dashboard/users', icon: Users, label: 'Kullanıcılar' },
    { path: '/a/dashboard/bots', icon: Bot, label: 'Botlar' },
    { path: '/a/dashboard/promos', icon: Megaphone, label: 'Promosyonlar' },
  ];

  return (
    <div className="flex min-h-screen bg-[#020617]">
      {/* Sidebar - Desktop */}
      <div className="w-64 border-r border-white/5 flex flex-col hidden lg:flex">
        <div className="p-8">
          <h1 className="text-xl font-black text-white italic uppercase tracking-tighter leading-none">Botly<span className="text-blue-500">Hub</span></h1>
          <p className="text-[8px] font-black text-slate-700 uppercase tracking-[0.4em] mt-1.5 italic">ADMIN PANEL V3</p>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-8">
          {menuItems.map(item => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                location.pathname === item.path || (item.path === '/a/dashboard' && location.pathname === '/a/dashboard/') 
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40' 
                : 'text-slate-500 hover:bg-white/5'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-8">
            <button 
                onClick={() => { localStorage.removeItem('admin_token'); navigate('/a/admin'); }} 
                className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-600/10 transition-all border border-transparent hover:border-red-500/20"
            >
                <LogOut size={18} /> Oturumu Kapat
            </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
          {/* Mobile Header */}
          <div className="lg:hidden h-20 px-6 flex items-center justify-between border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl sticky top-0 z-[100]">
              <h1 className="text-lg font-black text-white italic uppercase tracking-tighter">Botly<span className="text-blue-500">Hub</span></h1>
              <button className="p-3 bg-slate-900/60 border border-white/5 rounded-2xl text-slate-400">
                  <Menu size={20} />
              </button>
          </div>

          <div className="p-6 lg:p-16">
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


import React, { useState, useEffect, useCallback } from 'react';
import * as Router from 'react-router-dom';
import { 
  Trash2, Megaphone, X, LayoutDashboard, Users as UsersIcon, 
  Settings, LogOut, Shield, Activity, Loader2, DollarSign, 
  Bot as BotIcon, Share2, Send, Plus, Eye, MousePointer2, 
  Image as ImageIcon, Link2, Monitor, AlertCircle
} from 'lucide-react';
import { Promotion } from '../../types';
import { DatabaseService } from '../../services/DatabaseService';
import UserList from '../UserList';
import UserDetail from '../UserDetail';

const { Routes, Route, useNavigate, useLocation, Link } = Router as any;

const AdminInput = ({ label, value, onChange, placeholder, icon: Icon }: any) => (
    <div className="space-y-2">
        <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4 italic">{label}</label>
        <div className="relative group">
            {Icon && <Icon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-blue-500 transition-colors" size={18} />}
            <input 
                type="text" 
                value={value} 
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={`w-full h-16 bg-slate-950 border border-white/5 rounded-[24px] ${Icon ? 'pl-14' : 'px-8'} pr-8 text-[11px] font-black text-white outline-none focus:border-blue-500/30 transition-all uppercase italic tracking-widest shadow-inner`} 
            />
        </div>
    </div>
);

const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[40px] flex items-center justify-between group hover:border-blue-500/20 transition-all shadow-2xl">
        <div>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2 italic">{title}</p>
            <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">{value}</h3>
        </div>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color} shadow-lg group-hover:scale-110 transition-transform`}>
            <Icon size={24} className="text-white" />
        </div>
    </div>
);

const AdSharingCenter = () => {
    const [ads, setAds] = useState<Promotion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAd, setEditingAd] = useState<any>(null);

    const load = useCallback(async () => {
        setIsLoading(true);
        const data = await DatabaseService.getPromotions();
        setAds(data);
        setIsLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'sending': return <span className="px-3 py-1 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-full text-[9px] font-black uppercase animate-pulse">AKTİF YAYIN</span>;
            case 'sent': return <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-[9px] font-black uppercase">TAMAMLANDI</span>;
            default: return <span className="px-3 py-1 bg-slate-500/10 text-slate-500 border border-white/5 rounded-full text-[9px] font-black uppercase">BEKLEMEDE</span>;
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">Reklam <span className="text-blue-500">Merkezi</span></h2>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-2 italic">Global ağ üzerinde profesyonel paylaşım yönetimi</p>
                </div>
                <button 
                    onClick={() => { 
                        setEditingAd({ title: '', content: '', image_url: '', button_text: 'İNCELE', button_link: '', status: 'pending', click_count: 0, processed_channels: [] }); 
                        setIsModalOpen(true); 
                    }} 
                    className="bg-emerald-600 hover:bg-emerald-500 px-10 py-5 rounded-[28px] text-[11px] font-black uppercase tracking-widest shadow-2xl active:scale-95 border-b-4 border-emerald-900 transition-all flex items-center gap-3"
                >
                    <Plus size={18} /> YENİ REKLAM OLUŞTUR
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {isLoading ? (
                    <div className="flex justify-center py-24"><Loader2 className="animate-spin text-blue-500" size={32} /></div>
                ) : ads.length === 0 ? (
                    <div className="bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-[48px] p-24 text-center">
                        <Megaphone size={48} className="text-slate-800 mx-auto mb-6" />
                        <p className="text-slate-600 font-black uppercase italic tracking-widest">Henüz bir reklam paylaşımı yapılmadı.</p>
                    </div>
                ) : ads.map(ad => (
                    <div key={ad.id} className="bg-slate-900/40 border border-white/5 rounded-[48px] p-10 flex flex-col lg:flex-row items-center justify-between group shadow-2xl hover:border-blue-500/20 transition-all">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-4">
                                {getStatusBadge(ad.status)}
                                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-[0.2em]">{new Date(ad.created_at).toLocaleDateString()}</span>
                            </div>
                            <h4 className="text-2xl font-black italic uppercase text-white truncate">{ad.title}</h4>
                            <div className="flex items-center gap-6 mt-4">
                                <div className="flex items-center gap-2">
                                    <Monitor size={14} className="text-slate-500" />
                                    <span className="text-[10px] font-black text-slate-500 uppercase">{ad.channel_count || 0} KANAL</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MousePointer2 size={14} className="text-emerald-500" />
                                    <span className="text-[10px] font-black text-emerald-500 uppercase">{ad.click_count || 0} TIKLAMA</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-8 lg:mt-0">
                            <button 
                                onClick={async () => { 
                                    const nextStatus = ad.status === 'sending' ? 'pending' : 'sending';
                                    await DatabaseService.updatePromotionStatus(ad.id, nextStatus); 
                                    load(); 
                                }} 
                                className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 ${ad.status === 'sending' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 'bg-blue-600 text-white shadow-xl shadow-blue-900/20'}`}
                            >
                                {ad.status === 'sending' ? 'YAYINI DURDUR' : 'YAYINA AL'}
                                <Send size={14} />
                            </button>
                            <button onClick={async () => { if(confirm('Bu reklamı kalıcı olarak silmek istiyor musunuz?')) { await DatabaseService.deletePromotion(ad.id); load(); } }} className="p-4 bg-white/5 rounded-2xl text-red-500 hover:bg-red-600 hover:text-white transition-all shadow-xl">
                                <Trash2 size={20}/>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && editingAd && (
                <div className="fixed inset-0 z-[110] bg-black/98 flex items-center justify-center p-6 backdrop-blur-3xl animate-in fade-in">
                    <div className="bg-[#020617] p-10 lg:p-14 rounded-[64px] w-full max-w-7xl h-[90vh] overflow-hidden border border-white/10 shadow-2xl relative flex flex-col lg:flex-row gap-12">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 p-4 bg-white/5 rounded-2xl text-slate-500 hover:text-white z-50">
                            <X size={24}/>
                        </button>
                        
                        {/* Sol Taraf: Form */}
                        <div className="flex-1 overflow-y-auto pr-4 no-scrollbar space-y-8">
                            <div>
                                <h3 className="text-3xl font-black mb-2 uppercase italic tracking-tighter">İçerik <span className="text-emerald-500">Forge</span></h3>
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">Yayınlanacak reklamın detaylarını yapılandırın</p>
                            </div>

                            <form onSubmit={async (e) => { 
                                e.preventDefault(); 
                                await DatabaseService.savePromotion({ ...editingAd, status: 'pending' }); 
                                setIsModalOpen(false); 
                                load(); 
                            }} className="space-y-8 pb-10">
                                <AdminInput label="REKLAM BAŞLIĞI" value={editingAd.title} onChange={(v:any)=>setEditingAd({...editingAd, title:v})} placeholder="Örn: Haftalık Kampanya" />
                                
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-4 italic">MESAJ İÇERİĞİ</label>
                                    <textarea 
                                        value={editingAd.content} 
                                        onChange={e => setEditingAd({...editingAd, content: e.target.value})} 
                                        className="w-full bg-slate-950 border border-white/5 p-8 rounded-[36px] text-[11px] font-black h-40 outline-none text-slate-400 focus:border-emerald-500/30 uppercase italic leading-relaxed" 
                                        placeholder="Kanalda görünecek ana metin..." 
                                    />
                                </div>

                                <AdminInput label="GÖRSEL URL (OPSİYONEL)" value={editingAd.image_url} onChange={(v:any)=>setEditingAd({...editingAd, image_url:v})} icon={ImageIcon} placeholder="https://..." />
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <AdminInput label="BUTON METNİ" value={editingAd.button_text} onChange={(v:any)=>setEditingAd({...editingAd, button_text:v})} placeholder="İNCELE" />
                                    <AdminInput label="BUTON LİNKİ" value={editingAd.button_link} onChange={(v:any)=>setEditingAd({...editingAd, button_link:v})} icon={Link2} placeholder="https://t.me/..." />
                                </div>

                                <button type="submit" className="w-full h-20 bg-blue-600 hover:bg-blue-500 rounded-[32px] font-black text-[12px] uppercase tracking-[0.4em] shadow-2xl border-b-8 border-blue-900 transition-all active:translate-y-1 active:border-b-4">REKLAMI SİSTEME KAYDET</button>
                            </form>
                        </div>

                        {/* Sağ Taraf: Canlı Önizleme */}
                        <div className="hidden lg:flex w-[460px] flex-col items-center justify-center bg-slate-900/20 border-l border-white/5 p-12 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-600/5 via-transparent to-transparent"></div>
                            
                            <div className="text-center mb-12 space-y-2">
                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em] italic block">TELEGRAM PREVIEW</span>
                                <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest">SİMÜLATÖR V3.2</p>
                            </div>

                            {/* Telegram Mesaj Balonu */}
                            <div className="w-full bg-[#020617] border border-white/10 rounded-[40px] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.6)] animate-in zoom-in-95">
                                {editingAd.image_url && editingAd.image_url.startsWith('http') ? (
                                    <img src={editingAd.image_url} className="w-full h-48 object-cover border-b border-white/5" onError={(e)=>(e.target as any).style.display='none'} />
                                ) : (
                                    <div className="w-full h-32 bg-slate-900/40 flex flex-col items-center justify-center border-b border-white/5">
                                        <ImageIcon className="text-slate-800 mb-2" size={32} />
                                        <span className="text-[8px] font-black text-slate-800 uppercase tracking-widest">Görsel Eklenmedi</span>
                                    </div>
                                )}
                                <div className="p-8 space-y-4">
                                    <h5 className="text-white font-black text-lg italic uppercase tracking-tighter truncate">{editingAd.title || 'REKLAM BAŞLIĞI'}</h5>
                                    <p className="text-slate-400 text-[10px] font-bold uppercase italic leading-relaxed line-clamp-4 min-h-[60px]">{editingAd.content || 'Mesaj içeriği burada görünecek...'}</p>
                                    
                                    {editingAd.button_text && (
                                        <div className="pt-4">
                                            <div className="w-full py-4 bg-blue-600/10 border border-blue-500/30 rounded-2xl text-blue-500 text-[9px] font-black text-center uppercase tracking-widest">
                                                {editingAd.button_text}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-12 flex items-center gap-3 opacity-30">
                                <AlertCircle size={14} className="text-slate-500" />
                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em]">Gerçek görünüm Telegram istemcisine göre değişebilir</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const Overview = () => {
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        DatabaseService.getAdminStats().then(data => {
            setStats(data);
            setIsLoading(false);
        });
    }, []);

    if (isLoading) return <div className="flex justify-center py-24"><Loader2 className="animate-spin text-blue-500" /></div>;

    return (
        <div className="space-y-12 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="TOPLAM KULLANICI" value={stats?.userCount || 0} icon={UsersIcon} color="bg-blue-600" />
                <StatCard title="TOPLAM HASILAT" value={`₺${stats?.totalRevenue || 0}`} icon={DollarSign} color="bg-emerald-600" />
                <StatCard title="AKTİF BOTLAR" value={stats?.botCount || 0} icon={BotIcon} color="bg-purple-600" />
                <StatCard title="SİSTEM LOGU" value={stats?.logCount || 0} icon={Activity} color="bg-orange-600" />
            </div>
            <div className="bg-slate-900/20 border border-white/5 rounded-[44px] p-10">
                <h3 className="text-sm font-black text-white italic uppercase tracking-widest mb-8">Sistem Durumu</h3>
                <div className="py-12 border-2 border-dashed border-slate-800 rounded-3xl text-center">
                    <p className="text-slate-600 text-[10px] font-bold uppercase italic animate-pulse">Reklam Paylaşım Motoru Online...</p>
                </div>
            </div>
        </div>
    );
};

const AdminDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!DatabaseService.isAdminLoggedIn()) {
            navigate('/a/admin');
        }
    }, [navigate]);

    const menu = [
        { path: '/a/dashboard', icon: LayoutDashboard, label: 'Panel Özeti' },
        { path: '/a/dashboard/users', icon: UsersIcon, label: 'Kullanıcılar' },
        { path: '/a/dashboard/promotions', icon: Share2, label: 'Reklam Merkezi' },
        { path: '/a/dashboard/settings', icon: Settings, label: 'Sistem Ayarları' }
    ];

    return (
        <div className="min-h-screen bg-[#020617] flex font-sans">
            <aside className="w-72 bg-slate-900/50 border-r border-white/5 hidden lg:flex flex-col h-screen sticky top-0 backdrop-blur-3xl">
                <div className="p-10 flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-2xl">
                        <Shield size={20} className="text-white" />
                    </div>
                    <h1 className="text-xl font-black text-white italic uppercase tracking-tight">Admin<span className="text-blue-500">V3</span></h1>
                </div>
                <nav className="flex-1 px-6 space-y-2 mt-4">
                    {menu.map((m) => (
                        <Link key={m.path} to={m.path} className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${location.pathname === m.path ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/20' : 'text-slate-500 hover:bg-white/5'}`}>
                            <m.icon size={18} />
                            <span className="text-[11px] font-black uppercase tracking-widest italic">{m.label}</span>
                        </Link>
                    ))}
                </nav>
                <div className="p-8">
                    <button onClick={() => { DatabaseService.logoutAdmin(); navigate('/a/admin'); }} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all group">
                        <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
                        <span className="text-[11px] font-black uppercase tracking-widest">Çıkış Yap</span>
                    </button>
                </div>
            </aside>

            <main className="flex-1 p-6 lg:p-12 overflow-x-hidden">
                <Routes>
                    <Route path="/" element={<Overview />} />
                    <Route path="/users" element={<UserList />} />
                    <Route path="/users/:id" element={<UserDetail />} />
                    <Route path="/promotions" element={<AdSharingCenter />} />
                    <Route path="*" element={<div className="text-slate-700 font-black uppercase italic tracking-widest py-24 text-center">Modül Hazırlanıyor...</div>} />
                </Routes>
            </main>
        </div>
    );
};

export default AdminDashboard;

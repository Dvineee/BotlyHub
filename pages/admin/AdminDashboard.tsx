
import React, { useState, useEffect, useCallback } from 'react';
import * as Router from 'react-router-dom';
import { 
  Trash2, Megaphone, X, LayoutDashboard, Users, 
  Settings, LogOut, Shield, Bell, Activity, Database, 
  Loader2 
} from 'lucide-react';
import { Promotion } from '../../types';
import { DatabaseService } from '../../services/DatabaseService';

// Fix: Destructuring Router to ensure hooks and components are available in this environment
const { Routes, Route, useNavigate, useLocation, Link } = Router as any;

/**
 * Admin Input Component
 * Fix: Defined missing AdminInput component used in the PromotionManagement form
 */
const AdminInput = ({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) => (
    <div className="space-y-2">
        <label className="text-[9px] font-black text-slate-700 uppercase tracking-widest ml-4 italic">{label}</label>
        <input 
            type="text" 
            value={value} 
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-16 bg-slate-950 border border-white/5 rounded-[24px] px-8 text-[11px] font-black text-white outline-none focus:border-emerald-500/30 transition-all uppercase italic tracking-widest shadow-inner" 
        />
    </div>
);

/**
 * Promotion Management Module
 * Fix: Added missing useState, useEffect, and useCallback hooks along with DatabaseService methods
 */
const PromotionManagement = () => {
    const [promos, setPromos] = useState<Promotion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPromo, setEditingPromo] = useState<any>(null);

    const load = useCallback(async () => {
        setIsLoading(true);
        const data = await DatabaseService.getPromotions();
        setPromos(data);
        setIsLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'sending': return <span className="px-3 py-1 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-full text-[9px] font-black uppercase animate-pulse">YAYINDA</span>;
            case 'sent': return <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-[9px] font-black uppercase">TAMAMLANDI</span>;
            case 'failed': return <span className="px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full text-[9px] font-black uppercase">HATA</span>;
            default: return <span className="px-3 py-1 bg-slate-500/10 text-slate-500 border border-white/5 rounded-full text-[9px] font-black uppercase">BEKLEMEDE</span>;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">Promo <span className="text-blue-500">Engine</span></h2>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-2 italic">Toplam {promos.length} adet reklam tanımı mevcut</p>
                </div>
                <button onClick={() => { setEditingPromo({ title: '', content: '', status: 'pending', button_text: 'İNCELE', processed_channels: [] }); setIsModalOpen(true); }} className="w-full sm:w-auto bg-emerald-600 px-8 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95">YENİ YAYIN FORGE ET</button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {isLoading ? (
                    <div className="flex justify-center py-24"><Loader2 className="animate-spin text-blue-500" size={32} /></div>
                ) : promos.length > 0 ? promos.map(p => (
                    <div key={p.id} className="bg-slate-900/40 border border-white/5 rounded-[40px] p-6 lg:p-10 flex flex-col md:flex-row items-center gap-8 group shadow-2xl relative overflow-hidden">
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex items-center gap-3 mb-3 justify-center md:justify-start">
                                {getStatusBadge(p.status)}
                                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">{new Date(p.created_at).toLocaleDateString()}</span>
                            </div>
                            <h4 className="text-xl lg:text-2xl font-black italic uppercase text-white truncate">{p.title}</h4>
                            <p className="text-[10px] text-slate-500 font-bold uppercase italic mt-1">{p.channel_count || 0} Kanala İletildi</p>
                        </div>
                        <div className="flex w-full md:w-auto gap-2">
                            <button 
                                onClick={async () => { 
                                    const nextStatus = p.status === 'sending' ? 'pending' : 'sending';
                                    await DatabaseService.updatePromotionStatus(p.id, nextStatus); 
                                    load(); 
                                }} 
                                className={`flex-1 md:flex-none px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 ${p.status === 'sending' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 'bg-blue-600 text-white shadow-lg'}`}
                            >
                                {p.status === 'sending' ? 'DURDUR' : 'BAŞLAT'}
                            </button>
                            <button onClick={async () => { if(confirm('Silsin mi?')) { await DatabaseService.deletePromotion(p.id); load(); } }} className="p-4 bg-white/5 rounded-xl text-red-500 hover:bg-red-600 hover:text-white transition-all"><Trash2 size={18}/></button>
                        </div>
                    </div>
                )) : (
                    <div className="py-24 text-center bg-slate-900/20 rounded-[44px] border-2 border-dashed border-slate-800">
                        <Megaphone size={48} className="text-slate-800 mx-auto mb-6" />
                        <p className="text-slate-600 font-black uppercase text-xs tracking-widest">Henüz hiçbir reklam forge edilmedi.</p>
                    </div>
                )}
            </div>

            {isModalOpen && editingPromo && (
                <div className="fixed inset-0 z-[110] bg-black/98 flex items-end lg:items-center justify-center p-0 lg:p-8 backdrop-blur-3xl animate-in slide-in-from-bottom">
                    <div className="bg-[#020617] p-8 lg:p-16 rounded-t-[40px] lg:rounded-[64px] w-full max-w-3xl border-t lg:border border-white/10 shadow-2xl relative h-[90vh] lg:h-auto overflow-y-auto no-scrollbar pb-24">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 p-4 bg-white/5 rounded-2xl hover:bg-red-600 transition-all active:scale-90"><X size={20}/></button>
                        <h3 className="text-2xl lg:text-3xl font-black mb-10 uppercase italic tracking-tighter">Yayın <span className="text-emerald-500">Forge</span></h3>
                        <form onSubmit={async (e) => { 
                            e.preventDefault(); 
                            await DatabaseService.savePromotion({ ...editingPromo, status: 'sending' }); 
                            setIsModalOpen(false); 
                            load(); 
                        }} className="space-y-6">
                            <AdminInput label="REKLAM BAŞLIĞI" value={editingPromo.title} onChange={(v:any)=>setEditingPromo({...editingPromo, title:v})}/>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-700 uppercase tracking-widest ml-4 italic">MESAJ İÇERİĞİ</label>
                                <textarea value={editingPromo.content} onChange={e => setEditingPromo({...editingPromo, content: e.target.value})} className="w-full bg-slate-950 border border-white/5 p-8 rounded-[32px] text-[11px] font-black h-40 outline-none text-slate-400 focus:border-emerald-500/30 uppercase italic leading-relaxed" />
                            </div>
                            <AdminInput label="BUTON LİNKİ" value={editingPromo.button_link} onChange={(v:any)=>setEditingPromo({...editingPromo, button_link:v})}/>
                            <button type="submit" className="w-full h-16 lg:h-20 bg-emerald-600 py-6 rounded-[28px] lg:rounded-[32px] font-black text-[11px] uppercase tracking-widest shadow-2xl active:scale-95 border-b-4 border-emerald-800">FORGE ET VE DAĞITIMA BAŞLA</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * Sidebar Component
 */
const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const menu = [
        { path: '/a/dashboard', icon: LayoutDashboard, label: 'Panel' },
        { path: '/a/dashboard/promos', icon: Megaphone, label: 'Reklam Forge' }
    ];

    return (
        <aside className="w-72 bg-slate-900/50 border-r border-white/5 hidden lg:flex flex-col h-screen sticky top-0 overflow-y-auto no-scrollbar">
            <div className="p-10 flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-2xl shadow-blue-500/20">
                    <Database size={20} className="text-white" />
                </div>
                <h1 className="text-xl font-black text-white italic tracking-tighter uppercase">Admin<span className="text-blue-500">V3</span></h1>
            </div>
            <nav className="flex-1 px-6 space-y-2">
                {menu.map((m) => (
                    <Link 
                        key={m.path}
                        to={m.path}
                        className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${location.pathname === m.path ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/20' : 'text-slate-500 hover:bg-white/5'}`}
                    >
                        <m.icon size={18} />
                        <span className="text-[11px] font-black uppercase tracking-widest">{m.label}</span>
                    </Link>
                ))}
            </nav>
            <div className="p-8">
                <button onClick={() => { DatabaseService.logoutAdmin(); navigate('/a/admin'); }} className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all">
                    <LogOut size={18} />
                    <span className="text-[11px] font-black uppercase tracking-widest">Çıkış Yap</span>
                </button>
            </div>
        </aside>
    );
};

/**
 * Admin Dashboard Main Component
 * Fix: Added default export to resolve the lazy loading error in App.tsx
 */
const AdminDashboard = () => {
    const navigate = useNavigate();

    useEffect(() => {
        if (!DatabaseService.isAdminLoggedIn()) {
            navigate('/a/admin');
        }
    }, [navigate]);

    return (
        <div className="min-h-screen bg-[#020617] flex">
            <Sidebar />
            <main className="flex-1 p-6 lg:p-12 overflow-x-hidden">
                <Routes>
                    <Route path="/" element={<div className="text-white text-center py-24"><Activity size={48} className="mx-auto mb-6 text-blue-500 opacity-50" /><h2 className="text-2xl font-black uppercase italic">Hoş Geldiniz</h2><p className="text-slate-500 mt-2">Sol menüden işlem seçiniz.</p></div>} />
                    <Route path="/promos" element={<PromotionManagement />} />
                    <Route path="*" element={<div className="text-slate-500 text-center py-24">Modül yapım aşamasında...</div>} />
                </Routes>
            </main>
        </div>
    );
};

export default AdminDashboard;

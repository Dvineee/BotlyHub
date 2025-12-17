
import React, { useEffect, useState } from 'react';
import { useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Bot, CreditCard, Settings, 
  LogOut, Menu, X, TrendingUp, DollarSign, Package, 
  ArrowUpRight, BarChart3, Bell, Loader2, RefreshCw, 
  Plus, Edit2, Trash2, Save, Search, Mail, Phone, ExternalLink
} from 'lucide-react';
import { DatabaseService } from '../../services/DatabaseService';
import { User, Bot as BotType, CryptoTransaction } from '../../types';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalUsers: 0, totalBots: 0, totalRevenue: 0 });

  useEffect(() => {
    if (!DatabaseService.isAdminLoggedIn()) navigate('/a/admin');
    loadData();
  }, [navigate]);

  const loadData = async () => {
    setLoading(true);
    const users = await DatabaseService.getUsers();
    const bots = await DatabaseService.getBots();
    setStats({ totalUsers: users.length, totalBots: bots.length, totalRevenue: 12500 });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-200">
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <Package className="text-blue-500" size={32} />
            <h2 className="text-xl font-bold text-white">Botly V3 Admin</h2>
          </div>
          <nav className="flex-1 space-y-2">
            <Link to="/a/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400"> <LayoutDashboard size={20} /> <span>Genel Bakış</span></Link>
            <Link to="/a/dashboard/users" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400"> <Users size={20} /> <span>Kullanıcılar</span></Link>
            <Link to="/a/dashboard/bots" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400"> <Bot size={20} /> <span>Bot Yönetimi</span></Link>
          </nav>
          <button onClick={() => { DatabaseService.logoutAdmin(); navigate('/a/admin'); }} className="flex items-center gap-3 px-4 py-3 text-red-400 mt-auto"> <LogOut size={20} /> <span>Çıkış Yap</span></button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<div className="text-white text-2xl font-bold">Sistem Özeti</div>} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/bots" element={<BotManagement />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);
  const load = async () => {
    setLoading(true);
    const data = await DatabaseService.getUsers();
    setUsers(data);
    setLoading(false);
  };

  return (
    <div className="animate-in fade-in">
      <h1 className="text-2xl font-bold mb-6">Kullanıcı Yönetimi</h1>
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-800">
            <tr className="text-xs text-slate-400 uppercase font-bold">
              <th className="p-4">Kullanıcı</th>
              <th className="p-4">İletişim</th>
              <th className="p-4">Durum</th>
              <th className="p-4">Aksiyon</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-800/30">
                <td className="p-4">
                  <p className="font-bold">{u.name}</p>
                  <p className="text-xs text-slate-500">@{u.username}</p>
                </td>
                <td className="p-4">
                  <div className="flex flex-col gap-1">
                    {u.email ? <div className="flex items-center gap-1 text-xs text-blue-400"><Mail size={12}/> {u.email}</div> : <span className="text-[10px] text-slate-600">E-posta yok</span>}
                    {u.phone ? <div className="flex items-center gap-1 text-xs text-emerald-400"><Phone size={12}/> {u.phone}</div> : <span className="text-[10px] text-slate-600">Telefon yok</span>}
                  </div>
                </td>
                <td className="p-4">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded ${u.email || u.phone ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800 text-slate-500'}`}>
                    {u.email || u.phone ? 'Bilgili' : 'Sadece TG'}
                  </span>
                </td>
                <td className="p-4">
                  <button className="text-xs font-bold text-blue-500 hover:underline">Detay</button>
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
  const [bots, setBots] = useState<BotType[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingBot, setEditingBot] = useState<Partial<BotType>>({});
  const [tempScreenshot, setTempScreenshot] = useState('');

  useEffect(() => { load(); }, []);
  const load = async () => { setBots(await DatabaseService.getBots()); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await DatabaseService.saveBot(editingBot);
    setModalOpen(false);
    load();
  };

  const addScreenshot = () => {
      if(!tempScreenshot) return;
      setEditingBot({...editingBot, screenshots: [...(editingBot.screenshots || []), tempScreenshot]});
      setTempScreenshot('');
  };

  return (
    <div className="animate-in fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Bot Yönetimi</h1>
        <button onClick={() => { setEditingBot({ category: 'productivity', screenshots: [] }); setModalOpen(true); }} className="bg-blue-600 px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2"> <Plus size={18} /> Yeni Bot </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bots.map(b => (
          <div key={b.id} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
             <div className="flex gap-4 mb-4">
                <img src={b.icon} className="w-16 h-16 rounded-xl object-cover" />
                <div>
                   <h4 className="font-bold">{b.name}</h4>
                   <p className="text-xs text-slate-500 uppercase">{b.category}</p>
                </div>
             </div>
             <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                <span className="font-bold text-emerald-400">₺{b.price}</span>
                <div className="flex gap-2">
                    <button onClick={() => { setEditingBot(b); setModalOpen(true); }} className="p-2 bg-slate-800 rounded-lg text-slate-400"> <Edit2 size={16}/> </button>
                    <button onClick={async () => { await DatabaseService.deleteBot(b.id); load(); }} className="p-2 bg-slate-800 rounded-lg text-red-500"> <Trash2 size={16}/> </button>
                </div>
             </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl p-8 overflow-y-auto max-h-[90vh]">
            <h3 className="text-xl font-bold mb-6">{editingBot.id ? 'Botu Düzenle' : 'Yeni Bot Ekle'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                  <input type="text" value={editingBot.name} onChange={e => setEditingBot({...editingBot, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm" placeholder="Bot Adı" required />
                  <input type="number" value={editingBot.price} onChange={e => setEditingBot({...editingBot, price: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm" placeholder="Fiyat (₺)" required />
              </div>
              <textarea value={editingBot.description} onChange={e => setEditingBot({...editingBot, description: e.target.value})} className="w-full h-24 bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm" placeholder="Açıklama" required />
              <input type="text" value={editingBot.bot_link} onChange={e => setEditingBot({...editingBot, bot_link: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm" placeholder="Telegram Linki (t.me/bot_username)" required />
              <input type="text" value={editingBot.icon} onChange={e => setEditingBot({...editingBot, icon: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm" placeholder="İkon URL" required />
              
              <div className="border border-slate-800 p-4 rounded-xl">
                 <p className="text-xs font-bold text-slate-500 mb-3">SCREENSHOTLAR ({editingBot.screenshots?.length || 0})</p>
                 <div className="flex gap-2 mb-3">
                    <input type="text" value={tempScreenshot} onChange={e => setTempScreenshot(e.target.value)} className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs" placeholder="Görsel URL ekle..." />
                    <button type="button" onClick={addScreenshot} className="bg-slate-800 px-4 rounded-lg text-xs font-bold">Ekle</button>
                 </div>
                 <div className="flex gap-2 overflow-x-auto">
                    {editingBot.screenshots?.map((s, idx) => (
                        <div key={idx} className="relative w-16 h-16 rounded border border-slate-800">
                           <img src={s} className="w-full h-full object-cover" />
                           <button type="button" onClick={() => setEditingBot({...editingBot, screenshots: editingBot.screenshots?.filter((_, i) => i !== idx)})} className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5"><X size={10}/></button>
                        </div>
                    ))}
                 </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 bg-slate-800 py-3 rounded-xl font-bold">İptal</button>
                <button type="submit" className="flex-1 bg-blue-600 py-3 rounded-xl font-bold">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;


import React, { useEffect, useState } from 'react';
import { useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Bot, CreditCard, Settings, 
  LogOut, Menu, X, TrendingUp, DollarSign, Package, 
  ArrowUpRight, BarChart3, Bell, Loader2, RefreshCw, 
  Plus, Edit2, Trash2, CheckCircle, AlertCircle, Save
} from 'lucide-react';
import { DatabaseService } from '../../services/DatabaseService';
import { User, Bot as BotType, CryptoTransaction } from '../../types';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBots: 0,
    totalRevenue: 0,
    activeSubscriptions: 0
  });

  useEffect(() => {
    if (!DatabaseService.isAdminLoggedIn()) {
      navigate('/a/admin');
    }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const users = await DatabaseService.getUsers();
      const bots = await DatabaseService.getBots();
      const transactions = await DatabaseService.getTransactions();
      
      const totalRev = transactions.reduce((acc, curr) => acc + (curr.amount || 0), 0);

      setStats({
        totalUsers: users.length,
        totalBots: bots.length,
        totalRevenue: totalRev || 0,
        activeSubscriptions: users.filter(u => u.badges?.includes('Premium')).length
      });
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const SidebarItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to} 
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
          isActive 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
        }`}
      >
        <Icon size={20} />
        <span className="font-medium">{label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-200">
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Package className="text-white" size={24} />
            </div>
            <h2 className="text-xl font-bold text-white">BotlyHub V3</h2>
          </div>
          <nav className="flex-1 space-y-2">
            <SidebarItem to="/a/dashboard" icon={LayoutDashboard} label="Genel Bakış" />
            <SidebarItem to="/a/dashboard/users" icon={Users} label="Kullanıcılar" />
            <SidebarItem to="/a/dashboard/bots" icon={Bot} label="Bot Yönetimi" />
            <SidebarItem to="/a/dashboard/finance" icon={CreditCard} label="İşlemler" />
            <div className="my-4 border-t border-slate-800/50"></div>
            <SidebarItem to="/a/dashboard/settings" icon={Settings} label="Ayarlar" />
          </nav>
          <button onClick={() => { DatabaseService.logoutAdmin(); navigate('/a/admin'); }} className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all mt-auto">
            <LogOut size={20} />
            <span className="font-medium">Çıkış Yap</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 p-6 flex justify-between items-center">
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 hover:bg-slate-800 rounded-lg"><Menu /></button>
          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
              <img src="https://ui-avatars.com/api/?name=Admin" className="w-8 h-8 rounded-full border border-slate-700" />
              <span className="text-sm font-bold text-white hidden sm:inline">Botly Admin</span>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Overview stats={stats} loading={loading} onRefresh={loadData} />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/bots" element={<BotManagement />} />
            <Route path="/finance" element={<FinanceManagement />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

// --- Sub-Component: Overview ---
const Overview = ({ stats, loading, onRefresh }: any) => (
  <div className="animate-in fade-in duration-500">
    <div className="flex justify-between items-end mb-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Genel Bakış</h1>
        <p className="text-slate-500 mt-1">Platformun anlık veritabanı durumu.</p>
      </div>
      <button onClick={onRefresh} className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        Verileri Yenile
      </button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      <StatCard label="Toplam Kullanıcı" value={stats.totalUsers} icon={Users} color="blue" />
      <StatCard label="Yayındaki Bot" value={stats.totalBots} icon={Bot} color="emerald" />
      <StatCard label="Toplam Ciro" value={`₺${stats.totalRevenue.toLocaleString()}`} icon={DollarSign} color="purple" />
      <StatCard label="Premium Üyeler" value={stats.activeSubscriptions} icon={TrendingUp} color="orange" />
    </div>
  </div>
);

// --- Sub-Component: User Management ---
const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    setLoading(true);
    const data = await DatabaseService.getUsers();
    setUsers(data);
    setLoading(false);
  };

  const toggleUserStatus = async (user: User) => {
    const newStatus = user.status === 'Active' ? 'Passive' : 'Active';
    await DatabaseService.updateUser({ ...user, status: newStatus as any });
    loadUsers();
  };

  return (
    <div className="animate-in fade-in">
      <h1 className="text-2xl font-bold mb-6">Kullanıcı Yönetimi</h1>
      {loading ? <Loader2 className="animate-spin mx-auto mt-20 text-blue-500" /> : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-800/50 border-b border-slate-800">
              <tr>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Kullanıcı</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Rol / Durum</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Kayıt Tarihi</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-800/20">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-500 font-bold">{user.name?.[0]}</div>
                      <div>
                        <p className="text-sm font-bold">{user.name}</p>
                        <p className="text-xs text-slate-500">@{user.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-500">{user.role}</span>
                      <span className={`text-[10px] w-max px-2 py-0.5 rounded ${user.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                        {user.status === 'Active' ? 'Aktif' : 'Pasif'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-400">{new Date(user.joinDate).toLocaleDateString()}</td>
                  <td className="p-4">
                    <button onClick={() => toggleUserStatus(user)} className="text-xs font-bold text-blue-500 hover:underline">
                      Durumu Değiştir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// --- Sub-Component: Bot Management (CRUD) ---
const BotManagement = () => {
  const [bots, setBots] = useState<BotType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingBot, setEditingBot] = useState<Partial<BotType> | null>(null);

  useEffect(() => { loadBots(); }, []);

  const loadBots = async () => {
    setLoading(true);
    const data = await DatabaseService.getBots();
    setBots(data);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBot) return;
    try {
      await DatabaseService.saveBot(editingBot);
      setModalOpen(false);
      loadBots();
    } catch (err) { alert("Hata oluştu."); }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bu botu silmek istediğine emin misin?")) {
      await DatabaseService.deleteBot(id);
      loadBots();
    }
  };

  const openModal = (bot: BotType | null = null) => {
    setEditingBot(bot || { name: '', description: '', price: 0, category: 'productivity', icon: 'https://picsum.photos/seed/new/200' });
    setModalOpen(true);
  };

  return (
    <div className="animate-in fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bot Yönetimi</h1>
        <button onClick={() => openModal()} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
          <Plus size={18} /> Yeni Bot Ekle
        </button>
      </div>

      {loading ? <Loader2 className="animate-spin mx-auto mt-20 text-blue-500" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bots.map(bot => (
            <div key={bot.id} className="bg-slate-900 border border-slate-800 p-5 rounded-3xl group">
              <div className="flex items-center gap-4 mb-4">
                <img src={bot.icon} className="w-14 h-14 rounded-2xl object-cover bg-slate-800" />
                <div className="min-w-0">
                  <h4 className="font-bold text-white truncate">{bot.name}</h4>
                  <p className="text-xs text-slate-500 uppercase font-bold">{bot.category}</p>
                </div>
              </div>
              <p className="text-sm text-slate-400 line-clamp-2 mb-4 h-10">{bot.description}</p>
              <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                <span className="font-bold text-emerald-400">₺{bot.price}</span>
                <div className="flex gap-2">
                  <button onClick={() => openModal(bot)} className="p-2 bg-slate-800 hover:bg-blue-500/10 hover:text-blue-500 rounded-lg transition-all text-slate-400"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(bot.id)} className="p-2 bg-slate-800 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-all text-slate-400"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bot Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden p-8">
            <h3 className="text-xl font-bold mb-6">{editingBot?.id ? 'Botu Düzenle' : 'Yeni Bot Ekle'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Bot İsmi</label>
                <input type="text" value={editingBot?.name} onChange={e => setEditingBot({...editingBot!, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:border-blue-500 outline-none" required />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Açıklama</label>
                <textarea value={editingBot?.description} onChange={e => setEditingBot({...editingBot!, description: e.target.value})} className="w-full h-24 bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:border-blue-500 outline-none resize-none" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">Fiyat (₺)</label>
                  <input type="number" value={editingBot?.price} onChange={e => setEditingBot({...editingBot!, price: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:border-blue-500 outline-none" required />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">Kategori</label>
                  <select value={editingBot?.category} onChange={e => setEditingBot({...editingBot!, category: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:border-blue-500 outline-none">
                    <option value="productivity">Üretkenlik</option>
                    <option value="games">Oyun</option>
                    <option value="finance">Finans</option>
                    <option value="moderation">Moderasyon</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">İkon URL</label>
                <input type="text" value={editingBot?.icon} onChange={e => setEditingBot({...editingBot!, icon: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:border-blue-500 outline-none" required />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-3 text-sm font-bold text-slate-400 hover:bg-slate-800 rounded-xl transition-all">İptal</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2">
                  <Save size={18} /> Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Sub-Component: Finance Management ---
const FinanceManagement = () => {
  const [txs, setTxs] = useState<CryptoTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    DatabaseService.getTransactions().then(data => { setTxs(data); setLoading(false); });
  }, []);

  return (
    <div className="animate-in fade-in">
      <h1 className="text-2xl font-bold mb-6">Finansal İşlemler</h1>
      {loading ? <Loader2 className="animate-spin mx-auto mt-20 text-blue-500" /> : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-800/50 border-b border-slate-800">
              <tr>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">İşlem ID</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Tür</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Miktar</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Tarih</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {txs.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-800/20">
                  <td className="p-4 text-xs font-mono text-slate-500">{tx.hash?.substring(0, 12)}...</td>
                  <td className="p-4 text-sm font-bold">{tx.type}</td>
                  <td className={`p-4 text-sm font-bold ${tx.type === 'Withdrawal' ? 'text-red-400' : 'text-emerald-400'}`}>
                    {tx.type === 'Withdrawal' ? '-' : '+'}{tx.amount} {tx.symbol}
                  </td>
                  <td className="p-4 text-xs text-slate-400">{new Date(tx.date).toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${tx.status === 'Success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
              {txs.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-600 italic">Henüz bir finansal kayıt bulunmuyor.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color }: any) => (
  <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-sm hover:border-slate-700 transition-all">
    <div className={`w-12 h-12 rounded-2xl bg-${color}-600/10 text-${color}-500 flex items-center justify-center mb-4`}>
      <Icon size={24} />
    </div>
    <p className="text-slate-500 text-sm font-medium">{label}</p>
    <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
  </div>
);

export default AdminDashboard;

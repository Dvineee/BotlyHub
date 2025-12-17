
import React, { useEffect, useState } from 'react';
import { useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Bot, CreditCard, Settings, 
  LogOut, Menu, X, TrendingUp, DollarSign, Package, 
  ArrowUpRight, BarChart3, Bell
} from 'lucide-react';
import { DatabaseService } from '../../services/DatabaseService';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
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
    loadStats();
  }, [navigate]);

  const loadStats = async () => {
    const users = await DatabaseService.getUsers();
    const bots = await DatabaseService.getBots();
    // Simulate some stats
    setStats({
      totalUsers: users.length + 1240,
      totalBots: bots.length,
      totalRevenue: 42500,
      activeSubscriptions: 420
    });
  };

  const handleLogout = () => {
    DatabaseService.logoutAdmin();
    navigate('/a/admin');
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
      {/* Sidebar */}
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
            <SidebarItem to="/a/dashboard/finance" icon={CreditCard} label="Finansal İşlemler" />
            <div className="my-4 border-t border-slate-800/50"></div>
            <SidebarItem to="/a/dashboard/settings" icon={Settings} label="Site Ayarları" />
          </nav>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all mt-auto"
          >
            <LogOut size={20} />
            <span className="font-medium">Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 p-6 flex justify-between items-center">
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 hover:bg-slate-800 rounded-lg">
            <Menu />
          </button>
          <div className="flex items-center gap-4 ml-auto">
            <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
              <img src="https://ui-avatars.com/api/?name=Admin" className="w-8 h-8 rounded-full border border-slate-700" alt="Admin" />
              <span className="text-sm font-bold text-white hidden sm:inline">Botly Admin</span>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={
              <div className="animate-in fade-in duration-500">
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <h1 className="text-3xl font-bold text-white">Genel Bakış</h1>
                    <p className="text-slate-500 mt-1">Platformun güncel durumu ve istatistikleri.</p>
                  </div>
                  <div className="flex gap-3">
                    <button className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-sm font-bold">Rapor İndir</button>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                  <StatCard label="Toplam Kullanıcı" value={stats.totalUsers.toLocaleString()} icon={Users} color="blue" trend="+12%" />
                  <StatCard label="Yayındaki Bot" value={stats.totalBots.toString()} icon={Bot} color="emerald" trend="+2" />
                  <StatCard label="Aylık Ciro" value={`₺${stats.totalRevenue.toLocaleString()}`} icon={DollarSign} color="purple" trend="+24%" />
                  <StatCard label="Premium Üye" value={stats.activeSubscriptions.toString()} icon={TrendingUp} color="orange" trend="+5%" />
                </div>

                {/* Charts Area (Simulated) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        <BarChart3 size={20} className="text-blue-500" />
                        Kazanç Grafiği
                      </h3>
                      <select className="bg-slate-950 border border-slate-800 text-xs p-2 rounded-lg">
                        <option>Son 30 Gün</option>
                        <option>Son 6 Ay</option>
                      </select>
                    </div>
                    <div className="h-64 flex items-end justify-between gap-2 px-2">
                      {[40, 70, 45, 90, 65, 80, 50, 60, 85, 45, 75, 95].map((h, i) => (
                        <div key={i} className="flex-1 bg-blue-600/20 hover:bg-blue-600/40 rounded-t-lg transition-all relative group" style={{ height: `${h}%` }}>
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">₺{h * 100}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                    <h3 className="font-bold text-lg mb-6">Son İşlemler</h3>
                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-slate-950/50 rounded-xl border border-slate-800/50">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                              <ArrowUpRight size={14} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold truncate">Premium Alımı</p>
                              <p className="text-[10px] text-slate-500">2 dk önce</p>
                            </div>
                          </div>
                          <span className="text-sm font-bold text-emerald-400">+149₺</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            } />
            <Route path="/users" element={<AdminUsers />} />
            <Route path="/bots" element={<AdminBots />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color, trend }: any) => (
  <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-sm hover:border-slate-700 transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl bg-${color}-600/10 text-${color}-500`}>
        <Icon size={24} />
      </div>
      <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg">{trend}</span>
    </div>
    <p className="text-slate-500 text-sm font-medium">{label}</p>
    <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
  </div>
);

// Placeholder sub-pages for Admin
const AdminUsers = () => (
  <div className="animate-in fade-in slide-in-from-right-4">
    <h1 className="text-2xl font-bold mb-6">Kullanıcı Yönetimi</h1>
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-slate-800/50 border-b border-slate-800">
          <tr>
            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Kullanıcı</th>
            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Durum</th>
            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Kayıt Tarihi</th>
            <th className="p-4 text-xs font-bold text-slate-500 uppercase">İşlem</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {[1,2,3,4,5].map(i => (
            <tr key={i} className="hover:bg-slate-800/20">
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800"></div>
                  <div>
                    <p className="text-sm font-bold">Kullanıcı #{i}</p>
                    <p className="text-xs text-slate-500">@user_{i}</p>
                  </div>
                </div>
              </td>
              <td className="p-4"><span className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded">Aktif</span></td>
              <td className="p-4 text-sm text-slate-400">12.05.2024</td>
              <td className="p-4"><button className="text-xs text-blue-500 font-bold">Düzenle</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const AdminBots = () => (
  <div className="animate-in fade-in slide-in-from-right-4">
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">Bot Yönetimi</h1>
      <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
        Yeni Bot Ekle
      </button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1,2,3,4,5,6].map(i => (
        <div key={i} className="bg-slate-900 border border-slate-800 p-4 rounded-3xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-slate-800 rounded-2xl"></div>
            <div>
              <h4 className="font-bold">Task Master Pro</h4>
              <p className="text-xs text-slate-500">Üretkenlik</p>
            </div>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-slate-800">
            <span className="font-bold text-emerald-400">₺29.90</span>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"><Settings size={16} /></button>
              <button className="p-2 hover:bg-red-500/10 rounded-lg text-red-500"><X size={16} /></button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default AdminDashboard;

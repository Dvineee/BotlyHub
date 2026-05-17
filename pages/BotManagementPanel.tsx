
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Users, Calendar, Terminal, Code, ShieldAlert, BarChart3, UserCog, History, 
  Settings, CreditCard, LogOut, LayoutDashboard, Globe, MessageSquare, 
  ChevronRight, Save, Download, Upload, RotateCcw, AlertCircle, Info, Star,
  Search, Filter, List, MoreVertical, Plus, Check, X, ShieldCheck, Zap,
  ExternalLink, ListOrdered, Sticker
} from 'lucide-react';
import { useTelegram } from '../hooks/useTelegram';
import { DatabaseService } from '../services/DatabaseService';
import { UserBot } from '../types';
import { motion, AnimatePresence } from 'motion/react';

const SidebarItem = ({ icon: Icon, label, path, active, badge, color, external }: any) => (
  <Link 
    to={path} 
    className={`flex items-center justify-between px-3 py-1.5 transition-all group ${
      active 
        ? 'bg-blue-600/10 text-blue-500 font-bold' 
        : 'text-slate-400 hover:text-white'
    }`}
  >
    <div className="flex items-center gap-3">
      <Icon size={16} className={`${active ? 'text-blue-500' : color ? color : 'text-slate-500 group-hover:text-white'} transition-colors`} />
      <span className="text-[12px] font-medium tracking-tight">{label}</span>
    </div>
    <div className="flex items-center gap-1.5">
      {badge && (
        <span className={`text-[8px] font-black px-1 py-0.5 rounded italic uppercase border ${
          active ? 'bg-white/20 text-white border-white/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
        }`}>
          {badge}
        </span>
      )}
      {external && <ExternalLink size={10} className="text-slate-600" />}
    </div>
  </Link>
);

const GroupCard = ({ name, username, members, active, onClick }: any) => (
  <motion.div 
    whileHover={{ y: -4 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="group relative bg-[#1c222d] border border-white/5 rounded-2xl p-4 hover:border-blue-500/30 transition-all cursor-pointer"
  >
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-xl font-black text-white italic">
          {name[0].toUpperCase()}
        </div>
        <div>
          <h4 className="text-sm font-bold text-white tracking-tight">{name}</h4>
          <span className="text-[10px] text-slate-500 font-medium">@{username} • {members} Üye</span>
        </div>
      </div>
      <MoreVertical size={16} className="text-slate-600" />
    </div>
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${active ? 'bg-emerald-500' : 'bg-slate-600'}`}></div>
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
        {active ? 'Aktif' : 'Pasif'}
      </span>
    </div>
  </motion.div>
);

const BotManagementPanel = () => {
  const { botId, groupId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, haptic } = useTelegram();
  const [bot, setBot] = useState<UserBot | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBot = async () => {
      setIsLoading(true);
      if (botId && user?.id) {
        const bots = await DatabaseService.getUserBots(user.id.toString());
        const found = bots.find(b => b.id === botId);
        if (found) setBot(found);
      }
      setIsLoading(false);
    };
    fetchBot();
  }, [botId, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f1218] flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="text-blue-500">
           <RotateCcw size={40} />
        </motion.div>
      </div>
    );
  }

  if (!bot) {
    return (
      <div className="min-h-screen bg-[#0f1218] flex flex-col items-center justify-center text-white gap-4">
        <AlertCircle size={48} className="text-red-500" />
        <h2 className="text-xl font-bold">Bot Bulunamadı</h2>
        <button onClick={() => navigate('/my-bots')} className="bg-white/10 px-6 py-2 rounded-xl text-sm font-bold">Geri Dön</button>
      </div>
    );
  }

  const globalNavItems = [
    { label: 'Gruplar', icon: Users, path: 'groups' },
    { label: 'Zamanlayıcı', icon: Calendar, path: 'scheduler' },
    { label: 'Komutlar', icon: Terminal, path: 'commands' },
    { label: 'API', icon: Code, path: 'api' },
  ];

  const groupNavItems = [
    { label: 'Ayarlar', icon: Settings, path: `groups/${groupId}/settings`, color: 'text-blue-500' },
    { label: 'Combot AI', icon: Zap, path: `groups/${groupId}/ai`, color: 'text-blue-500' },
    { label: 'Pro', icon: Star, path: `groups/${groupId}/pro`, color: 'text-blue-500' },
    { label: 'Moderasyon', icon: ShieldCheck, path: `groups/${groupId}/moderation`, color: 'text-blue-500' },
    { label: 'Analiz', icon: BarChart3, path: `groups/${groupId}/analysis`, color: 'text-blue-500' },
    { label: 'Kullanıcılar', icon: UserCog, path: `groups/${groupId}/users`, color: 'text-blue-500' },
    { label: 'Yönlendirmeler', icon: Globe, path: `groups/${groupId}/referrals`, color: 'text-blue-500' },
    { label: 'Günlük', icon: History, path: `groups/${groupId}/logs`, color: 'text-blue-500' },
    { label: 'Sıralama', icon: ListOrdered, path: `groups/${groupId}/ranking`, color: 'text-blue-500' },
  ];

  const externalNavItems = [
    { label: 'Combot Anti-Spam', icon: ShieldAlert, path: 'antispam', external: true },
    { label: 'Telegram Top Groups', icon: Globe, path: 'top-groups', external: true },
    { label: 'Stickers Catalogue', icon: Sticker, path: 'stickers', external: true },
  ];

  return (
    <div className="min-h-screen bg-[#0f1218] flex text-slate-300 font-sans selection:bg-blue-500/30">
      {/* Sidebar */}
      <aside className="w-60 bg-[#11141a] border-r border-white/5 flex flex-col sticky top-0 h-screen overflow-y-auto no-scrollbar">
        <div className="p-4 flex-1">
          {/* Brand Header */}
          <Link to="/" className="flex items-center gap-2 px-3 mb-6">
            <div className="w-8 h-8 rounded-full border-2 border-white/10 flex items-center justify-center p-1 overflow-hidden shrink-0">
               <div className="w-full h-full bg-blue-600 rounded-full flex items-center justify-center">
                 <div className="flex gap-0.5">
                   <div className="w-0.5 h-3 bg-white/20"></div>
                   <div className="w-0.5 h-4 bg-white"></div>
                   <div className="w-0.5 h-2 bg-white/40"></div>
                 </div>
               </div>
            </div>
            <span className="font-bold text-white text-lg tracking-tight">Combot</span>
          </Link>

          <div className="space-y-4">
            {/* Global Nav */}
            <div className="space-y-0.5">
              {globalNavItems.map((item) => (
                <SidebarItem 
                  key={item.path}
                  icon={item.icon}
                  label={item.label}
                  path={`/bot-panel/${botId}/${item.path}`}
                  active={location.pathname.includes(`/${item.path}`) && !groupId}
                />
              ))}
            </div>

            {/* Current Active Item (Kaju Test) */}
            {groupId ? (
              <div className="space-y-1">
                <div className="px-3 py-2 flex items-center justify-between group cursor-pointer hover:bg-white/2 transition-all rounded-lg mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full border border-white/10 overflow-hidden shrink-0">
                       <img src="https://botlyhub.com/kaju-logo.png" alt="Kaju" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-[12px] font-bold text-white leading-tight">KAJU TEST</h4>
                      <span className="text-[10px] text-slate-500 lowercase leading-tight">@botlyhub</span>
                    </div>
                  </div>
                  <ChevronRight size={14} className="rotate-90 text-slate-600" />
                </div>

                {/* Sub-Nav Group */}
                <div className="space-y-0.5">
                  {groupNavItems.map((item) => (
                    <SidebarItem 
                      key={item.path}
                      icon={item.icon}
                      label={item.label}
                      color={item.color}
                      path={`/bot-panel/${botId}/${item.path}`}
                      active={location.pathname.includes(`/${item.path.split('/').pop()}`)}
                    />
                  ))}
                </div>
              </div>
            ) : (
                <div className="px-3 py-4 text-center border border-dashed border-white/5 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Grup Seçilmedi</p>
                </div>
            )}

            {/* External Links Section */}
            <div className="space-y-0.5 pt-4 border-t border-white/5">
              {externalNavItems.map((item) => (
                <SidebarItem 
                  key={item.path}
                  icon={item.icon}
                  label={item.label}
                  path="#"
                  external={true}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer Brand Branding */}
        <div className="mt-auto p-4 border-t border-white/5 bg-[#0d1014]">
          <div className="px-3 mb-4">
             <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">Kaju</h3>
          </div>
          <div className="space-y-0.5">
            <SidebarItem icon={Settings} label="Ayarlar" path={`/bot-panel/${botId}/bot-settings`} active={location.pathname.includes('bot-settings')} />
            <SidebarItem icon={CreditCard} label="Faturalandırma" path={`/bot-panel/${botId}/billing`} active={location.pathname.includes('billing')} />
            <button 
              onClick={() => { haptic('medium'); navigate('/my-bots'); }}
              className="w-full flex items-center gap-3 px-3 py-1.5 text-slate-500 hover:text-red-400 transition-all group"
            >
              <LogOut size={16} className="text-slate-500 group-hover:text-red-400" />
              <span className="text-[12px] font-medium tracking-tight">Çıkış Yap</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-[#14181f]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8 z-20">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-black text-white italic overflow-hidden shadow-lg shadow-black/20">
               {bot.icon ? <img src={bot.icon} alt={bot.name} className="w-full h-full object-cover" /> : bot.name[0].toUpperCase()}
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase italic tracking-widest">{bot.name}</h2>
              <span className="text-[10px] text-slate-500 font-bold tracking-widest">{groupId ? 'Grup Yönetimi' : 'Yönetim Paneli'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <button className="h-10 px-4 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
               <Save size={14} />
               Kaydet
             </button>
             <button className="h-10 px-4 flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
               <Download size={14} />
               Alıntı
             </button>
             <button className="h-10 px-4 flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
               <Upload size={14} />
               Çıktı
             </button>
             <button className="h-10 px-4 flex items-center gap-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
               <RotateCcw size={14} />
               Sıfırla
             </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <Routes>
            <Route index element={<NavigateToGroups botId={botId} />} />
            <Route path="groups" element={<GroupsView />} />
            <Route path="groups/:groupId/settings" element={<GroupSettingsView />} />
            <Route path="groups/:groupId/moderation" element={<ModerationView />} />
            <Route path="groups/:groupId/analysis" element={<AnalysisView />} />
            <Route path="groups/:groupId/users" element={<UsersView />} />
            <Route path="*" element={<EmptyModule />} />
          </Routes>
        </div>

        {/* Footer */}
        <footer className="h-10 bg-[#14181f] border-t border-white/5 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-6">
            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">[0.091]</span>
            <div className="flex items-center gap-3">
              <a href="#" className="text-[9px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors">refund policy</a>
              <span className="text-slate-800">|</span>
              <a href="#" className="text-[9px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors">gizlilik politikası</a>
              <span className="text-slate-800">|</span>
              <a href="#" className="text-[9px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors">terms of service</a>
              <span className="text-slate-800">|</span>
              <a href="#" className="text-[9px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors">@combotchat</a>
              <span className="text-slate-800">|</span>
              <a href="#" className="text-[9px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors">@combotnews</a>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest tracking-widest">v3.4.1</span>
          </div>
        </footer>
      </main>
    </div>
  );
};

const NavigateToGroups = ({ botId }: any) => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(`/bot-panel/${botId}/groups`, { replace: true });
  }, []);
  return null;
};

const GroupSettingsView = () => {
    const [activeTab, setActiveTab] = useState('basic'); // basic or team
    const groupId = '-1003360909133'; // Prototype ID from image

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
            <div className="flex items-center gap-2 mb-8 bg-[#14181f] p-1.5 rounded-2xl w-fit border border-white/5">
                <button 
                  onClick={() => setActiveTab('basic')}
                  className={`h-11 px-6 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeTab === 'basic' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-white'
                  }`}
                >
                    <Settings size={14} />
                    Basic
                </button>
                <button 
                  onClick={() => setActiveTab('team')}
                  className={`h-11 px-6 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeTab === 'team' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-white'
                  }`}
                >
                    <Users size={14} />
                    Team
                </button>
            </div>

            {activeTab === 'basic' ? (
                <div className="space-y-8">
                    {/* ID Section */}
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">ID</label>
                        <div className="flex items-center gap-2">
                            <div className="h-12 flex-1 bg-[#14181f] border border-white/5 rounded-xl px-4 flex items-center font-mono text-sm text-white">
                                {groupId}
                            </div>
                            <button className="h-12 w-12 bg-white/5 hover:bg-white/10 text-white rounded-xl flex items-center justify-center transition-all">
                                <CreditCard size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Checkboxes */}
                    <div className="space-y-4">
                        <label className="flex items-start gap-3 group cursor-pointer">
                            <div className="mt-0.5">
                                <input type="checkbox" className="w-5 h-5 accent-blue-600 rounded bg-[#14181f] border-white/5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white group-hover:text-blue-500 transition-colors">Analizler sayfasını özel tut</h4>
                                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">Yalnızca kimliği doğrulanmış yöneticiler erişebilir</p>
                            </div>
                        </label>

                        <label className="flex items-start gap-3 group cursor-pointer">
                            <div className="mt-0.5">
                                <input type="checkbox" className="w-5 h-5 accent-blue-600 rounded bg-[#14181f] border-white/5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white group-hover:text-blue-500 transition-colors">Receive daily analytics report</h4>
                                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">Combot will send you a daily report about your group</p>
                            </div>
                        </label>
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Tags</label>
                        <div className="h-12 bg-[#14181f] border border-white/5 rounded-xl px-4 flex items-center text-sm text-slate-500 italic">
                        </div>
                        <p className="text-[10px] text-slate-600 mt-2 italic flex items-center gap-1">
                            <Info size={10} /> At the moment, tag is only used for .gban command
                        </p>
                    </div>

                    {/* Language */}
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Language</label>
                        <div className="h-12 bg-[#14181f] border border-white/5 rounded-xl px-4 flex items-center justify-between group cursor-pointer hover:border-white/10 transition-all">
                            <span className="text-sm text-white font-medium">English (English)</span>
                            <ChevronRight size={16} className="rotate-90 text-slate-600" />
                        </div>
                    </div>

                    {/* Anti-Spam */}
                    <div className="bg-blue-600/5 border border-blue-500/10 p-6 rounded-[32px]">
                        <label className="flex items-start gap-4 cursor-pointer group">
                            <div className="mt-1">
                                <input type="checkbox" defaultChecked className="w-6 h-6 accent-blue-600 rounded-lg" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-white italic uppercase tracking-tighter mb-1">Combot Anti-Spam (CAS) kullan</h4>
                                <p className="text-xs text-slate-400 leading-relaxed font-medium">Combot Anti-Spam, Telegram'daki spam gönderenleri tespit etmek için tasarlanmış otomatik bir sistemdir. Grubunuzu korur!</p>
                            </div>
                        </label>
                    </div>

                    {/* Footer Checkboxes */}
                    <div className="space-y-6 pt-4 border-t border-white/5">
                        <label className="flex items-start gap-3 group cursor-pointer">
                            <div className="mt-0.5"><input type="checkbox" className="w-5 h-5 accent-blue-600" /></div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-bold text-white">Yasaklamaları duyurma</h4>
                                    <span className="text-[9px] font-black bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded italic uppercase">Pro</span>
                                </div>
                                <p className="text-[11px] text-orange-400/60 leading-relaxed font-medium">Yasaklamaları duyurma yalnızca Pro'da kullanılabilir. Kullanmak için Pro'ya yükseltin.</p>
                            </div>
                        </label>

                        <label className="flex items-start gap-3 group cursor-pointer">
                            <div className="mt-0.5"><input type="checkbox" className="w-5 h-5 accent-blue-600" /></div>
                            <div>
                                <h4 className="text-sm font-bold text-white">Katılmama "Top Telegram Chats"</h4>
                                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">24 saat içinde yürürlüğe girer</p>
                            </div>
                        </label>
                    </div>

                    {/* Custom Bot Section */}
                    <div className="group bg-gradient-to-br from-slate-900 to-[#0f1218] border border-white/5 p-8 rounded-[40px] relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Custom Bot</h3>
                                <span className="text-[10px] font-black bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded italic uppercase tracking-widest border border-blue-500/20">Pro</span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-lg mb-0 italic">
                                Combot yerine kendi botunuzu kullanın. Adını, kullanıcı adını, açıklamasını ve profil resmini ihtiyaçlarınıza göre özelleştirin.
                            </p>
                        </div>
                        <div className="absolute top-1/2 -right-10 -translate-y-1/2 opacity-5 pointer-events-none">
                            <Zap size={200} className="text-blue-500" />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-black text-white italic uppercase tracking-tighter mb-1">Yöneticiler</h2>
                            <p className="text-xs text-slate-500 font-medium flex items-center gap-1 italic">
                                <Info size={12} /> Combot'u yönetebilen yöneticiler
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                             <button className="h-10 px-4 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all">
                                <RotateCcw size={14} />
                                Yenile
                             </button>
                             <button className="h-10 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20">
                                <Plus size={14} />
                                Yönetici ekle
                             </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {[
                            { id: '210944655', name: 'Combot', user: '@combot', isBot: true },
                            { id: '842614237', name: 'KAJU', user: '@kajju66', isBot: false },
                        ].map((admin, i) => (
                            <div key={i} className="bg-[#14181f] border border-white/5 rounded-[24px] p-4 flex items-center gap-4 group hover:border-blue-500/30 transition-all cursor-pointer">
                                <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center p-1 overflow-hidden">
                                    <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center font-black text-white italic text-xs">
                                        {admin.name[0]}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-xs font-black text-blue-500 italic tracking-tighter">{admin.id}</span>
                                        <h4 className="text-sm font-bold text-white">{admin.name}</h4>
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-medium">{admin.user}</span>
                                </div>
                                <div className="p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreVertical size={16} className="text-slate-600" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const GroupsView = () => {
  const { botId } = useParams();
  const navigate = useNavigate();
  const { haptic } = useTelegram();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-1">Gruplar</h1>
          <p className="text-sm text-slate-500 font-medium">Botunuzun bağlı olduğu grupları ve kanalları yönetin.</p>
        </div>
        <button className="h-12 px-6 flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20">
          <Plus size={16} />
          Yeni Grup / Kanal Ekle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <GroupCard 
          name="Kaju Test" 
          username="kajugroup" 
          members="1.2k" 
          active={true} 
          onClick={() => { haptic('light'); navigate(`/bot-panel/${botId}/groups/kaju-test/settings`); }} 
        />
        <GroupCard 
          name="Kaju Community" 
          username="kajucomm" 
          members="4.8k" 
          active={true} 
          onClick={() => { haptic('light'); navigate(`/bot-panel/${botId}/groups/kaju-comm/settings`); }} 
        />
        <GroupCard 
          name="BotlyHub Haberler" 
          username="botlyhubnews" 
          members="8.5k" 
          active={true} 
          onClick={() => { haptic('light'); navigate(`/bot-panel/${botId}/groups/botlyhub-news/settings`); }} 
        />
        <GroupCard 
          name="Yeni deneme" 
          username="veriverkin" 
          members="7" 
          active={false} 
          onClick={() => { haptic('light'); navigate(`/bot-panel/${botId}/groups/test-group/settings`); }} 
        />
      </div>

      <div className="bg-orange-500/5 border border-orange-500/20 rounded-3xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/20 flex items-center justify-center shrink-0">
            <Info className="text-orange-500" size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-orange-200 mb-1 italic uppercase tracking-tight">Grubumu göremiyorum, ne yapmalıyım?</h4>
            <p className="text-xs text-orange-200/60 font-medium leading-relaxed">
              Grubunuzda yöneticiyseniz ve botu eklediyseniz ama burada göremiyorsanız, grubunuzda <code className="bg-orange-500/10 px-2 py-0.5 rounded text-orange-500 font-black">!reload_admins</code> yazın.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ModerationView = () => {
  const [activeTab, setActiveTab] = useState('general');
  const tabs = [
    { id: 'general', label: 'Temel Ayarlar' },
    { id: 'users', label: 'Yeni Üyeler' },
    { id: 'filters', label: 'Filtreler' },
    { id: 'fun', label: 'Eğlence' },
    { id: 'comments', label: 'Yorumlar' },
    { id: 'tools', label: 'Araçlar' },
    { id: 'triggers', label: 'Tetikleyiciler V2', premium: true },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
        {tabs.map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap px-6 h-12 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id 
                ? 'bg-slate-800 text-white border border-white/10' 
                : 'text-slate-500 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            {tab.label}
            {tab.premium && <Star size={10} className="text-amber-500" />}
          </button>
        ))}
      </div>

      <div className="bg-[#14181f] border border-white/5 rounded-[40px] p-10">
        <div className="flex items-center gap-2 mb-8">
           <LayoutDashboard className="text-blue-500" size={20} />
           <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Beyaz Liste</h2>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between px-2">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Kullanıcı Listesi</label>
               <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">3 Kullanıcı</span>
            </div>
            <textarea 
               className="w-full h-40 bg-[#0f1218] border border-white/5 rounded-3xl p-6 text-sm text-white outline-none focus:border-blue-500/30 transition-all placeholder:text-slate-700"
               placeholder="Telegram ID veya kullanıcı adlarını alt alta yazarak ekleyin..."
            ></textarea>
            <p className="text-[10px] text-slate-600 font-medium italic">
              Beyaz listeye giren kullanıcılar denetime tabi değildir. Sistem onları güvenilir olarak işaretler.
            </p>
          </div>

          <label className="flex items-center gap-4 group cursor-pointer w-fit p-4 bg-white/5 rounded-2xl border border-transparent hover:border-white/10 transition-all">
             <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center group-hover:bg-slate-700 transition-colors">
                <input type="checkbox" className="w-5 h-5 rounded accent-blue-600" />
             </div>
             <div>
                <h4 className="text-sm font-bold text-white group-hover:text-blue-500 transition-colors">Yalnızca Beyaz Liste</h4>
                <p className="text-[10px] text-slate-500 font-medium">Sadece listedeki kullanıcılar mesaj gönderebilir.</p>
             </div>
          </label>
        </div>
      </div>
    </div>
  );
}

const AnalysisView = () => (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="flex items-center justify-between mb-8">
       <div>
         <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-1">Analiz</h1>
         <p className="text-sm text-slate-500 font-medium">Grubunuzun büyüme ve etkileşim verilerini takip edin.</p>
       </div>
       <div className="flex items-center gap-3">
          <div className="bg-[#14181f] border border-white/5 rounded-xl px-4 h-10 flex items-center gap-3">
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Son 7 gün</span>
             <ChevronRight size={14} className="rotate-90 text-slate-500" />
          </div>
          <div className="bg-[#14181f] border border-white/5 rounded-xl px-4 h-10 flex items-center gap-3">
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">11.05.2026 - 17.05.2026</span>
          </div>
          <div className="flex items-center gap-2 ml-4">
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ort. DAU</span>
             <span className="text-sm font-black text-white italic">0</span>
             <span className="mx-2 text-slate-800">|</span>
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ort. Günlük Mesaj</span>
             <span className="text-sm font-black text-white italic">0</span>
          </div>
       </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
       <div className="bg-[#14181f] border border-white/5 rounded-3xl p-8">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Toplam Mesaj</span>
          <div className="flex items-end gap-3 px-1">
             <h2 className="text-4xl font-black text-white italic tracking-tighter">84.2k</h2>
             <span className="text-xs font-bold text-emerald-500 mb-2">+12%</span>
          </div>
       </div>
       <div className="bg-[#14181f] border border-white/5 rounded-3xl p-8">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Aktif Üye</span>
          <div className="flex items-end gap-3 px-1">
             <h2 className="text-4xl font-black text-white italic tracking-tighter">1.2k</h2>
             <span className="text-xs font-bold text-blue-500 mb-2">~ Stabil</span>
          </div>
       </div>
       <div className="bg-[#14181f] border border-white/5 rounded-3xl p-8">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Engellenen Spam</span>
          <div className="flex items-end gap-3 px-1">
             <h2 className="text-4xl font-black text-white italic tracking-tighter">3.5k</h2>
             <span className="text-xs font-bold text-red-500 mb-2">+5.4%</span>
          </div>
       </div>
       <div className="bg-[#14181f] border border-white/5 rounded-3xl p-8">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Sunucu Gecikme</span>
          <div className="flex items-end gap-3 px-1">
             <h2 className="text-4xl font-black text-white italic tracking-tighter">42ms</h2>
             <span className="text-xs font-bold text-emerald-500 mb-2">-2ms</span>
          </div>
       </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
       <div className="bg-[#14181f] border border-white/5 rounded-[40px] p-10 h-96 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="relative z-10 text-center">
             <BarChart3 size={48} className="text-blue-500/20 mx-auto mb-4" />
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Büyüme Grafiği</span>
             <p className="text-xs text-slate-600 font-medium italic mt-2 italic capitalize tracking-widest">Veriler yükleniyor...</p>
          </div>
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,transparent_25%,rgba(59,130,246,.05)_50%,transparent_75%)] bg-[length:20px_20px]"></div>
       </div>
       <div className="bg-[#14181f] border border-white/5 rounded-[40px] p-10 h-96">
          <h3 className="text-lg font-black text-white italic uppercase tracking-tighter mb-8">Etkinlik Zaman Çizelgesi</h3>
          <div className="space-y-6">
             {[1,2,3,4].map(i => (
               <div key={i} className="flex gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 group-hover:bg-blue-600 transition-all group-hover:text-white text-slate-500">
                    <History size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white mb-0.5">Sistem Güncellemesi</h4>
                    <span className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">12:45 • Otomatik Yedekleme</span>
                  </div>
               </div>
             ))}
          </div>
       </div>
    </div>
  </div>
);

const UsersView = () => (
  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="bg-[#14181f] border border-white/5 rounded-[40px] overflow-hidden">
      <div className="p-8 border-b border-white/5 flex items-center justify-between">
        <h3 className="text-lg font-black text-white italic uppercase tracking-tighter">Üye Yönetimi</h3>
        <div className="flex items-center gap-3">
           <div className="relative">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="text" placeholder="Üye ara..." className="bg-[#0f1218] border border-white/5 rounded-xl pl-10 pr-4 h-10 text-xs text-white outline-none focus:border-blue-500/30 w-64" />
           </div>
           <button className="h-10 px-4 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2">
             <Filter size={14} />
             Filtrele
           </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/2 border-b border-white/5">
               <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">ID</th>
               <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Kullanıcı</th>
               <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Karma (XP)</th>
               <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Mesaj</th>
               <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Son Görülme</th>
               <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {[1,2,3,4,5].map(i => (
              <tr key={i} className="hover:bg-white/2 transition-colors">
                <td className="px-8 py-5 text-[10px] font-medium text-slate-500 tracking-widest">842614237</td>
                <td className="px-8 py-5">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-black text-white italic text-xs">K</div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Kenan Ekinci</h4>
                        <span className="text-[10px] text-blue-500 font-bold lowercase tracking-wider">@kajju66</span>
                      </div>
                   </div>
                </td>
                <td className="px-8 py-5 text-xs font-black text-amber-500 italic">420 XP</td>
                <td className="px-8 py-5 text-xs font-bold text-white">1,245</td>
                <td className="px-8 py-5 text-[10px] font-medium text-slate-500 uppercase tracking-widest">16.05.2026 23:09</td>
                <td className="px-8 py-5 text-right">
                  <button className="text-slate-600 hover:text-white transition-colors"><MoreVertical size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-8 bg-white/2 border-t border-white/5 flex items-center justify-between">
         <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">1 - 5 / 154 kullanıcı gösteriliyor</span>
         <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white disabled:opacity-20"><ChevronRight size={16} className="rotate-180" /></button>
            <button className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black italic">1</button>
            <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white font-black italic">2</button>
            <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white disabled:opacity-20"><ChevronRight size={16} /></button>
         </div>
      </div>
    </div>
  </div>
);

const EmptyModule = () => (
  <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in">
    <Zap size={48} className="text-blue-500/20 mb-4" />
    <h3 className="text-lg font-black text-white italic uppercase tracking-tighter mb-2">Geliştirme Aşamasında</h3>
    <p className="text-sm text-slate-600 font-medium max-w-sm">
      Bu modül henüz prototip aşamasındadır. Yakında aktif hale getirilecektir.
    </p>
  </div>
);

export default BotManagementPanel;

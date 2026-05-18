
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Users, Calendar, Terminal, Code, ShieldAlert, BarChart3, UserCog, History, 
  Settings, CreditCard, LogOut, LayoutDashboard, Globe, MessageSquare, 
  ChevronRight, Save, Download, Upload, RotateCcw, AlertCircle, Info, Star,
  Search, Filter, List, MoreVertical, Plus, Check, X, ShieldCheck, Zap,
  ExternalLink, ListOrdered, Sticker, Lightbulb, Shield, Columns, UserPlus, Trophy, Clock,
  Loader2
} from 'lucide-react';
import LoginModal from '../components/LoginModal';
import { useTelegram } from '../hooks/useTelegram';
import { DatabaseService } from '../services/DatabaseService';
import { UserBot, Channel } from '../types';
import { motion, AnimatePresence } from 'motion/react';

const SidebarItem = ({ icon: Icon, label, path, active, badge, color, external }: any) => (
  <Link 
    to={path} 
    className={`flex items-center justify-between px-3 py-1.5 transition-all group rounded-lg ${
      active 
        ? 'bg-[#1e2430] text-blue-500 font-medium' 
        : 'text-slate-400 hover:text-white'
    }`}
  >
    <div className="flex items-center gap-3">
      <Icon size={18} className={`${active ? 'text-blue-500' : 'text-slate-500 group-hover:text-white'} transition-colors`} />
      <span className="text-[14px] font-medium tracking-tight">{label}</span>
    </div>
    <div className="flex items-center gap-1.5">
      {badge && (
        <span className={`text-[8px] font-black px-1 py-0.5 rounded italic uppercase border ${
          active ? 'bg-blue-500/20 text-blue-400 border-blue-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
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
    style={{ outline: 'solid 1px #1f222abf' }}
    className="group relative bg-transparent rounded-2xl p-4 hover:border-blue-500/30 transition-all cursor-pointer"
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
  const { user, haptic, notification, setWebAuthUser } = useTelegram();
  const [bot, setBot] = useState<UserBot | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Channel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

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

  useEffect(() => {
    const fetchGroup = async () => {
      if (groupId && user?.id) {
        const channels = await DatabaseService.getChannels(user.id.toString());
        const found = channels.find(c => c.id === groupId);
        if (found) setSelectedGroup(found);
      } else {
        setSelectedGroup(null);
      }
    };
    fetchGroup();
  }, [groupId, user]);

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
    { label: 'Ayarlar', icon: Settings, path: `groups/${groupId}/settings` },
    { label: 'Combot AI', icon: Lightbulb, path: `groups/${groupId}/ai` },
    { label: 'Pro', icon: Star, path: `groups/${groupId}/pro`, highlight: true },
    { label: 'Moderasyon', icon: Shield, path: `groups/${groupId}/moderation` },
    { label: 'Analiz', icon: Columns, path: `groups/${groupId}/analysis` },
    { label: 'Kullanıcılar', icon: Users, path: `groups/${groupId}/users` },
    { label: 'Yönlendirmeler', icon: UserPlus, path: `groups/${groupId}/referrals` },
    { label: 'Günlük', icon: Clock, path: `groups/${groupId}/logs` },
    { label: 'Sıralama', icon: Trophy, path: `groups/${groupId}/ranking` },
  ];

  const externalNavItems = [
    { label: 'Combot Anti-Spam', icon: ShieldAlert, path: 'antispam', external: true },
    { label: 'Telegram Top Groups', icon: Globe, path: 'top-groups', external: true },
    { label: 'Stickers Catalogue', icon: Sticker, path: 'stickers', external: true },
  ];

  return (
    <div className="bot-panel-scoped min-h-screen bg-[#0f1218] flex text-slate-300 font-sans selection:bg-blue-500/30">
      <style dangerouslySetInnerHTML={{ __html: `
        .bot-panel-scoped .bg-slate-800 {
            outline: solid 2px #ffffff08;
            --tw-bg-opacity: 1 !important;
        }
        .bot-panel-scoped .h-11 {
            margin: 2px !important;
            height: 1.75rem !important;
        }
      ` }} />
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
            {groupId && selectedGroup ? (
              <div className="space-y-1">
                <div onClick={() => navigate(`/bot-panel/${botId}/groups`)} className="px-3 py-2 flex items-center justify-between group cursor-pointer hover:bg-white/2 transition-all rounded-lg mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden shrink-0 flex items-center justify-center bg-slate-800 text-white font-bold text-xs italic">
                       {selectedGroup.icon ? <img src={selectedGroup.icon} alt={selectedGroup.name} className="w-full h-full object-cover" /> : selectedGroup.name[0].toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-[14px] font-bold text-white leading-tight uppercase tracking-tight">{selectedGroup.name}</h4>
                      <span className="text-[12px] text-slate-500 lowercase leading-tight">
                        {selectedGroup.telegram_id.startsWith('-') ? `ID: ${selectedGroup.telegram_id}` : `@${selectedGroup.telegram_id}`}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-slate-600" />
                </div>

                {/* Sub-Nav Group */}
                <div className="space-y-0.5">
                  {groupNavItems.map((item: any) => (
                    <SidebarItem 
                      key={item.path}
                      icon={item.icon}
                      label={item.label}
                      badge={item.highlight ? 'Pro' : undefined}
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
            {user ? (
              <button 
                onClick={() => { haptic('medium'); setWebAuthUser(null); }}
                className="w-full flex items-center gap-3 px-3 py-1.5 text-slate-500 hover:text-red-400 transition-all group"
              >
                <LogOut size={16} className="text-slate-500 group-hover:text-red-400" />
                <span className="text-[12px] font-medium tracking-tight">Çıkış Yap</span>
              </button>
            ) : (
                <button 
                onClick={() => { haptic('medium'); setIsLoginModalOpen(true); }}
                className="w-full flex items-center gap-3 px-3 py-1.5 text-blue-500 hover:text-blue-400 transition-all group"
              >
                <ShieldCheck size={16} className="text-blue-500 group-hover:text-blue-400" />
                <span className="text-[12px] font-medium tracking-tight">Giriş Yap</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onAuth={(user) => {
            setWebAuthUser(user);
            notification('success');
        }}
      />

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
             {user ? (
                <div className="flex items-center gap-3 border-r border-white/5 pr-3 mr-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black text-white uppercase italic leading-none">{user.name || user.username}</p>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter mt-1">@{user.username || 'user'}</p>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/20 overflow-hidden shrink-0 shadow-lg shadow-blue-500/10 capitalize flex items-center justify-center font-bold text-blue-400">
                        {user.avatar ? <img src={user.avatar} alt="User" className="w-full h-full object-cover" /> : (user.username?.[0] || user.id?.[0] || 'U')}
                    </div>
                </div>
             ) : (
                <button 
                    onClick={() => setIsLoginModalOpen(true)}
                    className="h-10 px-6 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all mr-3 shadow-lg shadow-blue-500/20"
                >
                    Giriş Yap
                </button>
             )}
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
            <Route path="scheduler" element={<SchedulerView />} />
            <Route path="commands" element={<CommandsView />} />
            <Route path="api" element={<APIView />} />
            <Route path="bot-settings" element={<BotSettingsView bot={bot} />} />
            <Route path="billing" element={<BillingView />} />
            
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
              <a href="#" className="text-[9px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors">İade Politikası</a>
              <span className="text-slate-800">|</span>
              <a href="#" className="text-[9px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors">gizlilik politikası</a>
              <span className="text-slate-800">|</span>
              <a href="#" className="text-[9px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors">hizmet şartları</a>
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
    const { groupId } = useParams();

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
                    Temel
                </button>
                <button 
                  onClick={() => setActiveTab('team')}
                  className={`h-11 px-6 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeTab === 'team' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-white'
                  }`}
                >
                    <Users size={14} />
                    Ekip
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
                                <h4 className="text-sm font-bold text-white group-hover:text-blue-500 transition-colors">Günlük analiz raporu al</h4>
                                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">Combot grubunuz hakkında günlük bir rapor gönderir</p>
                            </div>
                        </label>
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Etiketler</label>
                        <div className="h-12 bg-[#14181f] border border-white/5 rounded-xl px-4 flex items-center text-sm text-slate-500 italic">
                        </div>
                        <p className="text-[10px] text-slate-600 mt-2 italic flex items-center gap-1">
                            <Info size={10} /> Şu anda etiket yalnızca .gban komutu için kullanılır
                        </p>
                    </div>

                    {/* Language */}
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Dil</label>
                        <div className="h-12 bg-[#14181f] border border-white/5 rounded-xl px-4 flex items-center justify-between group cursor-pointer hover:border-white/10 transition-all">
                            <span className="text-sm text-white font-medium">Türkçe (Turkish)</span>
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
                                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Özel Bot</h3>
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

const BotSettingsView = ({ bot }: { bot: UserBot }) => {
    const [botData, setBotData] = useState(bot);
    
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl space-y-8">
            <div>
                <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-1">Bot Ayarları</h1>
                <p className="text-sm text-slate-500 font-medium">Botunuzun genel bilgilerini ve uygulama içi görünümünü yönetin.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Visual Settings */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-[#14181f] border border-white/5 rounded-[40px] p-8 text-center">
                        <div className="w-24 h-24 bg-slate-900 rounded-full mx-auto mb-6 flex items-center justify-center border-4 border-white/5 relative group cursor-pointer overflow-hidden shadow-2xl">
                            {botData.icon ? <img src={botData.icon} className="w-full h-full object-cover" /> : botData.name[0].toUpperCase()}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Upload size={20} className="text-white" />
                            </div>
                        </div>
                        <h4 className="text-sm font-bold text-white mb-1">{botData.name}</h4>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Bot Profil Resmi</span>
                    </div>

                    <div className="bg-blue-600/5 border border-blue-500/10 p-6 rounded-3xl">
                        <div className="flex items-center gap-3 mb-3">
                            <ShieldCheck size={20} className="text-blue-500" />
                            <span className="text-xs font-black text-white italic uppercase tracking-tighter">Durum</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-400">Pazar Yeri Durumu</span>
                            <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-black px-2 py-1 rounded-lg uppercase italic border border-emerald-500/20">Yayınlandı</span>
                        </div>
                    </div>
                </div>

                {/* Information Settings */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-[#14181f] border border-white/5 rounded-[40px] p-8 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Bot Adı</label>
                            <input 
                                type="text" 
                                value={botData.name} 
                                className="w-full h-12 bg-[#0f1218] border border-white/5 rounded-2xl px-4 text-sm text-white focus:border-blue-500/30 transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Kullanıcı Adı (Telegram)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-sm">@</span>
                                <input 
                                    type="text" 
                                    value={botData.slug} 
                                    disabled
                                    className="w-full h-12 bg-[#0f1218] border border-white/5 rounded-2xl pl-8 pr-4 text-sm text-slate-500 font-mono"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Açıklama</label>
                            <textarea 
                                className="w-full h-32 bg-[#0f1218] border border-white/5 rounded-2xl p-4 text-sm text-white focus:border-blue-500/30 transition-all resize-none"
                                defaultValue="Bu bot, kanallarınızı ve gruplarınızı yönetmenize yardımcı olan gelişmiş bir moderasyon sistemidir."
                            ></textarea>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Kategori</label>
                                <select className="w-full h-12 bg-[#0f1218] border border-white/5 rounded-2xl px-4 text-sm text-white appearance-none outline-none">
                                    <option>Moderasyon</option>
                                    <option>Eğlence</option>
                                    <option>Finans</option>
                                    <option>Oyun</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Fiyatlandırma</label>
                                <select className="w-full h-12 bg-[#0f1218] border border-white/5 rounded-2xl px-4 text-sm text-white appearance-none outline-none">
                                    <option>Ücretsiz</option>
                                    <option>Premium (Aylık/Yıllık)</option>
                                    <option>Tek Seferlik</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3">
                        <button className="h-12 px-8 flex items-center gap-2 bg-[#14181f] text-slate-400 hover:text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all">
                             İptal Et
                        </button>
                        <button className="h-12 px-8 flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20">
                             <Save size={16} />
                             Ayarları Kaydet
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const BillingView = () => {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8 max-w-5xl">
            <div>
                <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-1">Faturalandırma</h1>
                <p className="text-sm text-slate-500 font-medium">Plan ve abonelik durumunuzu yönetin.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Active Subscription Card */}
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl shadow-blue-600/20">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                    <Star className="text-white" size={24} fill="white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black italic uppercase tracking-tighter">Pro Plan</h3>
                                    <span className="text-[10px] font-black opacity-60 uppercase tracking-widest">Yıllık Abonelik</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-8 mb-10">
                                <div>
                                    <span className="text-[10px] font-black opacity-60 uppercase tracking-widest block mb-1">Durum</span>
                                    <p className="text-base font-bold italic">Yayında</p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-black opacity-60 uppercase tracking-widest block mb-1">Yenileme</span>
                                    <p className="text-base font-bold italic">14 Haziran 2026</p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-black opacity-60 uppercase tracking-widest block mb-1">Tutar</span>
                                    <p className="text-base font-bold italic">$99.99 / yıl</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <button className="h-12 px-8 bg-white text-blue-600 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">
                                    Planı Değiştir
                                </button>
                                <button className="h-12 px-8 bg-black/20 hover:bg-black/30 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all">
                                    Aboneliği Yönet
                                </button>
                            </div>
                        </div>
                        {/* Decorative Pattern */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none blur-3xl"></div>
                        <Zap size={240} className="absolute -bottom-20 -right-20 opacity-10 rotate-12" />
                    </div>

                    {/* Usage Stats */}
                    <div className="bg-[#14181f] border border-white/5 rounded-[40px] p-8">
                        <h4 className="text-sm font-black text-white italic uppercase tracking-widest mb-8">Kullanım Limitleri</h4>
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-slate-500">Maksimum Grup Sayısı</span>
                                    <span className="text-white">4 / Sınırsız</span>
                                </div>
                                <div className="h-2 bg-[#0f1218] rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-600 w-[15%] rounded-full shadow-lg shadow-blue-600/40"></div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-slate-500">Aylık Karşılanan İstek</span>
                                    <span className="text-white">84.2k / 1M</span>
                                </div>
                                <div className="h-2 bg-[#0f1218] rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-600 w-[8.4%] rounded-full shadow-lg shadow-blue-600/40"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-[#14181f] border border-white/5 rounded-[40px] p-8">
                        <h4 className="text-sm font-black text-white italic uppercase tracking-widest mb-6">Ödeme Yöntemi</h4>
                        <div className="flex items-center gap-4 p-4 bg-[#0f1218] border border-white/5 rounded-2xl mb-6">
                            <div className="w-10 h-6 bg-slate-800 rounded-md flex items-center justify-center overflow-hidden">
                                <CreditCard size={16} className="text-slate-500" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-bold text-white uppercase tracking-widest">•••• 4242</p>
                                <span className="text-[10px] text-slate-600 font-medium tracking-widest uppercase italic">Vade: 12/28</span>
                            </div>
                        </div>
                        <button className="w-full h-12 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                             Düzenle
                        </button>
                    </div>

                    <div className="bg-[#14181f] border border-white/5 rounded-[40px] p-8">
                        <h4 className="text-sm font-black text-white italic uppercase tracking-widest mb-6">Son İşlemler</h4>
                        <div className="space-y-4">
                            {[1, 2].map(i => (
                                <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 pb-4">
                                    <div>
                                        <p className="text-xs font-bold text-white mb-0.5">Yıllık Yenileme</p>
                                        <span className="text-[10px] text-slate-500 font-medium">14 Haz 2025</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black text-white italic">$99.99</p>
                                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Başarılı</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const GroupsView = () => {
  const { botId } = useParams();
  const navigate = useNavigate();
  const { haptic, user } = useTelegram();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChannels = async () => {
      setLoading(true);
      try {
        if (user?.id) {
          const userChannels = await DatabaseService.getChannels(user.id.toString());
          setChannels(userChannels);
        }
      } catch (error) {
        console.error("Error fetching channels:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchChannels();
  }, [user]);

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

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
           {[1, 2, 3].map((i) => (
             <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse"></div>
           ))}
        </div>
      ) : channels.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {channels.map((channel) => (
            <GroupCard 
              key={channel.id}
              name={channel.name} 
              username={channel.telegram_id.startsWith('-') ? `ID: ${channel.telegram_id}` : channel.telegram_id} 
              members={channel.memberCount.toLocaleString()} 
              active={channel.revenueEnabled} 
              onClick={() => { haptic('light'); navigate(`/bot-panel/${botId}/groups/${channel.id}/settings`); }} 
            />
          ))}
        </div>
      ) : (
        <div className="bg-[#14181f] border border-white/5 rounded-[32px] p-12 text-center mb-8">
          <Users size={48} className="text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Henüz Grup Yok</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">Botunuzu bir gruba ekleyerek ve yönetici yetkisi vererek başlayabilirsiniz.</p>
        </div>
      )}

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

const CommandsView = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const { haptic } = useTelegram();

    const botCommands = [
        {
          command: "!ban",
          description: "Grubunuzdaki üyeleri yasaklamak için mesajını alıntılayarak ya da kullanıcı adı/ID numarası kullanarak komutu yazın. Birden fazla üyeyi yasaklamak için aralarında birer boşluk bırakın.",
          usage: "!ban (@kullanıcıadı|12345) (30d|2w|10h|2m)",
          alternatives: ["!sban (Sessiz)"],
          notes: "Satır sonundan sonra nedenini belirtebilirsiniz."
        },
        {
          command: "!unban",
          description: "Grubunuzdaki üyelerin yasaklamasını kaldırmak için mesajını alıntılayarak ya da kullanıcı adı/ID numarası kullanarak komutu yazın. Birden fazla üyenin yasağını kaldırmak için aralarında birer boşluk bırakın.",
          usage: "!unban (@kullanıcıadı|12345)",
          alternatives: ["!sunban (Sessiz)"],
          notes: "Satır sonundan sonra nedenini belirtebilirsiniz."
        },
        {
          command: "!mute",
          description: "Grubunuzdaki üyeleri susturmak için mesajını alıntılayarak ya da kullanıcı adı/ID numarası kullanarak komutu yazın. Birden fazla üyeyi sessize almak için aralarında birer boşluk bırakın.",
          usage: "!mute (@kullanıcıadı|12345) (30d|2w|10h|2m)",
          alternatives: ["!smute (Sessiz)"],
          notes: "Satır sonundan sonra nedenini belirtebilirsiniz."
        },
        {
          command: "!unmute",
          description: "Grubunuzdaki susturulmuş üyelerin kısıtlamasını kaldırmak için mesajını alıntılayarak ya da kullanıcı adı/ID numarası kullanarak komutu yazın. Birden fazla üyenin sesini açmak için aralarında birer boşluk bırakın.",
          usage: "!unmute (@kullanıcıadı|12345)",
          notes: "Satır sonundan sonra nedenini belirtebilirsiniz."
        },
        {
          command: "!kick",
          description: "Grubunuzdaki üyeleri atmak için mesajını alıntılayarak ya da kullanıcı adı/ID numarası kullanarak komutu yazın. Birden fazla üyeyi atmak için aralarında birer boşluk bırakın.",
          usage: "!kick (@kullanıcıadı|12345)",
          alternatives: ["!skick (Sessiz)"],
          notes: "Satır sonundan sonra nedenini belirtebilirsiniz."
        },
        {
          command: "!readonly",
          description: "Sadece-okuma modunu etkinleştirin. Sadece yöneticiler mesaj gönderebilir. Beyaz listedeki üyeler de mesaj gönderemez. Sadece-okuma modunu kapatmak için komutu tekrar göndermeniz yeterli.",
          usage: "!readonly (30d|2w|10h|2m)",
          alternatives: ["!ro", "!channelmode"]
        },
        {
          command: "!warn",
          description: "Gruptaki bir üyeyi uyarmak için alıntılayarak komutu kullanın. Uyarı sayısı 3’e (varsayılan) ulaştığında, üye gruptan yasaklanır (varsayılan).",
          usage: "!warn (miktar=1) (neden=Yok)",
          alternatives: ["!w"]
        },
        {
          command: "!acquit",
          description: "Bir üyenin, uyarı geçmişini temizlemek için mesajını alıntılayarak komutu yazmanız yeterli.",
          usage: "!acquit (miktar=1) (neden=Yok)",
          alternatives: ["!unwarn"]
        },
        {
          command: "!unrestrict",
          description: "Kısıtlanmış üyelerin tüm kısıtlamalarını kaldırıp, susturmasını açmak için mesajını alıntılayarak ya da kullanıcı adı/ID numarası kullanarak komutu yazın. Birden fazla üyenin sesini açmak için aralarında birer boşluk bırakın.",
          usage: "!unrestrict (@kullanıcıadı|12345)",
          alternatives: ["!un"]
        },
        {
          command: "!status",
          description: "Bir üye hakkında genel bir durum raporu görmek için mesajını alıntılayarak komutu kullanın.",
          usage: "!status"
        },
        {
          command: "!purge",
          description: "Bir mesajı alıntılayarak komutu kullanın. Alıntıladığınız mesajdan güncel sohbete kadar bütün mesajlar silinir. Dikkatli kullanın.",
          usage: "!purge"
        },
        {
          command: "!d",
          description: "Bir mesajı alıntılayarak süre belirleyin. Süre sonunda mesaj otomatik silinecektir. Maksimum süre 46 saattir çünkü botlar 48 saatten daha eski mesajları silemez.",
          usage: "!d (10h|2m)",
          alternatives: ["!sd (Sessiz)"]
        },
        {
          command: "!log",
          description: "Mevcut grubun, günlük kayıtlarının adresini gönderir.",
          usage: "!log"
        },
        {
          command: "!mod",
          description: "Mevcut grubun, yönetim adresini gönderir.",
          usage: "!mod"
        },
        {
          command: "!cp",
          description: "Mevcut grubun, kontrol paneli adresini gönderir.",
          usage: "!cp",
          alternatives: ["!cfg"]
        },
        {
          command: "!pinforever",
          description: "Bir mesajı sürekli sabitte tutmak için mesajı alıntılayarak komutu gönderin. Başka bir mesajın sabitlenmesi durumda, Combot seçtiğin mesajı tekrar sabite alacaktır. Devredışı bırakmak için alıntılamadan komutu tekrar gönderin.",
          usage: "!pinforever",
          alternatives: ["!pin"]
        },
        {
          command: "!wtl_add",
          description: "Herhangi bir üyeyi beyaz listeye eklemek için mesajını alıntılayıp komutu kullanın.",
          usage: "!wtl_add",
          alternatives: ["!wl_add", "!add_wtl", "!add_wl"]
        },
        {
          command: "!wtl_del",
          description: "Bir üyeyi beyaz listeden çıkarmak için mesajını alıntılayıp komutu gönderin.",
          usage: "!wtl_del",
          alternatives: ["!wl_del", "!del_wtl", "!del_wl"]
        },
        {
          command: "!reload_admins",
          description: "Yöneticiler listesini yeniler.",
          usage: "!reload_admins",
          alternatives: ["!r", "!reload"]
        },
        {
          command: "!cdoctor",
          description: "Combot’un, grubunuzdaki yetkilerini gösterir.",
          usage: "!cdoctor"
        },
        {
          command: "!setrank",
          description: "Bir grup üyesini belirlenmiş bir rütbeye atamak için kullanılır. Seviye & XP sistemi etkin olmalıdır.",
          usage: "!setrank (rank)",
        },
        {
          command: "!c",
          description: "Gerçek zamanlı kripto para piyasası verilerini gösterir. CoinMarketCap tarafından desteklenmektedir. Ücretsiz hesaplar için kullanılabilir değildir.",
          usage: "!c (kriptopara) (kriptopara)"
        },
        {
          command: "!nokeyboard",
          description: "Sohbette bulunan aktif klavyeleri kaldırır.",
          usage: "!nokeyboard"
        },
        {
          command: "!report",
          description: "Bir mesajı yöneticilere bildirmek için alıntılayarak komutu yazın. Rapor sistemi açık olmalıdır.",
          usage: "!report",
          alternatives: ["!sreport (Sessiz)"]
        },
        {
          command: "!toprep",
          description: "En iyi kullanıcıları (varsayılan 10), itibar puanlarına göre sıralanmış olarak gösterir. İtibar sistemi etkin olmalıdır. Maksimum gösterme sınırı 50.",
          usage: "!toprep (miktar=10)"
        },
        {
          command: "!bottomrep",
          description: "En kötü kullanıcıları (varsayılan 10), itibar puanlarına göre, sıralayarak gösterir. İtibar sistemi etkin olmalı. Maksimum gösterme sınırı 50.",
          usage: "!bottomrep (miktar=10)"
        },
        {
          command: "!toplvl",
          description: "En üst rütbeli kullanıcıları (varsayılan 10), düzeylerine göre sıralanmış olarak gösterir. Seviyeler & XP sistemi etkin olmalıdır. Maksimum gösterme sınırı 43.",
          usage: "!toplvl (miktar=10)"
        },
        {
          command: "!me",
          description: "Mevcut itibar ve seviyenizi gösterir. Seviye & XP sistemi veya itibar sistemi etkinleştirilmelidir.",
          usage: "!me"
        },
        {
          command: "!online",
          description: "Combot özel kanaldan, grubunuza bir mesaj iletir. Gönderiyi kaç üyenin gördüğünü görmek için görünüm sayacını kontrol edebilirsiniz.",
          usage: "!online"
        }
    ];

    const filteredCommands = botCommands.filter(cmd => 
        cmd.command.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cmd.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                   <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-1">Bot Komutları</h1>
                   <p className="text-sm text-slate-500 font-medium">Botunuzda kullanabileceğiniz aktif komutlar ve açıklamaları.</p>
                </div>
                <div className="relative">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Komut ara..." 
                        className="bg-[#14181f] border border-white/5 rounded-2xl pl-10 pr-4 h-12 text-sm text-white outline-none focus:border-blue-500/30 w-full md:w-64 transition-all" 
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-12">
                {filteredCommands.length > 0 ? (
                    filteredCommands.map((cmd) => (
                        <div key={cmd.command} className="bg-[#14181f] border border-white/5 rounded-[24px] p-6 hover:border-blue-500/20 transition-all group">
                            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="bg-blue-600/10 text-blue-500 px-3 py-1 rounded-xl text-sm font-black italic">
                                            {cmd.command}
                                        </div>
                                        {cmd.alternatives?.map(alt => (
                                            <span key={alt} className="text-[10px] font-bold text-slate-600 uppercase tracking-widest border border-white/5 px-2 py-0.5 rounded-lg">
                                                {alt}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-sm text-slate-300 font-medium leading-relaxed mb-4">
                                        {cmd.description}
                                    </p>
                                    {cmd.notes && (
                                        <div className="flex items-center gap-2 text-amber-500/70 text-[11px] font-bold italic mb-4">
                                            <Info size={14} />
                                            {cmd.notes}
                                        </div>
                                    )}
                                    <div className="bg-[#0f1218] rounded-xl p-4 border border-white/2">
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-2">Kullanımı:</span>
                                        <code className="text-blue-400 font-mono text-sm break-all">{cmd.usage}</code>
                                    </div>
                                </div>
                                <div className="hidden lg:block shrink-0">
                                    <button 
                                        onClick={() => {
                                            haptic('light');
                                            navigator.clipboard.writeText(cmd.command);
                                        }}
                                        className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100"
                                        title="Komutu Kopyala"
                                    >
                                        <Terminal size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-20 text-center border border-dashed border-white/5 rounded-[40px]">
                        <Search size={48} className="text-slate-800 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-white mb-1 tracking-tight italic">Bulunamadı</h3>
                        <p className="text-sm text-slate-600 font-medium italic italic">"{searchQuery}" aramasıyla eşleşen komut bulunamadı.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const SchedulerView = () => {
    const { haptic } = useTelegram();
    const [tasks, setTasks] = useState([
        { id: 1, title: 'Hoşgeldin Mesajı', channel: 'Kaju Community', time: 'Her gün 09:00', active: true },
        { id: 2, title: 'Haftalık Rapor', channel: 'Kaju Test', time: 'Pazartesi 10:00', active: false },
    ]);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-1">Zamanlayıcı</h1>
                    <p className="text-sm text-slate-500 font-medium">Belirli zamanlarda otomatik mesajlar veya görevler planlayın.</p>
                </div>
                <button className="h-12 px-6 flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20">
                    <Plus size={16} />
                    Yeni Görev Planla
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {tasks.map(task => (
                    <div key={task.id} className="bg-[#14181f] border border-white/5 rounded-[24px] p-6 flex items-center justify-between group">
                        <div className="flex items-center gap-6">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${task.active ? 'bg-blue-600/10 text-blue-500' : 'bg-slate-800 text-slate-500'}`}>
                                <Calendar size={24} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white mb-1 uppercase tracking-tight">{task.title}</h4>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{task.channel}</span>
                                    <span className="text-slate-800">|</span>
                                    <span className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">{task.time}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={task.active} className="sr-only peer" onChange={() => {}} />
                                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                            <button className="p-2 text-slate-600 hover:text-white transition-colors">
                                <Settings size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-8 bg-blue-500/5 border border-blue-500/10 rounded-[32px] p-8 text-center">
                <Lightbulb size={32} className="text-blue-500 mx-auto mb-4" />
                <h4 className="text-sm font-bold text-white mb-2 italic uppercase tracking-widest">İpucu</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                    Zamanlanmış mesajlar için Markdown desteği mevcuttur. Mesajlarınıza butonlar veya medya ekleyebilirsiniz.
                </p>
            </div>
        </div>
    );
};

const APIView = () => {
    const { haptic } = useTelegram();
    const [apiKey, setApiKey] = useState('cb_live_kh892jx92j92j92j92j92j92j92j92j');
    const [showKey, setShowKey] = useState(false);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
                <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-1">API Yönetimi</h1>
                <p className="text-sm text-slate-500 font-medium">Harici entegrasyonlar için API anahtarlarınızı yönetin.</p>
            </div>

            <div className="bg-[#14181f] border border-white/5 rounded-[40px] p-10 mb-8">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-2xl bg-blue-600/10 flex items-center justify-center">
                        <Code size={20} className="text-blue-500" />
                    </div>
                    <h3 className="text-lg font-black text-white italic uppercase tracking-tighter">Canlı API Anahtarı</h3>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">API KEY</label>
                        <div className="relative group">
                            <input 
                                type={showKey ? "text" : "password"} 
                                value={apiKey} 
                                readOnly
                                className="w-full bg-[#0f1218] border border-white/5 rounded-2xl px-6 h-14 text-sm text-blue-400 font-mono outline-none"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                <button 
                                    onClick={() => setShowKey(!showKey)}
                                    className="p-2 text-slate-500 hover:text-white transition-colors"
                                >
                                    {showKey ? <X size={18} /> : <List size={18} />}
                                </button>
                                <button 
                                    onClick={() => {
                                        haptic('medium');
                                        navigator.clipboard.writeText(apiKey);
                                    }}
                                    className="h-10 px-4 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                >
                                    Kopyala
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                        <button className="h-12 px-6 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border border-red-500/20">
                            Yeni Anahtar Oluştur
                        </button>
                        <button className="h-12 px-6 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border border-white/5">
                            Web Hook Ayarları
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-[#14181f] border border-white/5 rounded-[40px] p-10">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-600/10 flex items-center justify-center">
                        <Globe size={20} className="text-emerald-500" />
                    </div>
                    <h3 className="text-lg font-black text-white italic uppercase tracking-tighter">İstatistikler</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-[10px]">
                    <div className="p-6 bg-[#0f1218] rounded-2xl border border-white/2">
                        <span className="text-slate-600 block mb-1">DÜNKÜ İSTEKLER</span>
                        <span className="text-white font-bold">142</span>
                    </div>
                    <div className="p-6 bg-[#0f1218] rounded-2xl border border-white/2">
                        <span className="text-slate-600 block mb-1">BU AYKİ İSTEKLER</span>
                        <span className="text-white font-bold">4,124</span>
                    </div>
                    <div className="p-6 bg-[#0f1218] rounded-2xl border border-white/2">
                        <span className="text-slate-600 block mb-1">ORTALAMA GECİKME</span>
                        <span className="text-emerald-500 font-bold">18ms</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const EmptyModule = ({ title }: { title?: string }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in">
    <Zap size={48} className="text-blue-500/20 mb-4" />
    <h3 className="text-lg font-black text-white italic uppercase tracking-tighter mb-2">{title || 'Geliştirme Aşamasında'}</h3>
    <p className="text-sm text-slate-600 font-medium max-w-sm">
      {title ? `${title} modülü henüz prototip aşamasındadır. Yakında aktif hale getirilecektir.` : 'Bu modül henüz prototip aşamasındadır. Yakında aktif hale getirilecektir.'}
    </p>
  </div>
);

export default BotManagementPanel;


import React, { useEffect, Suspense, lazy, useState } from 'react';
import * as Router from 'react-router-dom';
import { Loader2, Megaphone } from 'lucide-react';
import { DatabaseService } from './services/DatabaseService';
import { useTelegram } from './hooks/useTelegram';
import { User } from './types';
import './types';

const { HashRouter, Routes, Route, useLocation, useNavigate } = Router as any;

const Home = lazy(() => import('./pages/Home'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const BotDetail = lazy(() => import('./pages/BotDetail'));
const Payment = lazy(() => import('./pages/Payment'));
const ProfileSettings = lazy(() => import('./pages/ProfileSettings'));
const MyBots = lazy(() => import('./pages/MyBots'));
const MyChannels = lazy(() => import('./pages/MyChannels'));
const Premium = lazy(() => import('./pages/Premium'));
const Notifications = lazy(() => import('./pages/Notifications'));
const AccountSettings = lazy(() => import('./pages/AccountSettings'));
const Earnings = lazy(() => import('./pages/Earnings'));
const Maintenance = lazy(() => import('./pages/Maintenance'));
const Restricted = lazy(() => import('./pages/Restricted'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const UserPanelLogin = lazy(() => import('./pages/UserPanelLogin'));
const UserPanel = lazy(() => import('./pages/UserPanel'));

const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-500">
    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
    <span className="text-xs font-medium uppercase tracking-widest font-black opacity-40">Senkronize Ediliyor</span>
  </div>
);

const TelegramWrapper = ({ children }: { children?: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useTelegram();
  const isAdminPath = location.pathname.startsWith('/a/');
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isRestricted, setIsRestricted] = useState(false);
  const [marqueeText, setMarqueeText] = useState<string | null>(null);

  useEffect(() => {
    DatabaseService.init();
    
    const initializeApp = async () => {
        // 1. Bakım Modu & Ayarlar Kontrolü
        if (!isAdminPath) {
            const settings = await DatabaseService.getSettings();
            if (settings) {
                if (settings.maintenanceMode) setIsMaintenance(true);
                if (settings.marqueeText) setMarqueeText(settings.marqueeText);
            }
        }

        // 2. Kullanıcı Senkronizasyonu
        if (user && !isAdminPath) {
            try {
                const userData: Partial<User> = {
                    id: user.id.toString(),
                    name: `${user.first_name} ${user.last_name || ''}`.trim(),
                    username: user.username || 'user',
                    avatar: user.photo_url || `https://ui-avatars.com/api/?name=${user.first_name}`,
                    role: 'User',
                    status: 'Active',
                    badges: [],
                    joinDate: new Date().toISOString()
                };
                await DatabaseService.syncUser(userData);
                
                // 3. Kısıtlama Kontrolü
                const dbUser = await DatabaseService.getUser(user.id.toString());
                if (dbUser && dbUser.isRestricted) {
                    setIsRestricted(true);
                } else {
                    setIsRestricted(false);
                }

                // Log visit
                await DatabaseService.logActivity(user.id.toString(), 'system', 'app_visit', 'Uygulama Ziyareti', `${userData.username} uygulamayı başlattı.`);
            } catch (e) {
                console.error("User sync failed:", e);
            }
        }
    };
    
    initializeApp();

    if (!isAdminPath) {
      const tg = window.Telegram?.WebApp;
      if (tg) {
        tg.expand();
        if (tg.setHeaderColor) tg.setHeaderColor('#020617');
        tg.ready();
      }
    }

    const timer = setTimeout(() => {
      const loader = document.getElementById('loader');
      if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 300);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [isAdminPath, user, location.pathname]);

  useEffect(() => {
    if (isAdminPath) return;
    const tg = window.Telegram?.WebApp;
    if (!tg?.BackButton) return;

    const handleBack = () => {
      if (location.pathname === '/') return;
      navigate(-1);
    };

    if (location.pathname === '/') {
      tg.BackButton.hide();
    } else {
      tg.BackButton.show();
      tg.BackButton.onClick(handleBack);
    }
    return () => tg.BackButton.offClick(handleBack);
  }, [location, navigate, isAdminPath]);

  if (isMaintenance && !isAdminPath) {
      return <Maintenance />;
  }

  if (isRestricted && !isAdminPath) {
      return <Restricted />;
  }

  return (
    <div className={`${isAdminPath ? 'bg-[#020617]' : 'bg-slate-950'} flex flex-col min-h-screen`}>
      {marqueeText && !isAdminPath && (
        <div className="h-8 bg-blue-600/10 border-b border-blue-500/20 flex items-center overflow-hidden relative z-[60]">
          <div className="flex items-center gap-2 px-4 bg-blue-600 h-full z-10 shadow-[4px_0_10px_rgba(37,99,235,0.3)]">
            <Megaphone size={12} className="text-white" />
            <span className="text-[8px] font-black text-white uppercase tracking-widest italic">DUYURU</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="animate-marquee inline-block">
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest italic px-4">
                {marqueeText}
              </span>
            </div>
          </div>
        </div>
      )}
      {children}
    </div>
  );
};

export default function App() {
  return (
    <HashRouter>
      <TelegramWrapper>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/bot/:id" element={<BotDetail />} />
            <Route path="/payment/:id" element={<Payment />} />
            <Route path="/settings" element={<ProfileSettings />} />
            <Route path="/account-settings" element={<AccountSettings />} />
            <Route path="/my-bots" element={<MyBots />} />
            <Route path="/channels" element={<MyChannels />} />
            <Route path="/premium" element={<Premium />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/earnings" element={<Earnings />} />
            <Route path="/a/admin" element={<AdminLogin />} />
            <Route path="/a/dashboard/*" element={<AdminDashboard />} />
            <Route path="/u/login" element={<UserPanelLogin />} />
            <Route path="/u/panel/*" element={<UserPanel />} />
          </Routes>
        </Suspense>
      </TelegramWrapper>
    </HashRouter>
  );
}

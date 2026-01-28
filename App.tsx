
import React, { useEffect, Suspense, lazy, useState } from 'react';
import * as Router from 'react-router-dom';
import { Loader2 } from 'lucide-react';
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
const PublishPromo = lazy(() => import('./pages/PublishPromo')); // Yeni sayfa
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));

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

  useEffect(() => {
    DatabaseService.init();
    
    const initializeApp = async () => {
        if (!isAdminPath) {
            const settings = await DatabaseService.getSettings();
            if (settings && settings.maintenanceMode) {
                setIsMaintenance(true);
            } else {
                setIsMaintenance(false);
            }
        }

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

  return (
    <div className={`${isAdminPath ? 'bg-[#020617]' : 'bg-slate-950'} flex flex-col min-h-screen`}>
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
            <Route path="/publish-promo" element={<PublishPromo />} />
            <Route path="/a/admin" element={<AdminLogin />} />
            <Route path="/a/dashboard/*" element={<AdminDashboard />} />
          </Routes>
        </Suspense>
      </TelegramWrapper>
    </HashRouter>
  );
}

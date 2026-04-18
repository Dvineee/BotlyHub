
import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Loader2, Megaphone } from 'lucide-react';
import { PageLoader } from './components/PageLoader';
import { DatabaseService } from './services/DatabaseService';
import { useTelegram } from './hooks/useTelegram';
import { User } from './types';
import { checkAccountQuality, getDeviceFingerprint } from './security';
import './types';

import Home from './pages/Home';
import Maintenance from './pages/Maintenance';
import Restricted from './pages/Restricted';
import SearchPage from './pages/SearchPage';
import BotDetail from './pages/BotDetail';
import Payment from './pages/Payment';
import ProfileSettings from './pages/ProfileSettings';
import MyBots from './pages/MyBots';
import MyChannels from './pages/MyChannels';
import Premium from './pages/Premium';
import Notifications from './pages/Notifications';
import AccountSettings from './pages/AccountSettings';
import Earnings from './pages/Earnings';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserPanelLogin from './pages/UserPanelLogin';
import UserPanel from './pages/UserPanel';
import ReferralPage from './pages/ReferralPage';
import Footer from './components/Footer';

import { FilterProvider } from './FilterContext';

const TelegramWrapper = ({ children }: { children?: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useTelegram();
  const isAdminPath = location.pathname.startsWith('/a/');
  const isPanelPath = isAdminPath || location.pathname.startsWith('/u/');
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isRestricted, setIsRestricted] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isPanelPath) {
      root.classList.remove('light');
      root.classList.add('dark');
    } else {
      const savedTheme = localStorage.getItem('theme') || 'dark';
      root.classList.remove('light', 'dark');
      root.classList.add(savedTheme);
    }

    // Remove the static loader from index.html once the app is ready
    const loader = document.getElementById('loader');
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => loader.remove(), 300);
    }

    DatabaseService.init();
    
    const initializeApp = async () => {
        // 1. Bakım Modu & Ayarlar Kontrolü
        if (!isAdminPath) {
            const settings = await DatabaseService.getSettings();
            if (settings && settings.maintenanceMode) {
                setIsMaintenance(true);
            }
        }

        // 2. Kullanıcı Senkronizasyonu
        if (user?.id && !isAdminPath) {
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
                
                // 3. Referans Kontrolü
                const tg = window.Telegram?.WebApp;
                const startParam = tg?.initDataUnsafe?.start_param;
                
                if (startParam && startParam.startsWith('ref_')) {
                    const referrerId = startParam.replace('ref_', '');
                    
                    if (referrerId !== user.id.toString()) {
                        const existingUser = await DatabaseService.getUser(user.id.toString());
                        if (!existingUser || !existingUser.referred_by) {
                            try {
                                const ipRes = await fetch('https://api.ipify.org?format=json');
                                const { ip } = await ipRes.json();
                                const fingerprint = getDeviceFingerprint();
                                const quality = checkAccountQuality(user);
                                
                                if (quality.isValid) {
                                    await DatabaseService.createReferral(
                                        referrerId, 
                                        user.id.toString(), 
                                        ip, 
                                        fingerprint, 
                                        !!user.is_premium
                                    );
                                }
                            } catch (err) {
                                console.error("Referral processing failed:", err);
                            }
                        }
                    }
                }

                // 4. Kısıtlama Kontrolü
                const dbUser = await DatabaseService.getUser(user.id.toString());
                if (dbUser && dbUser.isRestricted) {
                    setIsRestricted(true);
                } else {
                    setIsRestricted(false);
                }
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
  }, [isAdminPath, user?.id]);

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
  }, [location.pathname, navigate, isAdminPath]);

  return (
    <div className={`${isPanelPath ? 'dark bg-slate-950' : 'bg-slate-50 dark:bg-slate-950'} flex flex-col min-h-screen transition-colors duration-300`}>
      {isMaintenance && !isAdminPath ? (
        <Maintenance />
      ) : isRestricted && !isAdminPath ? (
        <Restricted />
      ) : (
        <div className={isPanelPath ? "w-full flex-1 flex flex-col" : "w-full max-w-7xl mx-auto flex-1 flex flex-col"}>
          {children}
          {!isPanelPath && !isMaintenance && !isRestricted && <Footer />}
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <HashRouter>
      <FilterProvider>
        <TelegramWrapper>
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
            <Route path="/referral" element={<ReferralPage />} />
          </Routes>
        </TelegramWrapper>
      </FilterProvider>
    </HashRouter>
  );
}


import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import UserList from './pages/UserList';
import UserDetail from './pages/UserDetail';
import Earnings from './pages/Earnings';
import BotDetail from './pages/BotDetail';
import Payment from './pages/Payment';
import ProfileSettings from './pages/ProfileSettings';
import SearchPage from './pages/SearchPage';
import MyBots from './pages/MyBots';
import MyChannels from './pages/MyChannels';
import Premium from './pages/Premium';
import Notifications from './pages/Notifications';
import AccountSettings from './pages/AccountSettings';

// Telegram Wrapper Component to handle Native Features
const TelegramWrapper = ({ children }: { children?: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initTelegram = () => {
        try {
            if (window.Telegram?.WebApp) {
                const tg = window.Telegram.WebApp;
                
                // Expand to full height (Supported in all versions)
                tg.expand();
                
                // Version Check: Colors (Supported in 6.1+)
                if (tg.isVersionAtLeast('6.1')) {
                    if (tg.setHeaderColor) tg.setHeaderColor('#020617');
                    if (tg.setBackgroundColor) tg.setBackgroundColor('#020617');
                }

                // Force CSS variable for 100vh fix on mobile
                const vh = tg.viewportHeight || window.innerHeight;
                document.documentElement.style.setProperty('--tg-viewport-height', `${vh}px`);
                
                // Notify Telegram we are ready
                tg.ready();
            }
        } catch (e) {
            console.error("Telegram init failed:", e);
        } finally {
            // ALWAYS finish loading state, even if Telegram API fails/is old
            setIsReady(true);
        }
    };

    initTelegram();

    // Event listener for viewport changes (keyboard open/close)
    const handleViewportChanged = () => {
         if (window.Telegram?.WebApp) {
             const vh = window.Telegram.WebApp.viewportHeight;
             document.documentElement.style.setProperty('--tg-viewport-height', `${vh}px`);
         }
    };

    window.Telegram?.WebApp?.onEvent('viewportChanged', handleViewportChanged);

    return () => {
        window.Telegram?.WebApp?.offEvent('viewportChanged', handleViewportChanged);
    }
  }, []);

  // Handle Native Back Button
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    // Version Check: BackButton (Supported in 6.1+)
    if (!tg.isVersionAtLeast('6.1')) return;

    const handleBack = () => {
      navigate(-1);
    };

    if (location.pathname === '/') {
      tg.BackButton.hide();
    } else {
      tg.BackButton.show();
      tg.BackButton.offClick(handleBack); 
      tg.BackButton.onClick(handleBack);
    }

    return () => {
      tg.BackButton.offClick(handleBack);
    };
  }, [location, navigate]);

  if (!isReady) {
      return (
          <div className="fixed inset-0 bg-slate-950 flex items-center justify-center text-white">
              <div className="w-8 h-8 border-2 border-white/20 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
      );
  }

  return (
      <div style={{ minHeight: 'var(--tg-viewport-height, 100vh)' }} className="bg-slate-950">
          {children}
      </div>
  );
};

export default function App() {
  return (
    <HashRouter>
      <TelegramWrapper>
        <div className="min-h-screen w-full bg-slate-950 text-white transition-colors duration-300 flex flex-col">
          <div className="max-w-md w-full mx-auto min-h-screen bg-slate-950 shadow-2xl relative overflow-hidden flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/users" element={<UserList />} />
              <Route path="/users/:id" element={<UserDetail />} />
              <Route path="/earnings" element={<Earnings />} />
              <Route path="/bot/:id" element={<BotDetail />} />
              <Route path="/payment/:id" element={<Payment />} />
              <Route path="/settings" element={<ProfileSettings />} />
              <Route path="/account-settings" element={<AccountSettings />} />
              <Route path="/my-bots" element={<MyBots />} />
              <Route path="/channels" element={<MyChannels />} />
              <Route path="/premium" element={<Premium />} />
              <Route path="/notifications" element={<Notifications />} />
            </Routes>
          </div>
        </div>
      </TelegramWrapper>
    </HashRouter>
  );
}

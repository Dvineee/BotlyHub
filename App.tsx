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
    // 1. Loader'ı manuel olarak kaldırma fonksiyonu
    const removeLoader = () => {
      const loader = document.getElementById('loader');
      if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 500);
      }
      setIsReady(true);
    };

    const initTelegram = () => {
        try {
            if (window.Telegram?.WebApp) {
                const tg = window.Telegram.WebApp;
                
                // Expand to full height
                tg.expand();
                
                // Version Check for Colors (6.1+)
                if (tg.isVersionAtLeast && tg.isVersionAtLeast('6.1')) {
                    // Mavi ekranı engellemek için header ve bg rengini koyu yapıyoruz
                    tg.setHeaderColor?.('#020617');
                    tg.setBackgroundColor?.('#020617');
                } else {
                    // Fallback for older versions (try catch block prevents crash)
                    try {
                        tg.setHeaderColor?.('#020617');
                        tg.setBackgroundColor?.('#020617');
                    } catch (e) { console.warn("Color setting failed", e); }
                }

                // Force CSS variable
                const vh = tg.viewportHeight || window.innerHeight;
                document.documentElement.style.setProperty('--tg-viewport-height', `${vh}px`);
                
                // Notify Telegram we are ready
                tg.ready();
            }
        } catch (e) {
            console.error("Telegram init failed:", e);
        } finally {
            // Hata olsa bile uygulamayı aç
            removeLoader();
        }
    };

    // 2. Başlat
    initTelegram();

    // 3. Failsafe Timeout: Eğer Telegram API 1 saniye içinde yanıt vermezse uygulamayı zorla aç
    const timeoutId = setTimeout(() => {
        if (!isReady) {
            console.warn("Telegram init timed out, forcing app load");
            removeLoader();
        }
    }, 1000);

    // Event listener for viewport changes
    const handleViewportChanged = () => {
         if (window.Telegram?.WebApp) {
             const vh = window.Telegram.WebApp.viewportHeight;
             document.documentElement.style.setProperty('--tg-viewport-height', `${vh}px`);
         }
    };

    window.Telegram?.WebApp?.onEvent?.('viewportChanged', handleViewportChanged);

    return () => {
        clearTimeout(timeoutId);
        window.Telegram?.WebApp?.offEvent?.('viewportChanged', handleViewportChanged);
    }
  }, []);

  // Handle Native Back Button
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    // isVersionAtLeast kontrolü yoksa veya versiyon düşükse butonu hiç elleme
    if (!tg.isVersionAtLeast || !tg.isVersionAtLeast('6.1')) return;

    const handleBack = () => {
      navigate(-1);
    };

    if (location.pathname === '/') {
      tg.BackButton?.hide();
    } else {
      tg.BackButton?.show();
      tg.BackButton?.offClick(handleBack); 
      tg.BackButton?.onClick(handleBack);
    }

    return () => {
      tg.BackButton?.offClick(handleBack);
    };
  }, [location, navigate]);

  if (!isReady) {
      return null; // index.html'deki loader zaten gösteriliyor
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
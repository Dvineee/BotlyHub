
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import './types';

// Çeviri Sözlüğü
const translations = {
  tr: {
    // Navigation & Header
    "market": "Mağaza",
    "profile": "Profil",
    "my_bots": "Botlarım",
    "my_channels": "Kanallarım",
    "search_placeholder": "Bot ara...",
    "results_found": "sonuç bulundu",
    "no_results": "Sonuç bulunamadı.",
    "search_all_cats": "Tüm Kategorilerde Ara",
    
    // Categories (Kullanıcı Tarafı)
    "cat_all": "Hepsi",
    "cat_productivity": "Üretkenlik",
    "cat_games": "Eğlence & Oyun",
    "cat_utilities": "Araçlar & Servisler",
    "cat_finance": "Finans & Ekonomi",
    "cat_music": "Müzik & Ses",
    "cat_moderation": "Grup Yönetimi",
    
    // Bot Detail & Actions
    "open": "Aç",
    "premium": "Premium",
    "verified": "Doğrulanmış",
    "preview_screens": "Bot Önizleme Ekranları",
    "no_images": "Görsel bulunmuyor",
    "add_to_library": "Kütüphaneye Ekle",
    "buy_now": "Satın Al",
    "start_bot": "Botu Başlat",
    "share_copied": "Link kopyalandı!",

    // Sections
    "featured": "Öne Çıkanlar",
    "search_results": "Arama Sonuçları"
  },
  en: {
    "market": "Market",
    "profile": "Profile",
    "my_bots": "My Bots",
    "my_channels": "My Channels",
    "search_placeholder": "Search for bots...",
    "results_found": "results found",
    "no_results": "No results found.",
    "search_all_cats": "Search in All Categories",
    "cat_all": "All",
    "cat_productivity": "Productivity",
    "cat_games": "Games",
    "cat_utilities": "Utilities",
    "cat_finance": "Finance",
    "cat_music": "Music",
    "cat_moderation": "Moderation",
    "open": "Open",
    "premium": "Premium",
    "verified": "Verified",
    "preview_screens": "Bot Preview Screens",
    "no_images": "No images available",
    "add_to_library": "Add to Library",
    "buy_now": "Buy Now",
    "start_bot": "Start Bot",
    "share_copied": "Link copied!"
  }
};

type Language = 'tr' | 'en';

interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('tr');

  useEffect(() => {
    const initializeLanguage = () => {
      const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
      if (tgUser?.language_code?.toLowerCase().startsWith('en')) {
        setLanguage('en');
      }
    };
    initializeLanguage();
  }, []);

  const t = (key: string) => {
    // @ts-ignore
    return translations[language][key] || key;
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) throw new Error('useTranslation must be used within a TranslationProvider');
  return context;
};

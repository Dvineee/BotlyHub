
import React, { createContext, useState, useContext, useEffect, ReactNode, PropsWithChildren } from 'react';
import './types';

const translations = {
  tr: {
    "market": "Mağaza",
    "profile": "Profil",
    "my_bots": "Botlarım",
    "my_channels": "Kanallarım",
    "notifications": "Bildirimler",
    "search_placeholder": "Botları ara...",
    "results_found": "sonuç bulundu",
    "no_results": "Sonuç bulunamadı.",
    "search_all_cats": "Tüm Kategorilerde Ara",
    "cat_all": "Hepsi",
    "cat_productivity": "Üretkenlik",
    "cat_games": "Oyun",
    "cat_utilities": "Araçlar",
    "cat_finance": "Finans",
    "cat_music": "Müzik",
    "cat_moderation": "Moderasyon",
    "open": "Aç",
    "premium": "Premium",
    "verified": "Doğrulanmış",
    "preview_screens": "Bot Önizleme Ekranları",
    "no_images": "Görsel bulunmuyor",
    "add_to_library": "Kütüphaneye Ekle",
    "buy_now": "Satın Al",
    "start_bot": "Botu Başlat",
    "share_copied": "Link kopyalandı!",
    "featured": "Öne Çıkanlar",
    "search_results": "Arama Sonuçları"
  },
  en: {
    "market": "Market",
    "profile": "Profile",
    "my_bots": "My Bots",
    "my_channels": "My Channels",
    "notifications": "Notifications",
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
  },
  ru: {
    "market": "Магазин",
    "profile": "Профиль",
    "my_bots": "Мои боты",
    "my_channels": "Мои каналы",
    "notifications": "Уведомления",
    "search_placeholder": "Поиск ботов...",
    "results_found": "результатов найдено",
    "no_results": "Результатов не найдено.",
    "search_all_cats": "Поиск во всех категориях",
    "cat_all": "Все",
    "cat_productivity": "Продуктивность",
    "cat_games": "Игры",
    "cat_utilities": "Инструменты",
    "cat_finance": "Финансы",
    "cat_music": "Музыка",
    "cat_moderation": "Модерация",
    "open": "Открыть",
    "premium": "Премиум",
    "verified": "Подтверждено",
    "preview_screens": "Предпросмотр бота",
    "no_images": "Нет изображений",
    "add_to_library": "Добавить в библиотеку",
    "buy_now": "Купить",
    "start_bot": "Запустить бота",
    "share_copied": "Ссылка скопирована!"
  },
  fa: {
    "market": "فروشگاه",
    "profile": "پروفایل",
    "my_bots": "ربات‌های من",
    "my_channels": "کانال‌های من",
    "notifications": "اعلان‌ها",
    "search_placeholder": "جستجوی ربات...",
    "results_found": "نتیجه یافت شد",
    "no_results": "نتیجه‌ای یافت نشد.",
    "search_all_cats": "جستجو در همه دسته‌ها",
    "cat_all": "همه",
    "cat_productivity": "بهره‌وری",
    "cat_games": "بازی",
    "cat_utilities": "ابزارها",
    "cat_finance": "مالی",
    "cat_music": "موسیقی",
    "cat_moderation": "مدیریت",
    "open": "باز کردن",
    "premium": "پریمیوم",
    "verified": "تایید شده",
    "preview_screens": "پیش‌نمایش ربات",
    "no_images": "تصویری موجود نیست",
    "add_to_library": "افزودن به کتابخانه",
    "buy_now": "خرید",
    "start_bot": "شروع ربات",
    "share_copied": "لینک کپی شد!"
  },
  uk: {
    "market": "Крамниця",
    "profile": "Профіль",
    "my_bots": "Мої боти",
    "my_channels": "Мої канали",
    "notifications": "Сповіщення",
    "search_placeholder": "Пошук ботів...",
    "results_found": "результатів знайдено",
    "no_results": "Результатів не знайдено.",
    "search_all_cats": "Пошук у всіх категоріях",
    "cat_all": "Все",
    "cat_productivity": "Продуктивність",
    "cat_games": "Ігри",
    "cat_utilities": "Інструменти",
    "cat_finance": "Фінанси",
    "cat_music": "Музика",
    "cat_moderation": "Модерація",
    "open": "Відкрити",
    "premium": "Преміум",
    "verified": "Підтверджено",
    "preview_screens": "Передпрогляд бота",
    "no_images": "Немає зображень",
    "add_to_library": "Додати до бібліотеки",
    "buy_now": "Купити",
    "start_bot": "Запустити бота",
    "share_copied": "Посилання скопійовано!"
  },
  es: {
    "market": "Mercado",
    "profile": "Perfil",
    "my_bots": "Mis Bots",
    "my_channels": "Mis Canales",
    "notifications": "Notificaciones",
    "search_placeholder": "Buscar bots...",
    "results_found": "resultados encontrados",
    "no_results": "No se encontraron resultados.",
    "search_all_cats": "Buscar en todas las categorías",
    "cat_all": "Todo",
    "cat_productivity": "Productividad",
    "cat_games": "Juegos",
    "cat_utilities": "Utilidades",
    "cat_finance": "Finanzas",
    "cat_music": "Música",
    "cat_moderation": "Moderación",
    "open": "Abrir",
    "premium": "Premium",
    "verified": "Verificado",
    "preview_screens": "Vistas previas del bot",
    "no_images": "No hay imágenes disponibles",
    "add_to_library": "Añadir a la biblioteca",
    "buy_now": "Comprar ahora",
    "start_bot": "Iniciar Bot",
    "share_copied": "¡Enlace copiado!"
  },
  hi: {
    "market": "मार्केट",
    "profile": "प्रोफ़ाइल",
    "my_bots": "मेरे बॉट्स",
    "my_channels": "मेरे चैनल",
    "notifications": "सूचनाएं",
    "search_placeholder": "बॉट्स खोजें...",
    "results_found": "परिणाम मिले",
    "no_results": "कोई परिणाम नहीं मिला।",
    "search_all_cats": "सभी श्रेणियों में खोजें",
    "cat_all": "सभी",
    "cat_productivity": "उत्पादकता",
    "cat_games": "खेल",
    "cat_utilities": "उपयोगिताएँ",
    "cat_finance": "वित्त",
    "cat_music": "संगीत",
    "cat_moderation": "नियमन",
    "open": "खोलें",
    "premium": "प्रीमियम",
    "verified": "सत्यापित",
    "preview_screens": "बॉट प्रीव्यू स्क्रीन्स",
    "no_images": "कोई चित्र उपलब्ध नहीं है",
    "add_to_library": "लाइब्रेरी में जोड़ें",
    "buy_now": "अभी खरीदें",
    "start_bot": "बॉट शुरू करें",
    "share_copied": "लिंक कॉपी हो गया!"
  },
  ar: {
    "market": "المتجر",
    "profile": "الملف الشخصي",
    "my_bots": "بوتاتي",
    "my_channels": "قنواتي",
    "notifications": "الإشعارات",
    "search_placeholder": "ابحث عن بوت...",
    "results_found": "نتائج تم العثور عليها",
    "no_results": "لم يتم العثور على نتائج.",
    "search_all_cats": "البحث في كل الفئات",
    "cat_all": "الكل",
    "cat_productivity": "الإنتاجية",
    "cat_games": "ألعاب",
    "cat_utilities": "أدوات",
    "cat_finance": "المالية",
    "cat_music": "موسيقى",
    "cat_moderation": "الإشراف",
    "open": "افتح",
    "premium": "بريميوم",
    "verified": "مؤكد",
    "preview_screens": "معاينة البوت",
    "no_images": "لا توجد صور متوفرة",
    "add_to_library": "إضافة إلى المكتبة",
    "buy_now": "شراء الآن",
    "start_bot": "بدء البوت",
    "share_copied": "تم نسخ الرابط!"
  }
};

type Language = 'tr' | 'en' | 'ru' | 'fa' | 'uk' | 'es' | 'hi' | 'ar';

interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider = ({ children }: PropsWithChildren<{}>) => {
  const [language, setLanguage] = useState<Language>('tr');

  useEffect(() => {
    const initializeLanguage = () => {
      // Restore from local storage first (manual choice)
      const storedLang = localStorage.getItem('app_language');
      // @ts-ignore
      if (storedLang && translations[storedLang]) {
        setLanguage(storedLang as Language);
        return;
      }

      // Detect from Telegram
      const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
      if (tgUser?.language_code) {
        const code = tgUser.language_code.toLowerCase();
        const detected = code.split('-')[0];
        // @ts-ignore
        if (translations[detected]) {
          setLanguage(detected as Language);
          return;
        }
      }

      // Default to Turkish
      setLanguage('tr');
    };
    initializeLanguage();
  }, []);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('app_language', lang);
  };

  const t = (key: string) => {
    // @ts-ignore
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) throw new Error('useTranslation must be used within a TranslationProvider');
  return context;
};

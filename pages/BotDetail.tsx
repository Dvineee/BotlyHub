import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Share2,
  MoreVertical,
  Send,
  Loader2,
  ShieldCheck,
  Bot as BotIcon,
  Zap,
  Shield,
  PlusCircle,
  X,
  Maximize2,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Eye,
  Users,
  Lock,
  Unlock,
  AlertTriangle,
  Edit3,
  Sparkles,
  Star,
  Download,
  Info,
  CheckCircle2,
  Globe,
  Cpu,
  Play,
  UserPlus,
  MessageSquare,
  BarChart3,
  MousePointer2,
  Search,
  LayoutGrid,
  Store,
  User as UserIcon,
  Megaphone,
  Bell,
  Link as LinkIcon,
  Flag,
  Sun,
  Moon,
  Wallet,
  Menu,
  ExternalLink,
  Coins,
  Briefcase,
  Compass,
  LogOut,
  Plus,
  ArrowLeft,
  Terminal,
  Link2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, useParams, Link as RouterLink } from "react-router-dom";
import { Bot, Channel, User, Notification } from "../types";
import { categories, appsSubCategories } from "../data";
import { useTelegram } from "../hooks/useTelegram";
import { DatabaseService } from "../services/DatabaseService";
import PriceService from "../services/PriceService";
import { useTranslation } from "../TranslationContext";
import { GeminiService } from "../services/GeminiService";
import { useDraggableScroll } from "../hooks/useDraggableScroll";
import { useTheme } from "../ThemeContext";
import Logo from "../components/Logo";
import { useRef } from "react";
import { SEO } from "../components/SEO";
import LoginModal from "../components/LoginModal";
import { BotDetailSkeleton, LazyImage } from "../components/Preload";

const getLiveBotIcon = (bot: Bot) => {
  if (bot.bot_link) {
    const username = bot.bot_link
      .replace("@", "")
      .replace("https://t.me/", "")
      .split("/")
      .pop()
      ?.trim();
    if (username) return `https://t.me/i/userpic/320/${username}.jpg`;
  }
  return (
    bot.icon ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(bot.name)}&background=1e293b&color=fff&bold=true`
  );
};

const formatLanguages = (langs: string[] | undefined): string => {
  if (!langs || langs.length === 0) return "";
  const map: Record<string, string> = {
    '🇬🇧': 'İngilizce',
    'en': 'İngilizce',
    'english': 'İngilizce',
    'ing': 'İngilizce',
    'ingilizce': 'İngilizce',
    '🇷🇺': 'Rusça',
    'ru': 'Rusça',
    'russian': 'Rusça',
    'rusça': 'Rusça',
    '🇹🇷': 'Türkçe',
    'tr': 'Türkçe',
    'turkish': 'Türkçe',
    'türkçe': 'Türkçe',
    '🇮🇷': 'Farsça',
    'fa': 'Farsça',
    'persian': 'Farsça',
    'farsça': 'Farsça',
    '🇮🇳': 'Hintçe',
    'hi': 'Hintçe',
    'hindi': 'Hintçe',
    'hintçe': 'Hintçe',
    '🇪🇸': 'İspanyolca',
    'es': 'İspanyolca',
    'spanish': 'İspanyolca',
    'ispanyolca': 'İspanyolca'
  };

  return langs
    .map(l => {
      const clean = l.trim().toLowerCase();
      if (map[l]) return map[l];
      if (map[clean]) return map[clean];
      return l.charAt(0).toUpperCase() + l.slice(1);
    })
    .join(", ");
};

const NavMenu = ({
  user,
  unreadCount,
  theme,
  toggleTheme,
  haptic,
  isMenuOpen,
  setIsMenuOpen,
  setIsLoginModalOpen,
  setWebAuthUser,
  isLoginModalOpen,
  menuRef: parentMenuRef,
}: {
  user: any;
  unreadCount: number;
  theme: string;
  toggleTheme: () => void;
  haptic: any;
  isMenuOpen: boolean;
  setIsMenuOpen: (v: boolean) => void;
  setIsLoginModalOpen: (v: boolean) => void;
  setWebAuthUser: (v: any) => void;
  isLoginModalOpen: boolean;
  menuRef: React.RefObject<HTMLDivElement>;
}) => {
  const { t, language, setLanguage } = useTranslation();
  const [mobileMenuPanel, setMobileMenuPanel] = useState<"main" | "categories" | "bots" | "apps">("main");
  const toggleLanguage = () => {
    haptic("light");
    setLanguage(language === "tr" ? "en" : "tr");
  };
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState<"kesfet" | null>(null);
  const [mobileModal, setMobileModal] = useState<"kesfet" | null>(null);
  const [navState, setNavState] = useState<"main" | "bots" | "apps">("main");
  const internalMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) {
      setMobileMenuPanel("main");
    }
  }, [isMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        internalMenuRef.current &&
        !internalMenuRef.current.contains(event.target as Node)
      ) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (mobileModal) {
      document.body.style.overflow = "hidden";
      document.body.style.height = "100vh";
    } else {
      document.body.style.overflow = "";
      document.body.style.height = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.height = "";
    };
  }, [mobileModal]);

  const currentUser = {
    id: user?.id?.toString() || "user-active-session",
    name: user?.username
      ? `@${user.username}`
      : `@${(user?.first_name || user?.name || "Kenan").toLowerCase().replace(/\s+/g, "")}`,
    avatar:
      user?.photo_url ||
      user?.avatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.first_name || user?.name || "Kenan")}&background=0f172a&color=fff`,
    bio: "",
  };

  const botsCategories = categories.filter(
    (c) => c.id !== "apps" && c.id !== "all",
  );
  const appsCategories = appsSubCategories;

  const handleCategoryClick = (catId: string, mode: "bots" | "apps") => {
    haptic("light");
    navigate(`/search?mode=${mode}&category=${catId}`);
    setOpenMenu(null);
    setMobileModal(null);
    setNavState("main");
  };

  interface MenuItem {
    id: string;
    label: string;
    desc: string;
    icon: any;
    action?: () => void;
    path?: string;
  }

  const discoverItems: MenuItem[] = [
    {
      id: "bots",
      label: "Botlar",
      desc: "Telegram Bot Marketi",
      icon: BotIcon,
      path: "/search?mode=bots",
    },
    {
      id: "apps",
      label: "Uygulamalar",
      desc: "Web3 & TMA Uygulamaları",
      icon: LayoutGrid,
      path: "/search?mode=apps",
    },
    {
      id: "channels",
      label: "Kanallar",
      desc: "Popüler Telegram Kanalları",
      icon: Megaphone,
      path: "/channels",
    },
    {
      id: "qa",
      label: "QA Forum",
      desc: "Soru & Cevap Hub'ı",
      icon: MessageSquare,
      path: "/qa",
    },
  ];

  const simpleLinks = [
    { label: "Reklam", path: "/premium" },
    { label: "Blog", path: "/blog" },
    { label: "Gelişmiş Arama", path: "/search" },
  ];

  const renderMegaMenuContent = () => {
    if (openMenu === "kesfet") {
      return (
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-12 gap-8">
          <div className="col-span-8">
            <AnimatePresence mode="wait">
              {navState === "main" ? (
                <motion.div
                  key="main"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="grid grid-cols-2 gap-4"
                >
                  {discoverItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (item.id === "bots") {
                          haptic("light");
                          setNavState("bots");
                        } else if (item.id === "apps") {
                          haptic("light");
                          setNavState("apps");
                        } else if (item.action) {
                          item.action();
                        } else if (item.path) {
                          navigate(item.path);
                          setOpenMenu(null);
                        }
                      }}
                      className="flex items-center gap-4 p-4 hover:bg-black/[0.02] dark:hover:bg-white/5 rounded-2xl transition-all group border border-transparent hover:border-black/5 dark:hover:border-white/10 text-left w-full"
                    >
                      <div className="menu-icon-container shrink-0 flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                        <item.icon size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[14px] font-semibold menu-item-text">
                          {item.label}
                        </span>
                        <span className="text-[12px] text-slate-500 dark:text-slate-400 font-normal">
                          {item.desc}
                        </span>
                      </div>
                    </button>
                  ))}
                </motion.div>
              ) : navState === "bots" ? (
                <motion.div
                  key="bots"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex flex-col gap-6"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setNavState("main")}
                        className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-slate-500 transition-colors"
                      >
                        <ArrowLeft size={20} />
                      </button>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                        Bot Kategorileri
                      </h3>
                    </div>
                    <button
                      onClick={() => handleCategoryClick("all", "bots")}
                      className="text-xs font-black uppercase tracking-widest text-blue-500 hover:text-blue-600 dark:text-blue-400 cursor-pointer px-3 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all duration-150"
                    >
                      Tümünü Gör
                    </button>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {botsCategories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryClick(cat.id, "bots")}
                        className="flex items-center gap-3 p-3 hover:bg-black/[0.02] dark:hover:bg-white/5 rounded-xl transition-all group text-left border border-transparent hover:border-black/5 dark:hover:border-white/10 w-full"
                      >
                        <div className="menu-icon-container !w-8 !h-8 px-0 shrink-0 flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                          <cat.icon size={16} />
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-tight menu-item-text">
                          {t(cat.label)}
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="apps"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex flex-col gap-6"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setNavState("main")}
                        className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-slate-500 transition-colors"
                      >
                        <ArrowLeft size={20} />
                      </button>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                        Uygulama Kategorileri
                      </h3>
                    </div>
                    <button
                      onClick={() => handleCategoryClick("all", "apps")}
                      className="text-xs font-black uppercase tracking-widest text-blue-500 hover:text-blue-600 dark:text-blue-400 cursor-pointer px-3 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all duration-150"
                    >
                      Tümünü Gör
                    </button>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {appsCategories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryClick(cat.id, "apps")}
                        className="flex items-center gap-3 p-3 hover:bg-black/[0.02] dark:hover:bg-white/5 rounded-xl transition-all group text-left border border-transparent hover:border-black/5 dark:hover:border-white/10 w-full"
                      >
                        <div className="menu-icon-container !w-8 !h-8 px-0 shrink-0 flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                          <cat.icon size={16} />
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-tight menu-item-text">
                          {t(cat.label)}
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="col-span-4 border-l border-black/5 dark:border-white/5 pl-8 flex flex-col justify-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600 mb-2">
              Hızlı Bağlantılar
            </span>
            {simpleLinks.map((link, i) => (
              <a
                key={i}
                href={link.path}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(link.path);
                  setOpenMenu(null);
                }}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-all font-bold text-xs uppercase group"
              >
                {link.label}
                <ExternalLink
                  size={14}
                  className="opacity-0 group-hover:opacity-100 transition-all"
                />
              </a>
            ))}
          </div>
        </div>
      );
    }
  };

  return (
    <>
      <header
        ref={internalMenuRef}
        className="relative md:sticky md:top-0 z-40 bg-white dark:bg-slate-950 border-b border-[#f7f7f7] dark:border-white/5 w-full py-2.5 transition-colors"
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0">
          {/* Section 1: Center Navigation links */}
          <div className="hidden md:flex items-center justify-center gap-4 md:gap-14 order-1 md:order-2 w-full md:w-auto pb-1.5 md:pb-0 border-b md:border-b-0 border-slate-100 dark:border-white/5 md:border-transparent">
            {/* Discover / Keşfet */}
            <button
              onClick={() => {
                haptic("light");
                navigate("/");
              }}
              className="nav-menu-item text-slate-600 dark:text-slate-400 hover:bg-blue-500/5 grow-0 whitespace-nowrap"
              id="nav-explore-btn"
            >
              {t("nav_explore")}
            </button>

            {/* Categories / Kategoriler */}
            <div
              className="relative md:static"
              onMouseEnter={() => {
                if (window.innerWidth >= 768) setOpenMenu("kesfet");
              }}
            >
              <button
                onClick={() => {
                  if (window.innerWidth < 768) {
                    haptic("light");
                    setIsMenuOpen(true);
                    setMobileMenuPanel("categories");
                  } else {
                    setOpenMenu(openMenu === "kesfet" ? null : "kesfet");
                  }
                }}
                className={`nav-menu-item grow-0 ${openMenu === "kesfet" ? "text-slate-900 dark:text-white bg-blue-500/5" : "text-slate-600 dark:text-slate-400 hover:bg-blue-500/5"}`}
                id="nav-categories-btn"
              >
                Kategoriler{" "}
                <ChevronDown
                  size={14}
                  className={`text-slate-400 transition-transform duration-300 ${openMenu === "kesfet" ? "rotate-180" : ""}`}
                />
              </button>
            </div>


          </div>

          {/* Section 2 & 3 Mobile-Row Container */}
          <div className="flex md:contents items-center justify-between order-2 md:order-none w-full md:w-auto">
            {/* Section 2: Geri / return button */}
            <div className="flex items-center justify-start md:order-1 md:w-48 shrink-0">
              <button
                onClick={() => {
                  haptic("light");
                  navigate(-1);
                }}
                className="group flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                id="header-back-btn"
              >
                <span className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
                  <ChevronLeft size={14} />
                </span>
                <span>Geri</span>
              </button>
            </div>

            {/* Section 3: Right Side: Theme toggle + Profile */}
            <div className="flex items-center justify-end md:order-3 md:w-48 gap-3 shrink-0">
              <button
                onClick={() => {
                  haptic("light");
                  toggleTheme();
                }}
                className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-black/5 dark:border-white/5 rounded-xl text-slate-900 dark:text-white active:scale-95 transition-all outline-none shrink-0"
                id="header-theme-toggle"
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {!user || !user.id || user.id === "guest_user" ? (
                <button
                  onClick={() => {
                    haptic("light");
                    setIsLoginModalOpen(true);
                  }}
                  className="h-10 px-4 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white border-none text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all whitespace-nowrap"
                  id="header-login-btn"
                >
                  {t("home_login")}
                </button>
              ) : null}

              <div className="relative" ref={parentMenuRef}>
                <button
                  onClick={() => {
                    haptic("light");
                    setIsMenuOpen(!isMenuOpen);
                  }}
                  className="flex items-center gap-2 px-3 h-10 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-50 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/20 rounded-xl transition-all active:scale-95 duration-150 shadow-xs"
                  id="header-profile-menu-btn"
                >
                  {/* Mobile Icons */}
                  <div className="flex md:hidden items-center justify-center">
                    <div className="w-5 h-5 relative flex items-center justify-center">
                      <AnimatePresence mode="wait">
                        {isMenuOpen ? (
                          <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
                            animate={{ rotate: 0, opacity: 1, scale: 1 }}
                            exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                          >
                            <X size={18} className="text-slate-700 dark:text-slate-300" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="menu"
                            initial={{ rotate: 90, opacity: 0, scale: 0.8 }}
                            animate={{ rotate: 0, opacity: 1, scale: 1 }}
                            exit={{ rotate: -90, opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                          >
                            <Menu size={18} className="text-slate-700 dark:text-slate-300" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Desktop Icons */}
                  <div className="hidden md:flex items-center gap-1.5">
                    {user && user.id && user.id !== "guest_user" ? (
                      <>
                        <img
                          src={currentUser.avatar}
                          className="w-5 h-5 rounded-full object-cover"
                          alt=""
                          referrerPolicy="no-referrer"
                        />
                        <span className="max-w-[70px] sm:max-w-[100px] truncate">
                          {currentUser.name}
                        </span>
                        <ChevronDown
                          size={12}
                          className={`text-slate-400 dark:text-slate-500 transition-transform duration-200 ${isMenuOpen ? "rotate-180" : ""}`}
                        />
                      </>
                    ) : (
                      <>
                        <Compass
                          size={18}
                          className="text-slate-700 dark:text-slate-300"
                        />
                        <ChevronDown
                          size={12}
                          className={`text-slate-400 dark:text-slate-500 transition-transform duration-200 ${isMenuOpen ? "rotate-180" : ""}`}
                        />
                      </>
                    )}
                  </div>
                </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl shadow-2xl p-3 z-[150] animate-in fade-in slide-in-from-right-3 duration-200">
                      {/* Mobile View */}
                      <div className="block md:hidden">
                        {mobileMenuPanel === "main" && (
                          <div className="space-y-1">
                            {/* Keşfet */}
                            <button
                              onClick={() => {
                                haptic("light");
                                navigate("/");
                                setIsMenuOpen(false);
                              }}
                              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 transition-all group text-left"
                            >
                              <Compass
                                size={18}
                                className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors"
                              />
                              <span className="text-xs font-bold uppercase tracking-tight font-sans">
                                Keşfet
                              </span>
                            </button>

                            {/* Kategoriler */}
                            <button
                              onClick={() => {
                                haptic("light");
                                setMobileMenuPanel("categories");
                              }}
                              className="w-full flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 transition-all group text-left"
                            >
                              <div className="flex items-center gap-3">
                                <LayoutGrid
                                  size={18}
                                  className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors"
                                />
                                <span className="text-xs font-bold uppercase tracking-tight font-sans">
                                  Kategoriler
                                </span>
                              </div>
                              <ChevronRight size={14} className="text-slate-400" />
                            </button>

                            {/* Botlarım */}
                            {(user && user.id && user.id !== "guest_user") && (
                              <button
                                onClick={() => {
                                  haptic("light");
                                  navigate(user && user.id && user.id !== "guest_user" ? "/my-bots" : "/");
                                  setIsMenuOpen(false);
                                }}
                                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 transition-all group text-left"
                              >
                                <BotIcon
                                  size={18}
                                  className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors"
                                />
                                <span className="text-xs font-bold uppercase tracking-tight font-sans">
                                  {t("my_bots") || "Botlarım"}
                                </span>
                              </button>
                            )}

                            {/* Gece Modu */}
                            <button
                              onClick={() => {
                                haptic("light");
                                toggleTheme();
                              }}
                              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 transition-all group text-left"
                            >
                              {theme === "dark" ? (
                                <>
                                  <Sun
                                    size={18}
                                    className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors"
                                  />
                                  <span className="text-xs font-bold uppercase tracking-tight font-sans">
                                    {t("light_mode") || "Gündüz Modu"}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Moon
                                    size={18}
                                    className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors"
                                  />
                                  <span className="text-xs font-bold uppercase tracking-tight font-sans">
                                    {t("dark_mode") || "Gece Modu"}
                                  </span>
                                </>
                              )}
                            </button>

                            {/* Botunu Ekle */}
                            <button
                              onClick={() => {
                                haptic("light");
                                navigate("/settings");
                                setIsMenuOpen(false);
                              }}
                              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 transition-all group text-left"
                            >
                              <Plus
                                size={18}
                                className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors"
                              />
                              <span className="text-xs font-bold uppercase tracking-tight font-sans">
                                Botunu Ekle
                              </span>
                            </button>
                          </div>
                        )}

                        {mobileMenuPanel === "categories" && (
                          <div className="space-y-4">
                            {/* Back button */}
                            <button
                              onClick={() => {
                                haptic("light");
                                setMobileMenuPanel("main");
                              }}
                              className="w-full flex items-center gap-2 p-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 border-b border-slate-100 dark:border-white/5 font-bold text-xs uppercase"
                            >
                              <ArrowLeft size={16} />
                              <span>Geri</span>
                            </button>

                            {/* Mega Menu Options */}
                            <div className="space-y-2">
                              {discoverItems.map((item) => (
                                <button
                                  key={item.id}
                                  onClick={() => {
                                    haptic("light");
                                    if (item.id === "bots") {
                                      setMobileMenuPanel("bots");
                                    } else if (item.id === "apps") {
                                      setMobileMenuPanel("apps");
                                    } else if (item.path) {
                                      navigate(item.path);
                                      setIsMenuOpen(false);
                                    }
                                  }}
                                  className="flex items-center gap-4 p-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-2xl transition-all border border-black/5 dark:border-white/5 text-left w-full group"
                                >
                                  <div className="shrink-0 w-10 h-10 rounded-xl bg-black/[0.03] dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                                    <item.icon size={20} />
                                  </div>
                                  <div className="flex flex-col min-w-0 flex-1">
                                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tight">
                                      {item.label}
                                    </span>
                                    <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                      {item.desc}
                                    </span>
                                  </div>
                                  {(item.id === "bots" || item.id === "apps") && (
                                    <ChevronRight size={14} className="text-slate-400 shrink-0" />
                                  )}
                                </button>
                              ))}
                            </div>

                            {/* Hızlı Bağlantılar / Quick Links */}
                            <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex flex-col gap-1.5">
                              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600 pl-2">
                                Hızlı Bağlantılar
                              </span>
                              {simpleLinks.map((link, i) => (
                                <a
                                  key={i}
                                  href={link.path}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    navigate(link.path);
                                    setOpenMenu(null);
                                    if (typeof setMobileModal === "function") setMobileModal(null);
                                  }}
                                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-all font-bold text-xs uppercase group"
                                >
                                  {link.label}
                                  <ExternalLink
                                    size={14}
                                    className="opacity-0 group-hover:opacity-100 transition-all"
                                  />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {mobileMenuPanel === "bots" && (
                          <div className="space-y-1">
                            {/* Back button */}
                            <button
                              onClick={() => {
                                haptic("light");
                                setMobileMenuPanel("categories");
                              }}
                              className="w-full flex items-center gap-2 p-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 border-b border-slate-100 dark:border-white/5 mb-2 font-bold text-xs uppercase"
                            >
                              <ArrowLeft size={16} />
                              <span>Kategoriler</span>
                            </button>

                            <div className="max-h-[300px] overflow-y-auto pr-1 space-y-1">
                              <button
                                onClick={() => {
                                  haptic("light");
                                  navigate("/search?mode=bots");
                                  setIsMenuOpen(false);
                                }}
                                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase text-left"
                              >
                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                                  <Compass size={16} className="text-blue-500" />
                                </div>
                                <span>Tüm Botlar</span>
                              </button>

                              {botsCategories.map((cat) => (
                                <button
                                  key={cat.id}
                                  onClick={() => {
                                    haptic("light");
                                    navigate(`/search?mode=bots&category=${cat.id}`);
                                    setIsMenuOpen(false);
                                  }}
                                  className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase text-left"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-black/[0.04] dark:bg-white/5 flex items-center justify-center shrink-0">
                                    {cat.icon && <cat.icon size={16} className="text-slate-400" />}
                                  </div>
                                  <span className="truncate">{t(cat.label) || cat.label}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {mobileMenuPanel === "apps" && (
                          <div className="space-y-1">
                            {/* Back button */}
                            <button
                              onClick={() => {
                                haptic("light");
                                setMobileMenuPanel("categories");
                              }}
                              className="w-full flex items-center gap-2 p-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 border-b border-slate-100 dark:border-white/5 mb-2 font-bold text-xs uppercase"
                            >
                              <ArrowLeft size={16} />
                              <span>Kategoriler</span>
                            </button>

                            <div className="max-h-[300px] overflow-y-auto pr-1 space-y-1">
                              <button
                                onClick={() => {
                                  haptic("light");
                                  navigate("/search?mode=apps");
                                  setIsMenuOpen(false);
                                }}
                                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase text-left"
                              >
                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                                  <Compass size={16} className="text-blue-500" />
                                </div>
                                <span>Tüm Uygulamalar</span>
                              </button>

                              {appsCategories.map((cat) => (
                                <button
                                  key={cat.id}
                                  onClick={() => {
                                    haptic("light");
                                    navigate(`/search?mode=apps&category=${cat.id}`);
                                    setIsMenuOpen(false);
                                  }}
                                  className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase text-left"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-black/[0.04] dark:bg-white/5 flex items-center justify-center shrink-0">
                                    {cat.icon && <cat.icon size={16} className="text-slate-400" />}
                                  </div>
                                  <span className="truncate">{t(cat.label) || cat.label}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Desktop View */}
                      <div className="hidden md:block">
                        <div className="p-4 border-b border-slate-100 dark:border-white/5 mb-2">
                        <div className="flex items-center gap-3">
                          <img
                            src={currentUser.avatar}
                            alt={currentUser.name}
                            className="w-10 h-10 rounded-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="text-[13px] font-bold text-slate-900 dark:text-white truncate">
                              {currentUser.name}
                            </span>
                            <span className="text-[10px] text-slate-500 truncate">
                              @{user?.username || currentUser.id}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          haptic("light");
                          navigate("/");
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all group text-left"
                      >
                        <Store
                          size={18}
                          className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors"
                        />
                        <span className="text-xs font-bold uppercase tracking-tight">
                          {t("market")}
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          haptic("light");
                          navigate("/profile");
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all group text-left"
                      >
                        <UserIcon
                          size={18}
                          className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors"
                        />
                        <span className="text-xs font-bold uppercase tracking-tight">
                          {t("profile")}
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          haptic("light");
                          navigate("/my-bots");
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all group text-left"
                      >
                        <BotIcon
                          size={18}
                          className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors"
                        />
                        <span className="text-xs font-bold uppercase tracking-tight">
                          {t("my_bots")}
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          haptic("light");
                          navigate("/channels");
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all group text-left"
                      >
                        <Megaphone
                          size={18}
                          className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors"
                        />
                        <span className="text-xs font-bold uppercase tracking-tight">
                          {t("my_channels")}
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          haptic("light");
                          navigate("/notifications");
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all group text-left"
                      >
                        <div className="flex items-center gap-3">
                          <Bell
                            size={18}
                            className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors"
                          />
                          <span className="text-xs font-bold uppercase tracking-tight">
                            {t("notifications")}
                          </span>
                        </div>
                        {unreadCount > 0 && (
                          <div className="w-2 h-2 bg-red-500 rounded-full" />
                        )}
                      </button>

                      <button
                        onClick={() => {
                          haptic("light");
                          navigate("/qa");
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all group text-left"
                      >
                        <MessageSquare
                          size={18}
                          className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors"
                        />
                        <span className="text-xs font-bold uppercase tracking-tight">
                          {t("qa_forum") || "Soru Cevap Forumu"}
                        </span>
                      </button>

                      <div className="h-px bg-slate-100 dark:border-white/5 my-2" />

                      <button
                        onClick={() => {
                          const confirmed = window.confirm(
                            "Çıkış yapmak istediğinize emin misiniz?",
                          );
                          if (confirmed) {
                            haptic("medium");
                            setWebAuthUser(null);
                            setIsMenuOpen(false);
                            navigate("/");
                          }
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 transition-all font-bold text-xs uppercase text-left"
                      >
                        <LogOut size={18} />
                        <span className="text-xs font-bold uppercase tracking-tight">
                          {t("home_logout")}
                        </span>
                      </button>
                      </div>
                    </div>
                  )}
                </div>
            </div>
          </div>
        </div>

        {/* Desktop Mega Menu Dropdown */}
        <AnimatePresence>
          {openMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="hidden md:block absolute left-0 right-0 top-full bg-white dark:bg-slate-900/95 backdrop-blur-xl border-b border-black/5 dark:border-white/10 shadow-2xl z-[100] mega-menu-container"
              onMouseLeave={() => {
                setOpenMenu(null);
                setNavState("main");
              }}
            >
              {renderMegaMenuContent()}
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};

const BotDetail = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const { haptic, user, notification, tg, isTelegram, setWebAuthUser } =
    useTelegram();
  const { t, language } = useTranslation();
  const { toggleTheme, theme } = useTheme();

  const [bot, setBot] = useState<Bot | null>(null);
  const [similarBots, setSimilarBots] = useState<Bot[]>([]);
  const [matchedQATopics, setMatchedQATopics] = useState<any[]>([]);
  const [isOwned, setIsOwned] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [tonRate, setTonRate] = useState(250);
  const [showGuide, setShowGuide] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileActionMenuOpen, setIsMobileActionMenuOpen] = useState(false);
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isDescriptionLong, setIsDescriptionLong] = useState(false);
  const descriptionRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = descriptionRef.current;
    if (!el || !bot?.description) return;

    const checkIsLong = () => {
      if (!isDescriptionExpanded) {
        setIsDescriptionLong(el.scrollHeight > el.clientHeight);
      }
    };

    checkIsLong();

    const observer = new ResizeObserver(() => {
      checkIsLong();
    });
    observer.observe(el);

    const timer = setTimeout(checkIsLong, 150);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [bot?.description, isDescriptionExpanded, isLoading]);

  const [isSidebarDropdownOpen, setIsSidebarDropdownOpen] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isRating, setIsRating] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const qaParticipantsInfo = useMemo(() => {
    if (!matchedQATopics || matchedQATopics.length === 0) return null;
    
    const participantsMap = new Map<string, { name: string; avatar: string }>();
    
    matchedQATopics.forEach((topic) => {
      const authId = String(topic.author_id);
      if (authId) {
        participantsMap.set(authId, {
          name: topic.author_name || "Anonim",
          avatar: topic.author_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(topic.author_name || 'Anon')}`,
        });
      }
      
      if (topic.comments && Array.isArray(topic.comments)) {
        topic.comments.forEach((comment: any) => {
          const comAuthId = String(comment.author_id);
          if (comAuthId) {
            participantsMap.set(comAuthId, {
              name: comment.author_name || "Anonim",
              avatar: comment.author_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author_name || 'Anon')}`,
            });
          }
        });
      }
    });
    
    const participantsList = Array.from(participantsMap.entries()).map(([id, data]) => ({
      id,
      ...data,
    }));
    
    if (participantsList.length === 0) return null;
    
    const firstAuthor = participantsList[0];
    const totalRemaining = participantsList.length - 1;
    
    return {
      participants: participantsList,
      firstAuthor: firstAuthor,
      totalRemaining,
      totalCount: participantsList.length
    };
  }, [matchedQATopics]);

  const screenshotScroll = useDraggableScroll();
  const similarScroll = useDraggableScroll();

  const fetchBotData = useCallback(async () => {
    if (!slug) return;
    setIsLoading(true);
    const startTime = Date.now();
    try {
      const data = await DatabaseService.getBotBySlug(slug);
      setBot(data);
      if (data) {
        DatabaseService.incrementBotView(data.id);
        
        // Fetch similar bots
        try {
          const allBots = await DatabaseService.getBots();
          const filtered = allBots.filter((b) => b.id !== data.id);
          const currentCategory = data.category;
          
          const matching = filtered.filter((b) => b.category === currentCategory);
          const nonMatching = filtered.filter((b) => b.category !== currentCategory);
          
          const combined = [...matching, ...nonMatching].slice(0, 6);
          setSimilarBots(combined);
        } catch (err) {
          console.error("Similar bots fetch error:", err);
        }

        // Fetch Q&A topics matching this bot
        try {
          const allQATopics = await DatabaseService.getQADiscussions('all');
          const botNameLower = data.name.toLowerCase();
          const botSlugLower = data.slug?.toLowerCase() || '';
          const botIdLower = data.id.toLowerCase();
          
          const matches = allQATopics.filter((topic: any) => {
            return topic.tags?.some((t: any) => {
              const tagNameLower = t.name?.toLowerCase() || '';
              const tagIdLower = t.id?.toLowerCase() || '';
              return tagNameLower === botNameLower || 
                     tagIdLower === botSlugLower || 
                     tagIdLower === botIdLower;
            }) || topic.title?.toLowerCase().includes(botNameLower);
          });
          setMatchedQATopics(matches);
        } catch (err) {
          console.error("Q&A topics fetch error:", err);
        }
      }
      const userId = user?.id?.toString();
      if (userId && data) {
        const owned = await DatabaseService.isBotOwnedByUser(userId, data.id);
        setIsOwned(owned);

        // Log bot view
        await DatabaseService.logActivity(
          userId,
          "system",
          "bot_view",
          "Bot İnceleme",
          `${data.name} botu detayları görüntülendi.`,
        );

        // Get notifications for unread count
        DatabaseService.getNotifications(userId).then((notes) => {
          const unread = notes.filter((n) => !n.isRead).length;
          setUnreadCount(unread);
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      const elapsedTime = Date.now() - startTime;
      const minDelay = 500;
      if (elapsedTime < minDelay) {
        await new Promise((resolve) =>
          setTimeout(resolve, minDelay - elapsedTime),
        );
      }
      setIsLoading(false);
    }
  }, [slug, user?.id]);

  useEffect(() => {
    if (bot) {
      document.title = `${bot.name} | Telegram Bot & AI | BotlyHub`;
    } else {
      document.title = t("detail_seo_title") || "Bot Detayı | BotlyHub";
    }
  }, [bot, t]);

  useEffect(() => {
    fetchBotData();
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node))
        setIsMenuOpen(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") nextImage(null as any);
      if (e.key === "ArrowLeft") prevImage(null as any);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [fetchBotData, slug]);

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setIsLightboxOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    document.body.style.overflow = "auto";
  };

  const nextImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!bot?.screenshots) return;
    setCurrentImageIndex((prev) => (prev + 1) % bot.screenshots!.length);
  };

  const prevImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!bot?.screenshots) return;
    setCurrentImageIndex(
      (prev) => (prev - 1 + bot.screenshots!.length) % bot.screenshots!.length,
    );
  };

  useEffect(() => {
    if (user?.id && bot?.id) {
      DatabaseService.getUserBotRating(user.id.toString(), bot.id).then(
        setUserRating,
      );
    }
  }, [user?.id, bot?.id]);

  useEffect(() => {
    PriceService.getTonPrice().then((p) => setTonRate(p.tonTry));
  }, []);

  const handleAction = useCallback(async () => {
    if (isProcessing || !bot) return;
    haptic("medium");

    if (isOwned) {
      const username = bot.bot_link
        .replace("@", "")
        .replace("https://t.me/", "")
        .split("/")
        .pop()
        ?.trim();
      const finalUrl = `https://t.me/${username}`;
      if (tg?.openTelegramLink) tg.openTelegramLink(finalUrl);
      else window.open(finalUrl, "_blank");
      return;
    }

    if (!user || !user.id || user.id === "guest_user") {
      haptic("heavy");
      notification("error");
      alert("Kütüphaneye eklemek veya satın almak için lütfen giriş yapın.");
      setIsLoginModalOpen(true);
      return;
    }

    if (bot.price === 0) {
      setIsProcessing(true);
      try {
        const userData = user;

        const syncData: Partial<User> = {
          id: userData.id.toString(),
          name:
            `${userData.first_name || ""} ${userData.last_name || ""}`.trim() ||
            userData.username ||
            "User",
          username: userData.username || "user",
          role: "User",
          status: "Active",
          joinDate: new Date().toISOString(),
        };
        await DatabaseService.syncUser(syncData);

        await DatabaseService.addUserBot(userData, bot, false);

        DatabaseService.logActivity(
          userData.id.toString(),
          "system",
          "bot_added",
          "Kütüphaneye Ekleme",
          `${bot.name} botu kütüphaneye eklendi.`,
        );

        try {
          await DatabaseService.sendUserNotification(
            userData.id.toString(),
            t("detail_added_to_lib_title"),
            `'${bot.name}' ${t("detail_added_to_lib_msg")}`,
            "bot",
          );
        } catch (noteErr) {
          console.warn("Bildirim gönderilemedi ancak bot eklendi.", noteErr);
        }

        setIsOwned(true);
        notification("success");
        setTimeout(() => setShowGuide(true), 500);
      } catch (e: any) {
        console.error("Action failed:", e);
        alert("İşlem başarısız: " + (e.message || "Lütfen tekrar deneyin."));
      } finally {
        setIsProcessing(false);
      }
    } else {
      navigate(`/payment/${bot.slug}`);
    }
  }, [
    isProcessing,
    bot,
    isOwned,
    haptic,
    tg,
    user,
    notification,
    setShowGuide,
    navigate,
    setIsLoginModalOpen,
  ]);

  const handleAiAnalysis = async () => {
    if (!bot || isAiLoading) return;
    if (!user || !user.id || user.id === "guest_user") {
      haptic("heavy");
      notification("error");
      alert("Yapay zeka analizini kullanmak için lütfen giriş yapın.");
      setIsLoginModalOpen(true);
      return;
    }
    setIsAiLoading(true);
    try {
      const response = await GeminiService.analyzeBot(bot);
      setAiAnalysis(response);

      if (user?.id) {
        await DatabaseService.logActivity(
          user.id.toString(),
          "system",
          "bot_ai_analysis",
          "AI Analizi",
          `${bot.name} botu için AI analizi istendi.`,
        );
      }
    } catch (error) {
      console.error("AI Analysis Error:", error);
      setAiAnalysis(
        "AI asistanı şu anda meşgul. Lütfen daha sonra tekrar deneyin.",
      );
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleShare = () => {
    if (!bot) return;
    const shareUrl = `https://t.me/BotlyHubBot/app?startapp=bot_${bot.slug}`;
    const shareText = `BotlyHub'da harika bir bot buldum: ${bot.name}\n\n${bot.description}\n\n${shareUrl}`;

    if (tg?.openTelegramLink) {
      tg.openTelegramLink(
        `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      );
    } else {
      navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      notification("success");
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleRate = async (rating: number) => {
    console.log("handleRate called with:", rating);
    if (isRating) return;

    if (!user || !user.id || user.id === "guest_user") {
      notification("error");
      haptic("heavy");
      alert("Puan vermek için lütfen önce giriş yapın.");
      setIsLoginModalOpen(true);
      return;
    }

    if (!bot?.id) return;

    setIsRating(true);
    try {
      console.log("Saving rating to DB...");
      await DatabaseService.rateBot(user.id.toString(), bot.id, rating);
      console.log("Rating saved successfully");
      setUserRating(rating);
      await fetchBotData();
      notification("success");
    } catch (e: any) {
      console.error("Rating Error:", e);
      notification("error");
      if (tg?.showAlert)
        tg.showAlert(`Hata: ${e.message || "Puan kaydedilemedi"}`);
      else alert(`Hata: ${e.message || "Puan kaydedilemedi"}`);
    } finally {
      setIsRating(false);
    }
  };

  const prices = useMemo(() => {
    if (!bot) return { ton: 0, stars: 0 };
    return PriceService.convert(bot.price, tonRate);
  }, [bot, tonRate]);

  if (isLoading) return <BotDetailSkeleton />;

  if (!bot)
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <BotIcon
          className="text-slate-300 dark:text-slate-700 mb-4"
          size={64}
        />
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2 italic uppercase tracking-tight">
          Bot Bulunamadı
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium">
          Aradığınız bot sistemde bulunamadı veya silinmiş olabilir.
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black text-[11px] uppercase tracking-widest active:scale-95 transition-transform"
        >
          Anasayfaya Dön
        </button>
      </div>
    );

  return (
    <>
      <SEO
        title={`${bot.name} - ${t("detail_seo_title")}`}
        description={`${bot.name} ${t("home_seo_desc")}`}
        ogImage={bot.icon || undefined}
        breadcrumbs={[
          { name: t("search_breadcrumb_home"), item: "https://botlyhub.com/" },
          { name: bot.name, item: `https://botlyhub.com/bot/${bot.slug}` },
        ]}
      />
      <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-200 pb-40 animate-in fade-in transition-colors duration-300 bot-detail-page">
        <NavMenu
          user={user}
          unreadCount={unreadCount}
          theme={theme}
          toggleTheme={toggleTheme}
          haptic={haptic}
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          setIsLoginModalOpen={setIsLoginModalOpen}
          setWebAuthUser={setWebAuthUser}
          isLoginModalOpen={isLoginModalOpen}
          menuRef={menuRef}
        />
        <div className="max-w-7xl mx-auto px-5 sm:px-8 md:px-10">
          <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-16 overflow-visible pt-10">
            <div className="lg:col-start-1 min-w-0">
              {/* Hero & Stats Section */}
              <div className="pt-10 px-6 lg:px-0 flex flex-col md:flex-row md:items-center gap-6 mb-10">
                <div className="flex items-start justify-between gap-6 flex-1">
                  <div className="flex items-start gap-6 min-w-0">
                    <div className="flex flex-col gap-4 shrink-0 w-24">
                      <div className="relative">
                        <LazyImage
                          src={getLiveBotIcon(bot)}
                          className="w-24 h-24 rounded-xl !p-0 border border-black/10 dark:border-white/10 object-cover"
                          containerClass="w-24 h-24 rounded-xl"
                          skeletonClass="rounded-xl"
                          onError={(e) => {
                            (e.target as any).src =
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(bot.name)}&background=1e293b&color=fff&bold=true`;
                          }}
                        />
                        {isOwned && (
                          <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-xl border-2 border-slate-50 dark:border-slate-950">
                            <CheckCircle2 size={14} />
                          </div>
                        )}
                      </div>

                      {/* Categories Moved under Photo */}
                      <div className="flex flex-nowrap gap-2 w-max min-w-full">
                        {(() => {
                          const catList = Array.isArray(bot.category)
                            ? bot.category
                            : [bot.category];
                          const visibleCats = isCategoriesExpanded
                            ? catList
                            : catList.slice(0, 2);

                          return (
                            <div className="flex flex-nowrap gap-1.5 items-center">
                              {visibleCats.map((catId) => {
                                const cat =
                                  categories.find((c) => c.id === catId) ||
                                  appsSubCategories.find((c) => c.id === catId);
                                return (
                                  <motion.span
                                    key={catId}
                                    initial={
                                      isCategoriesExpanded
                                        ? { opacity: 0, scale: 0.9 }
                                        : false
                                    }
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-brand dark:text-brand-light text-[8px] font-black uppercase tracking-wider border border-brand/20 px-2 py-0.5 rounded-lg bg-brand/5 whitespace-nowrap bot-category-tag"
                                  >
                                    {cat
                                      ? t(cat.label)
                                      : t(`cat_${catId}`) === `cat_${catId}`
                                        ? catId
                                        : t(`cat_${catId}`)}
                                  </motion.span>
                                );
                              })}
                              {!isCategoriesExpanded && catList.length > 2 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    haptic("light");
                                    setIsCategoriesExpanded(true);
                                  }}
                                  className="text-brand dark:text-brand-light text-[8px] font-black uppercase tracking-wider border border-brand/20 px-2 py-0.5 rounded-lg bg-brand/5 flex items-center gap-1 active:scale-95 transition-all shadow-sm bot-category-tag"
                                >
                                  +{catList.length - 2}
                                </button>
                              )}
                              {isCategoriesExpanded && catList.length > 2 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    haptic("light");
                                    setIsCategoriesExpanded(false);
                                  }}
                                  className="text-slate-400 dark:text-slate-500 text-[8px] font-bold uppercase tracking-wider px-1 py-0.5 flex items-center gap-1 active:scale-95 transition-all"
                                >
                                  <X size={8} />
                                </button>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight truncate mb-1 flex items-center gap-2">
                        {bot.name}
                        {bot.is_official && (
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-[11px] h-[11px] text-[#139fec] shrink-0"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                        {isOwned && (
                          <button
                            onClick={() => {
                              haptic("medium");
                              navigate(`/bot-panel/${bot.id}`);
                            }}
                            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/10 border border-blue-600/20 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-600/20 active:scale-95 transition-all ml-2"
                            title="Bot Yönetim Paneli"
                          >
                            <LayoutGrid size={12} />
                            <span className="text-[10px] font-black uppercase tracking-widest italic">
                              YÖNETİM PANELİ
                            </span>
                          </button>
                        )}
                        {DatabaseService.isAdminLoggedIn() && (
                          <button
                            onClick={() => navigate("/a/dashboard/bots")}
                            className="p-1.5 bg-brand text-white rounded-lg active:scale-90 transition-transform ml-2"
                            title="Admin Panelinde Düzenle"
                          >
                            <Edit3 size={12} />
                          </button>
                        )}
                      </h1>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="bg-brand/10 border border-brand/20 text-brand dark:text-brand-light text-[10px] font-bold px-3 py-1 rounded-xl flex items-center gap-1">
                          @
                          {bot.bot_link
                            ? bot.bot_link
                                .replace("@", "")
                                .replace("https://t.me/", "")
                                .split("/")
                                .pop()
                                ?.trim()
                            : bot.name.replace(/\s+/g, "")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="lg:hidden relative shrink-0">
                    <button
                      onClick={() => {
                        haptic("light");
                        setIsMobileActionMenuOpen(!isMobileActionMenuOpen);
                      }}
                      className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-white/20 active:scale-90 transition-all shrink-0 cursor-pointer"
                    >
                      <MoreVertical size={20} />
                    </button>

                    <AnimatePresence>
                      {isMobileActionMenuOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-[60]"
                            onClick={() => setIsMobileActionMenuOpen(false)}
                          />
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="absolute right-0 top-full mt-2 w-44 z-[70] bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden"
                          >
                            <div className="p-1.5 space-y-1">
                              <button
                                onClick={() => {
                                  haptic("medium");
                                  handleShare();
                                  setIsMobileActionMenuOpen(false);
                                }}
                                className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg transition-colors text-left text-slate-700 dark:text-slate-300 font-bold text-[11px] uppercase tracking-wider"
                              >
                                <Share2
                                  size={14}
                                  className={isCopied ? "text-emerald-500" : "text-slate-400 dark:text-slate-500"}
                                />
                                <span>{t("detail_share_btn")}</span>
                              </button>
                              <button
                                onClick={() => {
                                  haptic("medium");
                                  notification("warning"); /* Future Report logic */
                                  setIsMobileActionMenuOpen(false);
                                }}
                                className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg transition-colors text-left text-red-500 font-bold text-[11px] uppercase tracking-wider"
                              >
                                <Flag size={14} className="text-red-400 dark:text-red-500" />
                                <span>{t("detail_report_btn") || "Şikayet Et"}</span>
                              </button>
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="w-full md:w-auto md:min-w-[320px] lg:hidden px-6">
                  <div className="flex flex-col bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 p-4 rounded-xl stats-card-bg mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col items-center flex-1">
                        <span className="text-slate-900 dark:text-white font-bold text-base">
                          {bot.rating || "0.0"}{" "}
                          <Star
                            size={12}
                            className="inline mb-1 fill-yellow-500 text-yellow-500"
                          />
                        </span>
                        <span className="text-[9px] text-slate-500 font-bold uppercase mt-0.5 tracking-wider">
                          {bot.rating_count || 0} Oy
                        </span>
                      </div>
                      <div className="w-px h-8 bg-black/5 dark:bg-white/5 mx-2"></div>
                      <div className="flex flex-col items-center flex-1">
                        <span className="text-slate-900 dark:text-white font-bold text-base flex items-center gap-1">
                          {bot.user_count && bot.user_count > 1000
                            ? `${(bot.user_count / 1000).toFixed(1)}K`
                            : bot.user_count || 0}
                          <Users
                            size={12}
                            className="text-slate-500 dark:text-slate-400 fill-slate-500/10"
                          />
                        </span>
                        <span className="text-[9px] text-slate-500 font-bold uppercase mt-0.5 tracking-wider">
                          Kullanıcı
                        </span>
                      </div>
                      <div className="w-px h-8 bg-black/5 dark:bg-white/5 mx-2"></div>
                      <div className="flex flex-col items-center flex-1">
                        <span className="text-slate-900 dark:text-white font-bold text-base flex items-center gap-1">
                          {bot.views && bot.views > 1000
                            ? `${(bot.views / 1000).toFixed(1)}K`
                            : bot.views || 0}
                          <Eye
                            size={12}
                            className="text-slate-500 dark:text-slate-400"
                          />
                        </span>
                        <span className="text-[9px] text-slate-500 font-bold uppercase mt-0.5 tracking-wider">
                          Görüntüleme
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gallery Section */}
              <div className="mb-12 relative group/gallery DappScreenshot_root__FSZyc">
                <div className="px-6 mb-6 flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase bot-detail-section-title">
                    {t("preview")}
                  </h3>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (screenshotScroll.ref.current) {
                          screenshotScroll.ref.current.scrollBy({
                            left: -340,
                            behavior: "smooth",
                          });
                          haptic("light");
                        }
                      }}
                      className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-brand hover:scale-110 shadow-lg transition-all active:scale-95"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() => {
                        if (screenshotScroll.ref.current) {
                          screenshotScroll.ref.current.scrollBy({
                            left: 340,
                            behavior: "smooth",
                          });
                          haptic("light");
                        }
                      }}
                      className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-brand hover:scale-110 shadow-lg transition-all active:scale-95"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>

                <div className="overflow-hidden">
                  <div
                    ref={screenshotScroll.ref}
                    onMouseDown={screenshotScroll.onMouseDown}
                    onMouseUp={screenshotScroll.onMouseUp}
                    onMouseMove={screenshotScroll.onMouseMove}
                    onMouseLeave={screenshotScroll.onMouseLeave}
                    onContextMenu={screenshotScroll.onContextMenu}
                    className={`flex gap-4 overflow-x-auto no-scrollbar px-6 snap-x pb-0 ${screenshotScroll.isDragging ? "cursor-grabbing" : "cursor-grab"} DappScreenshotsCarousel_root__s30Gy`}
                  >
                    {bot.screenshots && bot.screenshots.length > 0
                      ? bot.screenshots.map((s, i) => (
                          <motion.div
                            key={i}
                            className="h-[260px] w-[380px] rounded-[2.5rem] bg-slate-200 dark:bg-slate-950 border border-black/5 dark:border-white/10 overflow-hidden snap-center shrink-0 cursor-pointer group relative DappScreenshotsCarousel_emblaItem__s30Gy"
                            onClick={() => openLightbox(i)}
                          >
                            {/* Blurred Background Layer - Using the image itself */}
                            <div className="absolute inset-0 transform-gpu overflow-hidden">
                              <img
                                src={s}
                                className="w-full h-full object-cover blur-[40px] opacity-70 dark:opacity-50 scale-150"
                              />
                              <div className="absolute inset-0 bg-white/20 dark:bg-black/40" />
                            </div>

                            {/* Central Crisp Phone Mockup */}
                            <div className="absolute inset-0 flex items-center justify-center p-0 z-10">
                              <div className="h-full aspect-[9/19] relative group-hover:scale-105 transition-transform duration-700 ease-out">
                                <img
                                  src={s}
                                  loading="lazy"
                                  className="h-full w-full object-cover rounded-xl relative z-10 border-2 border-white/40 dark:border-white/20"
                                />
                                {/* Glass Reflection */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-white/5 to-transparent z-20 rounded-xl" />
                              </div>
                            </div>

                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none z-30">
                              <div className="bg-white/20 backdrop-blur-md p-4 rounded-full opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 border border-white/20">
                                <Maximize2 size={24} className="text-white" />
                              </div>
                            </div>
                          </motion.div>
                        ))
                      : [1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="w-[380px] h-[260px] rounded-[2.5rem] bg-slate-100 dark:bg-slate-900/50 border border-black/5 dark:border-white/5 overflow-hidden snap-center shrink-0 flex items-center justify-center"
                          >
                            <ImageIcon
                              className="text-slate-300 dark:text-slate-800"
                              size={32}
                            />
                          </div>
                        ))}
                  </div>
                </div>
              </div>

              {/* Rating Section */}
              {isOwned && (
                <div className="px-6 mb-10">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative p-5 bg-white/5 dark:bg-slate-900/40 backdrop-blur-xl rounded-xl border border-black/5 dark:border-white/5 overflow-hidden group"
                  >
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex flex-col gap-0.5">
                          <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase bot-detail-section-title">
                            Deneyimi Puanla
                          </h3>
                        </div>
                        {userRating && (
                          <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-xl"
                          >
                            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">
                              Puanınız: {userRating}
                            </span>
                          </motion.div>
                        )}
                      </div>

                      <div className="flex items-center justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const isActive =
                            (hoverRating || userRating || 0) >= star;
                          const isSelected = userRating === star;

                          return (
                            <motion.button
                              key={star}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(null)}
                              onClick={() => {
                                console.log("Star clicked:", star);
                                haptic("heavy");
                                handleRate(star);
                              }}
                              disabled={isRating}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="relative p-1.5 transition-all z-50"
                            >
                              <Star
                                size={28}
                                className={`transition-all duration-300 ${
                                  isActive
                                    ? "fill-yellow-400 text-yellow-400 "
                                    : "text-slate-200 dark:text-slate-800"
                                }`}
                              />
                              {isSelected && (
                                <motion.div
                                  layoutId="star-glow"
                                  className="absolute inset-0 bg-yellow-400/10 blur-lg rounded-full -z-10"
                                />
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Description */}
              <div className="px-6 mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase bot-detail-section-title">
                    {bot.name} Hakkında
                  </h2>
                </div>
                <div className="p-6 bg-slate-100/40 dark:bg-slate-900/40 rounded-2xl border border-slate-200/50 dark:border-white/5 text-sm text-slate-700 dark:text-slate-400 leading-relaxed transition-colors duration-300 bot-detail-about-box">
                  <div className="relative">
                    <p
                      ref={descriptionRef}
                      className={`text-sm text-slate-700 dark:text-slate-400 leading-relaxed ${
                        !isDescriptionExpanded ? "line-clamp-3 pr-24" : "whitespace-pre-wrap"
                      }`}
                    >
                      {bot.description}
                    </p>

                    {!isDescriptionExpanded && isDescriptionLong && (
                      <button
                        onClick={() => {
                          if (haptic) haptic("light");
                          setIsDescriptionExpanded(true);
                        }}
                        className="bot-detail-show-more-btn absolute bottom-0 right-0 inline-flex items-center text-xs font-bold text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 active:scale-95 transition-all select-none cursor-pointer pl-8 pt-0.5"
                      >
                        {t("show_more") || "Daha fazla göster"}
                      </button>
                    )}

                    {isDescriptionExpanded && isDescriptionLong && (
                      <button
                        onClick={() => {
                          if (haptic) haptic("light");
                          setIsDescriptionExpanded(false);
                        }}
                        className="bot-detail-show-less-btn inline text-xs font-bold text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 active:scale-95 transition-all select-none cursor-pointer align-baseline ml-2"
                      >
                        {t("show_less") || "Daha az göster"}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Soru-Cevap ve Yorumlar Bölümü */}
              {qaParticipantsInfo && (
                <div className="px-6 mb-12">
                  <div
                    onClick={() => {
                      if (haptic) haptic("light");
                      navigate(`/qa?tag=${bot.name}`);
                    }}
                    className="py-3 bg-transparent flex items-center justify-between gap-4 cursor-pointer transition-all duration-300 hover:opacity-85"
                  >
                    <div className="flex items-center gap-3">
                      {/* Overlapping avatars, maximum 3 */}
                      <div className="flex items-center -space-x-2">
                        {qaParticipantsInfo.participants.slice(0, 3).map((p, idx) => (
                          <img
                            key={p.id}
                            src={p.avatar}
                            alt={p.name}
                            className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-950 object-cover shadow-sm bg-slate-200"
                            referrerPolicy="no-referrer"
                          />
                        ))}
                      </div>
                      
                      {/* Interactive dynamic text based on user language */}
                      <span className="text-[13px] font-semibold text-slate-600 dark:text-slate-400">
                        {language === "tr" ? (
                          qaParticipantsInfo.totalRemaining > 0 ? (
                            <>
                              <span className="font-extrabold text-slate-800 dark:text-slate-200">
                                {qaParticipantsInfo.firstAuthor.name.startsWith("@") 
                                  ? qaParticipantsInfo.firstAuthor.name 
                                  : `@${qaParticipantsInfo.firstAuthor.name}`}
                              </span>
                              {" ve "}
                              <span className="font-extrabold text-slate-800 dark:text-slate-200">
                                {qaParticipantsInfo.totalRemaining} kişi
                              </span>
                              {" yorum yaptı."}
                            </>
                          ) : (
                            <>
                              <span className="font-extrabold text-slate-800 dark:text-slate-200">
                                {qaParticipantsInfo.firstAuthor.name.startsWith("@") 
                                  ? qaParticipantsInfo.firstAuthor.name 
                                  : `@${qaParticipantsInfo.firstAuthor.name}`}
                              </span>
                              {" bu bot hakkında tartışma başlattı."}
                            </>
                          )
                        ) : (
                          qaParticipantsInfo.totalRemaining > 0 ? (
                            <>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {qaParticipantsInfo.firstAuthor.name.startsWith("@") 
                                  ? qaParticipantsInfo.firstAuthor.name 
                                  : `@${qaParticipantsInfo.firstAuthor.name}`}
                              </span>
                              {" and "}
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {qaParticipantsInfo.totalRemaining} {qaParticipantsInfo.totalRemaining === 1 ? "other" : "others"}
                              </span>
                              {" commented."}
                            </>
                          ) : (
                            <>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {qaParticipantsInfo.firstAuthor.name.startsWith("@") 
                                  ? qaParticipantsInfo.firstAuthor.name 
                                  : `@${qaParticipantsInfo.firstAuthor.name}`}
                              </span>
                              {" started a discussion."}
                            </>
                          )
                        )}
                      </span>
                    </div>
                    
                    {/* Floating go option - Simple blue link with custom right arrow SVG icon */}
                    <div className="flex items-center gap-1 text-[#3b82f6] dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 font-bold text-xs select-none transition-all">
                      <span className="hidden sm:inline-block">
                        {language === "tr" ? "İncele" : "Review"}
                      </span>
                      <svg
                        fill="none"
                        viewBox="0 0 24 24"
                        id="sign-out-double-arrow-2"
                        data-name="Line Color"
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5 shrink-0 icon line-color"
                      >
                        <polyline
                          id="secondary-2"
                          data-name="secondary"
                          points="13 9 16 12 13 15"
                          style={{
                            fill: "none",
                            stroke: "#3b82f6",
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            strokeWidth: 2,
                          }}
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* Mobil için Resmi Linkler ve Diller - Tartışma Alanının Altında */}
              <div className="w-full lg:hidden px-6 mb-4">
                {/* Bağlantılar Dropdown Menu */}
                {(bot.telegram_group ||
                  bot.website_url ||
                  bot.app_url ||
                  bot.social_url) && (
                  <div className="relative mb-6">
                    <button
                      onClick={() => {
                        haptic("light");
                        setIsDropdownOpen(!isDropdownOpen);
                      }}
                      className="w-full h-14 bg-white dark:bg-slate-900 rounded-xl border border-black/5 dark:border-white/10 flex items-center justify-between px-5 text-[11px] font-black tracking-[0.2em] transition-all active:scale-[0.98] stats-card-bg"
                    >
                      <div className="flex items-center gap-3">
                        <span>
                          {t("detail_official_links") || "Resmi Linkler"}
                        </span>
                      </div>
                      <ChevronDown
                        size={18}
                        className={`transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    <AnimatePresence>
                      {isDropdownOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-[60]"
                            onClick={() => setIsDropdownOpen(false)}
                          ></div>
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="absolute left-0 right-0 top-full mt-2 z-[70] bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden"
                          >
                            <div className="p-2 space-y-1">
                              {bot.telegram_group && (
                                <button
                                  onClick={() => {
                                    const url =
                                      bot.telegram_group!.startsWith("@")
                                        ? `https://t.me/${bot.telegram_group!.substring(1)}`
                                        : bot.telegram_group;
                                    window.open(url || undefined, "_blank");
                                    setIsDropdownOpen(false);
                                  }}
                                  className="w-full flex items-center justify-between px-4 py-4 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors text-left group"
                                >
                                  <div className="flex items-center gap-3">
                                    <Send
                                      size={14}
                                      className="text-slate-400 dark:text-slate-500"
                                    />
                                    <span className="text-[10px] font-black tracking-widest text-slate-700 dark:text-slate-300">
                                      Telegram Grup
                                    </span>
                                  </div>
                                  <ChevronRight
                                    size={14}
                                    className="text-slate-300 dark:text-slate-700"
                                  />
                                </button>
                              )}
                              {bot.website_url && (
                                <button
                                  onClick={() => {
                                    window.open(bot.website_url || undefined, "_blank");
                                    setIsDropdownOpen(false);
                                  }}
                                  className="w-full flex items-center justify-between px-4 py-4 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors text-left group border-t border-black/[0.03] dark:border-white/[0.03]"
                                >
                                  <div className="flex items-center gap-3">
                                    <Globe
                                      size={14}
                                      className="text-slate-400 dark:text-slate-500"
                                    />
                                    <span className="text-[10px] font-black tracking-widest text-slate-700 dark:text-slate-300">
                                      Web Site
                                    </span>
                                  </div>
                                  <ChevronRight
                                    size={14}
                                    className="text-slate-300 dark:text-slate-700"
                                  />
                                </button>
                              )}
                              {bot.app_url && (
                                <button
                                  onClick={() => {
                                    window.open(bot.app_url || undefined, "_blank");
                                    setIsDropdownOpen(false);
                                  }}
                                  className="w-full flex items-center justify-between px-4 py-4 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors text-left group border-t border-black/[0.03] dark:border-white/[0.03]"
                                >
                                  <div className="flex items-center gap-3">
                                    <Cpu
                                      size={14}
                                      className="text-slate-400 dark:text-slate-500"
                                    />
                                    <span className="text-[10px] font-black tracking-widest text-slate-700 dark:text-slate-300">
                                      App / Bot
                                    </span>
                                  </div>
                                  <ChevronRight
                                    size={14}
                                    className="text-slate-300 dark:text-slate-700"
                                  />
                                </button>
                              )}
                              {bot.social_url && (
                                <button
                                  onClick={() => {
                                    window.open(bot.social_url || undefined, "_blank");
                                    setIsDropdownOpen(false);
                                  }}
                                  className="w-full flex items-center justify-between px-4 py-4 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors text-left group border-t border-black/[0.03] dark:border-white/[0.03]"
                                >
                                  <div className="flex items-center gap-3">
                                    <Share2
                                      size={14}
                                      className="text-slate-400 dark:text-slate-500"
                                    />
                                    <span className="text-[10px] font-black tracking-widest text-slate-700 dark:text-slate-300">
                                      Sosyal Medya
                                    </span>
                                  </div>
                                  <ChevronRight
                                    size={14}
                                    className="text-slate-300 dark:text-slate-700"
                                  />
                                </button>
                              )}
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                )}
                {bot.languages && bot.languages.length > 0 && (
                  <div className="flex flex-col bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 p-4 rounded-xl stats-card-bg mb-6">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {t("detail_languages") || "Diller"}
                    </span>
                    <span className="text-[13px] font-medium text-slate-800 dark:text-slate-200 mt-1">
                      {formatLanguages(bot.languages)}
                    </span>
                  </div>
                )}
              </div>

              {/* Benzer Alternatifler */}
              {similarBots.length > 0 && (
                <div className="px-6 mb-12" id="similar-alternatives-section">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider bot-detail-section-title">
                      Benzer Alternatifler
                    </h2>
                  </div>
                  
                  <div 
                    ref={similarScroll.ref}
                    onMouseDown={similarScroll.onMouseDown}
                    onMouseUp={similarScroll.onMouseUp}
                    onMouseMove={similarScroll.onMouseMove}
                    onMouseLeave={similarScroll.onMouseLeave}
                    onContextMenu={similarScroll.onContextMenu}
                    className={`flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-3 -mx-6 px-6 select-none ${similarScroll.isDragging ? "cursor-grabbing" : "cursor-grab"}`}
                  >
                    {similarBots.map((item) => (
                      <div
                        key={item.id}
                        onClick={(e) => {
                          if (similarScroll.isDragging) {
                            e.preventDefault();
                            return;
                          }
                          if (haptic) haptic("light");
                          navigate(`/bot/${item.slug}`);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="similar-bot-card flex items-center p-2 sm:p-2.5 md:p-3 bg-slate-50 hover:bg-slate-100/60 dark:bg-slate-900/40 dark:hover:bg-slate-800/40 rounded-2xl cursor-pointer transition-all duration-300 group active:scale-[0.98] select-none shrink-0 snap-start border border-transparent dark:border-white/5 gap-1.5 sm:gap-2 md:gap-3 w-[165px] sm:w-[185px] md:w-[190px] lg:w-[200px] xl:w-[200px]"
                      >
                        <img
                          src={getLiveBotIcon(item)}
                          alt={item.name}
                          className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl object-cover bg-slate-100 dark:bg-slate-800 shrink-0"
                          onError={(e) => {
                            (e.target as any).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=1e293b&color=fff&bold=true`;
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1">
                            <h4 className="text-[11px] sm:text-[12px] md:text-[12.5px] lg:text-[13px] font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-500 dark:group-hover:text-blue-450 transition-colors">
                              {item.name}
                            </h4>
                            <svg
                              viewBox="0 0 16 16"
                              fill="none"
                              className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#139fec] shrink-0"
                            >
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M7.408 1.2375C7.57933 1.11017 7.78667 1.0415 8 1.0415C8.21333 1.0415 8.42067 1.11017 8.592 1.23749L9.81067 2.14417C9.83467 2.16217 9.86133 2.1755 9.88933 2.18484C9.91733 2.19417 9.94733 2.19884 9.97733 2.19817L11.496 2.18084C11.7093 2.17817 11.918 2.24484 12.09 2.37017C12.2627 2.4955 12.39 2.6735 12.454 2.87684L12.9073 4.32617C12.916 4.35484 12.93 4.3815 12.9473 4.4055C12.9647 4.4295 12.986 4.45084 13.0107 4.46817L14.2493 5.34684C14.4233 5.47017 14.5527 5.64617 14.6187 5.8495C14.6847 6.05217 14.6833 6.27084 14.6153 6.4735L14.13 7.91284C14.1207 7.94084 14.1153 7.97084 14.1153 8.00017C14.1153 8.0295 14.12 8.0595 14.13 8.0875L14.6153 9.52684C14.6833 9.72884 14.6847 9.9475 14.6187 10.1508C14.5527 10.3535 14.4233 10.5302 14.2493 10.6535L13.0107 11.5322C12.9867 11.5495 12.9653 11.5702 12.9473 11.5948C12.93 11.6188 12.9167 11.6455 12.9073 11.6742L12.454 13.1235C12.3907 13.3268 12.2627 13.5048 12.09 13.6302C11.9173 13.7555 11.7093 13.8222 11.496 13.8195L9.97733 13.8022C9.94733 13.8015 9.918 13.8062 9.88933 13.8155C9.86133 13.8248 9.83467 13.8382 9.81067 13.8562L8.592 14.7628C8.42067 14.8902 8.21333 14.9588 8 14.9588C7.78667 14.9588 7.57933 14.8902 7.408 14.7628L6.18933 13.8562C6.16533 13.8382 6.13867 13.8248 6.11067 13.8155C6.08267 13.8062 6.05267 13.8015 6.02267 13.8022L4.504 13.8195C4.29067 13.8222 4.082 13.7550 3.91 13.6302C3.73733 13.5048 3.61 13.3268 3.546 13.1235L3.09267 11.6742C3.084 11.6455 3.07 11.6188 3.05267 11.5948C3.03533 11.5708 3.014 11.5495 2.98933 11.5322L1.75067 10.6535C1.57667 10.5302 1.44733 10.3542 1.38133 10.1508C1.31533 9.94817 1.31667 9.7295 1.38467 9.52684L1.87 8.00017C1.88067 8.0595 1.88533 8.03017 1.88533 8.00017C1.88533 7.97017 1.88067 7.94084 1.87067 7.91284L1.38533 6.4735C1.31733 6.2715 1.316 6.05284 1.382 5.8495C1.448 5.64684 1.57733 5.47084 1.75133 5.3475L1.75133 5.3475L2.99 4.46884C3.014 4.45084 3.03533 4.43017 3.05333 4.40617C3.07067 4.38217 3.084 4.3555 3.09333 4.32684L3.54667 2.8775C3.61 2.67417 3.738 2.49617 3.91067 2.37084C4.08333 2.2455 4.29133 2.17884 4.50467 2.1815L6.02333 2.19884C6.05333 2.1995 6.08266 2.19484 6.11133 2.1855C6.13933 2.17617 6.166 2.16284 6.19 2.14484L7.408 1.2375Z"
                                fill="#139fec"
                              />
                            </svg>
                          </div>
                          <p className="text-[9px] sm:text-[10px] md:text-[10.5px] lg:text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 leading-normal line-clamp-1 truncate">
                            <span className="font-extrabold text-slate-800 dark:text-slate-200 mr-0.5 sm:mr-1 text-[9.5px] sm:text-[10.5px] md:text-[11px] lg:text-[11.5px]">
                              {item.user_count !== undefined 
                                ? (item.user_count >= 1000000
                                  ? (item.user_count / 1000000).toFixed(1).replace(/\.0$/, "") + "M"
                                  : item.user_count >= 1000
                                  ? (item.user_count / 1000).toFixed(1).replace(/\.0$/, "") + "K"
                                  : item.user_count.toString())
                                : "0"}
                            </span>
                            {t("detail_users_count")?.toLowerCase() || "kullanıcı"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column (PC only) - Action bar moved here for large screens */}
            <aside className="hidden lg:flex flex-col gap-4 sticky top-10 h-fit pr-6 lg:pr-0 mt-10">
              {/* Action Buttons for Sidebar */}
              <div className="flex flex-col gap-4">
                <button
                  onClick={handleAction}
                  disabled={isProcessing}
                  className={`w-full h-20 rounded-xl text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all active:scale-95 disabled:opacity-50 border-b-8 ${
                    isOwned
                      ? "bg-emerald-600 text-white border-emerald-800"
                      : bot.price === 0
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-700 dark:border-slate-300 ucretsiz-edin-btn"
                      : "bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-700 dark:border-slate-300"
                  }`}
                >
                  {isProcessing ? (
                    <Loader2 className="animate-spin" />
                  ) : isOwned ? (
                    <>
                      <Send size={20} /> {t("detail_launch")}
                    </>
                  ) : bot.price === 0 ? (
                    <>
                      <PlusCircle size={20} /> {t("detail_get_free")}
                    </>
                  ) : (
                    <div className="flex items-center gap-5">
                      <span className="text-2xl font-black italic tracking-tighter leading-none">
                        {prices.ton}
                      </span>
                      <div className="h-6 w-px bg-white/20 dark:bg-slate-400/20"></div>
                      <div className="flex items-center gap-2">
                        <span className="font-black tracking-[0.3em]">
                          {t("buy")}
                        </span>
                        <ChevronRight
                          size={20}
                          className="opacity-50 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                    </div>
                  )}
                </button>

                <div className="flex gap-3">
                  <button
                    onClick={handleShare}
                    className="h-20 flex-1 bg-white dark:bg-slate-900 rounded-xl border border-black/5 dark:border-white/10 flex items-center justify-center gap-3 text-slate-500 dark:text-slate-400 active:scale-95 transition-all relative border-b-8 border-transparent"
                  >
                    <Share2
                      size={20}
                      className={isCopied ? "text-emerald-500" : ""}
                    />
                    <span className="text-[10px] font-black tracking-[0.2em]">
                      {t("detail_share_btn")}
                    </span>
                    <AnimatePresence>
                      {isCopied && (
                        <motion.span
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: -35 }}
                          exit={{ opacity: 0 }}
                          className="absolute left-1/2 -translate-x-1/2 text-[8px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md whitespace-nowrap"
                        >
                          {t("share_copied")}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>

                  <button
                    onClick={() => {
                      haptic("medium");
                      notification("warning"); /* Future Report logic */
                    }}
                    className="h-20 w-20 shrink-0 bg-white dark:bg-slate-900 rounded-xl border border-black/5 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-red-500 active:scale-95 transition-all border-b-8 border-transparent"
                  >
                    <Flag size={20} />
                  </button>
                </div>
              </div>
 
              <div className="w-full">
                <div className="flex flex-col bg-slate-100/40 dark:bg-slate-900/40 rounded-2xl border border-slate-200/50 dark:border-white/5 backdrop-blur-xl overflow-hidden fancy-glass-card stats-card-bg transition-colors duration-300">
                  <div className="flex items-center justify-between p-6">
                    <div className="flex flex-col items-center flex-1 border-r border-slate-200/50 dark:border-white/5">
                      <span className="text-slate-900 dark:text-white font-bold text-base">
                        {bot.rating || "0.0"}{" "}
                        <Star
                          size={12}
                          className="inline mb-1 fill-yellow-500 text-yellow-500"
                        />
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium uppercase mt-1 tracking-wider">
                        {bot.rating_count || 0} {t("detail_vote")}
                      </span>
                    </div>
                    <div className="flex flex-col items-center flex-1 border-r border-slate-200/50 dark:border-white/5">
                      <span className="text-slate-900 dark:text-white font-bold text-base flex items-center gap-1 justify-center">
                        {bot.user_count && bot.user_count > 1000
                          ? `${(bot.user_count / 1000).toFixed(1)}K`
                          : bot.user_count || 0}
                        <Users
                          size={12}
                          className="text-slate-500 dark:text-slate-400 fill-slate-500/10"
                        />
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium uppercase mt-1 tracking-wider">
                        {t("detail_users_count")}
                      </span>
                    </div>
                    <div className="flex flex-col items-center flex-1">
                      <span className="text-slate-900 dark:text-white font-bold text-base flex items-center gap-1 justify-center">
                        {bot.views && bot.views > 1000
                          ? `${(bot.views / 1000).toFixed(1)}K`
                          : bot.views || 0}
                        <Eye
                          size={12}
                          className="text-slate-500 dark:text-slate-400"
                        />
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium uppercase mt-1 tracking-wider">
                        {t("detail_views")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Languages Section for Desktop */}
              {bot.languages && bot.languages.length > 0 && (
                <div className="flex flex-col bg-slate-100/40 dark:bg-slate-900/40 rounded-2xl border border-slate-200/50 dark:border-white/5 p-6 stats-card-bg transition-colors duration-300 font-medium">
                  <span className="text-xs font-black text-slate-900 dark:text-white uppercase bot-detail-section-title mb-2">
                    {t("detail_languages") || "Diller"}
                  </span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-400 leading-relaxed">
                    {formatLanguages(bot.languages)}
                  </span>
                </div>
              )}

              {/* Direct Link Buttons for Sidebar (PC/Large Screens) - Moved to bottom & styled horizontally */}
              {(bot.telegram_group ||
                bot.website_url ||
                bot.app_url ||
                bot.social_url) && (
                <div className="flex flex-col bg-slate-100/40 dark:bg-slate-900/40 rounded-2xl border border-slate-200/50 dark:border-white/5 p-6 transition-colors duration-300 official-links-box">
                  <div className="mb-3">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-none mb-1 bot-detail-section-title">
                      {t("detail_official_links") || "Resmi Linkler"}
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {bot.app_url && (
                      <button
                        onClick={() => window.open(bot.app_url || undefined, "_blank")}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200/50 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-white bg-white/5 dark:bg-[#111214]/40 hover:bg-slate-205/50 dark:hover:bg-white/5 cursor-pointer backdrop-blur-md transition-all active:scale-95 duration-200"
                      >
                        <Terminal size={14} className="text-slate-400 dark:text-slate-500" />
                        <span>{t("detail_app_bot") || "Uygulama Bot"}</span>
                      </button>
                    )}
                    {bot.website_url && (
                      <button
                        onClick={() => window.open(bot.website_url || undefined, "_blank")}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200/50 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-white bg-white/5 dark:bg-[#111214]/40 hover:bg-slate-205/50 dark:hover:bg-white/5 cursor-pointer backdrop-blur-md transition-all active:scale-95 duration-200"
                      >
                        <Link2 size={14} className="text-slate-400 dark:text-slate-500" />
                        <span>{t("detail_website") || "Web Site"}</span>
                      </button>
                    )}
                    {bot.telegram_group && (
                      <button
                        onClick={() => {
                          const url = bot.telegram_group!.startsWith("@")
                            ? `https://t.me/${bot.telegram_group!.substring(1)}`
                            : bot.telegram_group;
                          window.open(url || undefined, "_blank");
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200/50 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-white bg-white/5 dark:bg-[#111214]/40 hover:bg-slate-205/50 dark:hover:bg-white/5 cursor-pointer backdrop-blur-md transition-all active:scale-95 duration-200"
                      >
                        <Send size={14} className="text-slate-400 dark:text-slate-400" />
                        <span>{t("detail_tg_group") || "Telegram Grubu"}</span>
                      </button>
                    )}
                    {bot.social_url && (
                      <button
                        onClick={() => window.open(bot.social_url || undefined, "_blank")}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200/50 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-white bg-white/5 dark:bg-[#111214]/40 hover:bg-slate-205/50 dark:hover:bg-white/5 cursor-pointer backdrop-blur-md transition-all active:scale-95 duration-200"
                      >
                        <Share2 size={14} className="text-slate-400 dark:text-slate-500" />
                        <span>{t("detail_social") || "Sosyal Medya"}</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>



        {/* Onboarding Guide Modal */}
        <AnimatePresence>
          {showGuide && (
            <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowGuide(false)}
                className="absolute inset-0 bg-slate-50/95 dark:bg-[#020617]/95 backdrop-blur-xl"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 rounded-xl overflow-hidden"
              >
                <div className="p-8 lg:p-10">
                  <div className="flex justify-between items-center mb-8">
                    <div className="w-12 h-12 bg-brand dark:bg-brand-light rounded-2xl flex items-center justify-center uppercase tracking-widest text-[11px] font-bold text-white">
                      <Sparkles className="text-white" size={24} />
                    </div>
                    <button
                      onClick={() => setShowGuide(false)}
                      className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <h2 className="text-2xl font-black text-slate-900 dark:text-white italic uppercase tracking-tighter leading-none mb-3">
                    {t("guide_congrats_title")} <br />{" "}
                    <span className="text-brand dark:text-brand-light">
                      {t("guide_congrats_subtitle")}
                    </span>
                  </h2>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-10 italic">
                    {t("guide_steps_desc")}
                  </p>

                  <div className="space-y-6 mb-10">
                    {[
                      {
                        icon: Play,
                        title: t("guide_step_1_title"),
                        desc: t("guide_step_1_desc"),
                      },
                      {
                        icon: UserPlus,
                        title: t("guide_step_2_title"),
                        desc: t("guide_step_2_desc"),
                      },
                      {
                        icon: MessageSquare,
                        title: t("guide_step_3_title"),
                        desc: t("guide_step_3_desc"),
                      },
                      {
                        icon: BarChart3,
                        title: t("guide_step_4_title"),
                        desc: t("guide_step_4_desc"),
                      },
                    ].map((step, i) => (
                      <div key={i} className="flex gap-5 group">
                        <div className="w-10 h-10 shrink-0 bg-slate-100 dark:bg-white/5 rounded-xl flex items-center justify-center text-brand dark:text-brand-light border border-black/5 dark:border-white/5 group-hover:bg-brand dark:group-hover:bg-brand-light group-hover:text-white transition-all duration-500">
                          <step.icon size={18} />
                        </div>
                        <div>
                          <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1 italic">
                            {i + 1}. {step.title}
                          </h4>
                          <p className="text-[9px] text-slate-500 font-bold uppercase leading-relaxed italic">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setShowGuide(false);
                        handleAction();
                      }}
                      className="w-full py-5 bg-brand dark:bg-brand-light hover:opacity-90 text-white font-black rounded-xl text-[10px] uppercase tracking-[0.4em] transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                      <Send size={16} /> {t("guide_now_start")}
                    </button>
                    <button
                      onClick={() => setShowGuide(false)}
                      className="w-full py-4 text-slate-400 dark:text-slate-600 font-black text-[9px] uppercase tracking-widest hover:text-slate-900 dark:hover:text-slate-400 transition-colors"
                    >
                      {t("home_maybe_later")}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>

      {/* Sticky Action Bar (Moved Outside to be truly fixed at the very bottom on mobile without layout or overflow issues) */}
      <div className="fixed bottom-0 inset-x-0 p-6 z-[70] bg-gradient-to-t from-white dark:from-slate-950 via-white/95 dark:via-slate-950/95 to-transparent pb-[calc(env(safe-area-inset-bottom)+1rem)] lg:hidden bot-sticky-action-bar">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <button
            onClick={handleAction}
            disabled={isProcessing}
            className={`flex-1 h-14 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 transition-all active:scale-95 disabled:opacity-50 border-b-4 ${
              isOwned
                ? "bg-emerald-600 text-white border-emerald-800"
                : bot.price === 0
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-700 dark:border-slate-300 shadow-lg shadow-brand/20 ucretsiz-edin-btn"
                : "bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-700 dark:border-slate-300 shadow-lg shadow-brand/20"
            }`}
          >
            {isProcessing ? (
              <Loader2 className="animate-spin" />
            ) : isOwned ? (
              <>
                <Send size={18} /> {t("detail_launch")}
              </>
            ) : bot.price === 0 ? (
              <>
                <PlusCircle size={18} /> {t("detail_get_free")}
              </>
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-black italic tracking-tighter leading-none">
                    {Number(prices.ton).toFixed(1)}
                  </span>
                  <svg
                    fill="none"
                    height="14"
                    width="14"
                    viewBox="0 0 16 16"
                    xmlns="http://www.w3.org/2000/svg"
                    className="opacity-90"
                  >
                    <title>Payment TON icon</title>
                    <g clipPath="url(#a_ton_buy)" fill="currentColor">
                      <path d="M7.5 11.015V5.963H5.268a.31.31 0 0 0-.272.463l1.772 3.17.734 1.419ZM9.232 9.596l1.771-3.17a.31.31 0 0 0-.272-.463H8.498v5.053l.734-1.42Z"></path>
                      <path
                        clipRule="evenodd"
                        d="M16 8.5a8 8 0 1 1-16 0 8 8 0 0 1 16 0ZM5.268 4.965h5.464c1.004 0 1.64 1.085 1.136 1.96l-3.372 5.844a.572.572 0 0 1-.992 0L4.132 6.925c-.505-.876.132-1.96 1.136-1.96Z"
                        fill-rule="evenodd"
                      ></path>
                    </g>
                    <defs>
                      <clipPath id="a_ton_buy">
                        <path
                          d="M0 0h16v16H0z"
                          fill="#fff"
                          transform="translate(0 .5)"
                        ></path>
                      </clipPath>
                    </defs>
                  </svg>
                </div>
                <div className="flex items-center gap-2 border-l border-white/20 dark:border-slate-400/20 pl-4">
                  <span className="font-black tracking-[0.2em]">
                    {t("buy")}
                  </span>
                  <ChevronRight size={18} className="opacity-40" />
                </div>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Screenshot Lightbox (Placed at root level behind root fragment to remain perfectly centered without parent relative constraints) */}
      <AnimatePresence>
        {isLightboxOpen && bot?.screenshots && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-3xl px-4 md:px-8"
            onClick={closeLightbox}
          >
            <div className="absolute top-8 right-8 flex items-center gap-4 z-50">
              <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] hidden md:block">
                {t("detail_screenshot")} {currentImageIndex + 1} /{" "}
                {bot.screenshots.length}
              </span>
              <button
                onClick={closeLightbox}
                className="w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors"
                aria-label={t("close")}
              >
                <X size={24} />
              </button>
            </div>

            <button
              onClick={prevImage}
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all z-50 active:scale-90"
              aria-label={t("prev")}
            >
              <ChevronLeft size={32} />
            </button>

            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl h-[70vh] md:h-[80vh] flex items-center justify-center z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={bot.screenshots[currentImageIndex]}
                alt={`${t("detail_screenshot")} ${currentImageIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl mx-auto my-auto select-none"
              />
            </motion.div>

            <button
              onClick={nextImage}
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all z-50 active:scale-90"
              aria-label={t("next")}
            >
              <ChevronRight size={32} />
            </button>

            {/* Thumbnails preview for large screens */}
            <div className="absolute bottom-10 left-10 right-10 flex justify-center gap-3 overflow-x-auto no-scrollbar py-4 hidden md:flex z-50">
              {bot.screenshots.map((s, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(idx);
                  }}
                  className={`w-12 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${currentImageIndex === idx ? "border-brand scale-110" : "border-white/10 opacity-40 hover:opacity-100"}`}
                >
                  <img src={s} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onAuth={setWebAuthUser}
      />
    </>
  );
};

const ImageIcon = ({
  className,
  size,
}: {
  className?: string;
  size?: number;
}) => (
  <div className={className} style={{ width: size, height: size }}>
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full h-full"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  </div>
);

export default BotDetail;

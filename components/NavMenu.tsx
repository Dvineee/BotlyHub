import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  ChevronRight,
  LayoutGrid,
  Store,
  User,
  Bot as BotIcon,
  Megaphone,
  X,
  Sparkles,
  Sun,
  Moon,
  Menu,
  Plus,
  LogOut,
  Compass,
  ArrowLeft,
  ArrowRight,
  MessageSquare,
  Shield,
  Bell,
  ChevronDown,
  Wallet,
  Settings,
  Globe
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "../TranslationContext";
import { useTelegram } from "../hooks/useTelegram";
import { categories, appsSubCategories } from "../data";
import { Logo } from "./Logo";
import LoginModal from "./LoginModal";
import { ConfirmModal } from "./ConfirmModal";
import { FilterMenu } from "./FilterMenu";

interface MenuItem {
  id: string;
  label: string;
  desc: string;
  icon: any;
  action?: () => void;
  path?: string;
}

interface NavMenuProps {
  isScrolled?: boolean;
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
  setIsSearchModalOpen?: (v: boolean) => void;
  
  // Optional for backward compatibility/flexibility across pages
  openMenu?: "kesfet" | null;
  setOpenMenu?: (v: "kesfet" | null) => void;
  navState?: "main" | "bots" | "apps";
  setNavState?: (v: "main" | "bots" | "apps") => void;
  mobileModal?: "kesfet" | null;
  setMobileModal?: (v: "kesfet" | null) => void;
  setSearchMode?: (mode: "bots" | "apps") => void;
  setActiveCategory?: (cat: string) => void;
}

export const NavMenu: React.FC<NavMenuProps> = ({
  isScrolled: propIsScrolled,
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
  openMenu,
  setOpenMenu,
  navState,
  setNavState,
  mobileModal,
  setMobileModal,
  setSearchMode,
  setActiveCategory,
  setIsSearchModalOpen,
}) => {
  const { t, language, setLanguage } = useTranslation();
  const [mobileMenuPanel, setMobileMenuPanel] = useState<"main" | "categories" | "bots" | "apps">("main");
  const navigate = useNavigate();
  const internalMenuRef = useRef<HTMLDivElement>(null);

  const [isScrolled, setIsScrolled] = useState(propIsScrolled !== undefined ? propIsScrolled : true);
  const [isConfirmLogoutOpen, setIsConfirmLogoutOpen] = useState(false);

  // Fallback local states if props are not provided
  const [localOpenMenu, localSetOpenMenu] = useState<"kesfet" | null>(null);
  const [localNavState, localSetNavState] = useState<"main" | "bots" | "apps">("main");
  const [localMobileModal, localSetMobileModal] = useState<"kesfet" | null>(null);

  const openMenuState = openMenu !== undefined ? openMenu : localOpenMenu;
  const setOpenMenuState = setOpenMenu !== undefined ? setOpenMenu : localSetOpenMenu;

  const navStateValue = navState !== undefined ? navState : localNavState;
  const setNavStateValue = setNavState !== undefined ? setNavState : localSetNavState;

  const mobileModalState = mobileModal !== undefined ? mobileModal : localMobileModal;
  const setMobileModalState = setMobileModal !== undefined ? setMobileModal : localSetMobileModal;

  const toggleLanguage = () => {
    haptic("light");
    setLanguage(language === "tr" ? "en" : "tr");
  };

  useEffect(() => {
    if (propIsScrolled === undefined) {
      const handleScroll = () => {
        const isHome = window.location.pathname === "/" || window.location.hash === "#/" || window.location.hash === "";
        if (isHome) {
          setIsScrolled(window.scrollY > 20);
        } else {
          setIsScrolled(true);
        }
      };
      const isHome = window.location.pathname === "/" || window.location.hash === "#/" || window.location.hash === "";
      setIsScrolled(!isHome || window.scrollY > 20);
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    } else {
      setIsScrolled(propIsScrolled);
    }
  }, [propIsScrolled]);

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
        setOpenMenuState(null);
        setNavStateValue("main");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setOpenMenuState, setNavStateValue]);

  const botsCategories = categories.filter(
    (c) => c.id !== "apps" && c.id !== "all",
  );
  const appsCategories = appsSubCategories;

  const handleCategoryClick = (catId: string, mode: "bots" | "apps") => {
    haptic("light");
    if (setSearchMode) setSearchMode(mode);
    if (setActiveCategory) setActiveCategory(catId);
    navigate(`/search?mode=${mode}&category=${catId}`);
    setOpenMenuState(null);
    setMobileModalState(null);
    setNavStateValue("main");
  };

  const discoverItems: MenuItem[] = [
    {
      id: "bots",
      label: t("cat_bots") || "Botlar",
      desc: t("bots_market_desc") || "Telegram Bot Marketi",
      icon: BotIcon,
      path: "/search?mode=bots",
    },
    {
      id: "apps",
      label: t("apps") || "Uygulamalar",
      desc: t("apps_market_desc") || "Web3 & TMA Uygulamaları",
      icon: LayoutGrid,
      path: "/search?mode=apps",
    },
    {
      id: "channels",
      label: t("channels") || "Kanallar",
      desc: t("channels_market_desc") || "Popüler Telegram Kanalları",
      icon: Megaphone,
      path: "/channels",
    },
    {
      id: "qa",
      label: t("qa_forum") || "QA Forum",
      desc: t("qa_desc") || "Soru & Cevap Hub'ı",
      icon: MessageSquare,
      path: "/qa",
    },
  ];

  const renderMegaMenuContent = () => {
    if (openMenuState === "kesfet") {
      return (
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-12 gap-8 py-8 font-sans">
          {/* Left Column (Promotion Panel) */}
          <div className="col-span-4 bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/[0.04] rounded-2xl p-5 flex flex-col justify-between select-none">
            {/* Top section */}
            <div className="flex flex-col gap-3.5">
              <h4 className="text-[13px] font-bold text-slate-800 dark:text-slate-200 leading-snug">
                {t("mega_promo_title") || "Kanalınız İçin En Uygun Araçlar"}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                {t("mega_promo_desc") || "Onlarca kategoride, topluluğunuz için bot ve uygulama listeleri."}
              </p>

              {/* Dynamic Styled Icon Badges - Professional & Non-colorful Mono version */}
              <div className="flex items-center gap-1.5 py-1">
                <div className="flex -space-x-2.5 overflow-hidden">
                  <div className="inline-block w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-slate-900 flex items-center justify-center shrink-0">
                    <Shield size={13} className="text-slate-600 dark:text-slate-400" />
                  </div>
                  <div className="inline-block w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-slate-900 flex items-center justify-center shrink-0">
                    <BotIcon size={13} className="text-slate-600 dark:text-slate-400" />
                  </div>
                  <div className="inline-block w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-slate-900 flex items-center justify-center shrink-0">
                    <LayoutGrid size={13} className="text-slate-600 dark:text-slate-400" />
                  </div>
                  <div className="inline-block w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-slate-900 flex items-center justify-center shrink-0">
                    <Compass size={13} className="text-slate-600 dark:text-slate-400" />
                  </div>
                </div>
                <span className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold uppercase tracking-wider ml-1">
                  +50 Kategori
                </span>
              </div>

              {/* Try now button */}
              <button
                onClick={() => {
                  haptic("light");
                  navigate("/search");
                  setOpenMenuState(null);
                }}
                className="group/btn text-[12px] font-extrabold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white flex items-center gap-1.5 mt-0.5 cursor-pointer transition-colors self-start"
              >
                {t("mega_try_now") || "Şimdi dene"}{" "}
                <ArrowRight size={13} className="shrink-0 transition-transform group-hover/btn:translate-x-0.5" />
              </button>
            </div>
          </div>

          {/* Middle Column (Categories etc.) */}
          <div className="col-span-5 border-l border-black/5 dark:border-white/5 pl-8">
            <AnimatePresence mode="wait">
              {navStateValue === "main" ? (
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
                          setNavStateValue("bots");
                        } else if (item.id === "apps") {
                          haptic("light");
                          setNavStateValue("apps");
                        } else if (item.path) {
                          haptic("light");
                          navigate(item.path);
                          setOpenMenuState(null);
                        }
                      }}
                      className="flex items-center gap-4 p-4 hover:bg-black/[0.02] dark:hover:bg-white/5 rounded-2xl transition-all group border border-transparent hover:border-black/5 dark:hover:border-white/10 text-left w-full cursor-pointer"
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
              ) : navStateValue === "bots" ? (
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
                        onClick={() => setNavStateValue("main")}
                        className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-slate-500 transition-colors"
                      >
                        <ArrowLeft size={20} />
                      </button>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                        {t("bot_categories") || "Bot Kategorileri"}
                      </h3>
                    </div>
                    <button
                      onClick={() => handleCategoryClick("all", "bots")}
                      className="text-xs font-black uppercase tracking-widest text-blue-550 hover:text-blue-600 dark:text-blue-400 cursor-pointer px-3 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all duration-150"
                    >
                      {t("view_all") || "Tümünü Gör"}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {botsCategories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryClick(cat.id, "bots")}
                        className="flex items-center gap-3 p-3 hover:bg-black/[0.02] dark:hover:bg-white/5 rounded-xl transition-all group text-left border border-transparent hover:border-black/5 dark:hover:border-white/10 w-full cursor-pointer"
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
                        onClick={() => setNavStateValue("main")}
                        className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-slate-500 transition-colors"
                      >
                        <ArrowLeft size={20} />
                      </button>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                        {t("app_categories") || "Uygulama Kategorileri"}
                      </h3>
                    </div>
                    <button
                      onClick={() => handleCategoryClick("all", "apps")}
                      className="text-xs font-black uppercase tracking-widest text-blue-550 hover:text-blue-600 dark:text-blue-400 cursor-pointer px-3 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all duration-150"
                    >
                      {t("view_all") || "Tümünü Gör"}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {appsCategories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryClick(cat.id, "apps")}
                        className="flex items-center gap-3 p-3 hover:bg-black/[0.02] dark:hover:bg-white/5 rounded-xl transition-all group text-left border border-transparent hover:border-black/5 dark:hover:border-white/10 w-full cursor-pointer"
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

          {/* Right Column (Featured Hub) */}
          <div className="col-span-3 border-l border-black/5 dark:border-white/5 pl-8 flex flex-col justify-center gap-3 mega-menu-right-links">
            {/* Reklam Link */}
            <button
              onClick={() => {
                haptic("light");
                navigate("/premium");
                setOpenMenuState(null);
              }}
              className="group/link flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent hover:border-black/5 dark:hover:border-white/10 transition-all text-left w-full cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Sparkles size={15} className="text-slate-500 dark:text-slate-400 transition-colors group-hover/link:text-slate-850 dark:group-hover/link:text-white" />
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 transition-colors group-hover/link:text-slate-950 dark:group-hover/link:text-white">
                    {t("mega_ad") || "Reklam"}
                  </span>
                  <span className="text-[10.5px] text-slate-450 dark:text-slate-450">
                    {t("mega_ad_desc") || "Botlyhub ile öne çıkın"}
                  </span>
                </div>
              </div>
              <ArrowRight size={14} className="opacity-0 -translate-x-1 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all text-slate-400 dark:text-slate-500" />
            </button>

            {/* Blog Link */}
            <button
              onClick={() => {
                haptic("light");
                navigate("/blog");
                setOpenMenuState(null);
              }}
              className="group/link flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent hover:border-black/5 dark:hover:border-white/10 transition-all text-left w-full cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Compass size={15} className="text-slate-500 dark:text-slate-400 transition-colors group-hover/link:text-slate-850 dark:group-hover/link:text-white" />
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 transition-colors group-hover/link:text-slate-950 dark:group-hover/link:text-white">
                    {t("mega_blog") || "Blog & Rehberler"}
                  </span>
                  <span className="text-[10.5px] text-slate-450 dark:text-slate-450">
                    {t("mega_blog_desc") || "En son ipuçları & rehberler"}
                  </span>
                </div>
              </div>
              <ArrowRight size={14} className="opacity-0 -translate-x-1 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all text-slate-400 dark:text-slate-500" />
            </button>

            {/* Advanced Search Link */}
            <button
              onClick={() => {
                haptic("light");
                navigate("/search");
                setOpenMenuState(null);
              }}
              className="group/link flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent hover:border-black/5 dark:hover:border-white/10 transition-all text-left w-full cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Search size={15} className="text-slate-500 dark:text-slate-400 transition-colors group-hover/link:text-slate-850 dark:group-hover/link:text-white" />
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 transition-colors group-hover/link:text-slate-950 dark:group-hover/link:text-white">
                    {t("mega_advanced_search") || "Gelişmiş Arama"}
                  </span>
                  <span className="text-[10.5px] text-slate-450 dark:text-slate-450">
                    {t("mega_advanced_search_desc") || "Filtrelerle nokta atışı arama"}
                  </span>
                </div>
              </div>
              <ArrowRight size={14} className="opacity-0 -translate-x-1 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all text-slate-400 dark:text-slate-500" />
            </button>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <div
        className="relative md:sticky md:top-0 z-[120] min-h-[56px] md:min-h-[64px] md:h-[72px] py-2 md:py-0 flex items-center bg-white dark:bg-slate-950 transition-all border-b border-black/[0.04] dark:border-white/[0.04]"
        ref={internalMenuRef}
        onMouseLeave={() => {
          setOpenMenuState(null);
          setNavStateValue("main");
        }}
      >
        {/* Top Section */}
        <div className="w-full relative z-[120]">
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <div className="flex items-center justify-between px-1 md:gap-x-6">
              {/* Left Section (Logo) - ALWAYS visible on desktop and mobile */}
              <div className="flex items-center order-1 md:w-36 lg:w-48 shrink-0">
                <Logo
                  onClick={() => navigate("/")}
                  className="cursor-pointer"
                />
              </div>

              {/* Center Section (Navigation & Search) */}
              <div className="hidden md:flex md:flex-1 md:max-w-4xl order-3 md:order-2 items-center gap-4 lg:gap-8 font-sans justify-center">
                {/* Search Trigger */}
                <div className="hidden md:block md:flex-1 md:max-w-[280px] lg:max-w-[320px] relative z-[130]">
                  <div
                    onClick={() => {
                      haptic("light");
                      if (setIsSearchModalOpen) {
                        setIsSearchModalOpen(true);
                      } else {
                        navigate("/search");
                      }
                    }}
                    className="relative flex items-center group transition-all h-[42px] px-3 premium-search-container cursor-pointer select-none active:scale-[0.99]"
                  >
                    <Search
                      size={15}
                      className="text-slate-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors shrink-0 mr-2"
                    />
                    <div className="flex-1 text-[13.5px] text-slate-400 dark:text-slate-500 font-semibold tracking-wide truncate">
                      Herşeyi ara...
                    </div>

                    {/* Vertical Divider */}
                    <div className="w-px h-5 bg-black/[0.08] dark:bg-white/[0.08] mx-1 shrink-0" />

                    {/* Filter Menu */}
                    <div className="shrink-0 relative z-[140] pointer-events-none opacity-80">
                      <FilterMenu />
                    </div>
                  </div>
                </div>

                {/* Nav Links */}
                <div className="hidden md:flex items-center gap-5 lg:gap-8 shrink-0">
                  <button
                    onClick={() => {
                      haptic("light");
                      navigate("/");
                    }}
                    className="nav-menu-item text-slate-800 dark:text-white hover:opacity-80 flex items-center gap-1 transition-all font-semibold text-[14px] select-none tracking-tight py-2 border-b-2 border-transparent"
                  >
                    <span>{t("nav_explore")}</span>
                  </button>

                  <button
                    onMouseEnter={() => {
                      if (window.innerWidth >= 768) setOpenMenuState("kesfet");
                    }}
                    onClick={() => {
                      haptic("light");
                      setOpenMenuState(openMenuState === "kesfet" ? null : "kesfet");
                    }}
                    className={`nav-menu-item text-slate-800 dark:text-white hover:opacity-80 flex items-center gap-1 transition-all font-semibold text-[14px] select-none tracking-tight py-2 border-b-2 ${openMenuState === "kesfet" ? "border-blue-500" : "border-transparent"}`}
                  >
                    <span>Kategoriler</span>
                    <ChevronDown
                      size={14}
                      className={`text-slate-400 transition-transform duration-300 ${openMenuState === "kesfet" ? "rotate-180" : ""}`}
                    />
                  </button>
                </div>
              </div>

              {/* Right Section (Profile & Settings Trigger) */}
              <div className="flex items-center gap-2 md:gap-3 order-2 md:order-3 md:w-48 justify-end ml-auto shrink-0 font-sans">
                {user && (
                  <button
                    onClick={() => {
                      haptic("medium");
                      navigate("/earnings");
                    }}
                    className="hidden sm:flex w-10 h-10 items-center justify-center text-slate-900 dark:text-white bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl active:scale-95 transition-all outline-none"
                  >
                    <Wallet size={18} />
                  </button>
                )}

                {!user && (
                  <button
                    onClick={() => {
                      haptic("light");
                      setIsLoginModalOpen(true);
                    }}
                    className="px-5 h-10 bg-blue-500 hover:bg-blue-600 text-white text-[13px] font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center whitespace-nowrap shadow-lg shadow-blue-500/25"
                  >
                    {t("login")}
                  </button>
                )}

                <div className="relative font-sans" ref={parentMenuRef}>
                  <button
                    onClick={() => {
                      haptic("light");
                      setIsMenuOpen(!isMenuOpen);
                    }}
                    className={`h-10 px-3 flex items-center gap-2 border border-black/5 dark:border-white/5 text-slate-900 dark:text-white rounded-xl active:scale-95 transition-all relative ${isMenuOpen ? "bg-slate-100 dark:bg-white/10" : "bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10"}`}
                  >
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
                    <div className="hidden md:flex items-center gap-1.5">
                      {user ? (
                        <>
                          <span className="text-[11px] font-black uppercase tracking-wide">
                            {user.username ||
                              user.first_name ||
                              user.name ||
                              ""}
                          </span>
                          <ChevronDown
                            size={12}
                            className={`text-slate-400 dark:text-slate-500 transition-transform duration-200 ${isMenuOpen ? "rotate-180" : ""}`}
                          />
                        </>
                      ) : (
                        <Settings
                          size={18}
                          className="text-slate-700 dark:text-slate-300"
                        />
                      )}
                    </div>
                    {user && unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-600 rounded-full border-2 border-slate-50 dark:border-slate-950 text-[8px] font-black text-white flex items-center justify-center px-1">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </div>
                    )}
                  </button>
                  {isMenuOpen && (
                    <div className="absolute right-0 top-full mt-4 w-72 sm:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl shadow-2xl p-3 z-[150] animate-in fade-in slide-in-from-right-3 duration-200">
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
                                  {t("nav_explore")}
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
                                    {t("categories") || "Kategoriler"}
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
                                  {t("add_your") || "Botunu Ekle"}
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
                                <span>{t("cancel") || "Geri"}</span>
                              </button>

                              {/* Mega Menu Options */}
                              <div className="space-y-2">
                                {discoverItems.map((item) => (
                                  <button
                                    key={item.id}
                                    onClick={() => {
                                      haptic("light");
                                      if (item.path) {
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
                                      <span className="text-[10px] text-slate-450 truncate">
                                        {item.desc}
                                      </span>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Desktop View */}
                        <div className="hidden md:block">
                          {user ? (
                            <>
                              <div className="px-3 py-2 flex items-center gap-3">
                                <img
                                  src={
                                    user.photo_url ||
                                    user.avatar ||
                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name || user.name || "Kenan")}&background=0f172a&color=fff`
                                  }
                                  className="w-10 h-10 rounded-full border border-black/5 dark:border-white/10"
                                  alt=""
                                />
                                <div className="flex flex-col min-w-0">
                                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                                    {user.first_name || user.name || "Kenan"}
                                  </span>
                                  <span className="text-[10px] text-slate-450 truncate">
                                    {user.username ? `@${user.username}` : ""}
                                  </span>
                                </div>
                              </div>

                              <div className="h-px bg-slate-100 dark:border-white/5 my-2" />

                              <button
                                onClick={() => {
                                  haptic("light");
                                  navigate("/earnings");
                                  setIsMenuOpen(false);
                                }}
                                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all group text-left"
                              >
                                <Wallet
                                  size={18}
                                  className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors"
                                />
                                <span className="text-xs font-bold uppercase tracking-tight">
                                  {t("earnings_title") || "Cüzdanım"}
                                </span>
                              </button>

                              <button
                                onClick={() => {
                                  haptic("light");
                                  navigate(user && user.id && user.id !== "guest_user" ? "/my-bots" : "/");
                                  setIsMenuOpen(false);
                                }}
                                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all group text-left"
                              >
                                <BotIcon
                                  size={18}
                                  className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors"
                                />
                                <span className="text-xs font-bold uppercase tracking-tight">
                                  {t("my_bots") || "Botlarım"}
                                </span>
                              </button>

                              <button
                                onClick={() => {
                                  haptic("light");
                                  toggleTheme();
                                }}
                                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all group text-left"
                              >
                                {theme === "dark" ? (
                                  <>
                                    <Sun
                                      size={18}
                                      className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors"
                                    />
                                    <span className="text-xs font-bold uppercase tracking-tight">
                                      {t("light_mode") || "Gündüz Modu"}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <Moon
                                      size={18}
                                      className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors"
                                    />
                                    <span className="text-xs font-bold uppercase tracking-tight">
                                      {t("dark_mode") || "Gece Modu"}
                                    </span>
                                  </>
                                )}
                              </button>

                              <button
                                onClick={() => {
                                  haptic("light");
                                  navigate("/settings");
                                  setIsMenuOpen(false);
                                }}
                                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all group text-left"
                              >
                                <Plus
                                  size={18}
                                  className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors"
                                />
                                <span className="text-xs font-bold uppercase tracking-tight">
                                  {t("add_your")}
                                </span>
                              </button>

                              <div className="h-px bg-slate-100 dark:border-white/5 my-2" />

                              <button
                                onClick={() => {
                                  haptic("medium");
                                  setIsConfirmLogoutOpen(true);
                                }}
                                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 transition-all font-bold text-xs uppercase text-left cursor-pointer"
                              >
                                <LogOut size={18} />
                                <span className="text-xs font-bold uppercase tracking-tight">
                                  {t("home_logout")}
                                </span>
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  haptic("light");
                                  toggleTheme();
                                }}
                                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all group text-left"
                              >
                                {theme === "dark" ? (
                                  <>
                                    <Sun
                                      size={18}
                                      className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors"
                                    />
                                    <span className="text-xs font-bold uppercase tracking-tight">
                                      {t("light_mode") || "Gündüz Modu"}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <Moon
                                      size={18}
                                      className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors"
                                    />
                                    <span className="text-xs font-bold uppercase tracking-tight">
                                      {t("dark_mode") || "Gece Modu"}
                                    </span>
                                  </>
                                )}
                              </button>

                              <button
                                onClick={() => {
                                  haptic("light");
                                  navigate("/settings");
                                  setIsMenuOpen(false);
                                }}
                                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all group text-left"
                              >
                                <Plus
                                  size={18}
                                  className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors"
                                />
                                <span className="text-xs font-bold uppercase tracking-tight">
                                  {t("add_your")}
                                </span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

            </div>
          </div>
        </div>
      </div>

        {/* Desktop Mega Menu Dropdown */}
        <AnimatePresence>
          {openMenuState && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="hidden md:block absolute left-0 right-0 top-full bg-white dark:bg-slate-900 border-b border-black/5 dark:border-white/10 shadow-2xl z-[100] mega-menu-container"
              onMouseLeave={() => {
                setOpenMenuState(null);
                setNavStateValue("main");
              }}
            >
              {renderMegaMenuContent()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Modal for Categories */}
      <AnimatePresence>
        {mobileModalState && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-0 bg-white dark:bg-slate-950 z-[999] flex flex-col font-sans"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-white/5 shrink-0">
              <Logo className="h-6" />
              <button
                onClick={() => {
                  haptic("light");
                  setMobileModalState(null);
                  setNavStateValue("main");
                }}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto py-8 flex flex-col justify-between">
              <AnimatePresence mode="wait">
                {navStateValue === "main" ? (
                  <motion.div
                    key="mobile-main-links"
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    className="flex flex-col gap-6 px-8"
                  >
                    <button
                      onClick={() => {
                        haptic("light");
                        setNavStateValue("bots");
                      }}
                      className="text-left text-3xl sm:text-4xl font-[900] tracking-tight text-slate-900 dark:text-white hover:text-blue-500 transition-colors uppercase flex items-center justify-between leading-none"
                    >
                      <span>{t("cat_bots") || "Botlar"}</span>
                      <ChevronRight size={22} className="text-slate-300 dark:text-slate-700" />
                    </button>

                    <button
                      onClick={() => {
                        haptic("light");
                        setNavStateValue("apps");
                      }}
                      className="text-left text-3xl sm:text-4xl font-[900] tracking-tight text-slate-900 dark:text-white hover:text-emerald-500 transition-colors uppercase flex items-center justify-between leading-none"
                    >
                      <span>{t("apps") || "Uygulamalar"}</span>
                      <ChevronRight size={22} className="text-slate-300 dark:text-slate-700" />
                    </button>

                    <button
                      onClick={() => {
                        haptic("light");
                        navigate("/qa");
                        setMobileModalState(null);
                      }}
                      className="text-left text-3xl sm:text-4xl font-[900] tracking-tight text-slate-900 dark:text-white hover:text-blue-500 transition-colors uppercase leading-none"
                    >
                      {t("qa_forum") || "Soru & Cevap"}
                    </button>

                    <button
                      onClick={() => {
                        haptic("light");
                        navigate("/blog");
                        setMobileModalState(null);
                      }}
                      className="text-left text-3xl sm:text-4xl font-[900] tracking-tight text-slate-900 dark:text-white hover:text-blue-500 transition-colors uppercase flex items-center gap-3 leading-none"
                    >
                      <span>{t("blog") || "Günlük"}</span>
                      <span className="text-[10px] font-black tracking-widest bg-blue-500 text-white px-2 py-0.5 rounded-md uppercase leading-none animate-pulse">
                        NEW
                      </span>
                    </button>

                    {/* Visually refined add-app action button */}
                    <button
                      onClick={() => {
                        haptic("light");
                        navigate("/settings");
                        setMobileModalState(null);
                      }}
                      className="text-left text-xl sm:text-2xl font-[800] tracking-tight text-blue-550 dark:text-blue-400 hover:text-blue-600 transition-colors uppercase leading-none mt-4 flex items-center gap-2"
                    >
                      <Plus size={20} strokeWidth={3} />
                      <span>{t("add_app") || "Uygulama Ekle"}</span>
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="mobile-categories"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 15 }}
                    className="flex flex-col w-full h-full px-6"
                  >
                    <div className="flex items-center justify-between mb-6 px-1">
                      <button
                        onClick={() => setNavStateValue("main")}
                        className="flex items-center gap-2 text-blue-500 dark:text-blue-400 font-[900] uppercase tracking-widest text-xs"
                      >
                        <ArrowLeft size={16} strokeWidth={3} /> {t("cancel") || "Geri"}
                      </button>
                      <button
                        onClick={() => handleCategoryClick("all", navStateValue === "bots" ? "bots" : "apps")}
                        className="text-xs font-[900] uppercase tracking-widest text-blue-550 dark:text-blue-400"
                      >
                        {t("view_all") || "Tümünü Gör"}
                      </button>
                    </div>

                    <h3 className="text-base font-[900] uppercase tracking-tight text-slate-900 dark:text-white mb-4 px-1">
                      {navStateValue === "bots" ? (t("bot_categories") || "Bot Kategorileri") : (t("app_categories") || "Uygulama Kategorileri")}
                    </h3>

                    <div className="grid grid-cols-4 gap-2 pr-1 max-h-[58vh] overflow-y-auto">
                      {(navStateValue === "bots"
                        ? botsCategories
                        : appsCategories
                      ).map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => handleCategoryClick(cat.id, navStateValue)}
                          className="flex flex-col items-center justify-center gap-2 p-2 px-1 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 active:scale-[0.97] transition-all rounded-xl border border-black/5 dark:border-white/5 text-center group"
                        >
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${navStateValue === "bots" ? "text-blue-500 bg-blue-500/10" : "text-emerald-500 bg-emerald-500/10"}`}
                          >
                            <cat.icon size={15} />
                          </div>
                          <span className="text-[10px] font-[900] uppercase tracking-tight text-slate-800 dark:text-slate-200 leading-tight block text-center truncate-1 w-full whitespace-normal">
                            {t(cat.label)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Menu Footer Row */}
              <div className="border-t border-slate-100 dark:border-white/5 px-8 pt-6 flex items-center gap-3 shrink-0">
                {/* Language Selector Pill */}
                <button
                  onClick={toggleLanguage}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-50 dark:bg-white/5 border border-black/[0.04] dark:border-white/[0.04] text-xs font-bold text-slate-700 dark:text-slate-300 transition-all active:scale-95"
                >
                  <Globe size={15} />
                  <span>{language.toUpperCase()}</span>
                </button>

                {/* Theme Toggle Pill */}
                <button
                  onClick={() => {
                    haptic("light");
                    toggleTheme();
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-50 dark:bg-white/5 border border-black/[0.04] dark:border-white/[0.04] text-xs font-bold text-slate-700 dark:text-slate-300 transition-all active:scale-95"
                >
                  {theme === "dark" ? (
                    <>
                      <Moon size={15} className="text-blue-400" />
                      <span>{t("dark_mode") || "Gece Modu"}</span>
                    </>
                  ) : (
                    <>
                      <Sun size={15} className="text-amber-500" />
                      <span>{t("light_mode") || "Gündüz Modu"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Logout Custom Modal */}
      <ConfirmModal
        isOpen={isConfirmLogoutOpen}
        onClose={() => setIsConfirmLogoutOpen(false)}
        onConfirm={() => {
          haptic("medium");
          setWebAuthUser(null);
          setIsMenuOpen(false);
        }}
        title={t("home_logout") || "Çıkış Yap"}
        message={t("confirm_logout_msg") || "Çıkış yapmak istediğinize emin misiniz?"}
      />
    </>
  );
};

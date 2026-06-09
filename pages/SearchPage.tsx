import React, { useState, useEffect, useRef } from "react";
import {
  Search as SearchIcon,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  X,
  Zap,
  Loader2,
  Sparkles,
  Send,
  Bot as BotIcon,
  Star,
  Sun,
  Moon,
  Wallet,
  Menu,
  Store,
  User,
  Bell,
  Megaphone,
  LayoutGrid,
  Share2,
  ExternalLink,
  BarChart3,
  Coins,
  Briefcase,
  Compass,
  ArrowLeft,
  Plus,
  LogOut,
  MessageSquare,
  Globe,
} from "lucide-react";
import { Bot, Notification, User as UserType } from "../types";
import { categories, appsSubCategories } from "../data";
import { useTranslation } from "../TranslationContext";
import { DatabaseService } from "../services/DatabaseService";
import PriceService from "../services/PriceService";
import { useTelegram } from "../hooks/useTelegram";
import { GeminiService } from "../services/GeminiService";
import { motion, AnimatePresence } from "motion/react";
import { useDraggableScroll } from "../hooks/useDraggableScroll";
import { useFilter } from "../FilterContext";
import { FilterMenu } from "../components/FilterMenu";
import { useTheme } from "../ThemeContext";
import LoginModal from "../components/LoginModal";
import Logo from "../components/Logo";
import { Skeleton, LazyImage } from "../components/Preload";

import { useNavigate, useSearchParams } from "react-router-dom";
import { SEO } from "../components/SEO";

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
    `https://ui-avatars.com/api/?name=${encodeURIComponent(bot.name)}&background=random&color=fff`
  );
};

const getLangLabel = (lang: string) => {
  const mapping: Record<string, string> = {
    "🇹🇷": "TR",
    "🇬🇧": "EN",
    "🇺🇸": "EN",
    "🇷🇺": "RU",
    "🇮🇷": "FA",
    "🇺🇦": "UA",
    "🇪🇸": "ES",
    "🇮🇳": "HI",
    "🇸🇦": "AR",
    "🇫🇷": "FR",
    "🇩🇪": "DE",
  };
  return mapping[lang] || lang;
};

const BotCard: React.FC<{ bot: Bot; tonRate: number }> = ({ bot, tonRate }) => {
  const navigate = useNavigate();
  const prices = PriceService.convert(bot.price, tonRate);
  const { t } = useTranslation();

  const firstCatId = bot.category?.[0];
  const catLabelObj =
    categories.find((c) => c.id === firstCatId) ||
    appsSubCategories.find((c) => c.id === firstCatId);
  const catLabel = catLabelObj
    ? t(catLabelObj.label)
    : firstCatId
      ? t(`cat_${firstCatId}`) === `cat_${firstCatId}`
        ? firstCatId
        : t(`cat_${firstCatId}`)
      : "";

  const formattedUserCount = React.useMemo(() => {
    if (!bot.user_count) return null;
    if (bot.user_count >= 1000000) {
      return (bot.user_count / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    }
    if (bot.user_count >= 1000) {
      return (bot.user_count / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    }
    return bot.user_count.toString();
  }, [bot.user_count]);

  const haptic = (vibe: "light" | "medium") => {
    try {
      if (vibe === "light") window.navigator.vibrate?.(10);
      else window.navigator.vibrate?.(20);
    } catch {}
  };

  return (
    <div
      onClick={() => navigate(`/bot/${bot.slug}`)}
      className="flex flex-col p-5 bg-white dark:bg-[#0F1623] border border-black/[0.06] dark:border-white/[0.06] rounded-[16px] transition-all duration-[180ms] ease-out hover:border-black/[0.12] dark:hover:border-white/[0.12] shadow-none hover:shadow-none active:scale-[0.98] transform-gpu cursor-pointer select-none group w-full relative min-h-[175px]"
    >
      {/* Top: bot identity (avatar + name) + category badge inline */}
      <div className="flex items-start justify-between gap-3 w-full mb-3.5 min-w-0">
        <div className="flex items-center gap-3 min-w-0">
          <LazyImage
            src={getLiveBotIcon(bot)}
            alt={bot.name}
            className="w-10 h-10 rounded-xl object-cover border border-black/[0.04] dark:border-white/[0.06] shrink-0"
            containerClass="w-10 h-10 rounded-xl shrink-0"
            skeletonClass="rounded-xl"
            onError={(e) => {
              (e.target as any).src =
                `https://ui-avatars.com/api/?name=${encodeURIComponent(bot.name)}&background=334155&color=fff&bold=true`;
            }}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <h3 className="font-bold text-[15px] text-slate-900 dark:text-slate-50 truncate tracking-tight leading-none group-hover:text-blue-500 transition-colors">
                {bot.name}
              </h3>
              {bot.is_official && (
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="text-[#139fec] shrink-0"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M7.408 1.2375C7.57933 1.11017 7.78667 1.0415 8 1.0415C8.21333 1.0415 8.42067 1.11017 8.592 1.23749L9.81067 2.14417C9.83467 2.16217 9.86133 2.1755 9.88933 2.18484C9.91733 2.19417 9.94733 2.19884 9.97733 2.19817L11.496 2.18084C11.7093 2.17817 11.918 2.24484 12.09 2.37017C12.2627 2.4955 12.39 2.6735 12.454 2.87684L12.9073 4.32617C12.916 4.35484 12.93 4.3815 12.9473 4.4055C12.9647 4.4295 12.986 4.45084 13.0107 4.46817L14.2493 5.34684C14.4233 5.47017 14.5527 5.64617 14.6187 5.8495C14.6847 6.05217 14.6833 6.27084 14.6153 6.4735L14.13 7.91284C14.1207 7.94084 14.1153 7.97084 14.1153 8.00017C14.1153 8.0295 14.12 8.0595 14.13 8.0875L14.6153 9.52684C14.6833 9.72884 14.6847 9.9475 14.6187 10.1508C14.5527 10.3535 14.4233 10.5302 14.2493 10.6535L13.0107 11.5322C12.9867 11.5495 12.9653 11.5702 12.9473 11.5948C12.93 11.6188 12.9167 11.6455 12.9073 11.6742L12.454 13.1235C12.3907 13.3268 12.2627 13.5048 12.09 13.6302C11.9173 13.7555 11.7093 13.8222 11.496 13.8195L9.97733 13.8022C9.94733 13.8015 9.918 13.8062 9.88933 13.8155C9.86133 13.8248 9.83467 13.8382 9.81067 13.8562L8.592 14.7628C8.42067 14.8902 8.21333 14.9588 8 14.9588C7.78667 14.9588 7.57933 14.8902 7.408 14.7628L6.18933 13.8562C6.16533 13.8382 6.13867 13.8248 6.11067 13.8155C6.08267 13.8062 6.05267 13.8015 6.02267 13.8022L4.504 13.8195C4.29067 13.8222 4.082 13.7555 3.91 13.6302C3.73733 13.5048 3.61 13.3268 3.546 13.1235L3.09267 11.6742C3.084 11.6455 3.07 11.6188 3.05267 11.5948C3.03533 11.5708 3.014 11.5495 2.98933 11.5322L1.75067 10.6535C1.57667 10.5302 1.44733 10.3542 1.38133 10.1508C1.31533 9.94817 1.31667 9.7295 1.38467 9.52684L1.87 8.00017C1.88067 8.0595 1.88533 8.03017 1.88533 8.00017C1.88533 7.97017 1.88067 7.94084 1.87067 7.91284L1.38533 6.4735C1.31733 6.2715 1.316 6.05284 1.382 5.8495C1.448 5.64684 1.57733 5.47084 1.75133 5.3475L1.75133 5.3475L2.99 4.46884C3.014 4.45084 3.03533 4.43017 3.05333 4.40617C3.07067 4.38217 3.084 4.3555 3.09333 4.32684L3.54667 2.8775C3.61 2.67417 3.738 2.49617 3.91067 2.37084C4.08333 2.2455 4.29133 2.17884 4.50467 2.1815L6.02333 2.19884C6.05333 2.1995 6.08266 2.19484 6.11133 2.1855C6.13933 2.17617 6.166 2.16284 6.19 2.14484L7.408 1.2375Z"
                    fill="currentColor"
                  ></path>
                </svg>
              )}
            </div>
          </div>
        </div>
        {catLabel && (
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-white/[0.04] px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 transition-opacity">
            {catLabel}
          </span>
        )}
      </div>

      {/* Middle: 1 line "personality text" -> Handles Telegram automation in seconds */}
      <div className="mb-4 flex-1 min-h-[22px]">
        <p className="text-[13px] sm:text-[13.5px] text-slate-500 dark:text-slate-400 font-normal leading-normal line-clamp-1 truncate">
          {bot.description.startsWith("bot_")
            ? t(bot.description)
            : bot.description}
        </p>
      </div>

      {/* Bottom: usage signal (not stats noise) & primary CTA */}
      <div className="mt-auto pt-3 border-t border-black/[0.03] dark:border-white/[0.03] flex items-center justify-between gap-3">
        {/* Usage signal */}
        <div className="flex items-center gap-1.5 text-[12px] text-slate-400 dark:text-slate-500 font-bold">
          <span className="text-slate-700 dark:text-slate-400">
            {formattedUserCount || bot.views || "1.1k"}
          </span>
          <span>{t("users") || "users"}</span>
        </div>

        {/* CTA Button */}
        <button
          className="px-4 py-1.5 bg-blue-500/10 hover:bg-blue-500 text-blue-600 hover:text-white dark:bg-blue-500/15 dark:text-blue-400 dark:hover:bg-blue-500 dark:hover:text-white rounded-lg transition-all text-[12px] font-extrabold leading-none active:scale-95 border border-blue-500/20"
          onClick={(e) => {
            e.stopPropagation();
            haptic("light");
            if (bot.bot_link) {
              window.open(bot.bot_link, "_blank", "noopener,noreferrer");
            } else {
              navigate(`/bot/${bot.slug}`);
            }
          }}
        >
          {t("run") || "Run"}
        </button>
      </div>
    </div>
  );
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
  setSearchMode,
  setActiveCategory,
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
  setSearchMode: (mode: "bots" | "apps") => void;
  setActiveCategory: (cat: string) => void;
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
    setSearchMode(mode);
    setActiveCategory(catId);
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
      id: "ads",
      label: "Reklam",
      desc: "Projenizi Öne Çıkarın",
      icon: Share2,
      path: "/settings",
    },
  ];

  const simpleLinks = [
    { label: "Hızlı Link 1", path: "#" },
    { label: "Hızlı Link 2", path: "#" },
    { label: "Hızlı Link 3", path: "#" },
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
                target="_blank"
                rel="noreferrer"
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
        className="relative md:sticky md:top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-b border-[#f7f7f7] dark:border-white/5 w-full py-2.5 transition-colors"
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

            {/* My Bots / Botlarım */}
            <button
              onClick={() => {
                haptic("light");
                navigate("/my-bots");
              }}
              className="nav-menu-item text-slate-600 dark:text-slate-400 hover:bg-blue-500/5"
              id="nav-my-bots-btn"
            >
              {t("my_bots")}
            </button>
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
                  <div className="flex md:hidden items-center gap-1.5">
                    {isMenuOpen ? (
                      <X
                        size={18}
                        className="text-slate-700 dark:text-slate-300"
                      />
                    ) : user && user.id && user.id !== "guest_user" ? (
                      <>
                        <span className="text-[11px] font-black uppercase tracking-wide">
                          {(
                            user.username ||
                            user.first_name ||
                            user.name ||
                            ""
                          ).slice(0, 5)}
                          {(
                            user.username ||
                            user.first_name ||
                            user.name ||
                            ""
                          ).length > 5
                            ? ".."
                            : ""}
                        </span>
                        <ChevronDown
                          size={12}
                          className="text-slate-400 dark:text-slate-500 transition-transform duration-200"
                        />
                      </>
                    ) : (
                      <>
                        <Menu
                          size={18}
                          className="text-slate-700 dark:text-slate-300"
                        />
                        <ChevronDown
                          size={12}
                          className="text-slate-400 dark:text-slate-500 transition-transform duration-200"
                        />
                      </>
                    )}
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
                                  target="_blank"
                                  rel="noreferrer"
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
                                  setSearchMode("bots");
                                  setActiveCategory("all");
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
                                    setSearchMode("bots");
                                    setActiveCategory(cat.id);
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
                                  setSearchMode("apps");
                                  setActiveCategory("all");
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
                                    setSearchMode("apps");
                                    setActiveCategory(cat.id);
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
                        <User
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

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const { user, haptic, setWebAuthUser } = useTelegram();
  const { theme, toggleTheme } = useTheme();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [activeCategory, setActiveCategory] = useState(
    searchParams.get("category") || "all",
  );
  const [bots, setBots] = useState<Bot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tonRate, setTonRate] = useState(250);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchMode, setSearchMode] = useState<"bots" | "apps">(
    (searchParams.get("mode") as "bots" | "apps") || "bots",
  );
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const modeMenuRef = React.useRef<HTMLDivElement>(null);
  const catScroll = useDraggableScroll();
  const { activeFilter } = useFilter();
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAiAssistant, setShowAiAssistant] = useState(false);

  useEffect(() => {
    const mode = searchParams.get("mode") as "bots" | "apps";
    const category = searchParams.get("category");
    if (mode && mode !== searchMode) setSearchMode(mode);
    if (category && category !== activeCategory) setActiveCategory(category);
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const startTime = Date.now();
      const [botData, pData] = await Promise.all([
        DatabaseService.getBots(),
        PriceService.getTonPrice(),
      ]);
      setBots(botData);
      setTonRate(pData.tonTry || 250);

      const elapsedTime = Date.now() - startTime;
      const minDelay = 500;
      if (elapsedTime < minDelay) {
        await new Promise((resolve) =>
          setTimeout(resolve, minDelay - elapsedTime),
        );
      }
      setIsLoading(false);

      // Log search page visit
      if (user?.id) {
        await DatabaseService.logActivity(
          user.id.toString(),
          "system",
          "search_visit",
          "Arama Sayfası",
          "Kullanıcı arama motorunu başlattı.",
        );

        // Fetch notifications for unread count
        const notes = await DatabaseService.getNotifications(
          user.id.toString(),
        );
        setUnreadCount(notes.filter((n) => !n.isRead).length);
      }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node))
        setIsMenuOpen(false);
      if (
        modeMenuRef.current &&
        !modeMenuRef.current.contains(event.target as Node)
      )
        setIsModeMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredBots = bots
    .filter((bot) => {
      const matchesQuery =
        bot.name.toLowerCase().includes(query.toLowerCase()) ||
        bot.description.toLowerCase().includes(query.toLowerCase());

      // Top-level filter: Apps vs Bots
      const isApp = Array.isArray(bot.category)
        ? bot.category.includes("apps")
        : bot.category === "apps";
      if (searchMode === "apps" && !isApp) return false;
      if (searchMode === "bots" && isApp) return false;

      let matchesCategory = false;
      if (searchMode === "bots") {
        matchesCategory =
          activeCategory === "all" ||
          (Array.isArray(bot.category)
            ? bot.category.includes(activeCategory)
            : bot.category === activeCategory);
      } else {
        // Apps Mode Mapping
        if (activeCategory === "all") {
          matchesCategory = true;
        } else {
          const appsCategoryMap: Record<string, (b: Bot) => boolean> = {
            trending: (b) => (b.views || 0) > 50,
            editors_choice: (b) => b.promoted_type === "featured",
            new: (b) => !!b.isNew,
            games_sub: (b) =>
              Array.isArray(b.category)
                ? b.category.includes("games")
                : b.category === "games",
            ai_sub: (b) =>
              Array.isArray(b.category)
                ? b.category.includes("ai_services")
                : b.category === "ai_services",
            trade: (b) =>
              Array.isArray(b.category)
                ? b.category.includes("finance")
                : b.category === "finance",
            social: (b) =>
              Array.isArray(b.category)
                ? b.category.includes("communication")
                : b.category === "communication",
            security_privacy: (b) =>
              Array.isArray(b.category)
                ? b.category.includes("security")
                : b.category === "security",
            dev: (b) =>
              Array.isArray(b.category)
                ? b.category.includes("utilities")
                : b.category === "utilities",
            art: (b) =>
              Array.isArray(b.category)
                ? b.category.includes("content")
                : b.category === "content",
            earn: (b) =>
              Array.isArray(b.category)
                ? b.category.includes("crypto")
                : b.category === "crypto",
            web3_general: (b) =>
              Array.isArray(b.category)
                ? b.category.includes("crypto") ||
                  b.category.includes("finance")
                : b.category === "crypto",
            tma_bots: (b) => true, // Already filtered by searchMode (isApp)
            ton_sites: (b) => true,
            saas: (b) =>
              Array.isArray(b.category)
                ? b.category.includes("productivity")
                : b.category === "productivity",
          };
          if (appsCategoryMap[activeCategory]) {
            matchesCategory = appsCategoryMap[activeCategory](bot);
          } else {
            matchesCategory = Array.isArray(bot.category)
              ? bot.category.includes(activeCategory)
              : bot.category === activeCategory;
          }
        }
      }

      let matchesFilter = true;
      if (activeFilter === "paid") matchesFilter = bot.price > 0;
      else if (activeFilter === "free") matchesFilter = bot.price === 0;
      else if (activeFilter === "bhub") matchesFilter = !!bot.is_official;

      return matchesQuery && matchesCategory && matchesFilter;
    })
    .sort((a, b) => {
      if (activeFilter === "popular" || activeCategory === "trending")
        return (b.views || 0) - (a.views || 0);
      if (activeCategory === "new") return b.id.localeCompare(a.id); // Mock new sort
      return 0;
    });

  const handleAiSearch = async () => {
    if (!aiQuery.trim()) return;
    setIsAiLoading(true);
    try {
      const response = await GeminiService.recommendBots(aiQuery, bots);
      setAiResponse(response);
      if (user?.id) {
        await DatabaseService.logActivity(
          user.id.toString(),
          "system",
          "ai_search",
          "AI Asistanı",
          `AI asistanına soruldu: ${aiQuery}`,
        );
      }
    } catch (error) {
      console.error("AI Search Error:", error);
      setAiResponse("Üzgünüm, şu anda yardımcı olamıyorum.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <>
      <SEO
        title={t("search_seo_title")}
        description={t("search_seo_desc")}
        breadcrumbs={[
          { name: t("search_breadcrumb_home"), item: "https://botlyhub.com/" },
          {
            name: t("search_breadcrumb_search"),
            item: "https://botlyhub.com/search",
          },
        ]}
      />
      <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300 search-page">
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
          setSearchMode={setSearchMode}
          setActiveCategory={setActiveCategory}
        />
        <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-10 pb-32">
          {/* Results */}
          <div className="sticky top-0 z-30 bg-white dark:bg-slate-950 py-3 -mx-5 px-5 md:relative md:top-auto md:z-auto md:py-0 md:px-0 md:mx-0 flex items-center gap-3 mb-10 border-b border-black/[0.03] dark:border-white/5 md:border-b-0 transition-colors">
            <div className="flex-1 relative">
              <div className="relative flex items-center bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-xl p-1 transition-all group custom-search-outline">
                <div className="ml-2 w-8 h-8 flex items-center justify-center text-slate-400 group-focus-within:text-blue-500 shrink-0">
                  <SearchIcon size={18} />
                </div>
                <input
                  type="text"
                  value={query}
                  autoFocus
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={
                    searchMode === "bots"
                      ? t("search_placeholder_bots")
                      : t("search_placeholder_apps")
                  }
                  className="w-full bg-transparent py-2 px-2 text-[13px] text-slate-900 dark:text-white outline-none placeholder:text-slate-400 font-bold uppercase tracking-widest min-w-0"
                />
                <div className="flex items-center gap-0.5 pr-1 shrink-0">
                  {query && (
                    <button
                      onClick={() => setQuery("")}
                      className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                  <div className="w-px h-5 bg-black/[0.05] dark:bg-white/[0.05] mx-1" />
                  <FilterMenu />
                </div>
              </div>
            </div>
          </div>

          {/* Categories Horizontal Scroll */}
          <div className="mb-10">
            <div
              ref={catScroll.ref}
              onMouseDown={catScroll.onMouseDown}
              onMouseUp={catScroll.onMouseUp}
              onMouseMove={catScroll.onMouseMove}
              onMouseLeave={catScroll.onMouseLeave}
              onContextMenu={catScroll.onContextMenu}
              className={`flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-2 snap-x ${catScroll.isDragging ? "cursor-grabbing" : "cursor-grab"}`}
            >
              {(searchMode === "bots"
                ? categories
                : [
                    { id: "all", label: "cat_all", icon: Sparkles },
                    ...appsSubCategories,
                  ]
              ).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    navigate(`/search?mode=${searchMode}&category=${cat.id}`);
                    if (user?.id) {
                      DatabaseService.logActivity(
                        user.id.toString(),
                        "system",
                        "search_category",
                        "Kategori Filtresi",
                        `Arama motorunda '${t(cat.label)}' kategorisi filtrelendi.`,
                      );
                    }
                  }}
                  className={`flex items-center gap-3 px-4 py-2.5 md:px-6 md:pb-2 rounded-xl border transition-all active:scale-95  whitespace-nowrap snap-center ${
                    activeCategory === cat.id
                      ? "bg-brand/10 dark:bg-brand-light/10 border-brand/40 dark:border-brand-light/40 text-brand dark:text-brand-light ring-1 ring-brand/20 dark:ring-brand-light/20"
                      : "bg-white dark:bg-slate-900/60 border-black/5 dark:border-white/5 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  <cat.icon
                    size={16}
                    className={
                      activeCategory === cat.id
                        ? "text-[#0a263d] dark:text-white font-bold"
                        : "text-[#0a263d]/60 dark:text-slate-400"
                    }
                  />
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    {t(cat.label)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          <div className="space-y-1">
            <div className="flex justify-between items-center mb-6 px-2">
              <h2 className="text-[10px] font-black text-slate-400 dark:text-slate-700 uppercase tracking-[0.4em]">
                {t("search_results_label")} ({filteredBots.length})
              </h2>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex gap-4 p-5 bg-white dark:bg-[#0F1623] border border-black/[0.06] dark:border-white/[0.06] rounded-[16px]"
                  >
                    <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                    <div className="flex-1 flex flex-col gap-2">
                      <Skeleton className="w-[140px] h-5 rounded-md" />
                      <Skeleton className="w-[180px] h-3.5 rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredBots.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-bottom-4">
                {filteredBots.map((bot) => (
                  <BotCard key={bot.id} bot={bot} tonRate={tonRate} />
                ))}
              </div>
            ) : (
              <div className="py-24 text-center">
                <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">
                  {t("search_no_results")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onAuth={setWebAuthUser}
      />
    </>
  );
};

export default SearchPage;

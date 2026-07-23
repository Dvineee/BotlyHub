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
  Shield,
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
  ArrowRight,
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
import { NavMenu } from "../components/NavMenu";

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
            className="w-[3.5rem] h-[3.5rem] rounded-xl object-cover border border-black/[0.04] dark:border-white/[0.06] shrink-0"
            containerClass="w-[3.5rem] h-[3.5rem] rounded-xl shrink-0"
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
  const { activeFilter, searchMode, setSearchMode } = useFilter();
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const modeMenuRef = React.useRef<HTMLDivElement>(null);
  const catScroll = useDraggableScroll();
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScroll = React.useCallback(() => {
    const el = catScroll.ref.current;
    if (el) {
      const canScrollLeft = el.scrollLeft > 5;
      const canScrollRight = el.scrollLeft < el.scrollWidth - el.clientWidth - 5;
      setShowLeftArrow(canScrollLeft);
      setShowRightArrow(canScrollRight);
    }
  }, [catScroll.ref]);

  useEffect(() => {
    const el = catScroll.ref.current;
    if (!el) return;

    checkScroll();

    el.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);

    const observer = new ResizeObserver(() => {
      checkScroll();
    });
    observer.observe(el);

    const timer = setTimeout(checkScroll, 150);

    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [searchMode, bots, checkScroll]);

  const scrollCategories = (direction: "left" | "right") => {
    const el = catScroll.ref.current;
    if (el) {
      if (haptic) haptic("light");
      const scrollAmount = direction === "left" ? -250 : 250;
      el.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };


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
    if (query) {
      document.title = `"${query}" Arama Sonuçları | BotlyHub`;
    } else {
      document.title = t("search_seo_title") || "Bot ve Uygulama Arayın | BotlyHub";
    }
  }, [query, t]);

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
      const minDelay = 200;
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
            tap_to_earn: (b) => {
              const nameLower = b.name.toLowerCase();
              const descLower = (b.description || '').toLowerCase();
              const isGame = Array.isArray(b.category) ? b.category.includes("games") : b.category === "games";
              const hasTapKeywords = nameLower.includes("tap") || nameLower.includes("click") || nameLower.includes("coin") || nameLower.includes("hamster") || nameLower.includes("catizen") || nameLower.includes("blum") || nameLower.includes("yescoin") || nameLower.includes("empire") || nameLower.includes("notcoin") || descLower.includes("tap") || descLower.includes("tıkla") || descLower.includes("click") || descLower.includes("mining") || descLower.includes("kazan");
              return isGame || hasTapKeywords;
            },
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
        <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-0 md:pt-0 pb-32">
          {/* Results */}
          <div className="relative z-20 bg-white dark:bg-slate-950 py-3 -mx-5 px-5 sm:-mx-8 sm:px-8 md:mx-0 md:px-0 flex items-center gap-3 mb-0 md:mb-2 transition-colors">
            <div className="flex-1 relative px-[8.5px]">
              <div className="relative flex items-center pl-3 pr-3.5 transition-all group premium-search-container h-[50px]">
                <button
                  type="button"
                  onClick={() => {
                    haptic("light");
                    navigate(-1);
                  }}
                  className="w-8 h-8 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 transition-all cursor-pointer active:scale-95 shrink-0"
                  title="Geri Git"
                >
                  <ArrowLeft size={20} />
                </button>
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
                  className="w-full bg-transparent py-2.5 px-2 text-[14.5px] text-slate-900 dark:text-white outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium min-w-0"
                />
                <div className="flex items-center gap-2 pr-1 shrink-0">
                  {query && (
                    <button
                      onClick={() => setQuery("")}
                      className="w-8 h-8 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors bg-transparent hover:bg-transparent"
                    >
                      <X size={16} />
                    </button>
                  )}
                  <FilterMenu />
                </div>
              </div>
            </div>
          </div>

          {/* Categories Horizontal Scroll */}
          <div className="sticky top-0 md:top-[72px] z-30 bg-white dark:bg-slate-950 py-3 -mx-5 px-5 sm:-mx-8 sm:px-8 md:mx-0 md:px-0 border-b border-black/[0.03] dark:border-white/[0.03] mb-10 relative group/cat">
            {/* Left Scroll Button & Fade Overlay */}
            {showLeftArrow && (
              <div className="hidden md:flex absolute left-0 top-0 bottom-0 w-20 items-center justify-start bg-gradient-to-r from-white via-white/80 to-transparent dark:from-slate-950 dark:via-slate-950/80 dark:to-transparent z-10 pointer-events-none">
                <button
                  type="button"
                  onClick={() => scrollCategories("left")}
                  className="pointer-events-auto flex w-7 h-7 items-center justify-center rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-150 active:scale-95 shadow-md"
                  aria-label="Sola Kaydır"
                >
                  <ChevronLeft size={14} />
                </button>
              </div>
            )}

            {/* Right Scroll Button & Fade Overlay */}
            {showRightArrow && (
              <div className="hidden md:flex absolute right-0 top-0 bottom-0 w-20 items-center justify-end bg-gradient-to-l from-white via-white/80 to-transparent dark:from-slate-950 dark:via-slate-950/80 dark:to-transparent z-10 pointer-events-none">
                <button
                  type="button"
                  onClick={() => scrollCategories("right")}
                  className="pointer-events-auto flex w-7 h-7 items-center justify-center rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-150 active:scale-95 shadow-md"
                  aria-label="Sağa Kaydır"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            )}

            <div
              ref={catScroll.ref}
              onMouseDown={catScroll.onMouseDown}
              onMouseUp={catScroll.onMouseUp}
              onMouseMove={catScroll.onMouseMove}
              onMouseLeave={catScroll.onMouseLeave}
              onContextMenu={catScroll.onContextMenu}
              className={`category-filter-container no-scrollbar py-3.5 snap-x ${catScroll.isDragging ? "cursor-grabbing" : "cursor-grab"}`}
            >
              <button
                onClick={() => {
                  navigate(`/search?mode=${searchMode}&category=all`);
                  if (user?.id) {
                    DatabaseService.logActivity(
                      user.id.toString(),
                      "system",
                      "search_category",
                      "Kategori Filtresi",
                      `Arama motorunda '${t("cat_all")}' kategorisi filtrelendi.`,
                    );
                  }
                }}
                className={`category-filter-item flex items-center gap-1.5 snap-center ${
                  activeCategory === "all" || !activeCategory ? "active" : ""
                }`}
              >
                <Sparkles size={13} className="shrink-0" />
                <span>{t("cat_all") || "Tümü"}</span>
              </button>

              {(searchMode === "bots"
                ? categories.filter((c) => c.id !== "apps" && c.id !== "all")
                : appsSubCategories
              ).map((cat) => {
                const IconComponent = cat.icon;
                return (
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
                    className={`category-filter-item flex items-center gap-1.5 snap-center ${
                      activeCategory === cat.id ? "active" : ""
                    }`}
                  >
                    {IconComponent && <IconComponent size={13} className="shrink-0" />}
                    <span>{t(cat.label)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results */}
          <div className="space-y-1">
            <div className="flex justify-end items-center mb-6 px-2">
              <h2 className="text-[10px] font-black text-slate-400 dark:text-slate-700 uppercase tracking-[0.4em] text-right">
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

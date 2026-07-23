import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../hooks/useTelegram';
import { useTranslation } from '../TranslationContext';
import { DatabaseService } from '../services/DatabaseService';
import { Announcement } from '../types';

const StarSVG = React.memo(
  ({ className, size = 24 }: { className?: string; size?: number }) => (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  ),
);

const StarVisual = React.memo(() => (
  <div className="absolute right-[-15px] sm:right-[-6px] top-1/2 -translate-y-1/2 w-[160px] h-[160px] sm:w-[180px] sm:h-[180px] flex items-center justify-center pointer-events-none select-none overflow-visible">
    <div
      className="absolute inset-0 rounded-full blur-3xl opacity-20 pointer-events-none"
      style={{
        background:
          "radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)",
      }}
    />

    <div className="absolute -translate-x-12 -translate-y-2 scale-75 -rotate-12 text-amber-300 dark:text-amber-500/40 opacity-70 group-hover:scale-80 transition-transform duration-500">
      <StarSVG size={45} />
    </div>

    <div className="absolute translate-x-14 translate-y-4 scale-60 rotate-[22deg] text-amber-300 dark:text-amber-500/30 opacity-60">
      <StarSVG size={40} />
    </div>

    <div className="absolute z-10 scale-100 rotate-6 text-[#ffaf02] drop-shadow-[0_4px_10px_rgba(245,158,11,0.2)] group-hover:scale-105 group-hover:rotate-[12deg] transition-all duration-500">
      <StarSVG size={85} />
    </div>

    <div className="absolute -translate-x-12 translate-y-12 text-amber-400/90 scale-75 animate-bounce duration-[3000ms]">
      <StarSVG size={14} />
    </div>
    <div className="absolute translate-x-10 -translate-y-12 text-amber-400 opacity-95">
      <StarSVG size={16} />
    </div>

    <div className="absolute z-20 translate-x-[24px] translate-y-[20px] bg-[#ff3b30] text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-lg shadow-red-500/10 rotate-[8deg] tracking-tight">
      -30%
    </div>
  </div>
));

const TonCoin = React.memo(
  ({ className, size = 48 }: { className?: string; size?: number }) => (
    <div
      className={`relative flex items-center justify-center rounded-full bg-gradient-to-br from-[#2f80ed] to-[#0088cc] shadow-xl text-white border border-white/10 select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size * 0.55}
        height={size * 0.55}
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M50 85 L15 35 L85 35 Z" fill="none" />
        <path d="M50 35 L50 85" />
      </svg>
    </div>
  ),
);

const TonVisual = React.memo(() => (
  <div className="absolute right-[-15px] sm:right-[-6px] top-1/2 -translate-y-1/2 w-[160px] h-[160px] sm:w-[180px] sm:h-[180px] flex items-center justify-center pointer-events-none select-none overflow-visible">
    <div
      className="absolute inset-0 rounded-full blur-3xl opacity-20 pointer-events-none"
      style={{
        background:
          "radial-gradient(circle, rgba(56,189,248,0.1) 0%, transparent 70%)",
      }}
    />

    <div className="absolute z-10 translate-x-5 translate-y-14 rotate-[-30deg] scale-90 shadow-xl opacity-90 group-hover:translate-y-12 transition-all duration-500">
      <TonCoin size={50} />
    </div>

    <div className="absolute z-20 -translate-x-4 -translate-y-4 rotate-[15deg] scale-115 drop-shadow-[0_4px_10px_rgba(47,128,237,0.2)] group-hover:scale-120 group-hover:rotate-[20deg] transition-all duration-500">
      <TonCoin size={58} />
    </div>

    <div className="absolute z-0 translate-x-12 -translate-y-8 rotate-[35deg] scale-75 opacity-60 group-hover:-translate-y-10 transition-all duration-500">
      <TonCoin size={42} />
    </div>

    <div className="absolute -translate-x-14 translate-y-6 text-sky-400 scale-75">
      <StarSVG size={18} />
    </div>
    <div className="absolute translate-x-12 translate-y-8 text-amber-300 scale-90">
      <StarSVG size={16} />
    </div>
    <div className="absolute translate-x-4 -translate-y-14 text-amber-400 scale-75 animate-bounce">
      <StarSVG size={12} />
    </div>
  </div>
));

const CloverVisual = React.memo(() => (
  <div className="absolute right-[-15px] sm:right-[-6px] top-1/2 -translate-y-1/2 w-[160px] h-[160px] sm:w-[180px] sm:h-[180px] flex items-center justify-center pointer-events-none select-none overflow-visible">
    <div
      className="absolute inset-0 rounded-full blur-3xl opacity-20 pointer-events-none"
      style={{
        background:
          "radial-gradient(circle, rgba(52,199,89,0.1) 0%, transparent 70%)",
      }}
    />

    <div className="absolute z-10 w-[95px] h-[95px] sm:w-[105px] sm:h-[105px] rounded-full bg-gradient-to-tr from-[#34c759] to-[#2eb850] flex items-center justify-center shadow-xl border-4 border-white dark:border-slate-800 drop-shadow-[0_4px_12px_rgba(52,199,89,0.15)] group-hover:scale-105 group-hover:rotate-[8deg] transition-all duration-500">
      <svg
        width="52"
        height="52"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="text-white"
      >
        <path d="M12 9c.5-1.5 2-2.5 3.5-2.5s2.5 1 2.5 2.5c0 1.5-1 3-2.5 3.5C14 13 12.5 12 12 9zm0 6c-.5 1.5-2 2.5-3.5 2.5S6 16.5 6 15c0-1.5 1-3 2.5-3.5 1.5-.5 3 .5 3.5 3.5zm0-6c-.5-1.5-2-2.5-3.5-2.5S6 7.5 6 9c0 1.5 1 3 2.5 3.5 1.5.5 3-.5 3.5-3.5zm0 6c.5 1.5 2 2.5 3.5 2.5s2.5-1 2.5-2.5c0-1.5-1-3-2.5-3.5-1.5-.5-3 .5-3.5 3.5z" />
        <path
          d="M12 12c.5 1.5 1 3.5.5 5.5-.5 2-1.5 3.5-2.5 4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>

    <div className="absolute -translate-x-14 -translate-y-8 text-[#34c759] opacity-80">
      <StarSVG size={18} />
    </div>
    <div className="absolute translate-x-14 translate-y-8 text-emerald-400 opacity-80">
      <StarSVG size={16} />
    </div>
    <div className="absolute translate-x-14 -translate-y-10 text-emerald-300 opacity-60">
      <StarSVG size={12} />
    </div>
    <div className="absolute -translate-x-10 translate-y-12 text-[#248a3d] opacity-80 animate-bounce">
      <StarSVG size={14} />
    </div>
  </div>
));

export const isDemoAnnouncement = (ann: Announcement): boolean => {
  const titleLower = ann.title?.toLowerCase() || "";
  const descLower = ann.description?.toLowerCase() || "";
  return (
    titleLower.includes("demo") ||
    titleLower.includes("test") ||
    titleLower.includes("deneme") ||
    titleLower.includes("kısa ve net") ||
    titleLower.includes("kisa ve net") ||
    titleLower.includes("bir başka duyuru") ||
    titleLower.includes("bir baska duyuru") ||
    descLower.includes("duyuru açıklaması") ||
    descLower.includes("duyuru aciklamasi") ||
    descLower.includes("kısa bir açıklama") ||
    descLower.includes("kisa bir aciklama")
  );
};

export const PromoCard: React.FC<{
  ann: Announcement;
  onShowPopup: (ann: Announcement) => void;
}> = React.memo(({ ann, onShowPopup }) => {
  const navigate = useNavigate();
  const { haptic } = useTelegram();
  const { t } = useTranslation();

  const handleAction = async (e: React.MouseEvent) => {
    e.stopPropagation();
    haptic("light");

    try {
      await DatabaseService.incrementPromotionClick(ann.id);
    } catch (err) {
      console.warn("Click tracking error:", err);
    }

    if (ann.action_type === "popup") onShowPopup(ann);
    else {
      let link = ann.button_link;
      if (!link) return;
      if (link.startsWith("@"))
        window.location.href = `https://t.me/${link.substring(1)}`;
      else if (link.startsWith("http")) window.location.href = link;
      else if (link.startsWith("/")) navigate(link);
      else window.location.href = `https://t.me/${link.replace("@", "")}`;
    }
  };

  const isStars =
    ann.id === "promo-stars" ||
    ann.icon_name === "stars" ||
    ann.title.toLowerCase().includes("stars");
  const isTon =
    ann.id === "promo-ton" ||
    ann.icon_name === "ton" ||
    ann.title.toLowerCase().includes("ton");
  const isClover =
    ann.id === "promo-clover" ||
    ann.icon_name === "clover" ||
    ann.title.toLowerCase().includes("clover") ||
    ann.title.toLowerCase().includes("gift") ||
    ann.description.toLowerCase().includes("gift") ||
    ann.description.toLowerCase().includes("lucky buy");

  const cardBgClass =
    "bg-white dark:bg-[#111214] border-black/5 dark:border-white/5 shadow-xs";
  const btnClass =
    "text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300";
  const descColorClass =
    "text-slate-500 dark:text-slate-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={handleAction}
      className={`w-full h-[185px] sm:h-[195px] shrink-0 rounded-[24px] border border-solid p-6 pb-5 sm:p-7 sm:pb-6 relative overflow-hidden flex flex-col justify-between cursor-pointer select-none transition-all duration-305 hover:shadow-lg dark:hover:shadow-black/20 group backdrop-blur-md announcement-card ${cardBgClass}`}
    >
      {ann.badge_text && (
        <div className={`absolute top-4 right-4 z-30 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-black/5 dark:border-white/10 text-slate-600 dark:text-slate-300 shadow-xs pointer-events-none select-none slider-badge-custom-pos announcement-badge`}>
          {ann.badge_text}
        </div>
      )}
      <div className="z-10 max-w-[58%] sm:max-w-[61%] flex flex-col items-start h-full justify-between">
        <div className="flex flex-col gap-1.5">
          <h3 className="text-[#0f172a] dark:text-white font-[900] text-[15px] sm:text-[17px] tracking-tight leading-snug font-sans group-hover:text-black dark:group-hover:text-slate-100 transition-colors">
            {ann.title}
          </h3>
          <p className={`${descColorClass} text-[11px] sm:text-[12px] leading-snug sm:leading-[1.4] font-medium line-clamp-3`}>
            {ann.description}
          </p>
        </div>

        <button
          onClick={handleAction}
          className={`flex items-center gap-1.5 px-0 py-1 rounded-none text-xs sm:text-[13px] font-[900] tracking-wide transition-all active:scale-95 bg-transparent shadow-none hover:shadow-none border-0 ${btnClass} group/btn`}
        >
          <span>{ann.button_text}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4 transition-all duration-200 transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 select-none shrink-0"
          >
            <line x1="7" y1="17" x2="17" y2="7"></line>
            <polyline points="7 7 17 7 17 17"></polyline>
          </svg>
        </button>
      </div>

      <div className="absolute right-0 top-0 bottom-0 w-[42%] overflow-visible">
        {isStars && <StarVisual />}
        {isTon && <TonVisual />}
        {isClover && <CloverVisual />}

        {!isStars && !isTon && !isClover && ann.bg_image_url && (
          <div className="absolute right-[16px] top-1/2 -translate-y-1/2 w-[110px] h-[110px] rounded-[22px] overflow-hidden border border-black/5 dark:border-white/10 shadow-lg shrink-0 pointer-events-none">
            <img
              src={ann.bg_image_url}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
              alt=""
              loading="lazy"
            />
          </div>
        )}
      </div>
    </motion.div>
  );
});

export const AnnouncementsCarousel: React.FC<{
  announcements: Announcement[];
  scroll: any;
  onShowPopup: (ann: Announcement) => void;
}> = React.memo(({ announcements, scroll, onShowPopup }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = useCallback(() => {
    if (scroll.ref.current) {
      const width = scroll.ref.current.offsetWidth;
      const index = Math.round(scroll.ref.current.scrollLeft / width);
      if (index !== currentIndex) {
        setCurrentIndex(index);
      }
    }
  }, [currentIndex, scroll.ref]);

  useEffect(() => {
    const el = scroll.ref.current;
    if (el) {
      el.addEventListener("scroll", handleScroll, { passive: true });
      return () => el.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll, scroll.ref]);

  useEffect(() => {
    if (announcements.length <= 1) return;

    const interval = setInterval(() => {
      if (window.innerWidth < 768 && scroll.ref.current && !scroll.isDragging) {
        const nextIndex = (currentIndex + 1) % announcements.length;
        const width = scroll.ref.current.offsetWidth;
        scroll.ref.current.scrollTo({
          left: nextIndex * width,
          behavior: "smooth",
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex, announcements.length, scroll.isDragging, scroll.ref]);

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="relative">
        <div
          ref={scroll.ref}
          onMouseDown={scroll.onMouseDown}
          onMouseUp={scroll.onMouseUp}
          onMouseMove={scroll.onMouseMove}
          onMouseLeave={scroll.onMouseLeave}
          onContextMenu={scroll.onContextMenu}
          className={`flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 overflow-x-auto md:overflow-x-visible no-scrollbar pb-3 scroll-smooth snap-x snap-mandatory ${scroll.isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        >
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className="w-[84vw] sm:w-[50vw] md:w-full shrink-0 snap-center"
            >
              <PromoCard ann={ann} onShowPopup={onShowPopup} />
            </div>
          ))}
        </div>

        {announcements.length > 1 && (
          <div className="md:hidden flex justify-center items-center gap-1.5 mt-3 pointer-events-none">
            {announcements.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? "w-4 bg-slate-800 dark:bg-white" : "w-1.5 bg-slate-300 dark:bg-slate-700"}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

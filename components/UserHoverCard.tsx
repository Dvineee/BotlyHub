import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ShieldAlert, 
  Calendar, 
  ExternalLink, 
  Activity, 
  Award,
  Shield,
  Heart
} from 'lucide-react';
import { User as UserType } from '../types';
import { DatabaseService } from '../services/DatabaseService';

interface UserHoverCardProps {
  userId?: string | null;
  user?: Partial<UserType> | null;
  children: React.ReactNode;
}

// Simple in-memory global cache for user details to prevent repeated API calls
const userCache: Record<string, UserType> = {};

export const UserHoverCard: React.FC<UserHoverCardProps> = ({ userId, user, children }) => {
  const navigate = useNavigate();
  const [showCard, setShowCard] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Partial<UserType> | null>(user || null);
  const [cardPosition, setCardPosition] = useState({ top: 0, left: 0, position: 'top' as 'top' | 'bottom' });
  
  const triggerRef = useRef<HTMLDivElement>(null);
  const enterTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const exitTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const effectiveUserId = user?.id || userId;

  // Sync state if user prop changes
  useEffect(() => {
    if (user) {
      setProfile(user);
    }
  }, [user]);

  // Load user data when card is going to show
  const fetchUserData = async () => {
    if (!effectiveUserId) return;
    
    // Check cache first
    if (userCache[effectiveUserId]) {
      setProfile(userCache[effectiveUserId]);
      return;
    }

    try {
      setLoading(true);
      const data = await DatabaseService.getUser(effectiveUserId);
      if (data) {
        userCache[effectiveUserId] = data;
        setProfile(data);
      } else {
        // Fallback placeholder based on available props or username
        const mockProfile: Partial<UserType> = {
          id: effectiveUserId,
          name: user?.name || `Kullanıcı #${effectiveUserId.toString().substring(0, 6)}`,
          username: user?.username || `user_${effectiveUserId.toString().substring(0, 4)}`,
          avatar: user?.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${effectiveUserId}`,
          role: 'User',
          status: 'Active',
          badges: [],
          joinDate: new Date('2024-01-01').toISOString()
        };
        setProfile(mockProfile);
      }
    } catch (err) {
      console.warn('Could not fetch user details for hovercard:', err);
      // Fallback
      setProfile({
        id: effectiveUserId,
        name: user?.name || 'Kullanıcı',
        username: user?.username || 'kullanıcı',
        avatar: user?.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${effectiveUserId}`,
        role: 'User',
        status: 'Active',
        badges: []
      });
    } finally {
      setLoading(false);
    }
  };

  const calculatePosition = () => {
    if (!triggerRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    
    const cardWidth = 320;
    const cardHeight = 220; // estimate max height

    let left = triggerRect.left + scrollX + (triggerRect.width / 2) - (cardWidth / 2);
    let top = triggerRect.top + scrollY - cardHeight - 12; // default position is top
    let pos: 'top' | 'bottom' = 'top';

    // Viewport overflow checks
    if (left < 12) {
      left = 12;
    } else if (left + cardWidth > window.innerWidth - 12) {
      left = window.innerWidth - cardWidth - 12;
    }

    // Top check: if there is not enough room on top, show on bottom
    if (triggerRect.top - cardHeight - 20 < 0) {
      top = triggerRect.bottom + scrollY + 12;
      pos = 'bottom';
    }

    setCardPosition({ top, left, position: pos });
  };

  const handleMouseEnter = () => {
    if (exitTimeoutRef.current) {
      clearTimeout(exitTimeoutRef.current);
      exitTimeoutRef.current = null;
    }

    if (enterTimeoutRef.current) return;

    enterTimeoutRef.current = setTimeout(async () => {
      calculatePosition();
      setShowCard(true);
      if (!profile || !profile.role) {
        await fetchUserData();
        // Recalculate position as data load may shift design slightly (or keep layout consistent)
        setTimeout(calculatePosition, 30);
      }
    }, 450); // elegant delays to avoid aggressive popups
  };

  const handleMouseLeave = () => {
    if (enterTimeoutRef.current) {
      clearTimeout(enterTimeoutRef.current);
      enterTimeoutRef.current = null;
    }

    // Safe transition delay for user to hover over the popup
    exitTimeoutRef.current = setTimeout(() => {
      setShowCard(false);
    }, 280);
  };

  // Keep showing cards if hovered directly on the card
  const handleCardMouseEnter = () => {
    if (exitTimeoutRef.current) {
      clearTimeout(exitTimeoutRef.current);
      exitTimeoutRef.current = null;
    }
  };

  const handleCardMouseLeave = () => {
    exitTimeoutRef.current = setTimeout(() => {
      setShowCard(false);
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (enterTimeoutRef.current) clearTimeout(enterTimeoutRef.current);
      if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current);
    };
  }, []);

  const getDisplayName = (u: Partial<UserType> | null) => {
    if (!u) return 'Seçkin Üye';
    if (!u.name || u.name === 'undefined' || u.name.trim() === '') {
      if (u.username && u.username !== 'undefined' && u.username.trim() !== '') {
        return u.username;
      }
      return `Kullanıcı #${u.id?.substring(0, 6) || ''}`;
    }
    return u.name;
  };

  const getDisplayUsername = (u: Partial<UserType> | null) => {
    if (!u) return '@user';
    if (!u.username || u.username === 'undefined' || u.username.trim() === '') {
      return `@user_${u.id?.substring(0, 4) || ''}`;
    }
    return u.username.startsWith('@') ? u.username : `@${u.username}`;
  };

  const getUserAvatar = (u: Partial<UserType> | null) => {
    if (u?.avatar && u.avatar.startsWith('http')) {
      return u.avatar;
    }
    const nameParam = encodeURIComponent(getDisplayName(u));
    return `https://ui-avatars.com/api/?name=${nameParam}&background=3b82f6&color=fff&bold=true`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Yakında';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' });
    } catch {
      return 'Bilinmiyor';
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (effectiveUserId) {
      setShowCard(false);
      navigate(`/user/${effectiveUserId}`);
    }
  };

  return (
    <>
      <div 
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-block"
      >
        {children}
      </div>

      {createPortal(
        showCard && (
          <motion.div
            ref={cardRef}
            onMouseEnter={handleCardMouseEnter}
            onMouseLeave={handleCardMouseLeave}
            initial={{ 
              opacity: 0, 
              scale: 0.95, 
              y: cardPosition.position === 'top' ? 6 : -6 
            }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'absolute',
              top: cardPosition.top,
              left: cardPosition.left,
              width: '320px',
              zIndex: 99999,
            }}
            className="pointer-events-auto"
          >
              <div 
                onClick={handleCardClick}
                className="bg-white/95 dark:bg-slate-905/95 dark:bg-slate-950/98 backdrop-blur-md rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-[0_20px_50px_rgba(0,0,0,0.12)] text-left overflow-hidden transition-colors duration-300 cursor-pointer hover:border-blue-500/30 group"
              >
                {/* Visual Accent Colored Header Bar */}
                <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 w-full" />
                
                {loading ? (
                  /* Loading Shimmer State */
                  <div className="p-5 space-y-4">
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-2/3" />
                        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-1/3" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-full" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse w-4/5" />
                    </div>
                  </div>
                ) : (
                  /* Card Body Details */
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img 
                            src={getUserAvatar(profile)} 
                            alt={getDisplayName(profile)}
                            className="w-[48px] h-[48px] rounded-xl object-cover border border-slate-200/50 dark:border-slate-800 ring-2 ring-slate-100 dark:ring-slate-900 group-hover:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                          />
                          {profile?.status === 'Active' && (
                            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-[3px] border-white dark:border-slate-950 rounded-full shadow-md animate-pulse"></span>
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-1.5">
                            {getDisplayName(profile)}
                            {profile?.role === 'Admin' && <Shield className="w-3.5 h-3.5 text-blue-500" />}
                          </h4>
                          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            {getDisplayUsername(profile)}
                          </p>
                        </div>
                      </div>

                      {/* Badge in top corner */}
                      {profile?.role && (
                        <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-widest ${
                          profile.role === 'Admin' 
                            ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' 
                            : profile.role === 'Moderator' 
                            ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}>
                          {profile.role}
                        </span>
                      )}
                    </div>

                    {/* Bio or Status description text */}
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed mb-4 line-clamp-2">
                      {profile?.email ? `İletişim: ${profile.email}` : ''}
                      {profile?.email && ' • '}
                      {profile?.isRestricted 
                        ? 'Hesap kısıtlaması aktif durumda.' 
                        : 'BotlyHub platformu üzerinde kayıtlı geliştirici ve içerik üreticisi.'}
                    </p>

                    {/* User Quick Info Stats Row */}
                    <div className="grid grid-cols-2 gap-2 py-2.5 px-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-white/5 mb-3">
                      <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                        <Calendar size={13} className="text-slate-400" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                          {formatDate(profile?.joinDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 justify-end">
                        <Award size={13} className="text-amber-500" />
                        <span className="text-[10px] font-extrabold uppercase tracking-wide text-slate-700 dark:text-slate-300">
                          {profile?.is_premium || profile?.badges?.includes('Premium') ? 'PREMIUM ÜYE' : 'STANDART ÜYE'}
                        </span>
                      </div>
                    </div>

                    {/* Footer Action details indicator */}
                    <div className="flex items-center justify-between text-blue-500 dark:text-blue-400 text-[10px] font-extrabold tracking-widest uppercase">
                      <span className="flex items-center gap-1 group-hover:text-amber-500 transition-colors">
                        <Sparkles size={11} />
                        AKTİFLİK: {profile?.status === 'Active' ? 'YÜKSEK' : 'PASİF'}
                      </span>
                      <span className="flex items-center gap-1 group-hover:translate-x-1.5 transition-transform duration-300">
                        PROFİLİ GÖR <ExternalLink size={10} />
                      </span>
                    </div>
                  </div>
                )}
              </div>
          </motion.div>
        ),
        document.body
      )}
    </>
  );
};

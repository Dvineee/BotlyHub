import React, { useState } from 'react';

// Standard pulsing skeleton for single blocks
export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-slate-200 dark:bg-slate-800/80 animate-pulse rounded-xl ${className}`} />
);

// Pulsing text lines skeleton
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ lines = 3, className = '' }) => (
  <div className={`flex flex-col gap-3.5 w-full ${className}`}>
    {Array.from({ length: lines }).map((_, i) => {
      // Vary width for a natural text shape
      const widthClass = i === lines - 1 ? 'w-3/5' : i % 2 === 0 ? 'w-full' : 'w-4/5';
      return (
        <div key={i} className={`h-4 bg-slate-200 dark:bg-slate-800/80 animate-pulse rounded-md ${widthClass}`} />
      );
    })}
  </div>
);

// Image Loader component that shows a pulsing shimmer skeleton until fully loaded, then smoothly fades in
interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  skeletonClass?: string;
  containerClass?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt = '',
  className = '',
  skeletonClass = '',
  containerClass = '',
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative overflow-hidden ${containerClass}`}>
      {!isLoaded && !hasError && (
        <div className={`absolute inset-0 bg-slate-200 dark:bg-slate-800/80 animate-pulse ${skeletonClass}`} />
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} transition-all duration-500 ease-out ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95 blur-[2px]'}`}
        onLoad={() => setIsLoaded(true)}
        onError={(e) => {
          setHasError(true);
          setIsLoaded(true);
          if (onError) onError(e);
        }}
        {...props}
      />
    </div>
  );
};

// Full-Page Skeletons to replace boring spinners

// 1. Home Page Loading Skeleton
export const HomeSkeleton = () => (
  <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 px-5 sm:px-8 py-6 flex flex-col gap-8 max-w-7xl mx-auto overflow-hidden">
    {/* Main Promo Banner/Carousel Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-6">
      <div className="md:col-span-2 h-[220px] bg-slate-200 dark:bg-slate-900/60 rounded-[2rem] p-6 flex flex-col gap-4 justify-between">
        <div className="flex flex-col gap-3">
          <Skeleton className="w-1/3 h-6" />
          <Skeleton className="w-2/3 h-8" />
          <Skeleton className="w-1/2 h-4" />
        </div>
        <Skeleton className="w-[120px] h-10 rounded-xl" />
      </div>
      <div className="hidden md:flex flex-col h-[220px] bg-slate-100 dark:bg-slate-900/65 rounded-[2rem] p-6 justify-between">
        <div className="flex flex-col gap-3">
          <Skeleton className="w-1/2 h-5" />
          <Skeleton className="w-full h-7" />
        </div>
        <Skeleton className="w-[100px] h-9 rounded-xl" />
      </div>
    </div>

    {/* Section / Category Filters Skeleton */}
    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-none w-full">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-[110px] rounded-xl shrink-0" />
      ))}
    </div>

    {/* Bots Grid Loading Skeleton */}
    <div className="flex flex-col gap-6 w-full">
      <div className="flex justify-between items-center">
        <Skeleton className="w-[200px] h-7" />
        <Skeleton className="w-[80px] h-5" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-4 border border-slate-200/50 dark:border-slate-900/40 p-5 rounded-[2rem] bg-slate-100 dark:bg-slate-900/30">
            <div className="flex gap-4 items-center">
              <Skeleton className="w-14 h-14 rounded-2xl" />
              <div className="flex flex-col gap-2 flex-1">
                <Skeleton className="w-3/4 h-5" />
                <Skeleton className="w-1/2 h-3.5" />
              </div>
            </div>
            <SkeletonText lines={2} />
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200/40 dark:border-slate-800/20">
              <Skeleton className="w-[70px] h-4" />
              <Skeleton className="w-[80px] h-8 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// 2. Bot Detail Skeleton
export const BotDetailSkeleton = () => (
  <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
    {/* Banner/Header Skeleton */}
    <div className="relative h-[250px] sm:h-[300px] bg-slate-100 dark:bg-slate-900/40 border-b border-slate-200/40 dark:border-slate-850">
      <div className="absolute top-6 left-5">
        <Skeleton className="w-10 h-10 rounded-full" />
      </div>
      <div className="absolute top-6 right-5 flex gap-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <Skeleton className="w-10 h-10 rounded-xl" />
      </div>
    </div>

    {/* Content Skeleton */}
    <div className="max-w-7xl mx-auto px-5 sm:px-8 -mt-20 relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column (Main Info) */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
          <Skeleton className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl shrink-0 shadow-lg" />
          <div className="flex flex-col gap-3 flex-1 w-full">
            <div className="flex gap-3 items-center flex-wrap">
              <Skeleton className="w-[180px] h-8" />
              <Skeleton className="w-[80px] h-5 rounded-full" />
            </div>
            <Skeleton className="w-[140px] h-5" />
            <div className="flex gap-2">
              <Skeleton className="w-20 h-6 rounded-md" />
              <Skeleton className="w-24 h-6 rounded-md" />
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-4 w-full border-y border-slate-200/60 dark:border-slate-800/40 py-5">
          <Skeleton className="h-12 flex-1 rounded-2xl" />
          <Skeleton className="h-12 w-[160px] rounded-2xl" />
        </div>

        {/* Tab content skeleton */}
        <div className="flex flex-col gap-4">
          <Skeleton className="w-1/3 h-7 mb-2" />
          <SkeletonText lines={5} />
          <Skeleton className="w-full h-[200px] rounded-3xl mt-4" />
        </div>
      </div>

      {/* Right Column (Sidebar) */}
      <div className="flex flex-col gap-6">
        <div className="p-6 rounded-3xl bg-slate-100 dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-850 flex flex-col gap-5">
          <Skeleton className="w-1/2 h-6" />
          <div className="flex flex-col gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-slate-200/50 dark:border-slate-800/20 last:border-none">
                <Skeleton className="w-1/3 h-4" />
                <Skeleton className="w-[100px] h-4" />
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-slate-100 dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-850 flex flex-col gap-4">
          <Skeleton className="w-2/3 h-5" />
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex flex-col gap-1.5 flex-1">
              <Skeleton className="w-1/2 h-4" />
              <Skeleton className="w-1/3 h-3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// 3. Blog List Skeleton
export const BlogSkeleton = () => (
  <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 px-5 sm:px-8 py-10 max-w-7xl mx-auto flex flex-col gap-8">
    <div className="flex flex-col gap-3">
      <Skeleton className="w-[140px] h-5" />
      <Skeleton className="w-[280px] h-10" />
      <Skeleton className="w-2/3 max-w-[500px] h-6" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-4 bg-slate-100 dark:bg-slate-900/20 border border-slate-200/50 dark:border-slate-850/60 rounded-[2.5rem] overflow-hidden p-4">
          <Skeleton className="w-full aspect-[16/10] rounded-3xl" />
          <div className="flex flex-col gap-3 px-2 py-4">
            <div className="flex justify-between items-center">
              <Skeleton className="w-[85px] h-5 rounded-full" />
              <Skeleton className="w-[60px] h-4" />
            </div>
            <Skeleton className="w-full h-6" />
            <Skeleton className="w-4/5 h-6" />
            <SkeletonText lines={2} className="mt-2" />
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-200/40 dark:border-slate-800/30">
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="w-[100px] h-4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// 4. Q&A Forum Skeleton
export const QASkeleton = () => (
  <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 px-5 sm:px-8 py-8 max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
    {/* Left (Topics / Filter) */}
    <div className="w-full lg:w-[260px] shrink-0 flex flex-col gap-4">
      <Skeleton className="w-full h-12 rounded-2xl" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="w-full h-11 rounded-xl" />
        ))}
      </div>
    </div>

    {/* Right (Questions list) */}
    <div className="flex-1 flex flex-col gap-6">
      <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-900/30 p-4 border border-slate-200/60 dark:border-slate-850 rounded-2xl">
        <Skeleton className="w-[110px] h-5" />
        <Skeleton className="w-[150px] h-10 rounded-xl" />
      </div>

      <div className="flex flex-col gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-6 bg-slate-100 dark:bg-slate-900/20 border border-slate-200/50 dark:border-slate-850/50 rounded-3xl flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Skeleton className="w-9 h-9 rounded-full" />
                <div className="flex flex-col gap-1">
                  <Skeleton className="w-[125px] h-4" />
                  <Skeleton className="w-[75px] h-3" />
                </div>
              </div>
              <Skeleton className="w-16 h-5 rounded-full" />
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton className="w-full h-6" />
              <Skeleton className="w-11/12 h-6" />
            </div>
            <SkeletonText lines={2} className="mt-1" />
            <div className="flex items-center gap-6 mt-2 pt-4 border-t border-slate-200/30 dark:border-slate-800/25">
              <Skeleton className="w-[80px] h-5" />
              <Skeleton className="w-[80px] h-5" />
              <Skeleton className="w-[100px] h-5 ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

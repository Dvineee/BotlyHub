
import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogType?: string;
  ogImage?: string;
  twitterHandle?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  canonical,
  ogType = 'website',
  ogImage = '/og-image.png',
  twitterHandle = '@botlyhub',
}) => {
  const siteName = 'BotlyHub V3';
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const defaultDescription = 'BotlyHub V3 - Telegram bot ve kanallarını keşfetmek, tanıtmak ve yönetmek için en gelişmiş platform.';
  const currentDescription = description || defaultDescription;
  const url = window.location.origin + window.location.pathname;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={currentDescription} />
      <link rel="canonical" href={canonical || url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={currentDescription} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={currentDescription} />
      <meta name="twitter:image" content={ogImage} />
      {twitterHandle && <meta name="twitter:site" content={twitterHandle} />}

      {/* Mobile Apps */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content={siteName} />
      
      {/* Extra SEO */}
      <meta name="keywords" content="telegram bots, telegram channels, bot list, telegram directory, bot store" />
      <meta name="robots" content="index, follow" />
    </Helmet>
  );
};


import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogType?: string;
  ogImage?: string;
  twitterHandle?: string;
  articleData?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    category?: string;
    image?: string;
  };
  breadcrumbs?: {
    name: string;
    item: string;
  }[];
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  canonical,
  ogType = 'website',
  ogImage = '/og-image.png',
  twitterHandle = '@botlyhub',
  articleData,
  breadcrumbs,
}) => {
  const siteName = 'BotlyHub';
  const fullTitle = title ? `${title} | ${siteName}` : `${siteName} | Modern Telegram Bot & AI Ecosystem`;
  const defaultDescription = 'BotlyHub - Telegram botları, otomasyon sistemleri ve AI destekli servisler için yeni nesil keşif ve yönetim platformu.';
  const currentDescription = description || defaultDescription;
  const url = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : 'https://botlyhub.com';

  const schemaOrg = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "BotlyHub",
    "url": "https://botlyhub.com",
    "logo": "https://botlyhub.com/logo.png",
    "description": defaultDescription,
    "sameAs": [
      "https://twitter.com/botlyhub",
      "https://github.com/botlyhub"
    ]
  };

  const schemaWebsite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "BotlyHub",
    "url": "https://botlyhub.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://botlyhub.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const schemaArticle = articleData ? {
    "@context": "https://schema.org",
    "@type": "Article",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    },
    "headline": title,
    "image": articleData.image || ogImage,
    "author": {
      "@type": "Organization",
      "name": articleData.author || siteName
    },
    "publisher": {
      "@type": "Organization",
      "name": siteName,
      "logo": {
        "@type": "ImageObject",
        "url": "https://botlyhub.com/logo.png"
      }
    },
    "datePublished": articleData.publishedTime,
    "dateModified": articleData.modifiedTime || articleData.publishedTime
  } : null;

  const schemaBreadcrumb = breadcrumbs ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.item
    }))
  } : null;

  return (
    <Helmet>
      {/* HTML Language tag */}
      <html lang="tr" />

      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={currentDescription} />
      <link rel="canonical" href={canonical || url} />
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={currentDescription} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content="tr_TR" />
      {articleData?.publishedTime && <meta property="article:published_time" content={articleData.publishedTime} />}
      {articleData?.category && <meta property="article:section" content={articleData.category} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={currentDescription} />
      <meta name="twitter:image" content={ogImage} />
      {twitterHandle && <meta name="twitter:site" content={twitterHandle} />}

      {/* Theme and Web App */}
      <meta name="theme-color" content="#2563eb" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content={siteName} />
      
      {/* Extra SEO Labels */}
      <meta name="keywords" content="botlyhub, telegram botları, ton ecosystem, telegram automation, bot store, ai services, telegram news" />
      <meta name="author" content="BotlyHub Team" />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />

      {/* JSON-LD Schemas */}
      <script type="application/ld+json">
        {JSON.stringify(schemaOrg)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(schemaWebsite)}
      </script>
      {schemaArticle && (
        <script type="application/ld+json">
          {JSON.stringify(schemaArticle)}
        </script>
      )}
      {schemaBreadcrumb && (
        <script type="application/ld+json">
          {JSON.stringify(schemaBreadcrumb)}
        </script>
      )}
    </Helmet>
  );
};

import { Helmet } from 'react-helmet-async';

const BASE_URL = 'https://techno.dog';

// Geographic targeting priorities for SEO
const GEO_REGIONS = ['Europe', 'United Kingdom', 'North America', 'Asia', 'Latin America'];

// Core keywords for techno music SEO
const CORE_KEYWORDS = [
  'techno music', 'techno DJs', 'techno festivals', 'techno clubs', 'techno venues',
  'techno artists', 'techno labels', 'techno gear', 'DJ equipment', 'synthesizers',
  'underground techno', 'Berlin techno', 'Detroit techno', 'warehouse techno',
  'electronic music', 'dance music', 'techno culture', 'open source techno',
  'techno archive', 'techno database', 'techno community'
];

interface PageSEOProps {
  title: string;
  description: string;
  path: string;
  image?: string;
  imageWidth?: number;
  imageHeight?: number;
  imageAlt?: string;
  type?: 'website' | 'article' | 'profile' | 'product';
  noindex?: boolean;
  structuredData?: object | object[];
  // Article-specific props
  articlePublishedTime?: string;
  articleModifiedTime?: string;
  articleAuthor?: string;
  articleSection?: string;
  articleTags?: string[];
  // Additional SEO props
  keywords?: string[];
  locale?: string;
  alternateLocales?: string[];
  geoRegion?: string;
  geoPlacename?: string;
  geoPosition?: string;
}

const PageSEO = ({
  title,
  description,
  path,
  image = '/og-image.png',
  imageWidth = 1200,
  imageHeight = 630,
  imageAlt,
  type = 'website',
  noindex = false,
  structuredData,
  articlePublishedTime,
  articleModifiedTime,
  articleAuthor,
  articleSection,
  articleTags,
  keywords = [],
  locale = 'en_US',
  alternateLocales = ['en_GB', 'de_DE', 'es_ES', 'fr_FR', 'pt_BR', 'ja_JP'],
  geoRegion,
  geoPlacename,
  geoPosition,
}: PageSEOProps) => {
  const fullUrl = `${BASE_URL}${path}`;
  const imageUrl = image.startsWith('http') ? image : `${BASE_URL}${image}`;
  const fullTitle = title.includes('techno.dog') ? title : `${title} | techno.dog`;
  const altText = imageAlt || title;
  
  // Merge core keywords with page-specific keywords
  const allKeywords = [...new Set([...CORE_KEYWORDS, ...keywords])].join(', ');

  // Build Organization structured data (always included)
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "techno.dog",
    "url": BASE_URL,
    "logo": `${BASE_URL}/og-image.png`,
    "description": "Open-source archive of underground techno culture — artists, labels, festivals, venues, gear, and the ideas that shaped the sound.",
    "sameAs": [
      "https://github.com/techno-dog"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "doggy@techno.dog",
      "contactType": "customer service"
    }
  };

  // Build WebSite structured data for search
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "techno.dog",
    "url": BASE_URL,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${BASE_URL}/artists?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  // Build WebPage structured data
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": fullTitle,
    "description": description,
    "url": fullUrl,
    "isPartOf": {
      "@type": "WebSite",
      "name": "techno.dog",
      "url": BASE_URL
    },
    "inLanguage": "en",
    "about": {
      "@type": "Thing",
      "name": "Techno Music Culture"
    },
    ...(articleModifiedTime && { "dateModified": articleModifiedTime }),
    ...(articlePublishedTime && { "datePublished": articlePublishedTime })
  };

  // Combine all structured data
  const allStructuredData = [
    organizationSchema,
    ...(path === '/' ? [websiteSchema] : []),
    webPageSchema,
    ...(structuredData ? (Array.isArray(structuredData) ? structuredData : [structuredData]) : [])
  ];

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={allKeywords} />
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}
      
      {/* Author and Publisher */}
      <meta name="author" content="techno.dog" />
      <meta name="publisher" content="techno.dog" />
      <meta name="copyright" content="© 2025 techno.dog" />
      
      {/* Canonical */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Alternate Languages/Locales */}
      {alternateLocales.map(altLocale => (
        <link 
          key={altLocale} 
          rel="alternate" 
          hrefLang={altLocale.replace('_', '-').toLowerCase()} 
          href={fullUrl} 
        />
      ))}
      <link rel="alternate" hrefLang="x-default" href={fullUrl} />
      
      {/* Geographic Targeting */}
      {geoRegion && <meta name="geo.region" content={geoRegion} />}
      {geoPlacename && <meta name="geo.placename" content={geoPlacename} />}
      {geoPosition && <meta name="geo.position" content={geoPosition} />}
      <meta name="ICBM" content="52.5200, 13.4050" /> {/* Berlin - techno capital */}
      
      {/* Content Distribution */}
      <meta name="distribution" content="global" />
      <meta name="rating" content="general" />
      <meta name="revisit-after" content="7 days" />
      
      {/* Mobile Optimization */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="techno.dog" />
      
      {/* Theme Color for browsers */}
      <meta name="theme-color" content="#000000" />
      <meta name="msapplication-TileColor" content="#000000" />
      <meta name="msapplication-navbutton-color" content="#7CFC00" />
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:secure_url" content={imageUrl} />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:width" content={imageWidth.toString()} />
      <meta property="og:image:height" content={imageHeight.toString()} />
      <meta property="og:image:alt" content={altText} />
      <meta property="og:locale" content={locale} />
      {alternateLocales.map(altLocale => (
        <meta key={altLocale} property="og:locale:alternate" content={altLocale} />
      ))}
      <meta property="og:site_name" content="techno.dog" />
      <meta property="og:see_also" content={BASE_URL} />
      
      {/* Article-specific Open Graph */}
      {type === 'article' && articlePublishedTime && (
        <meta property="article:published_time" content={articlePublishedTime} />
      )}
      {type === 'article' && articleModifiedTime && (
        <meta property="article:modified_time" content={articleModifiedTime} />
      )}
      {type === 'article' && articleAuthor && (
        <meta property="article:author" content={articleAuthor} />
      )}
      {type === 'article' && articleSection && (
        <meta property="article:section" content={articleSection} />
      )}
      {type === 'article' && articleTags?.map((tag, index) => (
        <meta key={index} property="article:tag" content={tag} />
      ))}
      
      {/* Twitter/X */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@techno_dog" />
      <meta name="twitter:creator" content="@techno_dog" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:image:alt" content={altText} />
      
      {/* Pinterest */}
      <meta name="pinterest-rich-pin" content="true" />
      
      {/* LinkedIn */}
      <meta property="linkedin:owner" content="techno.dog" />
      
      {/* Schema.org structured data */}
      <script type="application/ld+json">
        {JSON.stringify(allStructuredData)}
      </script>
    </Helmet>
  );
};

export default PageSEO;

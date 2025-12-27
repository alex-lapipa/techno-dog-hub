import { Helmet } from 'react-helmet-async';

const BASE_URL = 'https://techno.dog';

interface PageSEOProps {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: 'website' | 'article' | 'profile';
  noindex?: boolean;
  structuredData?: object;
}

const PageSEO = ({
  title,
  description,
  path,
  image = '/og-image.png',
  type = 'website',
  noindex = false,
  structuredData,
}: PageSEOProps) => {
  const fullUrl = `${BASE_URL}${path}`;
  const imageUrl = image.startsWith('http') ? image : `${BASE_URL}${image}`;
  const fullTitle = title.includes('techno.dog') ? title : `${title} | techno.dog`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Canonical */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:locale" content="en_US" />
      <meta property="og:site_name" content="techno.dog" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default PageSEO;
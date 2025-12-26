import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const BASE_URL = 'https://techno.dog';

const HreflangTags = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Normalize path (remove trailing slash except for root)
  const normalizedPath = currentPath === '/' ? '' : currentPath.replace(/\/$/, '');
  
  const enUrl = `${BASE_URL}${normalizedPath || '/'}`;
  const esUrl = `${BASE_URL}/es${normalizedPath}`;

  return (
    <Helmet>
      <link rel="alternate" hrefLang="en" href={enUrl} />
      <link rel="alternate" hrefLang="es" href={esUrl} />
      <link rel="alternate" hrefLang="x-default" href={enUrl} />
    </Helmet>
  );
};

export default HreflangTags;

import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const BASE_URL = 'https://techno.dog';

const HreflangTags = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const enUrl = `${BASE_URL}${currentPath}`;
  const esUrl = `${BASE_URL}/es${currentPath}`;

  return (
    <Helmet>
      <link rel="alternate" hrefLang="en" href={enUrl} />
      <link rel="alternate" hrefLang="es" href={esUrl} />
      <link rel="alternate" hrefLang="x-default" href={enUrl} />
    </Helmet>
  );
};

export default HreflangTags;

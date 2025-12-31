/**
 * OG Configuration - Route-to-Asset Mapping
 * 
 * Maps routes to:
 * - Doggy variant (asset)
 * - Icon type
 * - Background graphism/skin
 * - Color palette
 * - Default headline/subtitle
 */

export type OGSkin = 'minimal' | 'glitch' | 'archive' | 'neon' | 'rave';

export interface OGRouteConfig {
  /** Route pattern (exact or prefix match) */
  route: string;
  /** Doggy variant slug from DogPack */
  doggy: string;
  /** Icon type for category */
  icon: 'music' | 'gear' | 'venue' | 'book' | 'film' | 'label' | 'crew' | 'news' | 'home' | 'archive' | 'api' | 'dog' | 'calendar';
  /** Visual skin/template */
  skin: OGSkin;
  /** Primary color (HSL values) */
  primaryColor: string;
  /** Accent color */
  accentColor: string;
  /** Default headline if page title not available */
  defaultHeadline: string;
  /** Default tagline */
  tagline: string;
  /** OG type */
  type: 'website' | 'article' | 'profile';
}

// Deterministic hash for consistent skin selection
export function getRouteHash(route: string): number {
  let hash = 0;
  for (let i = 0; i < route.length; i++) {
    const char = route.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Core route configurations
export const OG_ROUTE_CONFIG: OGRouteConfig[] = [
  // Homepage - uses main techno.dog logo
  {
    route: '/',
    doggy: 'logo', // Main techno.dog hexagon logo
    icon: 'home',
    skin: 'minimal',
    primaryColor: '142 71% 45%', // logo-green
    accentColor: '0 0% 100%',
    defaultHeadline: 'techno.dog',
    tagline: 'Global Techno Culture Archive',
    type: 'website'
  },
  
  // Alex Lawton Launch Letter - uses main techno.dog logo
  {
    route: '/news/article/a0000001-0001-0001-0001-000000000001',
    doggy: 'logo', // Main techno.dog hexagon logo
    icon: 'news',
    skin: 'minimal',
    primaryColor: '142 71% 45%',
    accentColor: '0 0% 100%',
    defaultHeadline: 'A Letter from the Founder',
    tagline: 'The story behind techno.dog',
    type: 'article'
  },
  
  // Artists
  {
    route: '/artists',
    doggy: 'dj',
    icon: 'music',
    skin: 'rave',
    primaryColor: '142 71% 45%',
    accentColor: '280 100% 70%',
    defaultHeadline: 'Artists',
    tagline: 'The selectors shaping the sound',
    type: 'website'
  },
  {
    route: '/artist/',
    doggy: 'techno',
    icon: 'music',
    skin: 'glitch',
    primaryColor: '142 71% 45%',
    accentColor: '0 84% 60%',
    defaultHeadline: 'Artist Profile',
    tagline: 'From the techno.dog archive',
    type: 'profile'
  },
  
  // Gear
  {
    route: '/gear',
    doggy: 'modular',
    icon: 'gear',
    skin: 'neon',
    primaryColor: '142 71% 45%',
    accentColor: '180 100% 50%',
    defaultHeadline: 'Gear Archive',
    tagline: 'The machines behind the music',
    type: 'website'
  },
  {
    route: '/gear/',
    doggy: 'synth',
    icon: 'gear',
    skin: 'neon',
    primaryColor: '142 71% 45%',
    accentColor: '60 100% 50%',
    defaultHeadline: 'Equipment',
    tagline: 'Synthesizers, drum machines, and more',
    type: 'website'
  },
  
  // Venues
  {
    route: '/venues',
    doggy: 'berghain',
    icon: 'venue',
    skin: 'archive',
    primaryColor: '142 71% 45%',
    accentColor: '0 0% 60%',
    defaultHeadline: 'Venues',
    tagline: 'Sacred spaces of the underground',
    type: 'website'
  },
  {
    route: '/venue/',
    doggy: 'underground',
    icon: 'venue',
    skin: 'glitch',
    primaryColor: '142 71% 45%',
    accentColor: '0 0% 80%',
    defaultHeadline: 'Venue Profile',
    tagline: 'Where the magic happens',
    type: 'profile'
  },
  
  // Labels
  {
    route: '/labels',
    doggy: 'vinyl',
    icon: 'label',
    skin: 'archive',
    primaryColor: '142 71% 45%',
    accentColor: '30 100% 50%',
    defaultHeadline: 'Labels',
    tagline: 'The imprints shaping the sound',
    type: 'website'
  },
  {
    route: '/label/',
    doggy: 'producer',
    icon: 'label',
    skin: 'minimal',
    primaryColor: '142 71% 45%',
    accentColor: '45 100% 50%',
    defaultHeadline: 'Label Profile',
    tagline: 'From the underground',
    type: 'profile'
  },
  
  // Festivals
  {
    route: '/festivals',
    doggy: 'summer',
    icon: 'calendar',
    skin: 'neon',
    primaryColor: '142 71% 45%',
    accentColor: '300 100% 60%',
    defaultHeadline: 'Festivals',
    tagline: 'Global techno gatherings',
    type: 'website'
  },
  
  // Collectives/Crews
  {
    route: '/crews',
    doggy: 'promoter',
    icon: 'crew',
    skin: 'rave',
    primaryColor: '142 71% 45%',
    accentColor: '200 100% 60%',
    defaultHeadline: 'Crews & Collectives',
    tagline: 'Building scenes, not just parties',
    type: 'website'
  },
  
  // Books
  {
    route: '/books',
    doggy: 'nerdy',
    icon: 'book',
    skin: 'archive',
    primaryColor: '142 71% 45%',
    accentColor: '45 80% 50%',
    defaultHeadline: 'Books',
    tagline: 'Essential reading for the scene',
    type: 'website'
  },
  {
    route: '/book/',
    doggy: 'old',
    icon: 'book',
    skin: 'minimal',
    primaryColor: '142 71% 45%',
    accentColor: '30 60% 50%',
    defaultHeadline: 'Book',
    tagline: 'From the techno.dog library',
    type: 'website'
  },
  
  // Documentaries
  {
    route: '/documentaries',
    doggy: 'curious',
    icon: 'film',
    skin: 'glitch',
    primaryColor: '142 71% 45%',
    accentColor: '0 0% 70%',
    defaultHeadline: 'Documentaries',
    tagline: 'Visual stories from the underground',
    type: 'website'
  },
  {
    route: '/documentary/',
    doggy: 'legend',
    icon: 'film',
    skin: 'archive',
    primaryColor: '142 71% 45%',
    accentColor: '0 0% 50%',
    defaultHeadline: 'Documentary',
    tagline: 'Watch the story unfold',
    type: 'website'
  },
  
  // News
  {
    route: '/news',
    doggy: 'excited',
    icon: 'news',
    skin: 'rave',
    primaryColor: '142 71% 45%',
    accentColor: '0 84% 60%',
    defaultHeadline: 'News',
    tagline: 'Fresh from the underground',
    type: 'website'
  },
  {
    route: '/news/article/',
    doggy: 'techno',
    icon: 'news',
    skin: 'minimal',
    primaryColor: '142 71% 45%',
    accentColor: '0 0% 90%',
    defaultHeadline: 'Article',
    tagline: 'techno.dog news',
    type: 'article'
  },
  
  // Technopedia
  {
    route: '/technopedia',
    doggy: 'scientist',
    icon: 'archive',
    skin: 'archive',
    primaryColor: '142 71% 45%',
    accentColor: '200 80% 50%',
    defaultHeadline: 'Technopedia',
    tagline: 'The techno encyclopedia',
    type: 'website'
  },
  
  // Doggies
  {
    route: '/doggies',
    doggy: 'party',
    icon: 'dog',
    skin: 'neon',
    primaryColor: '142 71% 45%',
    accentColor: '300 100% 70%',
    defaultHeadline: 'Techno Doggies',
    tagline: 'The pack awaits',
    type: 'website'
  },
  
  // API / Developer
  {
    route: '/developer',
    doggy: 'nerdy',
    icon: 'api',
    skin: 'minimal',
    primaryColor: '142 71% 45%',
    accentColor: '180 100% 40%',
    defaultHeadline: 'Developer API',
    tagline: 'Build with techno.dog',
    type: 'website'
  },
  
  // About
  {
    route: '/about',
    doggy: 'happy',
    icon: 'home',
    skin: 'minimal',
    primaryColor: '142 71% 45%',
    accentColor: '0 0% 100%',
    defaultHeadline: 'About',
    tagline: 'The story behind techno.dog',
    type: 'website'
  },
  
  // Manifesto
  {
    route: '/manifesto',
    doggy: 'purist',
    icon: 'archive',
    skin: 'archive',
    primaryColor: '142 71% 45%',
    accentColor: '0 0% 70%',
    defaultHeadline: 'Manifesto',
    tagline: 'What we stand for',
    type: 'website'
  },
];

// Get config for a route (supports prefix matching)
export function getOGConfigForRoute(path: string): OGRouteConfig {
  // Exact match first
  const exactMatch = OG_ROUTE_CONFIG.find(c => c.route === path);
  if (exactMatch) return exactMatch;
  
  // Prefix match (for dynamic routes like /artist/[slug])
  const prefixMatch = OG_ROUTE_CONFIG
    .filter(c => c.route.endsWith('/') && path.startsWith(c.route))
    .sort((a, b) => b.route.length - a.route.length)[0];
  
  if (prefixMatch) return prefixMatch;
  
  // Default fallback
  return OG_ROUTE_CONFIG[0]; // Homepage config as default
}

// Get deterministic skin variation for a route
export function getSkinVariation(route: string, availableSkins: OGSkin[]): OGSkin {
  const hash = getRouteHash(route);
  return availableSkins[hash % availableSkins.length];
}

// WhatsApp share URL generator
export function getWhatsAppShareUrl(url: string, title: string, description?: string): string {
  const text = description 
    ? `${title}\n\n${description}\n\n${url}`
    : `${title}\n\n${url}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

// Telegram share URL generator
export function getTelegramShareUrl(url: string, title: string): string {
  return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
}

// Twitter/X share URL generator  
export function getTwitterShareUrl(url: string, title: string): string {
  return `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
}

// LinkedIn share URL generator
export function getLinkedInShareUrl(url: string): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
}

// OG Image URL generator
export function getOGImageUrl(route: string, title?: string, version?: string): string {
  const params = new URLSearchParams();
  params.set('route', route);
  if (title) params.set('title', title);
  if (version) params.set('v', version);
  return `https://techno.dog/api/og?${params.toString()}`;
}

// Cache version for OG images (increment to bust WhatsApp cache)
export const OG_CACHE_VERSION = '1';

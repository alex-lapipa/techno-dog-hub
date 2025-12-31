import { Link } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { 
  ArrowLeft, 
  Map, 
  Home, 
  Newspaper, 
  Music2, 
  Building2, 
  Disc, 
  Users, 
  Settings, 
  BookOpen,
  ShoppingBag,
  Code,
  Shield,
  FileText
} from 'lucide-react';

const Sitemap = () => {
  const sections = [
    {
      title: 'Main',
      icon: Home,
      links: [
        { path: '/', label: 'Home' },
        { path: '/news', label: 'News' },
        { path: '/news/archive', label: 'News Archive' },
        { path: '/news/your-stories', label: 'User Stories' },
      ],
    },
    {
      title: 'Archive',
      icon: Music2,
      links: [
        { path: '/artists', label: 'Artists' },
        { path: '/artists/gallery', label: 'Artist Gallery' },
        { path: '/labels', label: 'Labels' },
        { path: '/venues', label: 'Venues' },
        { path: '/festivals', label: 'Festivals' },
        { path: '/crews', label: 'Collectives & Crews' },
        { path: '/releases', label: 'Releases' },
      ],
    },
    {
      title: 'Resources',
      icon: BookOpen,
      links: [
        { path: '/technopedia', label: 'Technopedia' },
        { path: '/gear', label: 'Gear Catalog' },
        { path: '/books', label: 'Books' },
        { path: '/documentaries', label: 'Documentaries' },
      ],
    },
    {
      title: 'Community',
      icon: Users,
      links: [
        { path: '/community', label: 'Community Hub' },
        { path: '/community/docs', label: 'Community Docs' },
        { path: '/community/leaderboard', label: 'Leaderboard' },
        { path: '/training', label: 'Training Center' },
      ],
    },
    {
      title: 'Store',
      icon: ShoppingBag,
      links: [
        { path: '/store', label: 'Shop' },
        { path: '/store/lookbook', label: 'Lookbook' },
        { path: '/store/info', label: 'Store Information' },
        { path: '/doggies', label: 'Techno Doggies' },
      ],
    },
    {
      title: 'Developers',
      icon: Code,
      links: [
        { path: '/developer', label: 'Developer Portal' },
        { path: '/api-docs', label: 'API Documentation' },
      ],
    },
    {
      title: 'Legal & Privacy',
      icon: Shield,
      links: [
        { path: '/privacy', label: 'Privacy Policy' },
        { path: '/cookies', label: 'Cookie Policy' },
        { path: '/terms', label: 'Terms of Service' },
      ],
    },
    {
      title: 'Support',
      icon: FileText,
      links: [
        { path: '/support', label: 'Support & FAQ' },
        { path: '/sound-machine', label: 'Sound Machine' },
      ],
    },
  ];

  return (
    <PageLayout
      title="Sitemap"
      description="Navigate all pages and sections of techno.dog - the global techno culture archive."
      path="/sitemap"
    >
      <div className="container mx-auto px-4 md:px-8 py-8 max-w-5xl">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 font-mono text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Map className="w-8 h-8 text-logo-green" />
            <h1 className="font-mono text-3xl md:text-4xl uppercase tracking-wider">
              Sitemap
            </h1>
          </div>
          <p className="text-muted-foreground font-mono text-sm">
            Complete navigation of all pages on techno.dog
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sections.map((section) => (
            <div key={section.title} className="border border-border p-6 bg-card">
              <div className="flex items-center gap-2 mb-4">
                <section.icon className="w-5 h-5 text-logo-green" />
                <h2 className="font-mono text-lg uppercase tracking-wider">
                  {section.title}
                </h2>
              </div>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="font-mono text-sm text-muted-foreground hover:text-logo-green transition-colors block py-1"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border space-y-4">
          <div className="bg-card/50 border border-border p-6 text-center">
            <h3 className="font-mono text-sm uppercase tracking-wider mb-2 text-logo-green">
              Google Search Console
            </h3>
            <p className="font-mono text-xs text-muted-foreground mb-3">
              Submit this URL to Google Search Console for indexing:
            </p>
            <code className="block bg-background px-4 py-2 font-mono text-sm text-foreground border border-border select-all">
              https://techno.dog/sitemap.xml
            </code>
          </div>
          <p className="font-mono text-xs text-muted-foreground text-center">
            Direct XML sitemap:{' '}
            <a 
              href="https://bshyeweljerupobpmmes.supabase.co/functions/v1/sitemap-xml" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-logo-green hover:underline"
            >
              View XML
            </a>
          </p>
        </div>
      </div>
    </PageLayout>
  );
};

export default Sitemap;

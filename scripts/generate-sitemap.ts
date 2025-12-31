/**
 * Sitemap Generator for techno.dog
 * 
 * This script generates a comprehensive sitemap.xml including:
 * - All static pages
 * - Dynamic routes (artists, venues, festivals, labels, gear, crews, books)
 * 
 * Run with: npx tsx scripts/generate-sitemap.ts
 */

import { writeFileSync } from 'fs';

const BASE_URL = 'https://techno.dog';
const TODAY = new Date().toISOString().split('T')[0];

interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

// Static pages with their priorities
const staticPages: SitemapEntry[] = [
  { loc: '/', changefreq: 'daily', priority: 1.0 },
  { loc: '/news', changefreq: 'daily', priority: 0.9 },
  { loc: '/news/archive', changefreq: 'weekly', priority: 0.6 },
  { loc: '/news/your-stories', changefreq: 'weekly', priority: 0.6 },
  { loc: '/festivals', changefreq: 'weekly', priority: 0.8 },
  { loc: '/artists', changefreq: 'weekly', priority: 0.8 },
  { loc: '/artists/gallery', changefreq: 'weekly', priority: 0.6 },
  { loc: '/venues', changefreq: 'weekly', priority: 0.8 },
  { loc: '/labels', changefreq: 'weekly', priority: 0.8 },
  { loc: '/releases', changefreq: 'weekly', priority: 0.7 },
  { loc: '/crews', changefreq: 'monthly', priority: 0.7 },
  { loc: '/gear', changefreq: 'weekly', priority: 0.7 },
  { loc: '/technopedia', changefreq: 'weekly', priority: 0.7 },
  { loc: '/books', changefreq: 'weekly', priority: 0.7 },
  { loc: '/documentaries', changefreq: 'monthly', priority: 0.6 },
  { loc: '/community', changefreq: 'weekly', priority: 0.6 },
  { loc: '/community/docs', changefreq: 'monthly', priority: 0.5 },
  { loc: '/community/leaderboard', changefreq: 'daily', priority: 0.5 },
  { loc: '/developer', changefreq: 'monthly', priority: 0.5 },
  { loc: '/api-docs', changefreq: 'monthly', priority: 0.5 },
  { loc: '/store', changefreq: 'weekly', priority: 0.7 },
  { loc: '/store/info', changefreq: 'monthly', priority: 0.4 },
  { loc: '/store/lookbook', changefreq: 'monthly', priority: 0.5 },
  { loc: '/doggies', changefreq: 'weekly', priority: 0.6 },
  { loc: '/sound-machine', changefreq: 'monthly', priority: 0.5 },
  { loc: '/support', changefreq: 'monthly', priority: 0.4 },
];

function generateSitemapXml(entries: SitemapEntry[]): string {
  const urlEntries = entries.map(entry => `  <url>
    <loc>${BASE_URL}${entry.loc}</loc>
    <lastmod>${entry.lastmod || TODAY}</lastmod>
    ${entry.changefreq ? `<changefreq>${entry.changefreq}</changefreq>` : ''}
    ${entry.priority !== undefined ? `<priority>${entry.priority.toFixed(1)}</priority>` : ''}
  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntries}
</urlset>`;
}

async function main() {
  const allEntries: SitemapEntry[] = [...staticPages];

  // Note: In a production build, you would dynamically import and iterate
  // over data files here. For now, we output the static pages sitemap.
  
  const sitemap = generateSitemapXml(allEntries);
  writeFileSync('public/sitemap.xml', sitemap);
  console.log(`✓ Generated sitemap with ${allEntries.length} URLs`);
}

main().catch(console.error);

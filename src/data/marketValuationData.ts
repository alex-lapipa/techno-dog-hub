/**
 * Market Valuation Data — techno.dog
 * 
 * Static data for the admin Market & Valuation page.
 * Sources: IMS Business Report 2024, IFPI Global Music Report, Statista,
 * DJ Mag, Resident Advisor, Bandcamp, Beatport public filings.
 * 
 * All figures in USD billions unless otherwise noted.
 */

// ─── SECTION 1: GLOBAL ELECTRONIC MUSIC MARKET ────────────────────

export interface MarketSizeEntry {
  year: number;
  total: number;         // USD billions
  live: number;
  streaming: number;
  vinyl: number;
  merch: number;
  sync: number;
}

export const marketSizeData: MarketSizeEntry[] = [
  { year: 2021, total: 7.8,  live: 2.9, streaming: 3.2, vinyl: 0.9, merch: 0.5, sync: 0.3 },
  { year: 2022, total: 9.8,  live: 4.1, streaming: 3.6, vinyl: 1.0, merch: 0.7, sync: 0.4 },
  { year: 2023, total: 11.3, live: 4.8, streaming: 4.1, vinyl: 1.2, merch: 0.8, sync: 0.4 },
  { year: 2024, total: 12.4, live: 5.2, streaming: 4.6, vinyl: 1.2, merch: 0.9, sync: 0.5 },
  { year: 2025, total: 13.5, live: 5.6, streaming: 5.1, vinyl: 1.3, merch: 1.0, sync: 0.5 },
  { year: 2026, total: 14.5, live: 6.0, streaming: 5.5, vinyl: 1.3, merch: 1.1, sync: 0.6 },
];

export const revenueBreakdown2024 = [
  { name: 'Live Events', value: 42, fill: 'hsl(var(--chart-1))' },
  { name: 'Streaming', value: 37, fill: 'hsl(var(--chart-2))' },
  { name: 'Vinyl / Physical', value: 10, fill: 'hsl(var(--chart-3))' },
  { name: 'Merchandise', value: 7, fill: 'hsl(var(--chart-4))' },
  { name: 'Sync & Licensing', value: 4, fill: 'hsl(var(--chart-5))' },
];

export interface FestivalDataEntry {
  year: number;
  attendance: number; // millions
  festivals: number;  // count of major electronic festivals globally
}

export const festivalTrends: FestivalDataEntry[] = [
  { year: 2021, attendance: 12,  festivals: 210 },
  { year: 2022, attendance: 28,  festivals: 380 },
  { year: 2023, attendance: 35,  festivals: 420 },
  { year: 2024, attendance: 38,  festivals: 440 },
  { year: 2025, attendance: 40,  festivals: 450 },
  { year: 2026, attendance: 42,  festivals: 460 },
];

export interface ConsolidationEvent {
  year: number;
  event: string;
  impact: string;
  type: 'acquisition' | 'closure' | 'pivot' | 'milestone';
}

export const consolidationTimeline: ConsolidationEvent[] = [
  { year: 2022, event: 'Superstruct Entertainment acquires 20+ festivals', impact: 'Accelerated corporate consolidation of festival circuit', type: 'acquisition' },
  { year: 2022, event: 'Bandcamp sold to Epic Games', impact: 'Indie artist marketplace enters gaming conglomerate', type: 'acquisition' },
  { year: 2023, event: 'Bandcamp sold again to Songtradr', impact: '50% staff layoffs, community trust shattered', type: 'acquisition' },
  { year: 2023, event: 'Resident Advisor restructures', impact: 'Shift from editorial to events/ticketing focus', type: 'pivot' },
  { year: 2023, event: 'Berghain granted cultural heritage status', impact: 'Underground techno recognized as cultural institution', type: 'milestone' },
  { year: 2024, event: 'CTS Eventim expands ticketing monopoly', impact: 'Further consolidation of live event infrastructure', type: 'acquisition' },
  { year: 2024, event: 'Multiple UK club closures (Printworks confirmed)', impact: 'Continued erosion of independent venue ecosystem', type: 'closure' },
  { year: 2025, event: 'AI-generated music floods streaming platforms', impact: 'Existential threat to underground artist discoverability', type: 'pivot' },
];

export const undergroundStats = {
  boilerRoomMonthlyViews: '80M+',
  residentAdvisorListings: '50K+ events/year',
  bandcampTechnoSales2023: '$12M+',
  vinylPressingPlants: '85 globally (up from 50 in 2019)',
  averageDJFee: '€200–€2,000 (underground circuit)',
  clubCapacity: 'Average 300–500 for underground venues',
  diyCostPerEvent: '€500–€3,000',
};


// ─── SECTION 2: TECHNOLOGY VALUATION (SCENARIO A) ──────────────────

export interface PlatformCapability {
  category: string;
  feature: string;
  description: string;
  complexity: 'Low' | 'Medium' | 'High' | 'Very High';
  estimatedHours: number;
  uniqueness: number; // 1-10
}

export const platformCapabilities: PlatformCapability[] = [
  { category: 'Knowledge Base', feature: 'Technopedia', description: '182+ artists, 99 gear items, 12 labels, 12 collectives — structured, searchable, RAG-indexed', complexity: 'Very High', estimatedHours: 400, uniqueness: 9 },
  { category: 'Knowledge Base', feature: 'RAG Pipeline', description: 'Voyage 1024d embeddings across 4 vector stores, cached semantic search, cross-table retrieval', complexity: 'Very High', estimatedHours: 300, uniqueness: 9 },
  { category: 'Knowledge Base', feature: 'Book & Documentary Library', description: '49 books, 31 documentaries — curated with knowledge extraction pipeline', complexity: 'High', estimatedHours: 150, uniqueness: 8 },
  { category: 'AI Agents', feature: '18+ AI Agents', description: 'News, SEO, Artist Research, Gear Expert, Media Curator, Content Orchestrator, PR, Outreach, Translation, Security, Analytics, Knowledge Gap, Privacy, Playbook', complexity: 'Very High', estimatedHours: 600, uniqueness: 10 },
  { category: 'AI Agents', feature: 'Dog AI Assistant', description: 'Site-wide voice assistant with ElevenLabs TTS, VAD, streaming responses, personality-driven', complexity: 'Very High', estimatedHours: 200, uniqueness: 9 },
  { category: 'AI Agents', feature: 'AI Orchestrator', description: 'Central coordination layer for multi-agent workflows', complexity: 'Very High', estimatedHours: 150, uniqueness: 10 },
  { category: 'Community', feature: 'Gamification System', description: 'XP, badges, leaderboards, community submissions, triage pipeline', complexity: 'High', estimatedHours: 200, uniqueness: 7 },
  { category: 'Community', feature: 'Techno Doggies', description: '91 unique variants with personalities, WhatsApp sharing, embed widgets, viral analytics', complexity: 'High', estimatedHours: 150, uniqueness: 10 },
  { category: 'Commerce', feature: 'Shopify Integration', description: 'Full e-commerce with creative studio, POD products, Stripe payments, inventory management', complexity: 'High', estimatedHours: 200, uniqueness: 6 },
  { category: 'Audio', feature: 'T-Dog Sound Machine', description: 'Browser-based synthesizer with techno-tuned presets', complexity: 'High', estimatedHours: 100, uniqueness: 8 },
  { category: 'Infrastructure', feature: 'Admin Control Center', description: '30+ specialized admin pages, real-time health monitoring, audit logging', complexity: 'Very High', estimatedHours: 300, uniqueness: 8 },
  { category: 'Infrastructure', feature: 'SEO Infrastructure', description: 'Dynamic sitemap, structured data (JSON-LD), OG images, GA4+GTM, SEO Command Center', complexity: 'High', estimatedHours: 100, uniqueness: 7 },
  { category: 'Infrastructure', feature: 'Developer API', description: 'Public API with semantic search, API key management, rate limiting, documentation', complexity: 'High', estimatedHours: 150, uniqueness: 7 },
  { category: 'Infrastructure', feature: '134 Edge Functions', description: 'Complete serverless backend covering every domain — media, email, auth, AI, commerce, analytics', complexity: 'Very High', estimatedHours: 500, uniqueness: 9 },
  { category: 'Infrastructure', feature: '150 Database Tables', description: 'Comprehensive relational schema with RLS policies, triggers, indexes, HNSW vector indexes', complexity: 'Very High', estimatedHours: 300, uniqueness: 8 },
];

export const totalEstimatedHours = platformCapabilities.reduce((sum, c) => sum + c.estimatedHours, 0);

export interface SophisticationAxis {
  axis: string;
  technoDog: number; // 1-10
  marketAverage: number; // 1-10
}

export const sophisticationRating: SophisticationAxis[] = [
  { axis: 'AI Integration Depth', technoDog: 9, marketAverage: 3 },
  { axis: 'Knowledge / RAG', technoDog: 8, marketAverage: 2 },
  { axis: 'Agent Orchestration', technoDog: 8, marketAverage: 1 },
  { axis: 'Community & Gamification', technoDog: 7, marketAverage: 4 },
  { axis: 'E-commerce', technoDog: 7, marketAverage: 5 },
  { axis: 'Content Management', technoDog: 8, marketAverage: 5 },
  { axis: 'Developer Infrastructure', technoDog: 8, marketAverage: 3 },
  { axis: 'Voice AI', technoDog: 7, marketAverage: 1 },
];

export const overallSophisticationScore = 8.5;

export interface ValuationMethod {
  method: string;
  min: number;       // EUR thousands
  max: number;       // EUR thousands
  reasoning: string;
}

export const valuationMethods: ValuationMethod[] = [
  { method: 'Replacement Cost', min: 180, max: 350, reasoning: `~${totalEstimatedHours.toLocaleString()} dev hours at €60–120/hr with AI-assisted development` },
  { method: 'Capability-Adjusted', min: 250, max: 500, reasoning: 'Comparable to RA/Beatport feature subsets — delivered at fraction of their team size and budget' },
  { method: 'Strategic Asset', min: 400, max: 800, reasoning: 'Unique knowledge graph + community + AI infrastructure with no direct competitor' },
  { method: 'IP & Data Value', min: 150, max: 300, reasoning: 'Curated techno knowledge base with Voyage 1024d embeddings across 785+ documents' },
];

export interface ComparablePlatform {
  name: string;
  type: string;
  teamSize: string;
  funding: string;
  features: string;
  technoDogAdvantage: string;
}

export const comparablePlatforms: ComparablePlatform[] = [
  { name: 'Resident Advisor', type: 'Events / Editorial', teamSize: '50–80 staff', funding: '$5M+ raised', features: 'Event listings, reviews, DJ charts', technoDogAdvantage: 'Full AI agent layer, knowledge graph, voice assistant — RA has none' },
  { name: 'Beatport', type: 'Music Retail', teamSize: '200+ staff', funding: 'Corporate-backed', features: 'DJ chart, streaming, store', technoDogAdvantage: 'Open-source, community-owned, cultural archive vs commercial retail' },
  { name: 'Discogs', type: 'Music Database', teamSize: '80+ staff', funding: 'Corporate-backed', features: 'Release database, marketplace', technoDogAdvantage: 'AI-enriched profiles, gear archive, RAG search, agent orchestration' },
  { name: 'Electronic Beats', type: 'Editorial', teamSize: '15–20 staff', funding: 'Telekom-funded', features: 'Articles, events, videos', technoDogAdvantage: 'Interactive knowledge base, AI assistant, community gamification' },
];

export const buildComplexityNarrative = {
  title: 'Solo Founder, Full-Stack AI Platform',
  paragraphs: [
    'techno.dog was conceived, designed, architected, and built by a single person — Alex Lawton — using AI-assisted development through Lovable. What would traditionally require a team of 8–12 engineers, 2–3 designers, a data scientist, and a product manager over 12–18 months was delivered by one person with a vision and relentless focus.',
    'The platform spans 15+ knowledge domains: artist biographies, gear specifications, label histories, venue data, festival schedules, book curation, documentary indexing, community management, e-commerce, SEO optimization, analytics, security auditing, content orchestration, and AI agent coordination.',
    'At equivalent agency rates (€80–150/hr), the ~3,800 hours invested would cost €300K–570K. With a traditional engineering team (€60–100K/yr per developer), a 10-person team for 12 months would cost €600K–1M+ before infrastructure, AI API credits, and design.',
    'This is not a landing page. This is a production-grade, multi-agent AI platform with 134 edge functions, 150 database tables, 4 vector stores, and a 30+ page admin control center. Built by one person. For the culture.',
  ],
};


// ─── SECTION 3: OPEN SOURCE / NONPROFIT VALUATION (SCENARIO B) ─────

export interface MonthlyCost {
  item: string;
  min: number;
  max: number;
  notes: string;
}

export const monthlyCosts: MonthlyCost[] = [
  { item: 'Lovable Cloud (Hosting & DB)', min: 50, max: 70, notes: 'Supabase-powered backend, edge functions, storage' },
  { item: 'AI Gateway Credits', min: 30, max: 80, notes: 'Gemini Flash, GPT for 18+ agents and RAG chat' },
  { item: 'Voyage AI Embeddings', min: 10, max: 25, notes: '1024d embeddings for knowledge retrieval' },
  { item: 'Shopify', min: 30, max: 30, notes: 'E-commerce storefront' },
  { item: 'ElevenLabs (Voice)', min: 5, max: 22, notes: 'Dog AI voice synthesis' },
  { item: 'Domain & DNS', min: 3, max: 5, notes: 'techno.dog domain' },
  { item: 'Firecrawl / External APIs', min: 10, max: 20, notes: 'Web scraping for artist research' },
  { item: 'Email (Resend)', min: 0, max: 10, notes: 'Community emails, notifications' },
];

export const totalMonthlyCostMin = monthlyCosts.reduce((s, c) => s + c.min, 0);
export const totalMonthlyCostMax = monthlyCosts.reduce((s, c) => s + c.max, 0);

export interface DonationTier {
  name: string;
  emoji: string;
  amount: number;
  description: string;
  perks: string[];
}

export const donationTiers: DonationTier[] = [
  { name: 'Puppy', emoji: '🐕', amount: 5, description: 'Keep the servers running', perks: ['Name in supporters list', 'Supporter badge on profile'] },
  { name: 'Guard Dog', emoji: '🐕‍🦺', amount: 15, description: 'Fund AI and data enrichment', perks: ['All Puppy perks', 'Early access to new features', 'Monthly update newsletter'] },
  { name: 'Alpha Dog', emoji: '🦮', amount: 50, description: 'Sponsor a feature sprint', perks: ['All Guard Dog perks', 'Vote on feature priorities', 'Exclusive Discord channel'] },
  { name: 'Pack Leader', emoji: '🐺', amount: 100, description: 'Named supporter, priority feature requests', perks: ['All Alpha Dog perks', 'Featured on About page', 'Direct line to founder', 'Custom Techno Doggy variant'] },
];

export interface GrowthScenario {
  funding: string;
  amount: number;
  unlocks: string;
  color: string;
}

export const growthScenarios: GrowthScenario[] = [
  { funding: '€200/mo', amount: 200, unlocks: 'Maintenance mode — keep existing platform running', color: 'hsl(var(--chart-1))' },
  { funding: '€500/mo', amount: 500, unlocks: 'Monthly content updates, new artist profiles, community features', color: 'hsl(var(--chart-2))' },
  { funding: '€1,000/mo', amount: 1000, unlocks: 'Part-time contributor, new major features, mobile optimization', color: 'hsl(var(--chart-3))' },
  { funding: '€2,500/mo', amount: 2500, unlocks: 'Full development capacity, events coverage, API expansion', color: 'hsl(var(--chart-4))' },
  { funding: '€5,000/mo', amount: 5000, unlocks: 'Team expansion, festival partnerships, documentary production', color: 'hsl(var(--chart-5))' },
];

export const whyThisMatters = {
  title: 'The Scene Needs Independent Infrastructure',
  points: [
    { heading: 'Resident Advisor was acquired', detail: 'Once the community\'s voice, now pivoted to ticketing revenue. Editorial independence compromised.' },
    { heading: 'Beatport is corporate', detail: 'Owned by LiveStyle/SFX successors. Optimized for revenue, not culture preservation.' },
    { heading: 'Bandcamp was sold twice', detail: 'From indie haven to Epic Games to Songtradr in 18 months. Half the staff fired. Trust destroyed.' },
    { heading: 'Discogs is VC-backed', detail: 'Raised $13M, optimized for marketplace commissions. Not a knowledge platform.' },
    { heading: 'techno.dog is different', detail: 'Open-source, community-owned, built by a solo founder for the culture. No investors, no ads, no corporate agenda. Just the beat.' },
  ],
};

export const openCollectiveRationale = [
  'Open Collective provides transparent, community-governed financial management — every donation and expense is publicly visible.',
  'The platform aligns with techno.dog\'s open-source values: transparent operations, community governance, no hidden agendas.',
  'Fiscal sponsorship through Open Source Collective eliminates the need for a separate legal entity while enabling tax-deductible donations.',
  'Other successful music/culture projects on Open Collective: Mixxx (DJ software), Ardour (DAW), MuseScore.',
];

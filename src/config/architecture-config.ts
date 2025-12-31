/**
 * Architecture Blueprint Configuration
 * Living document for techno.dog website architecture
 * 
 * This config auto-updates when new pages/features are added
 */

export interface SitemapSection {
  title: string;
  description: string;
  routes: { path: string; label: string; dynamic?: boolean }[];
}

export interface UserRole {
  role: string;
  description: string;
  capabilities: string[];
}

export interface UserFlow {
  name: string;
  description: string;
  steps: string[];
  mermaidId: string;
}

export interface DataTable {
  name: string;
  description: string;
  keyFields: string[];
  relationships?: string[];
}

export interface ApiEndpoint {
  name: string;
  category: string;
  description: string;
  type: 'edge-function' | 'api' | 'webhook';
}

export interface AnalyticsEvent {
  name: string;
  trigger: string;
  data: string[];
}

// ============================================
// SITEMAP / INFORMATION ARCHITECTURE
// ============================================
export const sitemapSections: SitemapSection[] = [
  {
    title: 'Core Content',
    description: 'Main discovery and consumption pages',
    routes: [
      { path: '/', label: 'Home' },
      { path: '/news', label: 'News Feed' },
      { path: '/news/article/:id', label: 'Article Detail', dynamic: true },
      { path: '/news/archive', label: 'News Archive' },
      { path: '/news/drafts', label: 'News Drafts' },
      { path: '/news/your-stories', label: 'User Stories' },
    ],
  },
  {
    title: 'Knowledge Database',
    description: 'Structured archives of techno culture',
    routes: [
      { path: '/artists', label: 'Artists Directory' },
      { path: '/artists/gallery', label: 'Artist Gallery' },
      { path: '/artists/:id', label: 'Artist Profile', dynamic: true },
      { path: '/labels', label: 'Labels Directory' },
      { path: '/labels/:id', label: 'Label Detail', dynamic: true },
      { path: '/venues', label: 'Venues Directory' },
      { path: '/venues/:id', label: 'Venue Detail', dynamic: true },
      { path: '/festivals', label: 'Festivals Directory' },
      { path: '/festivals/:id', label: 'Festival Detail', dynamic: true },
      { path: '/crews', label: 'Collectives Directory' },
      { path: '/crews/:id', label: 'Collective Detail', dynamic: true },
      { path: '/releases', label: 'Releases Archive' },
      { path: '/gear', label: 'Gear Catalog' },
      { path: '/gear/:id', label: 'Gear Detail', dynamic: true },
    ],
  },
  {
    title: 'Technopedia & Resources',
    description: 'Educational content and curated media',
    routes: [
      { path: '/technopedia', label: 'Technopedia Encyclopedia' },
      { path: '/books', label: 'Book Library' },
      { path: '/documentaries', label: 'Documentary Archive' },
    ],
  },
  {
    title: 'Community',
    description: 'User engagement and gamification',
    routes: [
      { path: '/community', label: 'Community Hub' },
      { path: '/community/docs', label: 'Community Guidelines' },
      { path: '/community/leaderboard', label: 'XP Leaderboard' },
      { path: '/community/profile/:id', label: 'User Profile', dynamic: true },
      { path: '/my-submissions', label: 'My Submissions' },
      { path: '/training', label: 'Training Center' },
    ],
  },
  {
    title: 'Techno Doggies',
    description: 'Viral mascot ecosystem',
    routes: [
      { path: '/doggies', label: 'Doggies Gallery' },
      { path: '/doggy-widget', label: 'Embeddable Widget' },
    ],
  },
  {
    title: 'Store & Support',
    description: 'Commerce and supporter systems',
    routes: [
      { path: '/store', label: 'Store' },
      { path: '/store/lookbook', label: 'Lookbook' },
      { path: '/store/info', label: 'Store Info' },
      { path: '/support', label: 'Support & FAQ' },
      { path: '/sound-machine', label: 'Sound Machine' },
    ],
  },
  {
    title: 'Developer',
    description: 'API and integration resources',
    routes: [
      { path: '/developer', label: 'Developer Portal' },
      { path: '/api-docs', label: 'API Documentation' },
    ],
  },
  {
    title: 'Legal',
    description: 'Compliance and policies',
    routes: [
      { path: '/privacy', label: 'Privacy Policy' },
      { path: '/terms', label: 'Terms of Service' },
      { path: '/cookies', label: 'Cookie Policy' },
    ],
  },
  {
    title: 'Admin Core',
    description: 'Administrative control center',
    routes: [
      { path: '/admin', label: 'Admin Dashboard' },
      { path: '/admin/control-center', label: 'Control Center' },
      { path: '/admin/users', label: 'User Management' },
      { path: '/admin/submissions', label: 'Submissions Queue' },
      { path: '/admin/moderation', label: 'Moderation' },
      { path: '/admin/audit', label: 'Audit Log' },
      { path: '/admin/media', label: 'Media Manager' },
      { path: '/admin/changelog', label: 'Changelog' },
    ],
  },
  {
    title: 'AI Agents',
    description: 'Autonomous content and system agents',
    routes: [
      { path: '/admin/news-agent', label: 'News Agent' },
      { path: '/admin/artist-research', label: 'Artist Research Agent' },
      { path: '/admin/artist-label-agent', label: 'Artist-Label Agent' },
      { path: '/admin/labels-agent', label: 'Labels Agent' },
      { path: '/admin/gear-expert', label: 'Gear Expert Agent' },
      { path: '/admin/media-curator', label: 'Media Curator' },
      { path: '/admin/translation-agent', label: 'Translation Agent' },
      { path: '/admin/doggy-orchestrator', label: 'Doggy Orchestrator' },
      { path: '/admin/content-orchestrator', label: 'Content Orchestrator' },
      { path: '/admin/ai-orchestrator', label: 'AI Orchestrator' },
    ],
  },
  {
    title: 'System Monitoring',
    description: 'Health and security monitoring',
    routes: [
      { path: '/admin/health', label: 'System Health' },
      { path: '/admin/health-monitor', label: 'Health Monitor' },
      { path: '/admin/api-guardian', label: 'API Guardian' },
      { path: '/admin/security-auditor', label: 'Security Auditor' },
      { path: '/admin/data-integrity', label: 'Data Integrity' },
      { path: '/admin/analytics-reporter', label: 'Analytics Reporter' },
    ],
  },
];

// ============================================
// USER ROLES MATRIX
// ============================================
export const userRoles: UserRole[] = [
  {
    role: 'Anonymous User',
    description: 'Unauthenticated visitor browsing the site',
    capabilities: [
      'Browse all public content (artists, labels, venues, etc.)',
      'Read news articles and Technopedia',
      'View and share Techno Doggies',
      'Use Sound Machine',
      'Access developer documentation',
      'Submit community contributions (email required)',
    ],
  },
  {
    role: 'Registered Member',
    description: 'Authenticated community member',
    capabilities: [
      'All anonymous user capabilities',
      'Track personal submissions',
      'Earn XP and badges',
      'Appear on leaderboards',
      'Access training center',
      'Create user profile',
      'Refer new members',
      'Subscribe to newsletter',
    ],
  },
  {
    role: 'Supporter',
    description: 'Paying subscriber via Stripe',
    capabilities: [
      'All member capabilities',
      'Early access to new features',
      'Supporter badge',
      'Priority support',
      'Access to exclusive content',
    ],
  },
  {
    role: 'Creator/Curator',
    description: 'Trusted contributor with elevated permissions',
    capabilities: [
      'All supporter capabilities',
      'Submit content directly (bypass triage)',
      'Edit certain database entries',
      'Curate content sections',
    ],
  },
  {
    role: 'Admin',
    description: 'Full system access',
    capabilities: [
      'All capabilities',
      'Access admin dashboard',
      'Run AI agents',
      'Manage users and roles',
      'Review audit logs',
      'Moderate content',
      'Configure system settings',
      'View analytics and reports',
    ],
  },
];

// ============================================
// CORE USER FLOWS
// ============================================
export const userFlows: UserFlow[] = [
  {
    name: 'Discovery Flow',
    description: 'User discovers content through browsing or search',
    mermaidId: 'discovery',
    steps: [
      'User lands on homepage or direct link',
      'Browses category (artists/labels/venues)',
      'Uses search or filters',
      'Views detail page',
      'Explores related content',
      'Shares or bookmarks',
    ],
  },
  {
    name: 'Signup & Login',
    description: 'User creates account or authenticates',
    mermaidId: 'auth',
    steps: [
      'User clicks signup/login',
      'Enters email',
      'Receives magic link or enters password',
      'Email auto-confirmed',
      'Profile created in community_profiles',
      'Redirected to intended page',
    ],
  },
  {
    name: 'Support/Subscription',
    description: 'User becomes a paying supporter',
    mermaidId: 'payment',
    steps: [
      'User visits /support',
      'Selects tier or custom amount',
      'Redirected to Stripe Checkout',
      'Completes payment',
      'Webhook updates supporters table',
      'User receives confirmation email',
      'Badge applied to profile',
    ],
  },
  {
    name: 'Content Consumption',
    description: 'Deep engagement with site content',
    mermaidId: 'consume',
    steps: [
      'User opens content page',
      'Views embedded media (YouTube, images)',
      'Reads descriptions and metadata',
      'Interacts with Dog Agent for Q&A',
      'Clicks external links (Spotify, Discogs)',
      'Analytics event tracked',
    ],
  },
  {
    name: 'Content Submission',
    description: 'User contributes new content',
    mermaidId: 'submit',
    steps: [
      'User accesses submission form',
      'Fills entity type and details',
      'Uploads supporting media',
      'Submits with consent checkbox',
      'Entry added to community_submissions',
      'Admin receives notification',
      'Triage agent reviews',
      'If approved: merged to main DB',
      'User notified and XP awarded',
    ],
  },
  {
    name: 'Community Interaction',
    description: 'User engages with gamification features',
    mermaidId: 'community',
    steps: [
      'User views leaderboard',
      'Checks own profile and XP',
      'Shares doggies (earns XP)',
      'Refers friends',
      'Completes training modules',
      'Earns badges',
    ],
  },
  {
    name: 'Support/Contact',
    description: 'User seeks help or contacts team',
    mermaidId: 'support',
    steps: [
      'User visits /support',
      'Browses FAQ accordion',
      'Uses Dog Agent for questions',
      'Submits contact form if needed',
      'Receives email response',
    ],
  },
];

// ============================================
// DATA MODEL
// ============================================
export const dataTables: DataTable[] = [
  // Content
  { name: 'canonical_artists', description: 'Master artist records with RAG-enriched data', keyFields: ['artist_id', 'canonical_name', 'slug', 'photo_url'] },
  { name: 'artist_profiles', description: 'Multi-source profile data per artist', keyFields: ['profile_id', 'artist_id', 'source_system'] },
  { name: 'labels', description: 'Record label directory', keyFields: ['id', 'name', 'country'] },
  { name: 'venues', description: 'Club and venue database', keyFields: ['id', 'name', 'city', 'country'] },
  { name: 'festivals', description: 'Festival database', keyFields: ['id', 'name', 'country'] },
  { name: 'collectives', description: 'Crews and collectives', keyFields: ['id', 'collective_name', 'city'] },
  { name: 'gear_catalog', description: 'Equipment database', keyFields: ['id', 'name', 'brand', 'category'] },
  { name: 'books', description: 'Curated book library', keyFields: ['id', 'title', 'author', 'category_id'] },
  { name: 'documentaries', description: 'Documentary archive', keyFields: ['id', 'title', 'director'] },
  
  // News & Content
  { name: 'td_news_articles', description: 'AI-generated news articles', keyFields: ['id', 'title', 'status', 'published_at'] },
  { name: 'td_knowledge_entities', description: 'Knowledge graph entities', keyFields: ['id', 'entity_type', 'name'] },
  
  // Users & Community
  { name: 'community_profiles', description: 'Extended user profiles', keyFields: ['id', 'user_id', 'email', 'total_points'], relationships: ['auth.users'] },
  { name: 'referrals', description: 'Referral tracking', keyFields: ['id', 'referrer_id', 'referred_email'], relationships: ['community_profiles'] },
  { name: 'supporters', description: 'Stripe subscription data', keyFields: ['id', 'user_id', 'stripe_customer_id', 'support_mode'] },
  { name: 'badges', description: 'Achievement definitions', keyFields: ['id', 'slug', 'name', 'unlock_criteria'] },
  { name: 'community_submissions', description: 'User-submitted content queue', keyFields: ['id', 'entity_type', 'status', 'email'] },
  
  // Doggies
  { name: 'doggy_variants', description: 'Doggy character definitions', keyFields: ['id', 'name', 'personality', 'svg_content'] },
  { name: 'doggy_analytics', description: 'Share/download tracking', keyFields: ['id', 'variant_id', 'action_type'] },
  { name: 'doggy_share_leaderboard', description: 'Sharing gamification', keyFields: ['id', 'display_name', 'share_count'] },
  
  // System
  { name: 'analytics_events', description: 'All user events', keyFields: ['id', 'event_type', 'event_name', 'metadata'] },
  { name: 'agent_status', description: 'AI agent health tracking', keyFields: ['id', 'agent_name', 'status', 'last_run_at'] },
  { name: 'agent_reports', description: 'Agent findings and alerts', keyFields: ['id', 'agent_name', 'severity', 'title'] },
  { name: 'changelog_entries', description: 'Project changelog', keyFields: ['id', 'version', 'category', 'title'] },
  { name: 'api_keys', description: 'Developer API keys', keyFields: ['id', 'user_id', 'prefix', 'scopes'] },
  { name: 'dog_agent_config', description: 'AI model routing config', keyFields: ['id', 'use_groq_for_simple', 'use_gpt5_for_complex'] },
];

// ============================================
// API / EDGE FUNCTIONS
// ============================================
export const apiEndpoints: ApiEndpoint[] = [
  // AI Agents
  { name: 'dog-agent', category: 'AI', description: 'Multi-model conversational AI with 4-tier routing', type: 'edge-function' },
  { name: 'dog-agent-stream', category: 'AI', description: 'SSE streaming responses for Dog Agent', type: 'edge-function' },
  { name: 'dog-voice', category: 'AI', description: 'Voice synthesis via ElevenLabs', type: 'edge-function' },
  { name: 'elevenlabs-scribe-token', category: 'AI', description: 'Voice transcription token', type: 'edge-function' },
  { name: 'rag-chat', category: 'AI', description: 'RAG-powered semantic search chat', type: 'edge-function' },
  
  // Content Research
  { name: 'artist-research', category: 'Research', description: 'Firecrawl-based artist data enrichment', type: 'edge-function' },
  { name: 'gear-expert-agent', category: 'Research', description: 'Equipment knowledge and analysis', type: 'edge-function' },
  { name: 'documentary-curator', category: 'Research', description: 'Documentary discovery and curation', type: 'edge-function' },
  { name: 'youtube-channel-curator', category: 'Research', description: 'YouTube content curation', type: 'edge-function' },
  
  // Content Generation
  { name: 'news-agent', category: 'Content', description: 'AI news article generation', type: 'edge-function' },
  { name: 'write-article', category: 'Content', description: 'Article writing with sources', type: 'edge-function' },
  { name: 'generate-embedding', category: 'Content', description: 'Vector embedding generation', type: 'edge-function' },
  { name: 'og-image', category: 'Content', description: 'Dynamic OG image generation', type: 'edge-function' },
  { name: 'sitemap-xml', category: 'Content', description: 'Dynamic XML sitemap', type: 'edge-function' },
  
  // Orchestration
  { name: 'content-orchestrator', category: 'Orchestration', description: 'Content publishing automation', type: 'edge-function' },
  { name: 'doggy-orchestrator', category: 'Orchestration', description: 'Doggy system management', type: 'edge-function' },
  { name: 'ai-orchestration', category: 'Orchestration', description: 'Multi-agent coordination', type: 'edge-function' },
  
  // Infrastructure
  { name: 'health-monitor', category: 'Infrastructure', description: 'System health checks', type: 'edge-function' },
  { name: 'api-guardian', category: 'Infrastructure', description: 'API rate limiting and protection', type: 'edge-function' },
  { name: 'security-auditor', category: 'Infrastructure', description: 'Security scanning', type: 'edge-function' },
  { name: 'data-integrity', category: 'Infrastructure', description: 'Database consistency checks', type: 'edge-function' },
  
  // Public API
  { name: 'api-v1-search', category: 'Public API', description: 'Semantic search endpoint', type: 'api' },
  { name: 'api-v1-chunks', category: 'Public API', description: 'Document chunks retrieval', type: 'api' },
  { name: 'api-v1-docs', category: 'Public API', description: 'Documentation endpoint', type: 'api' },
  
  // Webhooks
  { name: 'stripe-webhook', category: 'Webhooks', description: 'Stripe payment events', type: 'webhook' },
  { name: 'api-webhooks', category: 'Webhooks', description: 'External webhook dispatcher', type: 'webhook' },
];

// ============================================
// ANALYTICS EVENTS
// ============================================
export const analyticsEvents: AnalyticsEvent[] = [
  { name: 'page_view', trigger: 'Route change', data: ['page_path', 'referrer'] },
  { name: 'search', trigger: 'Search submission', data: ['query', 'results_count', 'category'] },
  { name: 'entity_view', trigger: 'Detail page load', data: ['entity_type', 'entity_id', 'entity_name'] },
  { name: 'dog_agent_query', trigger: 'Chat message sent', data: ['query_length', 'model_selected', 'latency_ms'] },
  { name: 'doggy_share', trigger: 'Doggy shared', data: ['variant_id', 'platform', 'share_method'] },
  { name: 'doggy_download', trigger: 'Sticker downloaded', data: ['variant_id', 'format'] },
  { name: 'content_submission', trigger: 'Form submitted', data: ['entity_type', 'has_media'] },
  { name: 'signup', trigger: 'Account created', data: ['source', 'referral_code'] },
  { name: 'support_checkout', trigger: 'Stripe checkout started', data: ['tier', 'amount'] },
  { name: 'external_link', trigger: 'Outbound click', data: ['destination', 'context'] },
  { name: 'video_play', trigger: 'YouTube embed played', data: ['video_id', 'page_context'] },
  { name: 'training_complete', trigger: 'Module finished', data: ['module_id', 'score'] },
];

// ============================================
// MERMAID DIAGRAMS
// ============================================
export const mermaidDiagrams = {
  sitemap: `graph TD
    subgraph Public["🌐 Public"]
      HOME[Home] --> NEWS[News]
      HOME --> ARTISTS[Artists]
      HOME --> LABELS[Labels]
      HOME --> VENUES[Venues]
      HOME --> FESTIVALS[Festivals]
      HOME --> CREWS[Collectives]
      HOME --> GEAR[Gear]
      HOME --> TECHNOPEDIA[Technopedia]
      HOME --> BOOKS[Books]
      HOME --> DOCS[Documentaries]
      HOME --> DOGGIES[Doggies]
      HOME --> STORE[Store]
      HOME --> SUPPORT[Support]
      HOME --> DEVELOPER[Developer]
    end
    
    subgraph Community["👥 Community"]
      COMMUNITY[Hub] --> LEADERBOARD[Leaderboard]
      COMMUNITY --> PROFILE[Profile]
      COMMUNITY --> TRAINING[Training]
      COMMUNITY --> SUBMISSIONS[My Submissions]
    end
    
    subgraph Admin["🔧 Admin"]
      ADMIN[Dashboard] --> CONTROL[Control Center]
      ADMIN --> USERS[Users]
      ADMIN --> AGENTS[AI Agents]
      ADMIN --> MONITORING[Monitoring]
      AGENTS --> NEWS_AGENT[News]
      AGENTS --> ARTIST_AGENT[Artist Research]
      AGENTS --> MEDIA_CURATOR[Media Curator]
      AGENTS --> ORCHESTRATORS[Orchestrators]
    end
    
    HOME --> COMMUNITY
    ADMIN -.->|Auth Required| COMMUNITY`,

  systemArchitecture: `graph TB
    subgraph Client["📱 Frontend"]
      REACT[React 18 + Vite]
      UI[Shadcn/ui + Tailwind]
      STATE[Zustand + React Query]
    end
    
    subgraph Backend["☁️ Lovable Cloud"]
      EDGE[Edge Functions x110]
      DB[(PostgreSQL)]
      AUTH[Auth]
      STORAGE[Storage]
      REALTIME[Realtime]
    end
    
    subgraph AI["🤖 AI Layer"]
      ROUTER[Model Router]
      GEMINI[Gemini 2.5/3]
      GPT5[GPT-5]
      GROQ[Groq LPU]
    end
    
    subgraph External["🔗 External"]
      STRIPE[Stripe]
      ELEVEN[ElevenLabs]
      FIRECRAWL[Firecrawl]
      YOUTUBE[YouTube API]
      GA4[GA4 + GTM]
    end
    
    REACT --> EDGE
    REACT --> DB
    REACT --> AUTH
    EDGE --> DB
    EDGE --> ROUTER
    ROUTER --> GEMINI
    ROUTER --> GPT5
    ROUTER --> GROQ
    EDGE --> STRIPE
    EDGE --> ELEVEN
    EDGE --> FIRECRAWL
    EDGE --> YOUTUBE
    REACT --> GA4`,

  authFlow: `sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as Auth
    participant DB as Database
    participant E as Email
    
    U->>F: Click Login/Signup
    F->>A: signInWithOtp(email)
    A->>E: Send Magic Link
    E->>U: Email with link
    U->>A: Click magic link
    A->>A: Verify token
    A->>DB: Create/update user
    A->>F: Return session
    F->>DB: Create community_profile
    F->>U: Redirect to dashboard`,

  paymentFlow: `sequenceDiagram
    participant U as User
    participant F as Frontend
    participant E as Edge Function
    participant S as Stripe
    participant DB as Database
    
    U->>F: Select support tier
    F->>E: stripe-support(tier)
    E->>S: Create Checkout Session
    S->>E: Return session URL
    E->>F: Redirect URL
    F->>S: Redirect to Stripe
    U->>S: Complete payment
    S->>E: Webhook: payment_success
    E->>DB: Update supporters table
    E->>U: Confirmation email`,

  dataFlow: `graph LR
    subgraph Sources["📥 Sources"]
      RA[Resident Advisor]
      WIKI[Wikipedia]
      DISCOGS[Discogs]
      YT[YouTube]
      USER[User Submissions]
    end
    
    subgraph Processing["⚙️ Processing"]
      FIRECRAWL[Firecrawl Scrape]
      EMBED[Embedding Gen]
      VALIDATE[Validation]
      TRIAGE[AI Triage]
    end
    
    subgraph Storage["💾 Storage"]
      CANONICAL[canonical_artists]
      PROFILES[artist_profiles]
      DOCS[artist_documents]
      VECTORS[Embeddings]
    end
    
    subgraph Output["📤 Output"]
      RAG[RAG Search]
      API[Public API]
      PAGES[Detail Pages]
    end
    
    Sources --> Processing
    Processing --> Storage
    Storage --> Output`,
};

// ============================================
// METADATA
// ============================================
export const architectureMetadata = {
  lastUpdated: new Date().toISOString(),
  version: '1.0.0',
  stats: {
    totalPages: 100,
    edgeFunctions: 110,
    databaseTables: 150,
    aiAgents: 18,
    artists: 182,
    labels: 12,
    gear: 99,
    books: 49,
    documentaries: 31,
    doggies: 91,
    collectives: 12,
  },
};

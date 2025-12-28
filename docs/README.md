# techno.dog Architecture Overview

## Project Structure

```
techno.dog/
├── docs/                           # Documentation
│   ├── PLATFORM_REFACTOR_PLAN.md  # Refactoring roadmap
│   └── README.md                   # This file
├── public/                         # Static assets
│   ├── downloads/                  # Downloadable assets
│   └── knowledge/                  # Static knowledge files
├── src/                            # Frontend source
│   ├── assets/                     # Images and media
│   ├── components/                 # React components
│   │   ├── admin/                  # Admin-specific
│   │   ├── api-docs/               # API documentation
│   │   ├── audio/                  # Audio players
│   │   ├── community/              # Community widgets
│   │   ├── gamification/           # XP, badges, streaks
│   │   ├── social/                 # Social sharing
│   │   ├── store/                  # E-commerce
│   │   └── ui/                     # Shadcn/Radix components
│   ├── contexts/                   # React contexts
│   ├── data/                       # Static data (legacy)
│   ├── hooks/                      # Custom hooks
│   ├── integrations/               # External integrations
│   │   └── supabase/               # Supabase client & types
│   ├── lib/                        # Utility functions
│   ├── pages/                      # Route pages
│   └── stores/                     # Zustand stores
└── supabase/                       # Backend
    └── functions/                  # Edge functions
        └── _shared/                # Shared utilities
```

## Technology Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + custom design tokens
- **UI Components**: Shadcn/ui (Radix primitives)
- **State Management**: 
  - React Context (auth, i18n)
  - Zustand (cart, UI state)
  - React Query (server state)
- **Routing**: React Router v6
- **SEO**: React Helmet Async

### Backend
- **Platform**: Supabase (via Lovable Cloud)
- **Database**: PostgreSQL
- **Auth**: Supabase Auth
- **Edge Functions**: Deno
- **Storage**: Supabase Storage
- **AI**: Lovable AI Gateway (OpenAI, Anthropic)

### Integrations
- **E-commerce**: Shopify Storefront API
- **Payments**: Stripe
- **Email**: Resend

---

## Key Patterns

### 1. Page Structure
All pages follow a consistent structure:
```tsx
import PageSEO from "@/components/PageSEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PageName = () => {
  return (
    <>
      <PageSEO title="..." description="..." />
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12 pt-24">
          {/* Content */}
        </main>
        <Footer />
      </div>
    </>
  );
};
```

### 2. Data Fetching
Use React Query for server state:
```tsx
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const useArtists = () => useQuery({
  queryKey: ['artists'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('dj_artists')
      .select('*')
      .order('rank');
    if (error) throw error;
    return data;
  }
});
```

### 3. Authentication
```tsx
import { useAuth } from '@/hooks/useAuth';

const Component = () => {
  const { user, isAdmin, signOut } = useAuth();
  
  if (!user) return <Navigate to="/admin" />;
  if (!isAdmin) return <AccessDenied />;
  
  return <AdminContent />;
};
```

### 4. Edge Functions
```typescript
import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';
import { createServiceClient } from '../_shared/supabase.ts';

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;
  
  try {
    const supabase = createServiceClient();
    // ... logic
    return jsonResponse({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return errorResponse(error.message);
  }
});
```

---

## Design System

### Color Tokens (HSL)
```css
--background: 0 0% 4%;      /* Near black */
--foreground: 0 0% 100%;    /* White */
--primary: 0 0% 100%;       /* White */
--muted: 0 0% 10%;          /* Dark gray */
--muted-foreground: 0 0% 60%;
--logo-green: 100 100% 60%; /* Signature green */
--crimson: 348 75% 52%;     /* Accent red */
```

### Typography
- **Font**: IBM Plex Mono, Space Mono
- **Style**: Uppercase headings, wide letter-spacing
- **Sizes**: xs (0.75rem), sm (0.875rem), base (1rem)

### Components
- All UI components in `src/components/ui/`
- Based on Shadcn/ui with brutalist customization
- Custom variants: `brutalist`, `terminal`

---

## API Patterns

### Public API (v1)
```
Base URL: https://bshyeweljerupobpmmes.supabase.co/functions/v1/

Endpoints:
GET  /api-v1-ping          Health check
GET  /api-v1-search?q=...  Semantic search
GET  /api-v1-docs          Documentation
POST /api-v1-chunks        RAG chunks

Headers:
x-api-key: td_live_xxxxx
```

### Admin API
```
Base URL: https://bshyeweljerupobpmmes.supabase.co/functions/v1/admin-api

Endpoints:
GET  /artists              List artists
GET  /artists/:id          Get artist
POST /artists              Create artist
PATCH /artists/:id         Update artist
DELETE /artists/:id        Delete artist
(Similar for venues, festivals, etc.)
```

---

## Deployment

### Frontend
- Automatic via Lovable.dev
- Preview URLs for each edit
- Production deploy on publish

### Edge Functions
- Automatic deployment on code push
- Logs available in Supabase dashboard
- No manual deployment needed

### Database
- Migrations via Lovable migration tool
- Types auto-generated to `src/integrations/supabase/types.ts`

---

## Performance Best Practices

1. **Lazy Loading**: All routes except Index are lazy-loaded
2. **Image Optimization**: Use `LazyImage` component
3. **Code Splitting**: Vite handles automatically
4. **Caching**: React Query with 5-min stale time
5. **Background Effects**: `ParticleBackground` is GPU-accelerated

---

## Security

1. **RLS Policies**: All tables have Row Level Security
2. **API Keys**: Hashed, never stored in plain text
3. **Rate Limiting**: Per-key and per-IP limits
4. **Admin Auth**: Separate session with 24h expiry
5. **CORS**: Properly configured for all edge functions

---

## Contributing

### Code Style
- TypeScript strict mode
- Functional components only
- Hooks for state and side effects
- Tailwind for styling (no inline styles)

### Naming Conventions
- Components: PascalCase
- Hooks: camelCase with `use` prefix
- Files: kebab-case for utilities, PascalCase for components
- Edge functions: kebab-case folders

### Commits
- Automatic via Lovable edits
- Each edit creates a version checkpoint

---

*Last updated: 2025-12-28*

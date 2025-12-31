# Techno Dog OG + WhatsApp Sharing System

## Overview

This system generates dynamic, branded Open Graph images for every page on techno.dog, optimized for WhatsApp sharing.

## Key Features

- **Dynamic OG Images**: Every route gets a unique 1200×630 poster-style preview
- **WhatsApp-First**: Optimized for WhatsApp's heavy caching and preview requirements
- **Brand Consistency**: Uses Techno Doggies, icons, and design system
- **5 Template Skins**: Minimal, Glitch, Archive, Neon, Rave

## Architecture

```
┌─────────────────────────────────────────────────┐
│  PageSEO Component                              │
│  - Generates og:image URL: /api/og?route=...    │
└─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│  /api/og (Edge Function Proxy)                  │
│  - Proxied via _redirects to og-image function  │
└─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│  og-image Edge Function                         │
│  - Reads og-config.ts mapping                   │
│  - Generates AI image via Lovable AI            │
│  - Returns 1200×630 PNG                         │
└─────────────────────────────────────────────────┘
```

## Configuration

### Adding a New Page

Edit `src/config/og-config.ts`:

```typescript
'/your-new-route': {
  doggy: 'oracle-doggy',      // Doggy variant to use
  icon: 'book',               // Category icon
  graphism: 'circuit',        // Background pattern
  skin: 'minimal',            // Template skin
  headline: 'Your Page Title',
  subtitle: 'Optional subtitle',
  palette: {
    primary: '#7CFC00',
    secondary: '#1a1a1a',
    accent: '#00ff88'
  }
}
```

### Available Skins

| Skin | Style | Best For |
|------|-------|----------|
| `minimal` | Clean, elegant | About, Legal pages |
| `glitch` | Distorted, rave | Events, Festivals |
| `archive` | Monochrome, vintage | Books, Documentaries |
| `neon` | High-energy, bright | Store, Featured |
| `rave` | Bold, underground | Artists, Venues |

### Available Doggies

- `hero-doggy` - Main mascot
- `vinyl-doggy` - Music/releases
- `oracle-doggy` - Knowledge/books
- `rave-doggy` - Events/festivals
- `synth-doggy` - Gear/equipment
- `identity-doggy` - About/community
- `retriever-doggy` - Archive/search
- `pack-doggy` - Collectives/crews

## Share UI Component

Use the `ShareDrawer` component on any page:

```tsx
import { ShareDrawer } from '@/components/sharing/ShareDrawer';

<ShareDrawer 
  url="https://techno.dog/artists"
  title="Techno Artists"
  description="Explore 180+ underground techno artists"
/>
```

## Testing WhatsApp Previews

### QA Dashboard

Visit `/admin/og-preview` to:
- See all route OG images
- Copy WhatsApp test links
- Preview how different platforms display the link

### Manual Testing

1. Copy your URL
2. Open [WhatsApp Web Debugger](https://developers.facebook.com/tools/debug/)
3. Enter URL and click "Debug"
4. Click "Scrape Again" to refresh cache

### Cache Busting

WhatsApp caches previews aggressively. To force refresh:

1. Add version param: `?v=2` to the URL
2. Or use Facebook's debugger to scrape again

## Troubleshooting

### Blank Preview
- Check edge function logs
- Ensure route is mapped in og-config.ts
- Verify LOVABLE_API_KEY is set

### Wrong Image
- WhatsApp cache - use debugger to refresh
- Check if custom image is overriding dynamic

### Image Too Large
- Edge function returns optimized ~1MB images
- If still too large, reduce AI prompt complexity

## Files

| File | Purpose |
|------|---------|
| `src/config/og-config.ts` | Route → asset mapping |
| `src/components/sharing/ShareDrawer.tsx` | Share UI component |
| `src/components/PageSEO.tsx` | Meta tag generation |
| `supabase/functions/og-image/index.ts` | Image generation |
| `src/pages/OGPreview.tsx` | QA dashboard |
| `public/_redirects` | /api/og proxy |

## Environment Variables

- `LOVABLE_API_KEY` - Required for AI image generation (auto-configured)

# Design System Rules — techno.dog

## MANDATORY IMAGE COMPLIANCE (ZERO TOLERANCE)

### HARDCODED RULE — IMMUTABLE
**ALL product images MUST come from ONE of these sources:**

1. **User-Uploaded Images** (`user-uploads://`)
   - Explicitly provided by the user in chat
   - Verified brand artwork (e.g., Las Querodias)

2. **Official Brand Book Assets**
   - `/public/images/` — Approved brand imagery
   - `/src/assets/doggies/` — Official Techno Doggies pack
   - `/src/assets/brand/` — techno.dog brand elements

3. **Official Mascot SVG Pack** (94 variants)
   - Stroke-based SVG only
   - No fills, no gradients, no modifications
   - Green (#00FF00) or White stroke only

4. **Shopify CDN** (`cdn.shopify.com`)
   - Existing verified product images

### FORBIDDEN SOURCES (ALWAYS REJECT)
- AI-generated mascots or brand elements
- Stock photos (Unsplash, Pexels, Shutterstock, Getty)
- Placeholder images
- Base64-encoded AI outputs
- Any unverified external URLs

### ENFORCEMENT
- Edge function `brand-image-validator` validates ALL images before use
- Products CANNOT be created with non-compliant images
- Violations logged to audit trail

---

## SHOPIFY-FIRST FORMAT REQUIREMENTS

### Image Specifications
- **Formats**: JPG, JPEG, PNG, GIF, WebP
- **Max Size**: 20MB
- **Product Images**: 2048×2048px (1:1)
- **Lifestyle Images**: 1920×1080px (16:9)
- **Thumbnails**: 400×400px

### Workflow
1. Validate image source via `brand-image-validator`
2. Convert to Shopify-supported format
3. Upload to Shopify product
4. Verify in storefront

---

## STRICT ICON & EMOJI POLICY

### Prohibited
- **ALL standard Unicode emojis** (🐕, 🔥, 🚀, ⚡, 💡, ✨, 🎉, 👋, 🎯, 💪, etc.)
- **Generic dog icons** from lucide-react (`Dog`, `PawPrint`)
- **AI-related icons** (`Bot`, `Brain`, `Sparkles`, `Wand`, `Magic`, `BotMessageSquare`)
- **External icon libraries** not in the approved list

### Approved Icons
1. **Custom Components**
   - `DogSilhouette` — The ONLY dog icon allowed site-wide
   - Custom SVG variants from `src/components/DogPack.tsx`

2. **Lucide-react** (non-AI, non-dog icons only)
   - Navigation: `ArrowLeft`, `ArrowRight`, `ChevronLeft`, `ChevronRight`, `ExternalLink`
   - Actions: `RefreshCw`, `Download`, `Upload`, `Copy`, `Share`, `Send`
   - Status: `CheckCircle`, `XCircle`, `AlertCircle`, `AlertTriangle`, `Loader2`
   - UI: `Menu`, `X`, `Settings`, `Search`, `Filter`, `Eye`, `EyeOff`
   - Data: `Database`, `FileText`, `Image`, `Music`, `Video`, `Calendar`
   - Social: `Mail`, `Globe`, `Link`
   - Organization: `Users`, `Building`, `MapPin`

3. **Approved Text Symbols**
   - `🖤` — Black heart (brand signature, use sparingly)
   - Text-based indicators: `[OK]`, `[!]`, `[X]`, `[i]`

### Implementation Guidelines

#### Frontend Components
```tsx
// ❌ WRONG
import { Dog, Bot, Brain, Sparkles } from 'lucide-react';
const icon = "🐕"; // Never use emoji strings

// ✅ CORRECT
import DogSilhouette from '@/components/DogSilhouette';
import { CheckCircle, Database } from 'lucide-react';
```

#### Database Seeds & Migrations
```sql
-- ❌ WRONG
INSERT INTO badges (icon) VALUES ('🐕'), ('🔥'), ('⚡');

-- ✅ CORRECT
INSERT INTO badges (icon) VALUES ('check'), ('flame'), ('zap');
-- Frontend maps these to approved Lucide icons
```

#### Edge Functions & Emails
```typescript
// ❌ WRONG
subject: `🎧 Your Weekly Digest`
html: `<h1>🐕 Techno Dog</h1>`

// ✅ CORRECT
subject: `Your Weekly Digest | techno.dog`
html: `<h1>Techno Dog</h1>`
```

#### Toast & Notifications
```tsx
// ❌ WRONG
toast({ title: "✅ Success!" });

// ✅ CORRECT
toast({ title: "Success", description: "Operation completed." });
```

### Rationale
1. **Brand Consistency** — Custom DogSilhouette maintains unique identity
2. **Cross-Platform Rendering** — Emojis render inconsistently across devices
3. **Accessibility** — Icon-only elements need proper labels, not emoji
4. **Professional Aesthetic** — Clean, minimal interface without visual clutter

### Enforcement
- Code review checklist includes emoji/icon audit
- Edge function `brand-image-validator` enforces image compliance
- Automated linting rules (future implementation)
- Design system documentation in `/docs/DESIGN_SYSTEM_RULES.md`

---

*Last Updated: 2025-01-23*

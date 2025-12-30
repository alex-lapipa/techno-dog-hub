# Design System Rules — techno.dog

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
- Automated linting rules (future implementation)
- Design system documentation in `/docs/DESIGN_SYSTEM_RULES.md`

---

*Last Updated: 2025-12-30*

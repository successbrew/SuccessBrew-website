# Case Study Page — Section Reference

## Page Structure & Visual Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                      NAVIGATION BAR                          │
│              (SuccessBrew branding + CTA)                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   SECTION 01: HERO                           │
│                   (Dark background)                          │
│                                                              │
│  • CASE STUDY label with accent dot                         │
│  • [OPTIONAL] Primary metric (large)                         │
│    "535% REACH GROWTH"                                      │
│  • Case study title with accent underline                   │
│    "How SuccessBrew transformed ABC Company's presence"    │
│  • Short description (optional)                              │
│  • Meta info: Client, Service, Timeline (optional)          │
│  • CTA Button: "📄 View Full Case Study PDF" (if PDF)       │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│             SECTION 02: CHALLENGE                            │
│             (Light background)                               │
│                                                              │
│  • "01 · THE CHALLENGE" label (primary color)              │
│  • "The Problem" heading                                     │
│  • Full problem description (body text)                      │
│                                                              │
│  Dependencies:                                              │
│  - Shows: Always (uses existing "problem" field)            │
│  - Content: From database                                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│          SECTION 03: BEFORE → AFTER (Optional)              │
│          (Cream background)                                  │
│                                                              │
│  ┌──────────────────┐              ┌──────────────────┐    │
│  │     BEFORE       │      →       │      AFTER       │    │
│  │                  │              │                  │    │
│  │ • Low visibility │              │ • High visibility│    │
│  │ • Unclear market │              │ • Clear position │    │
│  │ • No strategy    │              │ • Strong brand   │    │
│  └──────────────────┘              └──────────────────┘    │
│                                                              │
│  Dependencies:                                              │
│  - Shows: Only if beforeAfter.before AND beforeAfter.after │
│  - Content: From JSON field                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│             SECTION 04: STRATEGY                             │
│             (Light background)                               │
│                                                              │
│  • "02 · THE STRATEGY" label                               │
│  • "The SuccessBrew Playbook" heading                       │
│                                                              │
│  Option A: NUMBERED CARDS (if strategySteps provided)       │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                          │
│  │ 01  │ │ 02  │ │ 03  │ │ 04  │                          │
│  │ Title│ │Title│ │Title│ │Title│                          │
│  │Desc  │ │Desc │ │Desc │ │Desc │                          │
│  └─────┘ └─────┘ └─────┘ └─────┘                          │
│                                                              │
│  Option B: TEXT BLOCK (if strategySteps empty)              │
│  Strategy summary as paragraph text                          │
│                                                              │
│  Dependencies:                                              │
│  - Shows: If strategySteps OR strategy text exists         │
│  - Content: JSON array OR database text field               │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│             SECTION 05: SOLUTION (Optional)                 │
│             (Sand background)                                │
│                                                              │
│  • "03 · THE SOLUTION" label                               │
│  • "What We Built" heading                                  │
│  • Detailed solution/execution description                  │
│                                                              │
│  Dependencies:                                              │
│  - Shows: Only if solutionContent provided                  │
│  - Content: From database field                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│             SECTION 06: RESULTS                              │
│             (Light background)                               │
│                                                              │
│  • "04 · THE IMPACT" label                                 │
│  • "The Results" heading                                    │
│                                                              │
│  Option A: METRICS GRID (if resultMetrics provided)         │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐             │
│  │   535%     │ │   113K+    │ │   64K+     │             │
│  │ Reach Growth│ │ Impressions│ │ People Reach│             │
│  └────────────┘ └────────────┘ └────────────┘             │
│                                                              │
│  Option B: TEXT (if resultMetrics empty)                    │
│  Results summary as paragraph text                          │
│                                                              │
│  Dependencies:                                              │
│  - Shows: If resultMetrics OR results text exists          │
│  - Animations: Count-up on scroll (if metrics provided)     │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│         SECTION 07: TIMELINE (Optional)                     │
│         (Cream background)                                   │
│                                                              │
│  • "The Journey" label                                      │
│  • "Project Timeline" heading                               │
│                                                              │
│  ●  1. Discovery                                            │
│  │  Initial research and analysis                           │
│  │                                                           │
│  ●  2. Strategy                                             │
│  │  Content planning phase                                  │
│  │                                                           │
│  ●  3. Execution                                            │
│  │  Launch and publishing                                   │
│  │                                                           │
│  ●  4. Optimization                                         │
│     Performance refinement                                  │
│                                                              │
│  Dependencies:                                              │
│  - Shows: Only if timelineSteps array has items             │
│  - Content: From JSON array (sorted by order field)         │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│        SECTION 08: PDF CTA (Optional)                       │
│        (Light background)                                    │
│                                                              │
│  • "DEEP DIVE" label                                        │
│  • "Want the complete breakdown?" heading                   │
│  • Description text                                         │
│  • "📄 VIEW FULL CASE STUDY" button                        │
│                                                              │
│  Dependencies:                                              │
│  - Shows: Only if pdfUrl provided                           │
│  - Behavior: Opens PDF in new tab when clicked              │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│      SECTION 09: RELATED CASE STUDIES (Optional)            │
│      (Sand background)                                       │
│                                                              │
│  • "MORE SUCCESS STORIES" heading                           │
│                                                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐       │
│  │   Case Study │ │  Case Study  │ │  Case Study  │       │
│  │   Card 1     │ │   Card 2     │ │   Card 3     │       │
│  │   [Image]    │ │   [Image]    │ │   [Image]    │       │
│  │   Tag        │ │   Tag        │ │   Tag        │       │
│  │   Title      │ │   Title      │ │   Title      │       │
│  │   Results    │ │   Results    │ │   Results    │       │
│  └──────────────┘ └──────────────┘ └──────────────┘       │
│                                                              │
│  Dependencies:                                              │
│  - Shows: Only if other case studies exist                  │
│  - Content: Up to 3 related case studies                    │
│  - Links: Click to visit each case study page               │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│            SECTION 10: FINAL CTA                            │
│            (Primary color background)                        │
│                                                              │
│  • "LET'S WORK TOGETHER" label (muted)                     │
│  • "Ready to create your own success story?" heading        │
│  • CTA buttons:                                             │
│    [BOOK A STRATEGY CALL] [VIEW OUR SERVICES]              │
│                                                              │
│  Dependencies:                                              │
│  - Shows: Always                                            │
│  - Links: To strategy call booking + services page          │
│                                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      FOOTER                                  │
│                (Dark background)                             │
│          (Social links + branding)                           │
└─────────────────────────────────────────────────────────────┘
```

## Section Visibility Matrix

| Section | Show If | Field(s) | Optional | Auto-Hide |
|---------|---------|----------|----------|-----------|
| Hero | Always | title, clientName | ✓ | ✗ |
| Hero Metric | If exists | heroMetrics[0] | ✓ | ✓ |
| Challenge | Always | problem | ✗ | ✗ |
| Before/After | If both exist | beforeAfter.before & after | ✓ | ✓ |
| Strategy Cards | If array exists | strategySteps[] | ✓ | ✓ |
| Strategy Text | If array empty | strategy | ✗ | ✗ |
| Solution | If provided | solutionContent | ✓ | ✓ |
| Results Metrics | If array exists | resultMetrics[] | ✓ | ✓ |
| Results Text | If array empty | results | ✗ | ✗ |
| Timeline | If array exists | timelineSteps[] | ✓ | ✓ |
| PDF CTA | If exists | pdfUrl | ✓ | ✓ |
| Related Studies | If exist | Other case studies | ✓ | ✓ |
| Final CTA | Always | config | ✗ | ✗ |

## Color Scheme by Section

| Section | Background | Text | Accent |
|---------|-----------|------|--------|
| Navigation | Background | Ink | Primary |
| Hero | Ink (dark) | White | Accent |
| Challenge | Background | Ink | Primary |
| Before/After | Cream | Ink | Primary/Accent |
| Strategy | Background | Ink | Primary |
| Solution | Sand | Ink | Primary |
| Results | Background | Ink | Primary |
| Timeline | Cream | Ink | Primary |
| PDF CTA | Background | Ink | Primary |
| Related | Sand | Ink | Primary |
| Final CTA | Primary | White | Accent |
| Footer | Ink | White | Primary |

## Responsive Breakpoints

### Mobile (< 640px)
- Single column layouts
- Full-width sections
- Stacked metrics (1 column)
- Vertical timeline
- Touch-friendly buttons (48px min height)
- Readable text sizes (16px+ base)

### Tablet (640px - 1024px)
- 2-column grids
- Half-width sections
- 2-column metrics
- Large readable text
- Balanced whitespace

### Desktop (> 1024px)
- Max-width 1280px container (centered)
- 3-4 column grids
- 4-column metrics (if available)
- Large typography with hierarchy
- Optimal readability

## Animation Timing

| Element | Animation | Duration | Delay | Condition |
|---------|-----------|----------|-------|-----------|
| Hero | Fade-in | 0.7s | Staggered | On load |
| Sections | Fade-up | 0.7s | Staggered | On scroll |
| Cards | Fade-up + Scale | 0.6s | Staggered | On scroll |
| Metrics | Count-up | 1.4s | On view | If in viewport |
| Buttons | Hover lift | 0.3s | - | On hover |
| All | Respect | - | - | prefers-reduced-motion |

## Database Fields Used

### Required
- `id` — Case study ID (CUID)
- `title` — Case study title
- `tag` — Service category
- `imageUrl` — Hero image
- `problem` — Challenge description
- `strategy` — Strategy summary
- `results` — Results summary

### Optional Text
- `clientName` — Client name
- `description` — Short description
- `solutionContent` — Solution details
- `pdfUrl` — PDF link

### Optional JSON
- `heroMetrics` — Primary metric array
- `beforeAfter` — Before/after object
- `strategySteps` — Strategy cards array
- `resultMetrics` — Results stats array
- `timelineSteps` — Timeline steps array

## Performance Considerations

- **Lazy Loading:** Below-fold images are lazy-loaded
- **Animations:** GPU-accelerated transforms only
- **Bundle:** Minimal JS (Framer Motion only, no extra libs)
- **Fonts:** System fonts (no custom font downloads)
- **Images:** Optimized through Next.js Image component (where possible)
- **Accessibility:** Semantic HTML, proper contrast, keyboard support

## SEO Metadata

Automatically generated per case study:

```
<title>{caseStudy.title} | Case Study | Successbrew</title>
<meta name="description" content="{caseStudy.description or problem}">
<meta property="og:title" content="{caseStudy.title} | Case Study">
<meta property="og:description" content="{caseStudy.description}">
<meta property="og:image" content="{caseStudy.imageUrl}">
<meta property="og:url" content="successbrew.in/case-studies/{id}">
```

---

**This document serves as a visual reference for the case study page structure and component hierarchy.**

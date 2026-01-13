# DataBao Media Platform

A scalable, newsroom-style media platform for company-owned content publication. Inspired by nytimes.com, reimagined for enterprise news, analysis, and research.

**This is NOT a marketing site. This is a newsroom + research publication with journalistic structure.**

## Target Audience

- Executives
- Analysts
- Partners
- Employees
- External stakeholders

## Core Principles

1. **Clear separation of FACTUAL reporting vs OPINION** — Opinion content is explicitly labeled with visual indicators
2. **Strong hierarchy and scannability** — Editorial grid layouts guide reader attention
3. **Support for long-form, data-heavy content** — Chapter navigation, pull quotes, full-bleed images
4. **Editorial credibility** — Newsroom-like structure with bylines, sources, and methodology
5. **Scales to hundreds of articles** — Section landing pages with filtering and pagination

---

## Information Architecture

### Top-Level Sections

| Section | Description | Subsections |
|---------|-------------|-------------|
| **Breaking Reports** | Real-time news and alerts | Alerts, Live Updates, Short-form |
| **Company News** | Official company updates | Executive, Quarterly, Partnerships, Culture, Global |
| **Industry Insights** | Analysis and commentary | Market Trends, Competitive, Regulatory, Technology |
| **Features** | Long-form journalism | Long-form, Investigations, Case Studies |
| **Opinion** ⚠️ | Editorial content (clearly labeled) | CEO Column, Guest Voices, Expert Commentary |
| **Data & Research** | Reports and dashboards | White Papers, Benchmarks, Annual Reports, Dashboards |
| **Multimedia** | Rich media content | Video, Podcasts, Visual Stories, Infographics |
| **Events** | Company gatherings | Webinars, Talks, Conferences, Recordings |
| **Labs** | Innovation updates | Experiments, R&D, Prototypes |
| **About** | Editorial information | Policy, Methodology, Contact, Careers |

---

## File Structure

```
DataBao_media/
├── index.html                  # Homepage - editorial layout
├── css/
│   ├── base.css               # Reset, variables, typography
│   ├── layout.css             # Grid systems, header, footer
│   ├── components.css         # Story cards, buttons, forms
│   └── pages.css              # Page-specific styles
├── js/
│   └── main.js                # Navigation, search, animations
├── pages/
│   ├── article.html           # Standard article template
│   ├── opinion.html           # Opinion piece (clearly labeled)
│   └── longform.html          # Feature/long-form template
├── sections/
│   └── company-news.html      # Section landing page template
└── README.md
```

---

## Content Model

### Base Content Schema

All content types share these fields:

```javascript
{
  id: String,              // Unique identifier
  title: String,           // Headline
  slug: String,            // URL-friendly identifier
  dek: String,             // Summary/subtitle
  section: String,         // Parent section
  contentType: String,     // Type identifier
  authors: [{              // Byline(s)
    name: String,
    title: String,
    avatar: String
  }],
  tags: [String],          // Topic tags
  publishDate: Date,       // Publication timestamp
  readingTime: Number,     // Minutes to read
  body: String,            // Rich text content
  featuredImage: {         // Hero image
    url: String,
    alt: String,
    caption: String,
    credit: String
  },
  sources: [{              // References
    title: String,
    url: String
  }],
  relatedContent: [{       // Related articles
    id: String,
    title: String,
    type: String
  }]
}
```

### Content Types

| Type | Description | Additional Fields |
|------|-------------|-------------------|
| `Article` | Standard news story | — |
| `BreakingUpdate` | Time-sensitive alert | `urgency`, `expiresAt` |
| `FeatureStory` | Long-form narrative | `chapters`, `pullQuotes` |
| `OpinionPiece` | Editorial content | `isOpinion: true`, `disclaimer` |
| `ResearchReport` | Data-heavy document | `pageCount`, `downloadUrl`, `format` |
| `DataVisualization` | Interactive chart/dashboard | `embedUrl`, `dataSource` |
| `Event` | Webinar, talk, conference | `date`, `time`, `location`, `registrationUrl` |
| `MultimediaItem` | Video, podcast, infographic | `mediaType`, `duration`, `embedUrl` |

### Opinion Content Requirements

All opinion content **MUST**:
1. Have `isOpinion: true` in content model
2. Display visible "Opinion" badge in UI
3. Include disclaimer about views not representing company
4. Be styled distinctly (purple accent color)

---

## Page Templates

### 1. Homepage (`index.html`)

Editorial layout with multiple content blocks:
- Breaking ticker (dismissable)
- Hero grid (lead story + secondary + updates)
- Opinion section (clearly labeled)
- Industry insights grid
- Data & Research section
- Features & Investigations
- Company News grid
- Multimedia carousel
- Events list
- Labs section

### 2. Section Landing (`sections/*.html`)

- Section hero with title and description
- Filter/sort controls
- Featured story (large)
- Content listing with pagination
- Related sections in sidebar

### 3. Article Page (`pages/article.html`)

- Article header (section, headline, dek, byline, date)
- Hero image with caption
- Article body (rich text with figures, blockquotes)
- Tags and sources
- Share buttons
- Related content

### 4. Opinion Page (`pages/opinion.html`)

Same as article, plus:
- **Visible "Opinion" badge**
- **Purple-tinted header background**
- **Disclaimer box before content**
- Links to more opinion pieces

### 5. Long-form Feature (`pages/longform.html`)

Immersive reading experience:
- Full-bleed hero image
- Chapter navigation (sticky)
- Full-width image breaks
- Photo grids
- Pull stats
- Inline quotes with author photos
- Chapter sections

---

## Design System

### Typography

| Element | Font | Weight | Size |
|---------|------|--------|------|
| Headlines | Fraunces | 600 | 40-56px (fluid) |
| Subheads | Fraunces | 600 | 24-30px |
| Body | Inter | 400 | 15-16px |
| UI/Labels | Inter | 500-700 | 11-14px |
| Code | JetBrains Mono | 400 | 14px |

### Color Palette

```css
/* Neutrals */
--ink-900: #0d0d0d;
--ink-800: #1a1a1a;
--paper-50: #fafafa;
--paper-100: #f5f5f4;

/* Brand */
--primary-600: #1c6ba5;
--accent-500: #c73e1d;

/* Semantic */
--opinion: #6b21a8;      /* Purple - Opinion content */
--labs: #0891b2;         /* Teal - Labs section */
--live: #dc2626;         /* Red - Breaking/live */
```

### Grid System

- Max container: 1400px
- Content width: 1200px
- Reading width: 680px
- Gutter: 16-32px (fluid)

---

## JavaScript Features

- **Date display**: Auto-updates current date
- **Navigation**: Dropdown menus, mobile toggle
- **Breaking ticker**: Dismissable with session persistence
- **Search modal**: Cmd/Ctrl+K shortcut, quick links
- **Scroll animations**: Staggered reveal on scroll
- **Content tracking**: Analytics-ready click tracking
- **Article enhancements**: Reading progress, TOC, share buttons

---

## Getting Started

1. Clone or download the repository
2. Open `index.html` in a browser

No build step required — this is a static HTML/CSS/JS site.

### Local Development

For local development with live reload:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve
```

---

## Customization

### Branding

1. Update logo in masthead (`index.html` and all templates)
2. Modify colors in `css/base.css` (CSS custom properties)
3. Replace placeholder icons with real images

### Adding Content

1. Copy appropriate template (`article.html`, `opinion.html`, etc.)
2. Update content and metadata
3. Add to section listing pages
4. Update homepage if featured

### Adding Sections

1. Create new section file in `/sections/`
2. Add to primary navigation in all templates
3. Add to footer navigation
4. Create section-specific styles if needed

---

## Accessibility

- Skip links for keyboard navigation
- ARIA roles and labels on interactive elements
- Focus-visible styles
- Reduced motion support
- Semantic HTML structure
- Schema.org markup for articles

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## License

Internal use only.

---

## Editorial Policy

For questions about content guidelines, factual vs. opinion content, or editorial standards, see the [Editorial Policy](/pages/editorial-policy.html) page.

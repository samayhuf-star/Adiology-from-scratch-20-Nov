# Website Templates Module - Rebuilt

This module has been rebuilt using a templating engine approach for generating themed single-page templates.

## Architecture

- **Single Canonical Template**: `templates/template.html` - Base template with Handlebars placeholders
- **Templating Engine**: Handlebars for server-side rendering
- **Theme System**: CSS variables with predefined color palettes
- **Manifest-Based**: JSON files define content for each vertical
- **Generator Script**: Node.js script to batch-generate all templates

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Create a Manifest

Create a JSON file in `templates/manifests/` for each vertical. See `templates/manifests/lawn-care.json` for an example.

### 3. Generate Templates

```bash
npm run generate:templates
```

This will:
- Read all manifest files from `templates/manifests/`
- Generate HTML files in `dist/<slug>/index.html`
- Generate policy pages in `dist/<slug>/policies/`

### 4. Preview Locally

```bash
npm run preview:templates
```

This generates templates and starts a local server at `http://localhost:3000`

## Manifest Structure

Each manifest file should include:

```json
{
  "slug": "unique-slug",
  "title": "Business Name",
  "themeId": "green-edge",
  "hero": { ... },
  "features": { ... },
  "services": { ... },
  "testimonials": { ... },
  "cta": { ... },
  "contact": { ... },
  "footer": { ... },
  "seo": { ... },
  "policies": { ... }
}
```

See `templates/manifests/README.md` for complete documentation.

## Available Themes

- `green-edge` - Green theme (default)
- `blue-ocean` - Blue theme
- `purple-royal` - Purple theme
- `orange-fire` - Orange theme
- `teal-fresh` - Teal theme
- `red-bold` - Red theme

Themes are defined in `templates/themes.json`.

## Features

✅ **CSS Variables**: Easy theming with CSS custom properties
✅ **Responsive Design**: Mobile-first, fully responsive templates
✅ **SEO Optimized**: Meta tags, structured data (LD+JSON)
✅ **Accessibility**: Semantic HTML, proper alt tags
✅ **Policy Pages**: Auto-generated privacy and terms pages
✅ **Batch Generation**: Generate 30+ templates from manifests
✅ **Theme System**: Consistent color palettes across verticals

## Directory Structure

```
templates/
├── template.html          # Main template with Handlebars placeholders
├── policy-template.html  # Policy page template
├── themes.json           # Color palette definitions
└── manifests/            # JSON files for each vertical
    ├── lawn-care.json
    ├── plumbing.json
    └── ...

scripts/
└── generate.js           # Generator script

dist/                      # Generated output
├── lawn-care/
│   ├── index.html
│   └── policies/
│       ├── privacy.html
│       └── terms.html
└── ...
```

## Integration with React Component

The `WebsiteTemplates.tsx` component can be updated to:
1. Load manifests from `templates/manifests/`
2. Use the generator script to create previews
3. Allow users to customize manifests before generation

## Deployment

Generated templates in `dist/` can be:
- Uploaded to static hosting (S3, Netlify, Vercel)
- Served via CDN
- Integrated into existing routing

## Migration from Old System

The old system used:
- Hardcoded templates in `websiteTemplateLibrary.ts`
- React components for rendering
- Manual HTML generation

The new system:
- Uses manifest files for content
- Generates static HTML files
- Supports batch generation
- Easier to maintain and extend

## Next Steps

1. Create manifests for all 30+ verticals
2. Customize themes as needed
3. Add more template variations
4. Integrate with deployment pipeline


# gpx.photos — 3D Activity Telemetry & Digital Finish Art

**gpx.photos** transforms activity photography and GPS tracks (from Garmin, AllTrails, Wahoo, COROS, Apple Watch, etc.) into high-resolution, gallery-grade finish art featuring 3D laser-projected telemetry routes, floating glass HUD plaques, and synchronized elevation profiles.

The application runs **100% client-side** in the browser: photos and GPS coordinates are processed directly on an HTML5 canvas without requiring media to be uploaded or stored on an external server.

---

## Table of Contents
1. [Core Features & Philosophy](#core-features--philosophy)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [3D Mathematics & Canvas Rendering Pipeline](#3d-mathematics--canvas-rendering-pipeline)
5. [Telemetry & GPX Parsing](#telemetry--gpx-parsing)
6. [Monetization: Paystack & Distribution Model](#monetization-paystack--distribution-model)
7. [Environment Variables](#environment-variables)
8. [Local Development & Commands](#local-development--commands)
9. [Pre-Launch TODO Checklist](#pre-launch-todo-checklist)
10. [SEO Strategy & Growth Engine](#seo-strategy--growth-engine)
11. [Landing Page & Site Architecture Strategy](#landing-page--site-architecture-strategy)

---

## Core Features & Philosophy

- **Zero-Crop Native Aspect Ratio**: The artwork maintains 100% of the original photo aspect ratio (whether 3:2, 4:3, 16:9, or custom smartphone portrait/landscape).
- **Interactive 3D Ground Projection**: Telemetry routes are transformed in real time with continuous pitch (ground tilt), yaw (trajectory angle), and vertical elevation extrusions.
- **Privacy First**: All photo enhancements, GPX calculations, and canvas exports occur in browser memory.
- **Dual Distribution Model**:
  - **Free Social Edition ($0)**: Includes the high-impact **gpx.photos** advertising hallmark badge, designed for viral sharing across social and club feeds.
  - **Clean Master Edition ($10)**: 100% unbranded, watermark-removed 4K / 300 DPI master download unlocked via Paystack checkout.

---

## Tech Stack

- **Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Tooling**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Payment Processing**: [Paystack Inline JS SDK](https://paystack.com/docs/payments/accept-payments/) (`https://js.paystack.co/v1/inline.js`)
- **Rendering Engine**: Custom native HTML5 Canvas 2D Rendering Context with custom 3D perspective projection math.

---

## Project Structure

```text
├── index.html                  # HTML entry point, fonts, Paystack SDK & meta tags
├── package.json                # Project dependencies and npm scripts
├── vite.config.ts              # Vite configuration
├── tailwind.config.js          # Tailwind styling rules and custom font families
├── .env.example                # Template for environment variables (Paystack public key)
└── src/
    ├── main.tsx                # Application bootstrap
    ├── App.tsx                 # Root coordinator: state, tabs, high-DPI export pipeline
    ├── types/
    │   └── poster.ts           # Central TypeScript types (Strava data, spatial, HUD, elevation)
    ├── data/
    │   └── sampleRoutes.ts     # Reference activities, starter coordinates & asset paths
    ├── utils/
    │   ├── canvasRenderer.ts   # Core 3D perspective projection & multi-pass drawing engine
    │   ├── autoStyler.ts       # Vision palette analysis, mood classification & theme coordinator
    │   └── gpxParser.ts        # XML parser for GPX trackpoints, haversine metrics & elevation
    └── components/
        ├── TopBar.tsx           # Brand header, Free download & $10 checkout triggers
        ├── PosterCanvas.tsx     # Active canvas viewport with zoom and fit controls
        ├── PhotoTab.tsx         # Image upload, reference scenes & color grading atmosphere
        ├── OverlayTab.tsx       # 3-section tab: GPS Route, HUD Plaque & Elevation Ribbon
        ├── FulfillmentModal.tsx # Paystack payment modal + 1-click sandbox simulation
        └── RouteSelector.tsx    # Standalone GPX uploader & manual stats editor component
```

---

## 3D Mathematics & Canvas Rendering Pipeline

All rendering logic lives in `src/utils/canvasRenderer.ts`.

### 1. Coordinate Normalization & Projection (`projectPointToGround`)
Points from GPX tracks are normalized relative to center `(0.5, 0.5)` and transformed using a 3D perspective matrix:
1. **Yaw Rotation**: Rotates the track around the ground vertical axis:
   $$\text{rotX} = x \cos(\text{yaw}) - y \sin(\text{yaw})$$
   $$\text{rotY} = x \sin(\text{yaw}) + y \cos(\text{yaw})$$
2. **Pitch Tilt (Ground Foreshortening)**:
   $$\text{groundY} = \text{rotY} \cos(\text{pitch}) - \text{elev3D}$$
   $$\text{groundZ} = \text{rotY} \sin(\text{pitch})$$
3. **Perspective Depth Factor**:
   $$\text{depthFactor} = \frac{1}{\max(0.1, 1 + \text{groundZ} \cdot \text{perspectiveDepth})}$$
4. Smooth continuity is enforced by weighting perspective depth by $\sin(\text{pitch})$, eliminating any discontinuous jump between $0^\circ$ (overhead 2D) and $1^\circ$ (tilted 3D).

### 2. Multi-Pass Rendering Layers
The canvas draws elements in strict visual depth order:
- **Layer 1: Base Photography**: Draws image scaled to cover the uncropped canvas, applying brightness, contrast, and color grading LUTs.
- **Layer 2: Ground Contact Drop Shadow**: Soft ambient occlusion shadow anchored at contact points ($\text{elev} = 0$), plus dashed vertical drop tethers for elevated routes.
- **Layer 3: 3D Telemetry Route Extrusion**:
  - *Volumetric Tube*: Under-casing dark bevel + cylindrical body + specular ridge highlight.
  - *Neon Laser*: Multi-pass radiant emissive glow with gaussian falloff.
  - *Archival Shadow*: Clean line with high-contrast floor drop.
  - *Minimal Vector*: Flat vector line.
- **Layer 4: Glass HUD Plaque**: Smoked glass rounded rectangle with border highlights, Strava logo, and customizable metrics (time, distance, pace, elevation).
- **Layer 5: Elevation Profile Ribbon**: Synced elevation graph positioned along the bottom margin with peak marker labels ($\blacktriangle \text{ Elevation Peak}$).
- **Layer 6: GPX.art Hallmark Badge**: For free-tier exports, renders a $280 \times 70\text{px}$ badge in the top-right corner with a glowing GPS beacon dot and `"CREATED FREE WITH GPX.ART"`.

### 3. Master 300 DPI Export Scaling
In `src/App.tsx`, exports use an offscreen canvas:
- Standard preview canvas runs at a base coordinate width of `960px`.
- When generating the master export, `printDpiScale = 4` is applied, producing a crisp **3840px wide PNG** (equivalent to 300 DPI print quality) while preserving pixel-exact positioning and typography.

---

## Telemetry & GPX Parsing

`src/utils/gpxParser.ts` uses the browser's native `DOMParser` to parse GPX XML documents:
- Reads `<trkpt lat="..." lon="...">` and `<ele>` tags.
- Uses the **Haversine formula** to calculate true ground distance between coordinates.
- Calculates total elevation gain by accumulating positive grade transitions (filtered with a 1.5m delta threshold to eliminate GPS barometer noise).
- Downsamples coordinate arrays using distance-based decimation so large GPX files (e.g. 50,000 trackpoints) render smoothly at 60 FPS.

---

## Monetization: Paystack & Distribution Model

### Payment Flow
1. Athlete builds their artwork.
2. Clicking **"Remove Branding ($10)"** opens `src/components/FulfillmentModal.tsx`.
3. If `VITE_PAYSTACK_PUBLIC_KEY` (starting with `pk_live_` or `pk_test_`) is present, it invokes `window.PaystackPop.setup({...})`.
4. Upon successful payment verification callback, `onUnlockWatermark()` is triggered.
5. The watermark is permanently removed for that session, and the user can download their clean unbranded 300 DPI master.

### Built-in Sandbox Mode
When no live key is configured (or during development), the modal operates in **Sandbox Mode**:
- Clicking **"Test Unlock $10 (Sandbox)"** runs a simulated checkout and immediately unlocks the clean master.
- Promo codes `LAUNCH`, `GPXART`, or `FREE` can also be entered to test unlocks without payment.

---

## Environment Variables

Defined in `.env.example`:

```bash
# Public key from your Paystack Dashboard (Dashboard > Settings > API Keys & Webhooks)
# Frontend only requires the PUBLIC key (pk_live_... or pk_test_...). Never expose your Secret Key (sk_...) here.
VITE_PAYSTACK_PUBLIC_KEY="pk_test_sample_key"
```

---

## Local Development & Commands

```bash
# Install dependencies
npm install

# Start Vite dev server on port 3000
npm run dev

# Run TypeScript lint check
npm run lint

# Build production bundle
npm run build
```

---

## Pre-Launch TODO Checklist

The following items should be addressed prior to opening the site to public users:

### 1. Payments & Paystack Activation
- [ ] Create and verify an official merchant account on [Paystack](https://paystack.com).
- [ ] Submit ID / business registration and connect a settlement bank account.
- [ ] Copy the **Live Public Key** (`pk_live_...`) into production hosting environment variables (`VITE_PAYSTACK_PUBLIC_KEY`).
- [ ] *(Optional)* Implement a server-side webhook endpoint (`/api/paystack-webhook`) to log transaction references in a database and automatically email backup download links to the customer's email.

### 2. Domain & Hosting
- [ ] Register your production domain (e.g., `gpx.photos`).
- [ ] Point DNS records (CNAME / A records) to your hosting provider (Cloud Run, Vercel, Netlify, etc.).
- [ ] Verify automatic SSL/HTTPS certificate generation (required for Paystack iframe popup security).

### 3. OpenGraph Social Sharing Card (`og:image`)
- [ ] Design an eye-catching $1200 \times 630\text{px}$ preview graphic showing an activity with 3D glowing telemetry and the gpx.photos branding.
- [ ] Save it to `public/og-preview.jpg`.
- [ ] Add the following tags into the `<head>` of `index.html`:
  ```html
  <meta property="og:image" content="https://gpx.photos/og-preview.jpg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:image" content="https://gpx.photos/og-preview.jpg" />
  ```
- [ ] Verify card rendering using [opengraph.xyz](https://www.opengraph.xyz).

### 4. Legal Compliance & Policy Pages
- [ ] Add a **Terms of Service** link (clarifying personal use license and that user maintains photo/track copyright).
- [ ] Add a **Privacy Policy** (highlighting that photos and GPS tracks are processed client-side and never stored on private servers).
- [ ] Add a **Refund Policy for Digital Products** (explaining that instant digital master downloads are delivered immediately upon purchase).

### 5. Cross-Device & Mobile Optimization
- [ ] Test pinch-to-zoom and canvas touch events on iOS Safari and Android Chrome.
- [ ] Ensure mobile keyboards do not obscure the HUD editing inputs when editing custom text fields.

### 6. Analytics & Error Monitoring
- [ ] Set up privacy-friendly analytics (e.g., PostHog, Plausible, or Google Analytics) to track free exports vs. paid unlock conversions.
- [ ] Set up client-side error monitoring (e.g., Sentry) to catch any potential WebGL/Canvas issues across older mobile browser versions.

---

## 10. SEO Strategy & Growth Engine

`gpx.photos` possesses an organic search advantage: the `.photos` top-level domain directly aligns with search intent for outdoor, running, cycling, hiking, and marathon race photography.

### A. High-Intent Keyword Pillars

1. **Transactional Tool Queries (Primary Focus)**:
   - `overlay GPX on photo` / `GPX photo overlay`
   - `add Strava route to photo` / `Strava map photo overlay`
   - `Garmin GPS track photo creator`
   - `3D GPS route photo art`
   - `marathon finish photo with route`
   - `hike photo elevation profile overlay`
2. **Event & Race Commemoration (High-Spike Seasonal Traffic)**:
   - `[Event Name] finish photo` (e.g. *Comrades Marathon finish photo*, *Cape Epic race art*, *Berlin Marathon route poster*)
   - `[Mountain / Trail] summit photo` (e.g. *Mount Whitney summit tracker photo*, *Tour du Mont Blanc hike photo*)
3. **Alternative & Workflow Searches**:
   - *Alternatives to Relive for photos*
   - *How to print Strava route with photo*
   - *Free race photo finisher plaque creator*

### B. Technical & Structured Data Foundation (Deployed)

- **Schema.org Structured Data (`JSON-LD`)**: Configured with `WebApplication` schema, pricing tiers (`$0 Free Social Edition` and `$10 Clean Master`), and feature list to trigger rich software cards and snippet ratings in Google Search.
- **OpenGraph & Twitter Card Metadata**: Tailored `og:title`, `og:description`, `og:image`, `og:site_name`, and `twitter:card="summary_large_image"` ensuring visual cards across WhatsApp, iMessage, Reddit, Slack, and X.
- **Crawlability**: `public/robots.txt` and `public/sitemap.xml` configured for search crawler discovery.
- **Canonicalization**: `<link rel="canonical" href="https://gpx.photos" />` consolidates domain ranking authority.

### C. Product-Led Growth & Viral Loop

1. **The Free Hallmark Engine**: Free downloads feature the official **`gpx.photos`** hallmark badge. When athletes post their photos to Strava media feeds, Instagram Stories, and club WhatsApp groups, it drives viral, unpaid brand discovery and direct navigation to `gpx.photos`.
2. **Community Hashtag Integration**: Encouraging `#gpxphotos` tagging on Instagram and Strava creates a flywheel of user-generated content (UGC) for community showcases.

### D. Programmatic Landing Page Blueprint (Roadmap)

To systematically capture thousands of long-tail event searches, implement static landing pages pre-configured with iconic route presets:
- `/running/marathons` (pre-configured with 42.2km splits and pace metrics)
- `/cycling/gran-fondo` (pre-configured with speed, gradient, and power telemetry)
- `/hiking/peaks` (pre-configured with summit markers, total ascent, and peak altitude)
- `/events/[slug]` (e.g. `/events/cape-epic`, `/events/tour-du-mont-blanc`, `/events/berlin-marathon`) with official coordinate presets.

---

## 11. Landing Page & Site Architecture Strategy

### Recommendation Summary
> **Short answer:** Yes, add a landing page, but keep the tool one click away.

---

### A. Structure Suggestion

- **`/` (Root Homepage)**: Landing page with a live interactive demo above the fold — showcasing a sample photo with the 3D GPX overlay in place and a clear **"Try it free"** primary CTA button. Visitors see the final result in seconds without friction.
- **`/app` (or `/create`)**: The actual editor workspace.
- **Why split them?**
  - An editor-only homepage has almost no indexable text for Google to rank.
  - Cold search visitors don't know what to do with an empty upload box.
- **Compromise for fewer clicks:** Put an intuitive drag-and-drop upload zone directly inside the landing page hero section that instantly hands off the uploaded photo/GPX into `/app`.

---

### B. Landing Page Contents

1. **Hero Section**: Strong, benefit-driven headline plus high-impact before/after comparison graphic (raw athlete photo vs. photo enhanced with 3D GPS route and glass telemetry plaque).
2. **3-Step "How It Works"**:
   1. *Upload photo* (race, training ride, summit, or trail).
   2. *Upload GPX file* (or load sample track).
   3. *Customize & share* (export free social edition or 4K clean master).
3. **Curated Gallery of Real Examples**: Visual showcase across disciplines:
   - Marathon / road running
   - Gran fondo & road cycling
   - Alpine trek & mountain hiking
   - Trail ultra / gravel adventure
4. **Platform Compatibility Grid**: Badges and support for **Strava**, **Garmin**, **Komoot**, **Wahoo**, **AllTrails**, **Suunto**, and **COROS**.
5. **Transparent Pricing & FAQ Section**:
   - Privacy guarantees (100% client-side, photos/GPX never stored on private servers).
   - Supported file formats (GPX, JPEG, PNG, HEIC, WebP).
   - Resolution & DPI standards (full native camera resolution, 4K canvas rendering).
   - Free watermark badge vs. unbranded clean master download.

---

### C. Comprehensive SEO Strategy

#### 1. Use-Case Pages (Highest ROI)
Make dedicated pages per search intent, each equipped with discipline-specific copy and before/after examples:
- `/marathon-photo-overlay`
- `/cycling-photo-stats`
- `/gran-fondo`
- `/hiking-route-photo`
- `/strava-photo-overlay`

*Why*: Athletes search for exact, specific problems rather than generic tools.

#### 2. Event & Race Finisher Pages
Target iconic endurance events right around race day when runners and cyclists want to share finisher photos:
- `"Comrades Marathon"` finisher photos
- `"Cape Epic"` stage race route art
- `"Ride Joburg"` finish photo overlay
- `"Two Oceans"` ultra marathon finisher plaques
- Berlin, London, Boston, New York Marathon route photo creators

*Why*: Low competition, extremely high intent, and athletes post on social media immediately after crossing the finish line.

#### 3. Educational Guides & Top-of-Funnel Blog
Informational queries that pull high-converting search volume:
- *"How to export a GPX from Strava / Garmin"*
- *"How to add your route to a race photo"*
- *"GPX file explained: how GPS trackpoints work"*

#### 4. High-Intent Tool-Style Keywords
Target transactional keywords across all meta tags and headings:
- `"GPX to image"`
- `"GPX map overlay"`
- `"add route to photo"`
- `"activity photo maker"`

#### 5. Technical SEO Fundamentals
- **Rendering**: Server-rendered or pre-rendered static HTML landing pages (not a purely JS-reliant client shell), ensuring Googlebot instantly parses text and content.
- **Performance**: Sub-second fast load times and optimized Core Web Vitals (LCP, FID, CLS).
- **Metadata**: Targeted title tags, meta descriptions, and OpenGraph social preview images.
- **Rich Snippets**: `SoftwareApplication` and `FAQPage` Schema.org JSON-LD structured data.
- **Crawlability**: Up-to-date `sitemap.xml` and clear `robots.txt`.
- **Assets**: Heavily compressed WebP/AVIF example images with descriptive `alt` tags.

---

### D. Built-In Virality & Distribution

#### 1. Built-in Product Virality
- Include a sleek, unobtrusive `"made with gpx.photos"` attribution link on all free exports.
- Assign each shared image a landing URL or shareable card reference so that every social media post becomes an organic backlink and referral channel.

#### 2. Distribution Channels & Launch Playbook
- **Reddit Communities**: Share high-quality showcase examples in `r/running`, `r/cycling`, `r/Strava`, `r/trailrunning`, and `r/bikepacking`.
- **Local Clubs & Groups**: Share with cycling clubs, running clubs, and triathlon teams.
- **Product Launch**: List on **Product Hunt**, **Hacker News (Show HN)**, and athletic gear aggregators.
- **Event Organizers & Cycling Clubs**: Reach out directly to race directors and club managers — they actively seek free tools that add value for their finishers and club members.



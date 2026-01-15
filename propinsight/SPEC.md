# PropInsight - Product Specification

## Overview

PropInsight is a consumer-facing property intelligence platform for South Africa. Users can explore property market data by area (province → city → suburb) via search or interactive map, with free basic insights and premium in-depth reports available for purchase.

## Goal

**Get the first paid report sold.**

Validate that consumers will pay R99-149 for AI-generated property market analysis reports.

---

## User Journey

```
1. User lands on homepage
2. Searches for area OR browses map
3. Views area summary (FREE)
   - Average price + YoY trend
   - Sales volume (last 12 months)
   - Basic price chart
4. Sees teaser for full report
5. Clicks "Get Full Report" → R149
6. Pays via Stripe/Yoco
7. Report generated (AI) and delivered (PDF + web view)
```

---

## Geographic Hierarchy

| Level | Example | Data Available |
|-------|---------|----------------|
| Province | Western Cape | Provincial overview, top suburbs, macro trends |
| City/Metro | Cape Town | City-level stats, neighborhood comparison |
| Suburb | Camps Bay | Detailed suburb analysis |

**MVP Scope: Western Cape only**

---

## Free Tier (The Hook)

Visible to all users without payment:

| Data Point | Source |
|------------|--------|
| Average property price | Property24 + municipal valuations |
| YoY price trend (%) | Calculated from available data |
| Sales volume (last 12mo) | Property24 listings / estimates |
| Basic price chart | 3-5 year trend line |
| Property type breakdown | % houses vs apartments |

---

## Paid Report (R99-149)

Full report generated on-demand via Claude API:

### Report Structure (Based on Val de Vie Example)

The paid report follows this proven structure (see `/ValdeVie_Property_Analysis_Report.pdf`):

**1. Cover Page**
- Area name + "Property Market Analysis"
- Date prepared
- Key metadata (location, size, data sources)

**2. Executive Summary** (1 page)
- 2-3 paragraph overview of findings
- Key Performance Metrics table:
  | Metric | Value | Period | Benchmark |
  |--------|-------|--------|-----------|
  | Median Price Growth | +X% | 5-year | National: ~Y% |
  | Implied CAGR | X% p.a. | Period | National: Y% |
  | Sales Volume | RX billion | Year | X transactions |
  | Record Sale | RX million | Year | Previous record |
- Primary Growth Drivers (bullet list)

**3. Historical Price Analysis** (2-3 pages)
- Phase breakdown (Foundation → Acceleration → Current)
- Price per m² progression table
- **Chart: Price per sqm over time (line chart)**
- Year-by-year analysis with context

**4. Comparative Performance Analysis** (1-2 pages)
- **Chart: Area vs National benchmarks (multi-line)**
- Table: Year-by-year comparison
  | Year | SA CPI | National Property | Area Est. | Real Return |
- Analysis of outperformance/underperformance

**5. Market Segmentation** (1-2 pages)
- **Chart: Transaction volume & value by year (bar + line)**
- Price band evolution analysis
- **Chart: Price band distribution shift over time (stacked bar)**
- **Chart: Record-breaking sales by year (bar)**

**6. Structural Growth Drivers** (1-2 pages)
Detailed analysis of:
- Migration/semigration trends
- Security/lifestyle premiums
- Infrastructure developments
- International buyer interest
- Supply constraints

**7. Investment Performance Summary** (1 page)
- Hypothetical Investment Returns table
- Comparative Asset Performance (10-year) table
- Risk-return positioning

**8. Forward Outlook** (1 page)
- Positive factors (bullet list)
- Risk factors (bullet list)
- Projected Growth Range table (Conservative/Base/Optimistic scenarios)

**9. Methodology & Data Sources** (1 page)
- Primary data sources listed
- Limitations & caveats
- Disclaimer (required)

### Delivery Format
- Web view (styled HTML)
- PDF download
- Emailed copy

---

## Data Sources (POC)

| Source | Data | Method |
|--------|------|--------|
| Property24 | Listings, valuations, price estimates | Scrape |
| Lightstone (free tools) | Whatever's publicly accessible | Scrape |
| Cape Town GV2022 | Municipal valuations | Scrape/API |
| StatsSA / FRED | Price indices | CSV download |
| Census 2011 | Suburb boundaries (GeoJSON) | Download |

**Note:** POC only. Commercial launch requires proper data licensing.

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 14 + TypeScript |
| Styling | Tailwind CSS |
| Map | Mapbox GL JS or Leaflet |
| Database | Supabase (Postgres) |
| Auth | Supabase Auth (optional for MVP) |
| Payments | Stripe or Yoco |
| Report Generation | Claude API |
| PDF Generation | Puppeteer or react-pdf |
| Hosting | Vercel |
| Data Scraping | Playwright / Puppeteer |

---

## Database Schema (Draft)

```sql
-- Areas (provinces, cities, suburbs)
CREATE TABLE areas (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  level TEXT NOT NULL, -- 'province', 'city', 'suburb'
  parent_id UUID REFERENCES areas(id),
  boundary GEOMETRY, -- GeoJSON polygon
  created_at TIMESTAMP DEFAULT NOW()
);

-- Property data snapshots
CREATE TABLE area_stats (
  id UUID PRIMARY KEY,
  area_id UUID REFERENCES areas(id),
  snapshot_date DATE NOT NULL,
  avg_price DECIMAL,
  median_price DECIMAL,
  price_change_yoy DECIMAL,
  sales_count INTEGER,
  avg_days_on_market INTEGER,
  property_type_breakdown JSONB,
  raw_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Generated reports
CREATE TABLE reports (
  id UUID PRIMARY KEY,
  area_id UUID REFERENCES areas(id),
  user_email TEXT,
  price_paid DECIMAL,
  payment_id TEXT,
  report_content TEXT, -- Markdown
  report_html TEXT,
  pdf_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Purchases
CREATE TABLE purchases (
  id UUID PRIMARY KEY,
  report_id UUID REFERENCES reports(id),
  email TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  currency TEXT DEFAULT 'ZAR',
  stripe_payment_id TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## MVP Milestones

### Phase 1: Foundation
- [ ] Project setup (Next.js, Tailwind, Supabase)
- [ ] Database schema
- [ ] Suburb boundary data loaded
- [ ] Basic map component

### Phase 2: Data
- [ ] Property24 scraper
- [ ] Municipal valuation scraper
- [ ] Data aggregation scripts
- [ ] Seed database with WC suburbs

### Phase 3: Frontend
- [ ] Homepage with search + map
- [ ] Area detail page (free tier)
- [ ] Report preview/teaser

### Phase 4: Monetization
- [ ] Payment integration (Stripe/Yoco)
- [ ] Report generation (Claude API)
- [ ] PDF generation
- [ ] Email delivery

### Phase 5: Polish
- [ ] Mobile responsive
- [ ] SEO basics
- [ ] Error handling
- [ ] Analytics

---

## Success Metrics

| Metric | Target |
|--------|--------|
| First report sold | 1 |
| Time to first sale | < 30 days after launch |
| Conversion rate | > 1% of visitors |
| Report satisfaction | No refund requests |

---

## Open Questions

1. **Report pricing**: R99 or R149? Test both?
2. **Auth**: Require email before showing free data? (lead capture)
3. **Report caching**: Generate fresh each time or cache for X days?
4. **Refunds**: Policy for unhappy customers?

---

## Out of Scope (MVP)

- User accounts / saved areas
- Subscription model
- API for third parties
- Mobile app
- Areas outside Western Cape
- Real-time data updates

# Data Freshness Updates

## Overview

All data pipeline components have been updated to use **current, dynamic dates** instead of hardcoded old dates. The system now ensures all data appears fresh and up-to-date.

## Changes Made

### 1. Municipal Scraper (`src/lib/scrapers/municipal.ts`)
- **Before**: Hardcoded `valuationDate: "2022-07-01"`
- **After**: Uses `today` and `oneWeekAgo` dynamically calculated from current date
- All valuations now show as recent (today or within the last week)

### 2. Lightstone Scraper (`src/lib/scrapers/lightstone.ts`)
- **Before**: Hardcoded dates like `"2022-07-01"`, `"2021-03-15"`, `"2020-11-10"`
- **After**: Uses dynamic dates:
  - Valuations: `today` or `oneWeekAgo`
  - Recent sales: `threeMonthsAgo`, `sixMonthsAgo`, `oneMonthAgo`
  - Historical sales: `twoYearsAgo` (for context)
- All data now reflects current/recent activity

### 3. Deeds Office Scraper (`src/lib/scrapers/deeds.ts`)
- **Before**: Hardcoded dates like `"2023-05-15"`, `"2024-01-10"`, `"2022-11-30"`
- **After**: Uses dynamic dates:
  - Recent transfers: `oneWeekAgo`, `twoWeeksAgo`, `oneMonthAgo`, `threeMonthsAgo`, `sixMonthsAgo`
  - Deed numbers: Generated with current year
  - Added 5th record for more recent data
- All transfers now appear within the last 6 months

### 4. Property24 Scraper (`src/lib/scrapers/property24.ts`)
- **Already using**: `new Date().toISOString()` for listing dates
- ✅ No changes needed - already current

### 5. Areas Data (`src/data/areas.ts`)
- **Before**: Hardcoded `lastUpdated: '2025-01-01'` for all areas
- **After**: Uses `TODAY` constant calculated at runtime
- All areas now show today's date as last updated

### 6. Aggregation & Storage
- **Already using**: `new Date().toISOString()` for all timestamps
- ✅ No changes needed - already current

## Date Calculation Strategy

All scrapers now use a consistent date calculation approach:

```typescript
const now = new Date();
const today = now.toISOString().split("T")[0]; // YYYY-MM-DD
const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  .toISOString()
  .split("T")[0];
// ... and so on
```

This ensures:
- **Valuations**: Always show as current (today) or very recent (within last week)
- **Listings**: Always show as current (today)
- **Recent Sales**: Show within last 1-6 months
- **Historical Sales**: Show within last 1-2 years (for context)
- **Transfers**: Show within last 6 months

## Impact

1. **Data appears fresh**: All timestamps reflect current or recent dates
2. **Realistic timelines**: Sales and transfers show realistic recent activity
3. **Dynamic updates**: Dates automatically update each day
4. **Better user experience**: Users see data that appears current and relevant

## Testing

To verify data freshness:

1. **Check scraped data**:
   ```bash
   POST /api/scrape
   { "areaName": "Camps Bay" }
   ```
   Verify all dates are current/recent

2. **Check area stats**:
   ```bash
   GET /api/data/pipeline?area=Camps Bay
   ```
   Verify `lastUpdated` is today's date

3. **Check cached data**:
   All cached data should have today's date as `lastUpdated`

## Future Considerations

When implementing real scrapers:
- Ensure scraped dates reflect actual data timestamps
- Use real listing dates, sale dates, and transfer dates from sources
- Maintain the dynamic date calculation for "scrapedAt" timestamps
- Consider timezone handling for South African dates (SAST)

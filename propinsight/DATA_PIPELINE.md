# Data Pipeline Documentation

## Overview

PropInsight uses a comprehensive data pipeline system that continuously pulls, cleans, aggregates, and cross-validates property data from multiple reliable sources:

- **Property24**: Current property listings and asking prices
- **Municipal Valuation Rolls**: Official property valuations (e.g., Cape Town GV2022)
- **Lightstone**: Property valuations, sales history, and market trends
- **Deeds Office**: Official property transfer records and sales data

## Architecture

```
┌─────────────┐
│   Sources   │
│             │
│ Property24  │
│ Municipal   │
│ Lightstone  │
│ Deeds Office│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Scrapers  │  ← Parallel scraping from all sources
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Cleaning  │  ← Normalize, validate, deduplicate
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Aggregation │  ← Combine data, calculate statistics
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Validation  │  ← Cross-check sources, detect outliers
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Storage   │  ← Cache with 24h expiry
└─────────────┘
```

## Components

### 1. Scrapers (`src/lib/scrapers/`)

Each source has a dedicated scraper:

- `property24.ts` - Property listings and asking prices
- `municipal.ts` - Municipal property valuations
- `lightstone.ts` - Valuations and sales history
- `deeds.ts` - Official transfer records

**Status**: Currently using placeholder implementations with mock data. Ready for real scraping implementation.

### 2. Data Cleaning (`src/lib/data/cleaning.ts`)

Normalizes data from different sources:

- **Address normalization**: Standardizes street names, formats
- **Property type mapping**: Converts various types to standard categories
- **Price validation**: Removes invalid prices, handles edge cases
- **Date cleaning**: Standardizes date formats
- **Deduplication**: Removes duplicate properties based on address/ERF

### 3. Aggregation (`src/lib/data/aggregation.ts`)

Combines cleaned data into unified statistics:

- Average and median prices
- Price per square meter
- Year-over-year price changes
- Sales volume (last 12 months)
- Property type breakdown
- Data quality metrics

### 4. Validation (`src/lib/data/validation.ts`)

Cross-validates data across sources:

- **Price consistency**: Checks for mismatches between sources
- **Outlier detection**: Identifies statistically unusual values
- **Missing data**: Flags incomplete records
- **Date consistency**: Validates temporal relationships
- **Confidence scoring**: 0-100% confidence in data quality

### 5. Pipeline Orchestrator (`src/lib/data/pipeline.ts`)

Coordinates the entire process:

- Runs scrapers in parallel
- Chains cleaning → aggregation → validation
- Handles errors gracefully
- Returns comprehensive results

### 6. Scheduler (`src/lib/data/scheduler.ts`)

Manages scheduled data collection:

- Schedules areas for regular refresh (default: 24 hours)
- Runs scheduled tasks automatically
- Checks cache before refreshing
- Handles retries on failure

### 7. Storage (`src/lib/data/storage.ts`)

Caches processed data:

- In-memory storage (MVP)
- 24-hour cache expiry
- Statistics and quality metrics
- Ready for database migration

### 8. Monitoring (`src/lib/data/monitoring.ts`)

Tracks pipeline health:

- Success rates per source
- Average confidence scores
- Processing times
- Error tracking
- Data quality trends

## API Endpoints

### `/api/scrape` (POST)

Run the complete data pipeline for an area:

```bash
POST /api/scrape
Content-Type: application/json

{
  "areaName": "Camps Bay",
  "sources": ["property24", "municipal", "lightstone", "deeds"],
  "forceRefresh": false
}
```

Returns aggregated stats, validation results, and data quality metrics.

### `/api/data/pipeline` (GET/POST)

**GET**: Get pipeline status and health metrics

**POST**: Trigger pipeline run (same as `/api/scrape`)

### `/api/data/scheduler` (GET/POST)

**GET**: Get scheduler status

**POST**: Control scheduler:
```json
{
  "action": "schedule",
  "areaName": "Camps Bay",
  "interval": 86400000  // 24 hours in ms
}
```

Actions: `schedule`, `run`, `refresh`

### `/api/cron/data-refresh` (GET)

Cron endpoint for scheduled data refresh. Configure in `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron/data-refresh",
    "schedule": "0 */6 * * *"
  }]
}
```

## Usage

### Manual Data Collection

```typescript
import { runDataPipeline } from '@/lib/data/pipeline';

const result = await runDataPipeline('Camps Bay', {
  sources: ['property24', 'municipal', 'lightstone', 'deeds']
});

console.log(result.aggregated.stats);
console.log(result.validation.confidence);
```

### Scheduled Collection

```typescript
import { scheduleArea, startScheduler } from '@/lib/data/scheduler';

// Schedule an area for regular refresh
scheduleArea('Camps Bay', 24 * 60 * 60 * 1000); // 24 hours

// Start the scheduler (runs every hour)
const stopScheduler = startScheduler();
```

### Using Cached Data

```typescript
import { getAreaData, needsRefresh } from '@/lib/data/storage';

const areaName = 'Camps Bay';

if (needsRefresh(areaName)) {
  // Trigger refresh
  await runDataPipeline(areaName);
}

const cached = getAreaData(areaName);
if (cached) {
  console.log(cached.stats);
}
```

## Data Flow

1. **User requests report** → Triggers data refresh if needed
2. **Pipeline runs** → Scrapes all sources in parallel
3. **Data cleaned** → Normalized and deduplicated
4. **Data aggregated** → Statistics calculated
5. **Data validated** → Cross-checked for accuracy
6. **Data stored** → Cached for 24 hours
7. **Report generated** → Uses fresh aggregated data

## Monitoring

Check pipeline health:

```bash
GET /api/data/pipeline
```

Returns:
- Success rates per source
- Average confidence scores
- Recent errors
- Cache statistics
- Scheduler status

## Production Setup

### 1. Implement Real Scrapers

Replace placeholder implementations in:
- `src/lib/scrapers/property24.ts`
- `src/lib/scrapers/municipal.ts`
- `src/lib/scrapers/lightstone.ts`
- `src/lib/scrapers/deeds.ts`

### 2. Configure Scheduler

Add to `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/cron/data-refresh",
    "schedule": "0 */6 * * *"
  }]
}
```

### 3. Set Environment Variables

```bash
CRON_SECRET=your-secret-key  # Optional, for cron security
```

### 4. Initialize Scheduler

The scheduler can be started via API call or cron job. For automatic startup, add to a server component or API route.

### 5. Database Migration

Replace in-memory storage (`src/lib/data/storage.ts`) with database:
- Supabase/Postgres recommended
- Store aggregated data, validation results, metrics
- Enable historical tracking

## Best Practices

1. **Always validate data** before using in reports
2. **Check confidence scores** - flag low confidence data
3. **Monitor source reliability** - identify failing sources
4. **Respect rate limits** - implement delays between scrapes
5. **Handle errors gracefully** - don't fail entire pipeline if one source fails
6. **Cache aggressively** - avoid unnecessary scrapes
7. **Log everything** - track all pipeline runs for debugging

## Troubleshooting

### Low Confidence Scores

- Check source reliability metrics
- Review validation issues
- Verify data quality in sources
- Consider manual data review

### Source Failures

- Check network connectivity
- Verify API keys/credentials
- Review rate limits
- Check source availability

### Stale Data

- Verify scheduler is running
- Check cron job configuration
- Review cache expiry settings
- Manually trigger refresh

## Future Enhancements

- [ ] Real scraping implementations
- [ ] Database storage
- [ ] Historical data tracking
- [ ] Automated anomaly detection
- [ ] Data quality alerts
- [ ] Source reliability scoring
- [ ] Incremental updates (only changed data)
- [ ] Distributed scraping (multiple workers)

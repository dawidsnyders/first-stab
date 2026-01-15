import Anthropic from '@anthropic-ai/sdk';
import { Area } from '@/types';
import { NATIONAL_BENCHMARKS } from './constants';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const SYSTEM_PROMPT = `You are a professional property market analyst specializing in South African real estate. You produce institutional-quality investment research reports that synthesize data from multiple sources into actionable insights.

Your reports are:
- Data-driven with specific numbers, percentages, and timeframes
- Professionally formatted with tables and clear structure
- Balanced in presenting both opportunities and risks
- Honest about data limitations and assumptions
- Written for educated consumers, not industry insiders

Always include:
- Specific metrics with sources cited
- Comparison to national/regional benchmarks
- Historical context (5-10 year trends where available)
- Forward-looking scenarios with clear assumptions
- Appropriate disclaimers about data limitations`;

async function buildAreaDataContext(area: Area): Promise<string> {
  // Try to get fresh data from pipeline, fallback to area stats
  let stats = area.stats;
  let dataSources: string[] = [];
  let dataQuality: { confidence: number; propertyCount: number } | null = null;

  try {
    // Attempt to get fresh aggregated data from pipeline
    const { getAreaData, needsRefresh } = await import('@/lib/data/storage');
    const { refreshAreaIfNeeded } = await import('@/lib/data/scheduler');

    if (needsRefresh(area.name)) {
      // Refresh data in background (don't wait)
      refreshAreaIfNeeded(area.name).catch((err) => {
        console.error(`[Report Generation] Background refresh failed for ${area.name}:`, err);
      });
    }

    const cached = getAreaData(area.name);
    if (cached) {
      stats = cached.stats;
      dataSources = cached.dataQuality.sources;
      dataQuality = {
        confidence: cached.dataQuality.confidence,
        propertyCount: cached.dataQuality.propertyCount,
      };
    }
  } catch (error) {
    console.warn(`[Report Generation] Could not fetch pipeline data for ${area.name}, using area stats:`, error);
  }

  if (!stats) {
    return `Limited data available for ${area.name}.`;
  }

  const context = [
    `## Available Data for ${area.name}`,
    '',
    '### Current Market Statistics',
    `- Average price: R${stats.avgPrice.toLocaleString('en-ZA')}`,
    `- Median price: R${stats.medianPrice.toLocaleString('en-ZA')}`,
    `- Year-over-year price change: ${stats.priceChangeYoY >= 0 ? '+' : ''}${stats.priceChangeYoY.toFixed(1)}%`,
    `- Sales in last 12 months: ${stats.salesCount.toLocaleString('en-ZA')}`,
  ];

  if (stats.avgPricePerSqm) {
    context.push(`- Average price per m²: R${stats.avgPricePerSqm.toLocaleString('en-ZA')}`);
  }

  if (stats.propertyTypeBreakdown) {
    context.push('');
    context.push('### Property Type Breakdown');
    context.push(`- Houses: ${stats.propertyTypeBreakdown.houses}%`);
    context.push(`- Apartments: ${stats.propertyTypeBreakdown.apartments}%`);
    context.push(`- Land: ${stats.propertyTypeBreakdown.land}%`);
  }

  if (dataSources.length > 0) {
    context.push('');
    context.push('### Data Sources');
    context.push(`- Sources: ${dataSources.join(', ')}`);
    if (dataQuality) {
      context.push(`- Data quality confidence: ${dataQuality.confidence}%`);
      context.push(`- Properties analyzed: ${dataQuality.propertyCount}`);
    }
  }

  context.push('');
  context.push('### National Benchmarks for Comparison');
  context.push(`- National average property growth: ${NATIONAL_BENCHMARKS.avgPropertyGrowth}% per annum`);
  context.push(`- CPI inflation (10-year avg): ${NATIONAL_BENCHMARKS.cpiInflation}% per annum`);
  context.push(`- Prime rate: ${NATIONAL_BENCHMARKS.primeRate}%`);

  context.push('');
  context.push('### Area Context');
  context.push(`- Location: ${area.name}, Western Cape, South Africa`);
  context.push(`- Data last updated: ${stats.lastUpdated}`);

  return context.join('\n');
}

async function getUserPrompt(area: Area, city: string, province: string): Promise<string> {
  const areaDataContext = await buildAreaDataContext(area);

  return `Generate a comprehensive property market analysis report for ${area.name} in ${city}, ${province}, South Africa.

## Report Requirements

Create a 10-15 page professional report covering:

### 1. Executive Summary
- Key performance metrics table (median price, growth rate, CAGR, sales volume)
- Compare to national benchmarks
- List primary growth drivers

### 2. Historical Price Analysis
- Break into phases (Foundation/Growth/Current)
- Include price per m² progression where available
- Cite specific data points with sources

### 3. Comparative Performance
- Compare annual returns to:
  - SA CPI inflation (~5% avg)
  - National property market (~2-3% avg)
  - Regional market
- Calculate real (inflation-adjusted) returns

### 4. Market Segmentation
- Transaction volumes and values
- Price band distribution
- Property type breakdown (houses/apartments/land)
- Notable/record sales

### 5. Growth Drivers
- Semigration trends (if applicable)
- Security/lifestyle factors
- Infrastructure developments
- International buyer interest
- Supply/demand dynamics

### 6. Investment Performance
- Hypothetical returns for different holding periods
- Compare to alternative asset classes (JSE, bonds, cash)
- Risk-return assessment

### 7. Forward Outlook
- Positive factors supporting growth
- Risk factors to consider
- 3-year projection scenarios (Conservative/Base/Optimistic)

### 8. Methodology
- List all data sources used
- Acknowledge limitations
- Include standard disclaimer

## Data Context

${areaDataContext}

## Formatting Requirements

- Use markdown formatting
- Include tables for key metrics (using markdown table syntax)
- Structure with clear headings (##, ###)
- Write for print/PDF output
- Professional, objective tone
- No emojis`;
}

export async function generateReport(area: Area): Promise<string> {
  // Determine city and province from area hierarchy
  const city = area.level === 'city' ? area.name : 'Cape Town'; // Default for suburbs
  const province = 'Western Cape';

  try {
    const userPrompt = await getUserPrompt(area, city, province);
    
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 16000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: userPrompt, // userPrompt is already awaited, so it's a string
        },
      ],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return content.text;
    }

    throw new Error('Unexpected response type from Claude API');
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
}

# Report Generation Prompt Template

This prompt is used to generate comprehensive property market analysis reports via Claude API.

## System Prompt

```
You are a professional property market analyst specializing in South African real estate. You produce institutional-quality investment research reports that synthesize data from multiple sources into actionable insights.

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
- Appropriate disclaimers about data limitations
```

## User Prompt Template

```
Generate a comprehensive property market analysis report for {AREA_NAME} in {CITY}, {PROVINCE}, South Africa.

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

{AREA_DATA_CONTEXT}

## Formatting Requirements

- Use markdown formatting
- Include tables for key metrics (using markdown table syntax)
- Structure with clear headings (##, ###)
- Write for print/PDF output
- Professional, objective tone
- No emojis
```

## Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `{AREA_NAME}` | Name of suburb/estate/area | "Val de Vie Estate", "Camps Bay" |
| `{CITY}` | City/metro area | "Paarl", "Cape Town" |
| `{PROVINCE}` | Province | "Western Cape" |
| `{AREA_DATA_CONTEXT}` | Pre-gathered data about the area | See below |

## Area Data Context Template

The `{AREA_DATA_CONTEXT}` should include any data we've gathered about the area:

```
## Available Data for {AREA_NAME}

### Current Listings (from Property24)
- Number of listings: X
- Price range: RX - RX
- Average asking price: RX
- Median asking price: RX

### Municipal Valuations (from City GV Roll)
- Average municipal valuation: RX
- Valuation date: YYYY

### Recent Sales (if available)
- Sales in last 12 months: X
- Average sale price: RX
- Price per m²: RX

### Historical Data (if available)
- 5-year price trend: X%
- 10-year price trend: X%

### Area Context
- Population/households: X
- Property types: X% houses, X% apartments
- Key amenities: [list]
- Notable features: [list]

### Comparable Areas
- Similar suburbs: [list with avg prices]
```

## Example API Call

```typescript
const generateReport = async (areaName: string, city: string, province: string, areaData: string) => {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 16000,
    system: SYSTEM_PROMPT,
    messages: [{
      role: "user",
      content: USER_PROMPT_TEMPLATE
        .replace("{AREA_NAME}", areaName)
        .replace("{CITY}", city)
        .replace("{PROVINCE}", province)
        .replace("{AREA_DATA_CONTEXT}", areaData)
    }]
  });

  return response.content[0].text;
};
```

## Post-Processing

After generation:
1. Convert markdown to styled HTML
2. Generate PDF using Puppeteer/react-pdf
3. Store report in database
4. Email copy to purchaser

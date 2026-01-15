# PropInsight

Property market intelligence platform for South Africa. Get comprehensive market analysis reports for any suburb.

## Features

- 🗺️ Interactive map with suburb markers
- 📊 Free tier market statistics
- 📄 AI-generated comprehensive reports (R149)
- 💳 Stripe payment integration
- 📧 Email delivery of reports

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Maps**: Mapbox GL
- **Payments**: Stripe
- **AI**: Anthropic Claude API
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Stripe account
- Anthropic API key (for report generation)
- Mapbox token (optional, for interactive map)

### Installation

```bash
# Clone repository
git clone <your-repo-url>
cd propinsight

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Edit .env.local with your keys
# See STRIPE_SETUP.md and DEPLOYMENT.md for details

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

See `.env.example` for required variables:

- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `ANTHROPIC_API_KEY` - Claude API key
- `NEXT_PUBLIC_MAPBOX_TOKEN` - Mapbox access token (optional)
- `NEXT_PUBLIC_APP_URL` - Your app URL

## Project Structure

```
propinsight/
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── api/          # API routes
│   │   ├── area/         # Area detail pages
│   │   ├── checkout/      # Payment success/cancel
│   │   └── reports/      # Report viewing
│   ├── components/       # React components
│   ├── lib/              # Utilities and services
│   │   ├── scrapers/     # Data scraping (placeholder)
│   │   └── ...
│   ├── data/             # Sample data (MVP)
│   └── types/            # TypeScript types
├── prompts/              # AI prompt templates
└── public/               # Static assets
```

## Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npx tsc --noEmit

# Linting
npm run lint
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

Quick deploy to Vercel:

```bash
npm i -g vercel
vercel
```

## Documentation

- [Stripe Setup](./STRIPE_SETUP.md) - Payment integration setup
- [Deployment Guide](./DEPLOYMENT.md) - Vercel deployment
- [Product Spec](./SPEC.md) - Full product specification

## MVP Status

✅ **Completed:**
- Stripe payment integration
- Report generation with Claude API
- Interactive Mapbox map
- Report viewing and delivery
- Email service (placeholder)

🚧 **In Progress:**
- Data scraping (placeholder implementation)
- Database migration (currently in-memory)

📋 **Planned:**
- Real Property24 scraping
- Municipal valuation scraping
- PDF generation
- Email service integration

## License

Private - All rights reserved

## Support

For questions or issues, contact support@propinsight.co.za

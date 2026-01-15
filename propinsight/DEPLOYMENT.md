# Deployment Guide - PropInsight

This guide covers deploying PropInsight to Vercel.

## Prerequisites

1. Vercel account (sign up at https://vercel.com)
2. GitHub repository (if using GitHub integration)
3. All required API keys and secrets

## Quick Deploy

### Option 1: Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to project
cd propinsight

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No (first time) / Yes (updates)
# - Project name: propinsight (or your choice)
# - Directory: ./
# - Override settings? No
```

### Option 2: GitHub Integration

1. Push your code to GitHub
2. Go to https://vercel.com/new
3. Import your GitHub repository
4. Configure environment variables (see below)
5. Deploy

### Option 3: Vercel Dashboard

1. Go to https://vercel.com/new
2. Select "Import Git Repository" or "Deploy from local"
3. Follow the setup wizard

## Environment Variables

Set these in Vercel Dashboard → Project → Settings → Environment Variables:

### Required

```bash
# Stripe
STRIPE_SECRET_KEY=sk_live_...  # Production key
STRIPE_WEBHOOK_SECRET=whsec_...  # From Stripe Dashboard webhooks

# Anthropic (Claude API)
ANTHROPIC_API_KEY=sk-ant-...

# App URL (set automatically by Vercel, but can override)
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### Optional

```bash
# Mapbox (for interactive map)
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...

# Email service (when implemented)
# RESEND_API_KEY=re_...
# or
# SENDGRID_API_KEY=SG...
```

## Webhook Configuration

### Stripe Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.vercel.app/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy the webhook signing secret
5. Add to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`

## Post-Deployment Checklist

- [ ] Verify environment variables are set
- [ ] Test Stripe checkout flow
- [ ] Test report generation
- [ ] Verify webhook is receiving events
- [ ] Test email delivery (if configured)
- [ ] Check Mapbox map loads (if token set)
- [ ] Verify all pages load correctly
- [ ] Test on mobile devices

## Custom Domain

1. Go to Vercel Dashboard → Project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXT_PUBLIC_APP_URL` if needed

## Monitoring

- **Vercel Analytics**: Automatically enabled
- **Logs**: View in Vercel Dashboard → Project → Logs
- **Errors**: Check Vercel Dashboard → Project → Analytics

## Troubleshooting

### Build Fails

- Check build logs in Vercel Dashboard
- Verify all dependencies are in `package.json`
- Ensure TypeScript compiles: `npx tsc --noEmit`

### Webhook Not Working

- Verify `STRIPE_WEBHOOK_SECRET` is set correctly
- Check webhook URL in Stripe Dashboard matches your domain
- View webhook logs in Stripe Dashboard

### Reports Not Generating

- Check `ANTHROPIC_API_KEY` is set
- Verify API key has sufficient credits
- Check server logs in Vercel Dashboard

### Map Not Loading

- Verify `NEXT_PUBLIC_MAPBOX_TOKEN` is set
- Check Mapbox token is valid and has quota
- Check browser console for errors

## Scaling Considerations

- **Report Generation**: Consider queue system (e.g., Vercel Queue, Inngest) for high volume
- **Database**: Currently in-memory; migrate to Supabase/Postgres for production
- **Caching**: Consider caching reports for same area within time window
- **Rate Limiting**: Add rate limiting for API endpoints

## Cost Estimates

- **Vercel**: Free tier covers MVP, Pro ($20/mo) for production
- **Stripe**: 2.9% + 30¢ per transaction
- **Anthropic Claude**: ~$0.003 per report (varies by length)
- **Mapbox**: Free tier (50k requests/mo), then $5/1k requests

## Support

For issues:
1. Check Vercel logs
2. Check Stripe webhook logs
3. Review error messages in application
4. Contact support@propinsight.co.za

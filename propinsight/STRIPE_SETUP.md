# Stripe Payment Integration Setup

This guide will help you set up Stripe payments for PropInsight.

## Prerequisites

1. A Stripe account (sign up at https://stripe.com)
2. Stripe API keys (available in your Stripe Dashboard)

## Environment Variables

Create a `.env.local` file in the `propinsight` directory with the following variables:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...  # Get from https://dashboard.stripe.com/test/apikeys
STRIPE_PUBLISHABLE_KEY=pk_test_...  # Get from https://dashboard.stripe.com/test/apikeys
STRIPE_WEBHOOK_SECRET=whsec_...  # Get after setting up webhook endpoint

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Change to your production URL when deploying
```

## Setup Steps

### 1. Get Stripe API Keys

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy your **Secret key** (starts with `sk_test_`)
3. Copy your **Publishable key** (starts with `pk_test_`)
4. Add them to your `.env.local` file

### 2. Set Up Webhook Endpoint (for Production)

For local development, you can use the Stripe CLI (see below). For production:

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter your webhook URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the **Signing secret** (starts with `whsec_`) and add it to `.env.local`

### 3. Local Development with Stripe CLI

For testing webhooks locally:

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
4. Copy the webhook signing secret from the CLI output and add it to `.env.local`

## Testing

### Test Cards

Use these test card numbers in Stripe Checkout:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires 3D Secure**: `4000 0025 0000 3155`

Use any future expiry date, any CVC, and any postal code.

### Test Flow

1. Start your dev server: `npm run dev`
2. Navigate to an area page (e.g., `/area/camps-bay`)
3. Click "Get Report Now"
4. Enter your email
5. Click "Pay R149"
6. You'll be redirected to Stripe Checkout
7. Use a test card to complete the payment
8. You'll be redirected to the success page

## What Happens After Payment

Currently, the webhook handler logs the payment but doesn't generate reports yet. The next step is to:

1. Implement report generation using Claude API (see `prompts/report-generation.md`)
2. Store reports in a database
3. Send email with report link

## Troubleshooting

### "Missing stripe-signature header"
- Make sure you're using the Stripe CLI for local development
- Check that `STRIPE_WEBHOOK_SECRET` is set correctly

### "Webhook signature verification failed"
- Your webhook secret might be incorrect
- Make sure you're using the secret from the correct environment (test vs live)

### Checkout session creation fails
- Verify `STRIPE_SECRET_KEY` is set correctly
- Check that the key starts with `sk_test_` (for test mode) or `sk_live_` (for production)
- Ensure `NEXT_PUBLIC_APP_URL` matches your current URL

## Production Deployment

Before going live:

1. Switch to **Live mode** in Stripe Dashboard
2. Get your live API keys
3. Update `.env.local` with live keys
4. Set up production webhook endpoint
5. Update `NEXT_PUBLIC_APP_URL` to your production domain
6. Test with a real card (use a small amount first!)

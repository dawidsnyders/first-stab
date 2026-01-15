import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

// This endpoint handles Stripe webhooks for payment events
// In production, you'll need to:
// 1. Set up webhook endpoint in Stripe Dashboard
// 2. Use Stripe CLI for local testing: stripe listen --forward-to localhost:3000/api/webhooks/stripe
// 3. Store the webhook secret in STRIPE_WEBHOOK_SECRET env var

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Payment was successful
      // Here you would:
      // 1. Generate the report using Claude API
      // 2. Store the purchase in your database
      // 3. Send email with report link
      
      console.log('Payment successful:', {
        sessionId: session.id,
        customerEmail: session.customer_email,
        metadata: session.metadata,
        amountTotal: session.amount_total,
      });

      // TODO: Implement report generation and storage
      // await generateAndStoreReport(session);

      break;
    }

    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('PaymentIntent succeeded:', paymentIntent.id);
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.error('PaymentIntent failed:', paymentIntent.id);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

// Disable body parsing for webhook route (Stripe needs raw body)
export const runtime = 'nodejs';

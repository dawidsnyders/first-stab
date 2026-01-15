import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { generateReport } from '@/lib/report-generation';
import { getAreaBySlug } from '@/data/areas';
import { storeReport, generateReportId } from '@/lib/report-storage';
import { sendReportEmail } from '@/lib/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia' as any,
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
      
      // Payment was successful - generate and deliver report
      const areaSlug = session.metadata?.areaSlug;
      const email = session.customer_email || session.metadata?.email;
      const areaName = session.metadata?.areaName || 'Unknown Area';

      if (!areaSlug || !email) {
        console.error('Missing required metadata for report generation:', {
          areaSlug,
          email,
          sessionId: session.id,
        });
        break;
      }

      try {
        // Get area data
        const area = getAreaBySlug(areaSlug);
        if (!area) {
          console.error('Area not found:', areaSlug);
          break;
        }

        // Generate the report
        console.log(`Generating report for ${areaName}...`);
        const reportContent = await generateReport(area);

        // Store the report
        const reportId = generateReportId();
        const report = {
          id: reportId,
          areaId: area.id,
          areaName: area.name,
          content: reportContent,
          createdAt: new Date().toISOString(),
        };
        storeReport(report);

        // Send email with report link
        await sendReportEmail(email, reportId, areaName);

        console.log('Report generated and stored:', {
          reportId,
          areaName,
          email,
        });
      } catch (error) {
        console.error('Error generating report after payment:', error);
        // In production, you might want to:
        // - Store the failed payment for retry
        // - Send an error notification
        // - Refund the customer
      }

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

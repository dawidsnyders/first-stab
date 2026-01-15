import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getReportBySessionId } from '@/lib/report-storage';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia' as any,
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session_id parameter' },
        { status: 400 }
      );
    }

    // Retrieve the checkout session from Stripe to verify it exists
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Security fix: Look up report by session ID, not by area
    // This ensures each customer gets their own report, even if multiple
    // customers purchase reports for the same area
    const report = getReportBySessionId(sessionId);

    if (!report) {
      return NextResponse.json({
        reportId: null,
        message: 'Report is being generated, please check back in a few minutes',
      });
    }

    // Verify the session email matches the report email (additional security check)
    const sessionEmail = session.customer_email || session.metadata?.email;
    if (sessionEmail && sessionEmail !== report.email) {
      console.error('Email mismatch between session and report:', {
        sessionEmail,
        reportEmail: report.email,
        sessionId,
      });
      return NextResponse.json(
        { error: 'Report access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      reportId: report.id,
      reportUrl: `/reports/${report.id}`,
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json(
      { error: 'Failed to fetch report' },
      { status: 500 }
    );
  }
}

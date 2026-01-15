import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getReportsByArea } from '@/lib/report-storage';
import { getAreaBySlug } from '@/data/areas';

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

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const areaSlug = session.metadata?.areaSlug;

    if (!areaSlug) {
      return NextResponse.json(
        { error: 'No area found in session metadata' },
        { status: 404 }
      );
    }

    const area = getAreaBySlug(areaSlug);
    if (!area) {
      return NextResponse.json(
        { error: 'Area not found' },
        { status: 404 }
      );
    }

    // Get the most recent report for this area
    const reports = getReportsByArea(area.id);
    const latestReport = reports.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];

    if (!latestReport) {
      return NextResponse.json({
        reportId: null,
        message: 'Report is being generated, please check back in a few minutes',
      });
    }

    return NextResponse.json({
      reportId: latestReport.id,
      reportUrl: `/reports/${latestReport.id}`,
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json(
      { error: 'Failed to fetch report' },
      { status: 500 }
    );
  }
}

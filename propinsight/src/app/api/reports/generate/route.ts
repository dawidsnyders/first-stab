import { NextRequest, NextResponse } from 'next/server';
import { generateReport } from '@/lib/report-generation';
import { getAreaBySlug } from '@/data/areas';
import { storeReport, generateReportId } from '@/lib/report-storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { areaSlug } = body;

    if (!areaSlug) {
      return NextResponse.json(
        { error: 'Missing required field: areaSlug' },
        { status: 400 }
      );
    }

    const area = getAreaBySlug(areaSlug);
    if (!area) {
      return NextResponse.json(
        { error: 'Area not found' },
        { status: 404 }
      );
    }

    // Generate the report
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

    return NextResponse.json({
      success: true,
      reportId,
      areaName: area.name,
    });
  } catch (error) {
    console.error('Report generation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate report',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

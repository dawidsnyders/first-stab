// Simple email service for MVP
// In production, use a service like SendGrid, Resend, or AWS SES

export async function sendReportEmail(
  email: string,
  reportId: string,
  areaName: string
): Promise<void> {
  const reportUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reports/${reportId}`;

  // For MVP, we'll just log the email
  // In production, integrate with an email service
  console.log('📧 Email would be sent:', {
    to: email,
    subject: `Your ${areaName} Property Market Analysis Report`,
    body: `Thank you for your purchase! Your report is ready.

View your report: ${reportUrl}

This report contains comprehensive market analysis for ${areaName}.

Best regards,
PropInsight Team`,
    reportUrl,
  });

  // TODO: Integrate with email service (SendGrid, Resend, etc.)
  // Example with Resend:
  // await resend.emails.send({
  //   from: 'reports@propinsight.co.za',
  //   to: email,
  //   subject: `Your ${areaName} Property Market Analysis Report`,
  //   html: `...`,
  // });
}

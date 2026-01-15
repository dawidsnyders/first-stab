import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';

interface PageProps {
  searchParams: Promise<{ session_id?: string }>;
}

async function getReportLink(sessionId: string | undefined): Promise<string | null> {
  if (!sessionId) return null;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/reports/by-session?session_id=${sessionId}`,
      { cache: 'no-store' }
    );
    const data = await response.json();
    return data.reportUrl || null;
  } catch (error) {
    console.error('Error fetching report link:', error);
    return null;
  }
}

export default async function CheckoutSuccessPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const sessionId = params.session_id;
  const reportUrl = sessionId ? await getReportLink(sessionId) : null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center">
          {/* Success icon */}
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Thank you for your purchase. Your report is being generated and will
            be delivered to your email shortly.
          </p>

          {sessionId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-8 text-left">
              <p className="text-sm text-gray-500 mb-1">Session ID:</p>
              <p className="text-xs font-mono text-gray-700 break-all">
                {sessionId}
              </p>
            </div>
          )}

          <div className="space-y-4">
            {reportUrl ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left">
                <h3 className="font-semibold text-green-900 mb-2">
                  Your report is ready!
                </h3>
                <p className="text-sm text-green-800 mb-4">
                  Your comprehensive market analysis report has been generated
                  and is ready to view.
                </p>
                <Link
                  href={reportUrl}
                  className="inline-block px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors"
                >
                  View Your Report →
                </Link>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <h3 className="font-semibold text-blue-900 mb-2">
                  What happens next?
                </h3>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    <span>
                      Your report is being generated using AI analysis
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    <span>
                      You'll receive an email with a download link within a few
                      minutes
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    <span>
                      The report will also be available here once ready
                    </span>
                  </li>
                </ul>
                <p className="text-xs text-blue-600 mt-4">
                  This page will automatically update when your report is ready.
                  You can also check your email.
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
              >
                Back to Home
              </Link>
              <Link
                href="/#explore"
                className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Explore More Areas
              </Link>
            </div>
          </div>

          <p className="text-sm text-gray-500 mt-8">
            If you have any questions, please contact us at{' '}
            <a
              href="mailto:support@propinsight.co.za"
              className="text-blue-600 hover:underline"
            >
              support@propinsight.co.za
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';
import { getAreaBySlug } from '@/data/areas';

interface PageProps {
  searchParams: Promise<{ area?: string }>;
}

export default async function CheckoutCancelPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const areaSlug = params.area;
  const area = areaSlug ? getAreaBySlug(areaSlug) : null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center">
          {/* Cancel icon */}
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-10 h-10 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Payment Cancelled
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Your payment was cancelled. No charges have been made.
          </p>

          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <p className="text-sm text-gray-600">
                You can return to complete your purchase at any time. Your
                report will be ready when you're ready.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {area && (
                <Link
                  href={`/area/${area.slug}`}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </Link>
              )}
              <Link
                href="/"
                className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Back to Home
              </Link>
              <Link
                href="/#explore"
                className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Explore Areas
              </Link>
            </div>
          </div>

          <p className="text-sm text-gray-500 mt-8">
            Need help? Contact us at{' '}
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

import { notFound } from "next/navigation";
import Link from "next/link";
import { getReport } from "@/lib/report-storage";
import { APP_NAME } from "@/lib/constants";
import { marked } from "marked";

interface PageProps {
  params: Promise<{ reportId: string }>;
}

// Simple markdown renderer - in production, use a proper library like react-markdown
function renderMarkdown(markdown: string): string {
  // For MVP, we'll use a simple approach
  // In production, use react-markdown or similar for better rendering
  return markdown;
}

export default async function ReportPage({ params }: PageProps) {
  const { reportId } = await params;
  const report = getReport(reportId);

  if (!report) {
    notFound();
  }

  // Convert markdown to HTML
  const htmlContent = await marked(report.content);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              {APP_NAME}
            </Link>
            <Link
              href={`/area/${report.areaName
                .toLowerCase()
                .replace(/\s+/g, "-")}`}
              className="text-sage-600 hover:text-sage-700 transition-colors duration-200"
            >
              ← Back to {report.areaName}
            </Link>
          </div>
        </div>
      </header>

      {/* Report Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          {/* Report Header */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {report.areaName} Property Market Analysis
            </h1>
            <p className="text-gray-500">
              Generated on{" "}
              {new Date(report.createdAt).toLocaleDateString("en-ZA", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {/* Report Body */}
          <div
            className="prose prose-lg max-w-none
              prose-headings:text-gray-900
              prose-p:text-gray-700
              prose-strong:text-gray-900
              prose-a:text-blue-600
              prose-a:no-underline
              prose-a:hover:underline
              prose-ul:text-gray-700
              prose-ol:text-gray-700
              prose-li:text-gray-700
              prose-table:text-gray-700
              prose-th:bg-gray-50
              prose-th:font-semibold
              prose-td:border-gray-200
              prose-blockquote:border-blue-200
              prose-blockquote:bg-blue-50
              prose-blockquote:text-gray-700
              prose-code:text-blue-600
              prose-code:bg-gray-100
              prose-code:px-1
              prose-code:py-0.5
              prose-code:rounded
              prose-pre:bg-gray-900
              prose-pre:text-gray-100"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-sage-600 text-white font-semibold rounded-xl hover:bg-sage-700 transition-colors duration-200 text-center"
          >
            Explore More Areas
          </Link>
          <form action="javascript:window.print()">
            <button
              type="submit"
              className="px-6 py-3 bg-stone-100 text-stone-700 font-semibold rounded-xl hover:bg-stone-200 transition-colors duration-200"
            >
              Print / Save as PDF
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-gray-500 text-sm text-center">
            This report is for informational purposes only and does not
            constitute financial advice.
          </p>
        </div>
      </footer>
    </div>
  );
}

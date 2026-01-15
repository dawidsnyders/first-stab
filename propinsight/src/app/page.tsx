import { SearchBar } from '@/components/ui/SearchBar';
import { MapView } from '@/components/map/MapView';
import { AreaCard } from '@/components/area/AreaCard';
import { getAreasByLevel } from '@/data/areas';
import { APP_NAME, REPORT_PRICE_DISPLAY } from '@/lib/constants';

export default function Home() {
  const featuredSuburbs = getAreasByLevel('suburb').slice(0, 6);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Floating Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-stone-900">{APP_NAME}</h1>
            <nav className="hidden sm:flex items-center gap-6">
              <a 
                href="#explore" 
                className="text-stone-600 hover:text-sage-600 transition-colors duration-200 font-medium"
              >
                Explore
              </a>
              <a 
                href="#pricing" 
                className="text-stone-600 hover:text-sage-600 transition-colors duration-200 font-medium"
              >
                Pricing
              </a>
              <a 
                href="#about" 
                className="text-stone-600 hover:text-sage-600 transition-colors duration-200 font-medium"
              >
                About
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="relative bg-gradient-to-br from-sage-100 via-stone-50 to-moss-50 text-stone-900 pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-terracotta-100/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-moss-100/30 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Property Intelligence
              <span className="block text-sage-600 mt-2">for South Africa</span>
            </h2>
            <p className="text-xl md:text-2xl text-stone-600 mb-10 font-light leading-relaxed max-w-2xl mx-auto">
              Discover comprehensive market insights for any suburb. 
              <span className="block mt-2">Make informed property decisions with data-driven analysis.</span>
            </p>
            <div className="flex justify-center mb-6">
              <SearchBar />
            </div>
            <p className="text-sm text-stone-500">
              Search by suburb name, estate, or city
            </p>
          </div>
        </div>
      </section>

      {/* Map section */}
      <section id="explore" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <h3 className="text-3xl font-bold text-stone-900 mb-3">
            Explore the Western Cape
          </h3>
          <p className="text-stone-600 text-lg">
            Click on an area to see quick stats, or view the full details page
          </p>
        </div>
        <MapView initialLevel="suburb" />
      </section>

      {/* Featured suburbs */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">
            Popular Areas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredSuburbs.map((area) => (
              <AreaCard key={area.id} area={area} />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          How It Works
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StepCard
            number={1}
            title="Search or Browse"
            description="Find your area of interest using search or the interactive map"
          />
          <StepCard
            number={2}
            title="View Free Insights"
            description="See average prices, trends, and sales volume at a glance"
          />
          <StepCard
            number={3}
            title="Get Full Report"
            description={`Purchase a comprehensive analysis report for just ${REPORT_PRICE_DISPLAY}`}
          />
        </div>
      </section>

      {/* Report preview */}
      <section id="pricing" className="bg-stone-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-3xl font-bold mb-4">
              Professional Market Analysis
            </h3>
            <p className="text-stone-400 mb-8">
              Each report includes 10-15 pages of in-depth analysis
            </p>
            <div className="bg-stone-800 rounded-2xl p-8 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ReportFeature
                  title="10-Year Price Analysis"
                  description="Year-by-year breakdown with CAGR calculations"
                />
                <ReportFeature
                  title="National Benchmarks"
                  description="Compare performance to SA property market"
                />
                <ReportFeature
                  title="Growth Drivers"
                  description="Understand what's driving prices in the area"
                />
                <ReportFeature
                  title="Investment Outlook"
                  description="Forward-looking scenarios and recommendations"
                />
                <ReportFeature
                  title="Comparable Areas"
                  description="See how the area stacks up to neighbors"
                />
                <ReportFeature
                  title="Risk Assessment"
                  description="Know what factors could affect values"
                />
              </div>
              <div className="mt-8 pt-8 border-t border-stone-700 text-center">
                <span className="text-4xl font-bold">{REPORT_PRICE_DISPLAY}</span>
                <span className="text-stone-400 ml-2">per report</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-stone-500 text-sm">
              2026 {APP_NAME}. Data for informational purposes only.
            </p>
            <div className="flex gap-6 text-sm text-stone-500">
              <a href="#" className="hover:text-sage-600 transition-colors duration-200">Terms</a>
              <a href="#" className="hover:text-sage-600 transition-colors duration-200">Privacy</a>
              <a href="#" className="hover:text-sage-600 transition-colors duration-200">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 bg-sage-100 text-sage-600 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 transition-colors duration-200 hover:bg-sage-200">
        {number}
      </div>
      <h4 className="text-lg font-semibold text-stone-900 mb-2">{title}</h4>
      <p className="text-stone-600">{description}</p>
    </div>
  );
}

function ReportFeature({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <svg
        className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
      <div>
        <h5 className="font-medium text-white">{title}</h5>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
    </div>
  );
}

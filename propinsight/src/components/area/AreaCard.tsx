import Link from 'next/link';
import { Area, formatPrice, formatPriceChange } from '@/types';

interface AreaCardProps {
  area: Area;
}

export function AreaCard({ area }: AreaCardProps) {
  const { stats } = area;
  const isPositive = stats && stats.priceChangeYoY >= 0;

  return (
    <Link
      href={`/area/${area.slug}`}
      className="block p-6 bg-white border border-stone-200 rounded-xl hover:shadow-lg hover:border-sage-300 transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-stone-900">{area.name}</h3>
          <span className="text-sm text-stone-500 capitalize">{area.level}</span>
        </div>
        {stats && (
          <span
            className={`px-2 py-1 text-sm font-medium rounded-lg ${
              isPositive
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {formatPriceChange(stats.priceChangeYoY)} YoY
          </span>
        )}
      </div>

      {stats && (
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-stone-600">Avg Price</span>
            <span className="font-semibold text-stone-900">
              {formatPrice(stats.avgPrice)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-600">Sales (12mo)</span>
            <span className="font-semibold text-stone-900">
              {stats.salesCount.toLocaleString()}
            </span>
          </div>
          {stats.avgPricePerSqm && (
            <div className="flex justify-between">
              <span className="text-stone-600">Per m²</span>
              <span className="font-semibold text-stone-900">
                {formatPrice(stats.avgPricePerSqm)}
              </span>
            </div>
          )}
        </div>
      )}
    </Link>
  );
}

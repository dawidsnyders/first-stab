"use client";

import { useState } from "react";
import { Development } from "@/types";
import { formatPrice } from "@/types";
import {
  CalendarIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

interface DevelopmentsSectionProps {
  developments: Development[];
  areaName: string;
}

export function DevelopmentsSection({
  developments,
  areaName,
}: DevelopmentsSectionProps) {
  if (developments.length === 0) {
    return null;
  }

  const ongoing = developments.filter((d) => d.status === "ongoing");
  const upcoming = developments.filter((d) => d.status === "upcoming");

  return (
    <div className="space-y-8">
      {/* Ongoing Developments */}
      {ongoing.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-stone-900 mb-4">
            Ongoing Developments
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ongoing.map((development) => (
              <DevelopmentCard key={development.id} development={development} />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Developments */}
      {upcoming.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-stone-900 mb-4">
            Upcoming Developments
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcoming.map((development) => (
              <DevelopmentCard key={development.id} development={development} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface DevelopmentCardProps {
  development: Development;
}

function DeveloperLogo({ developer }: { developer: Development["developer"] }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Show text fallback if no logo, logo is invalid, or image fails to load
  const showTextFallback =
    !developer.logo || imageError || !developer.logo.startsWith("http");

  return (
    <div className="h-6 flex items-center min-w-0 flex-1 pr-2">
      {!showTextFallback ? (
        <img
          src={developer.logo}
          alt={developer.name}
          className={`h-full w-auto object-contain max-w-[100px] ${
            imageLoaded ? "opacity-100" : "opacity-0"
          } transition-opacity duration-200`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
      ) : (
        <span className="text-xs font-semibold text-stone-700 truncate">
          {developer.name}
        </span>
      )}
    </div>
  );
}

function DevelopmentCard({ development }: DevelopmentCardProps) {
  const completionDate = new Date(development.estimatedCompletion);
  const isPastDue = completionDate < new Date();
  const daysUntilCompletion = Math.ceil(
    (completionDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const getStatusBadge = () => {
    if (development.status === "ongoing") {
      return (
        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
          Ongoing
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
        Upcoming
      </span>
    );
  };

  return (
    <Link
      href={development.website}
      target="_blank"
      rel="noopener noreferrer"
      className="group bg-white border border-stone-200 rounded-xl p-4 hover:shadow-lg hover:border-sage-300 transition-all duration-200 flex flex-col max-h-[150px] overflow-hidden"
    >
      {/* Developer Logo & Status */}
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <DeveloperLogo developer={development.developer} />
        <div className="flex-shrink-0">{getStatusBadge()}</div>
      </div>

      {/* Development Name */}
      <h4 className="text-sm font-bold text-stone-900 mb-1.5 group-hover:text-sage-600 transition-colors duration-200 line-clamp-1 flex-shrink-0">
        {development.name}
      </h4>

      {/* Details - Compact layout */}
      <div className="flex items-center justify-between gap-3 mb-2 flex-grow min-h-0">
        <div className="flex items-center gap-1.5 text-xs text-stone-600 min-w-0 flex-1">
          <CalendarIcon className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">
            {isPastDue
              ? "Past due"
              : daysUntilCompletion <= 90
              ? `${daysUntilCompletion} days`
              : completionDate.toLocaleDateString("en-ZA", {
                  month: "short",
                  year: "numeric",
                })}
          </span>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[10px] text-stone-500 leading-tight">Avg Price</p>
          <p className="text-sm font-bold text-stone-900 leading-tight">
            {formatPrice(development.averageApartmentPrice)}
          </p>
        </div>
      </div>

      {/* View Link */}
      <div className="flex items-center gap-1.5 text-xs text-sage-600 font-medium pt-1.5 border-t border-stone-100 group-hover:gap-2 transition-all duration-200 flex-shrink-0">
        <span>View Development</span>
        <ArrowTopRightOnSquareIcon className="w-3 h-3" />
      </div>
    </Link>
  );
}

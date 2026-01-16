"use client";

import { useState } from "react";
import { Area } from "@/types";
import { AreaLocationMap } from "@/components/map/AreaLocationMap";
import { MapModal } from "@/components/ui/MapModal";
import { MapView } from "@/components/map/MapView";
import { MapIcon } from "@heroicons/react/24/outline";

interface AreaMapWithButtonProps {
  area: Area;
}

export function AreaMapWithButton({ area }: AreaMapWithButtonProps) {
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  return (
    <div className="relative">
      <AreaLocationMap area={area} />
      <button
        onClick={() => setIsMapModalOpen(true)}
        className="absolute bottom-[6px] right-[6px] px-3 py-1.5 bg-white hover:bg-stone-50 text-stone-900 text-xs font-medium rounded-lg shadow-md hover:shadow-lg border border-stone-200 transition-all duration-100 flex items-center gap-1.5 z-10"
      >
        <MapIcon className="w-3.5 h-3.5" />
        <span>View Map</span>
      </button>

      {/* Map Modal */}
      <MapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
      >
        <MapView initialLevel="suburb" />
      </MapModal>
    </div>
  );
}

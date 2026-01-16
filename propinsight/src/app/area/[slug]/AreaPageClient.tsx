"use client";

import { useState, useEffect, useRef } from "react";
import { ReportCTA } from "./ReportCTA";
import { StickyReportCTA } from "@/components/area/StickyReportCTA";
import { Area } from "@/types";

interface AreaPageClientProps {
  area: Area;
}

export function AreaPageClient({ area }: AreaPageClientProps) {
  const [isReportSectionVisible, setIsReportSectionVisible] = useState(false);
  const reportSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // When the report section is visible in viewport, hide the sticky footer
          setIsReportSectionVisible(entry.isIntersecting);
        });
      },
      {
        threshold: 0.1, // Trigger when 10% of the section is visible
        rootMargin: "-100px 0px", // Add some margin to trigger slightly before the section fully enters
      }
    );

    const currentRef = reportSectionRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <>
      {/* Report CTA */}
      <section
        ref={reportSectionRef}
        id="report"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
      >
        <ReportCTA area={area} />
      </section>

      {/* Premium Sticky Buy Report CTA */}
      <StickyReportCTA
        area={area}
        isReportSectionVisible={isReportSectionVisible}
      />
    </>
  );
}

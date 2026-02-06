'use client';

import { announcements } from '@/data/announcements';

export default function Home() {
  return (
    <div className="min-h-screen bg-bg-base">
      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Carousel will go here */}
        <div className="rounded-xl border border-border-subtle bg-bg-card p-8">
          <p className="text-text-secondary text-sm">
            {announcements.length} announcements loaded
          </p>
          <div className="mt-4 space-y-3">
            {announcements.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-3 rounded-lg bg-bg-elevated px-4 py-3"
              >
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: a.accentColor }}
                />
                <span className="text-sm font-medium">{a.headline}</span>
                <span className="ml-auto text-xs text-text-muted">
                  {a.stat.value} {a.stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

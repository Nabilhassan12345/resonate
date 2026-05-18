"use client";

import type { RetentionRisk } from "@/lib/tribe/types";

interface RetentionMarkersProps {
  risks: RetentionRisk[];
  onSelect: (t: number, label: string) => void;
  activeT: number | null;
}

export function RetentionMarkers({ risks, onSelect, activeT }: RetentionMarkersProps) {
  if (!risks.length) return null;
  return (
    <div className="space-y-2">
      <p className="text-[10px] uppercase tracking-widest text-zinc-500">
        Retention-risk timestamps
      </p>
      <div className="flex flex-wrap gap-2">
        {risks.map((r) => (
          <button
            key={r.t}
            type="button"
            onClick={() => onSelect(r.t, r.label)}
            className={`rounded-full border px-3 py-1.5 text-left text-xs transition-colors ${
              activeT === r.t
                ? "border-red-500 bg-red-500/20 text-red-200"
                : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
            }`}
          >
            <span className="font-mono font-bold">t={r.t}s</span>
            <span className="ml-2 opacity-80">{r.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

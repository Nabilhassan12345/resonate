"use client";

import { motion } from "framer-motion";
import type { RoiSnapshot } from "@/lib/tribe/types";

const LABELS: Record<string, string> = {
  fusiform_face: "Face (FFA)",
  early_visual: "Early visual",
  auditory_cortex: "Auditory",
  language_network: "Language",
  default_mode: "Default mode",
  reward_anticipation: "Reward anticipation",
};

interface RoiBarsProps {
  rois: RoiSnapshot[];
}

export function RoiBars({ rois }: RoiBarsProps) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] uppercase tracking-widest text-zinc-500">ROI activation</p>
      {rois.length === 0 ? (
        <p className="text-xs text-zinc-600">Scrub timeline or analyze to load ROIs</p>
      ) : (
        rois.map((r) => (
          <div key={r.region}>
            <div className="mb-0.5 flex justify-between text-[10px] text-zinc-500">
              <span>{LABELS[r.region] ?? r.region}</span>
              <span>{Math.round(r.activation * 100)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-red-600 to-yellow-500"
                initial={{ width: 0 }}
                animate={{ width: `${r.activation * 100}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
              />
            </div>
          </div>
        ))
      )}
    </div>
  );
}

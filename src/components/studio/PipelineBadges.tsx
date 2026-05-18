"use client";

import { motion } from "framer-motion";
import { PIPELINE_STEPS } from "@vendor/tribev2-reference/constants";

interface PipelineBadgesProps {
  activeStep: number;
  running: boolean;
}

export function PipelineBadges({ activeStep, running }: PipelineBadgesProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {PIPELINE_STEPS.map((step, i) => {
          const done = i < activeStep;
          const current = i === activeStep && running;
          return (
            <motion.span
              key={step}
              initial={{ opacity: 0.4 }}
              animate={{
                opacity: done || current ? 1 : 0.35,
                borderColor: current ? "#ef4444" : done ? "#52525b" : "#3f3f46",
              }}
              className="rounded-full border border-zinc-700 bg-zinc-900 px-2.5 py-1 font-mono text-[9px] text-zinc-400"
            >
              {step}
              {current && " …"}
            </motion.span>
          );
        })}
      </div>
      <p className="text-[10px] text-zinc-600">
        TRIBE v2 · simulated projection · 20,484 vertices
      </p>
    </div>
  );
}

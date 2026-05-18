"use client";

import { animate, useMotionValue, useMotionValueEvent } from "framer-motion";
import { useEffect, useState } from "react";

interface HookScoreProps {
  score: number;
  visible: boolean;
}

export function HookScore({ score, visible }: HookScoreProps) {
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useMotionValueEvent(mv, "change", (v) => setDisplay(Math.round(v)));

  useEffect(() => {
    if (visible) {
      const controls = animate(mv, score, { duration: 1.2, ease: "easeOut" });
      return controls.stop;
    }
    mv.set(0);
  }, [score, visible, mv]);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-6 text-center">
      <p className="text-[10px] uppercase tracking-widest text-zinc-500">Hook quality</p>
      <p className="mt-2 text-5xl font-bold tabular-nums text-white">
        <span>{display}</span>
        <span className="text-2xl text-zinc-500">/100</span>
      </p>
    </div>
  );
}

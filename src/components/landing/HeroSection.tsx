"use client";

import dynamic from "next/dynamic";
import { PillButton } from "@/components/ui/PillButton";

const BrainCanvas = dynamic(
  () => import("@/components/brain/BrainCanvas").then((m) => m.BrainCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 w-full max-w-3xl items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950">
        <span className="text-sm text-zinc-500">Loading cortical model…</span>
      </div>
    ),
  },
);

const HERO_ROIS = [
  { region: "early_visual", activation: 0.78 },
  { region: "fusiform_face", activation: 0.66 },
  { region: "reward_anticipation", activation: 0.7 },
  { region: "language_network", activation: 0.55 },
  { region: "default_mode", activation: 0.42 },
];

export function HeroSection() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-6 py-20 text-center">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">
        Resonate
      </p>
      <p className="mb-6 max-w-lg text-sm text-zinc-400">
        We engineer high-performing human attention.
        <br />
        <span className="text-zinc-500">The operating system for digital persuasion.</span>
      </p>
      <h1 className="text-balance text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
        Engineering human attention.
      </h1>
      <p className="mx-auto mt-6 max-w-xl text-lg text-zinc-400">
        Predict curiosity, emotion, and retention before you publish — using multimodal
        brain-response modeling.
      </p>
      <p className="mx-auto mt-3 max-w-lg text-sm text-zinc-500">
        AI-directed content engineering for creators, brands, and advertisers.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <PillButton href="#studio">Open Studio ↗</PillButton>
        <PillButton href="#problem">How it works ↗</PillButton>
        <PillButton href="#architecture">TRIBE architecture ↗</PillButton>
        <PillButton href="#studio">API ↗</PillButton>
      </div>
      <div className="mt-16 w-full max-w-3xl px-4">
        <BrainCanvas
          className="h-72 w-full md:h-96"
          roiActivations={HERO_ROIS}
          autoRotate
        />
      </div>
      <p className="mt-6 text-[10px] uppercase tracking-widest text-zinc-600">
        Powered by TRIBE v2-style cortical response modeling · simulated for demo
      </p>
    </section>
  );
}

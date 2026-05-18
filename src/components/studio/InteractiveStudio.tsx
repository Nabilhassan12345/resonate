"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  PIPELINE_STEPS,
  PIPELINE_STEP_MS,
  type TribeProfile,
} from "@vendor/tribev2-reference/constants";
import { roiAtTime } from "@/lib/tribe/interpolate";
import type { AnalyzeResponse } from "@/lib/tribe/types";
import { AttentionCharts } from "./AttentionCharts";
import { HookScore } from "./HookScore";
import { HeadSilhouette } from "./HeadSilhouette";
import { PipelineBadges } from "./PipelineBadges";
import { RetentionMarkers } from "./RetentionMarkers";
import { RewriteCards } from "./RewriteCards";
import { RoiBars } from "./RoiBars";
import { SegmentedToggle } from "./SegmentedToggle";

const BrainCanvas = dynamic(
  () => import("@/components/brain/BrainCanvas").then((m) => m.BrainCanvas),
  { ssr: false },
);

type StudioTab = "examples" | "performance" | "in-silico" | "multimodality";
type ViewMode = "true" | "compare" | "predicted";
type Surface = "normal" | "inflated";
type AnalyticsState = "open" | "close";

const DEMO_VIDEOS = ["/videos/stimulus-a.mp4", "/videos/stimulus-b.mp4"];

const TAB_OPTIONS = [
  { id: "examples", label: "Browse Examples" },
  { id: "performance", label: "Compare Performance" },
  { id: "in-silico", label: "Explore In-Silico" },
  { id: "multimodality", label: "Learn about Multimodality" },
] as const;

const VIEW_OPTIONS = [
  { value: "true", label: "True" },
  { value: "compare", label: "Compare" },
  { value: "predicted", label: "Predicted" },
] as const;

const SURFACE_OPTIONS = [
  { value: "normal", label: "Normal" },
  { value: "inflated", label: "Inflated" },
] as const;

const ANALYTICS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "close", label: "Close" },
] as const;

const ROI_CYCLES = [
  { region: "early_visual", freq: 0.45, phase: 0.0, base: 0.35, amp: 0.55 },
  { region: "fusiform_face", freq: 0.55, phase: 1.2, base: 0.3, amp: 0.5 },
  { region: "auditory_cortex", freq: 0.32, phase: 2.5, base: 0.32, amp: 0.45 },
  { region: "language_network", freq: 0.48, phase: 3.7, base: 0.32, amp: 0.5 },
  { region: "reward_anticipation", freq: 0.52, phase: 0.8, base: 0.3, amp: 0.45 },
  { region: "default_mode", freq: 0.27, phase: 4.2, base: 0.24, amp: 0.32 },
] as const;

function roisAtTime(t: number, intensity = 1): { region: string; activation: number }[] {
  return ROI_CYCLES.map((c) => {
    const wave = c.base + c.amp * Math.sin(t * c.freq + c.phase);
    const v = Math.max(0.05, Math.min(1, wave)) * intensity;
    return { region: c.region, activation: v };
  });
}

function formatTime(t: number) {
  const m = Math.floor(t / 60).toString().padStart(2, "0");
  const s = Math.floor(t % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function InteractiveStudio() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [profile, setProfile] = useState<TribeProfile>("narrative");
  const [tab, setTab] = useState<StudioTab>("examples");
  const [viewMode, setViewMode] = useState<ViewMode>("compare");
  const [surface, setSurface] = useState<Surface>("normal");
  const [analyticsOpen, setAnalyticsOpen] = useState<AnalyticsState>("close");
  const [analyzing, setAnalyzing] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(20);
  const [playing, setPlaying] = useState(false);
  const [highlightRegion, setHighlightRegion] = useState<string | null>(null);
  const [activeRiskT, setActiveRiskT] = useState<number | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);

  useEffect(() => {
    fetch(DEMO_VIDEOS[0], { method: "HEAD" })
      .then((r) => setVideoSrc(r.ok ? DEMO_VIDEOS[0] : null))
      .catch(() => setVideoSrc(null));
  }, []);

  const seededRois = result ? roiAtTime(result.roiBySecond, Math.round(currentTime)) : [];
  const liveRois = roisAtTime(currentTime || 0.001, 1);
  const rois: { region: string; activation: number }[] =
    seededRois.length > 0
      ? seededRois.map((r) => {
          const cyclic = liveRois.find((x) => x.region === r.region)?.activation ?? 0;
          return { region: r.region, activation: Math.max(r.activation, cyclic * 0.85) };
        })
      : liveRois;
  const trueRois = rois.map((r) => ({
    region: r.region,
    activation: r.activation * 0.55,
  }));

  const handleTimeUpdate = useCallback(() => {
    const v = videoRef.current;
    if (v) setCurrentTime(Math.min(duration, v.currentTime));
  }, [duration]);

  const seekTo = useCallback((t: number) => {
    const v = videoRef.current;
    if (v) {
      v.currentTime = t;
    }
    setCurrentTime(t);
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  const runAnalyze = async () => {
    setAnalyzing(true);
    setResult(null);
    setPipelineStep(0);
    setAnalyticsOpen("open");

    const stepTimer = setInterval(() => {
      setPipelineStep((s) => Math.min(s + 1, PIPELINE_STEPS.length));
    }, PIPELINE_STEP_MS);

    try {
      const res = await fetch("/api/tribe/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, stimulusRef: videoSrc ?? "upload" }),
      });
      const data = (await res.json()) as AnalyzeResponse;
      setResult(data);
      setPipelineStep(PIPELINE_STEPS.length);
    } finally {
      clearInterval(stepTimer);
      setAnalyzing(false);
    }
  };

  const switchProfile = async (p: TribeProfile) => {
    setProfile(p);
    const res = await fetch(`/api/tribe/profiles/${p}`);
    const data = (await res.json()) as AnalyzeResponse;
    setResult((prev) =>
      prev
        ? { ...prev, ...data, profile: p, inference_mode: "simulated" }
        : ({
            ...data,
            inference_mode: "simulated",
            pipeline: [...PIPELINE_STEPS],
          } as AnalyzeResponse),
    );
  };

  const handleRiskSelect = (t: number, label: string) => {
    setActiveRiskT(t);
    seekTo(t);
    const match = rois[0]?.region ?? "default_mode";
    setHighlightRegion(
      label.toLowerCase().includes("visual")
        ? "early_visual"
        : label.toLowerCase().includes("dopamine")
          ? "reward_anticipation"
          : match,
    );
  };

  const hasResults = !!result && !analyzing;
  const isCompare = viewMode === "compare";

  return (
    <section id="studio" className="scroll-mt-8 border-t border-zinc-800 px-4 py-20 md:px-6">
      <div className="mx-auto max-w-7xl">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-500">
          Attention Studio
        </p>
        <h2 className="max-w-2xl text-3xl font-bold leading-tight md:text-4xl">
          See what your audience will feel.
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400">
          Upload any video stimulus and watch the brain respond. Our cortical response model
          predicts attention, emotion, and engagement across 20,484 vertices of the human cortex
          — frame by frame, before you publish.
        </p>

        <div className="mt-10 overflow-hidden rounded-3xl border border-zinc-800 bg-[#080808] shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="relative border-b border-zinc-800 bg-black lg:border-b-0 lg:border-r">
              <div className="absolute left-4 top-4 z-10">
                <button
                  type="button"
                  onClick={runAnalyze}
                  disabled={analyzing}
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/80 px-3 py-1.5 text-[11px] font-medium text-zinc-200 backdrop-blur transition hover:border-zinc-500 disabled:opacity-50"
                >
                  <svg
                    className="h-3 w-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v6m0 10v6m11-11h-6M7 12H1m17.36-6.36l-4.24 4.24M9.88 14.12l-4.24 4.24m12.72 0l-4.24-4.24M9.88 9.88L5.64 5.64" />
                  </svg>
                  {analyzing ? "Analyzing…" : "Analyze"}
                </button>
              </div>
              <div className="absolute right-4 top-4 z-10 flex items-center gap-2 text-[9px] uppercase tracking-widest text-zinc-500">
                <span>Low</span>
                <span className="h-1.5 w-20 rounded-full bg-gradient-to-r from-white via-yellow-300 via-orange-500 to-red-600" />
                <span>High</span>
                <span className="ml-1 text-zinc-600">Activity</span>
              </div>

              <div className="flex items-center justify-center gap-4 px-6 pb-6 pt-16 md:gap-8">
                {isCompare ? (
                  <>
                    <HeadSilhouette
                      facing="right"
                      label="True"
                      inflated={surface === "inflated"}
                    >
                      <BrainCanvas
                        transparent
                        showLegend={false}
                        autoRotate={false}
                        view="lateral"
                        inflated={surface === "inflated"}
                        roiActivations={trueRois}
                        highlightRegion={null}
                      />
                    </HeadSilhouette>
                    <HeadSilhouette
                      facing="right"
                      label="Predicted"
                      inflated={surface === "inflated"}
                    >
                      <BrainCanvas
                        transparent
                        showLegend={false}
                        autoRotate={false}
                        view="lateral"
                        inflated={surface === "inflated"}
                        roiActivations={rois}
                        highlightRegion={highlightRegion}
                      />
                    </HeadSilhouette>
                  </>
                ) : (
                  <HeadSilhouette
                    facing="front"
                    size="lg"
                    inflated={surface === "inflated"}
                    label={viewMode === "true" ? "True" : "Predicted"}
                  >
                    <BrainCanvas
                      transparent
                      showLegend={false}
                      autoRotate={false}
                      view="anterior"
                      inflated={surface === "inflated"}
                      roiActivations={viewMode === "true" ? trueRois : rois}
                      highlightRegion={highlightRegion}
                    />
                  </HeadSilhouette>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 border-t border-zinc-900 bg-[#050505] px-4 py-4">
                <SegmentedToggle
                  options={VIEW_OPTIONS}
                  value={viewMode}
                  onChange={setViewMode}
                  size="sm"
                />
                <SegmentedToggle
                  options={SURFACE_OPTIONS}
                  value={surface}
                  onChange={setSurface}
                  size="sm"
                />
                <SegmentedToggle
                  options={ANALYTICS_OPTIONS}
                  value={analyticsOpen}
                  onChange={setAnalyticsOpen}
                  size="sm"
                />
              </div>
            </div>

            <div className="flex flex-col bg-[#0c0c0c]">
              <div className="flex flex-wrap gap-2 border-b border-zinc-900 p-4">
                {TAB_OPTIONS.map((t) => {
                  const active = tab === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTab(t.id)}
                      className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                        active
                          ? "bg-zinc-800 text-white ring-1 ring-zinc-700"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex-1 space-y-5 px-6 py-6">
                {tab === "examples" && (
                  <>
                    <p className="text-sm font-semibold text-zinc-200">
                      Compare Resonate&apos;s predicted attention with real audience response on
                      creator content.
                    </p>
                    <p className="text-xs leading-relaxed text-zinc-500">
                      Real engagement reflects everything — algorithm, mood, distraction,
                      novelty. Resonate isolates the cortical signal: predicting where curiosity
                      peaks and where retention breaks, frame-by-frame, before you publish. This
                      is the first system to engineer human attention at this resolution for
                      creators it has never seen.
                    </p>

                    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-black">
                      {videoSrc ? (
                        <video
                          ref={videoRef}
                          src={videoSrc}
                          className="aspect-video w-full object-cover"
                          onTimeUpdate={handleTimeUpdate}
                          onLoadedMetadata={(e) => {
                            const v = e.currentTarget;
                            setDuration(v.duration || 20);
                            setCurrentTime(v.currentTime);
                          }}
                          onPlay={() => setPlaying(true)}
                          onPause={() => setPlaying(false)}
                        />
                      ) : (
                        <div className="flex aspect-video flex-col items-center justify-center gap-3 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 text-center">
                          <p className="text-xs text-zinc-500">Stimulus preview</p>
                          <label className="cursor-pointer rounded-full border border-zinc-700 px-4 py-2 text-xs text-zinc-300 hover:border-zinc-500 hover:bg-zinc-900">
                            <input
                              type="file"
                              accept="video/*"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) setVideoSrc(URL.createObjectURL(f));
                              }}
                            />
                            Upload stimulus
                          </label>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={togglePlay}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-300 transition hover:bg-zinc-800"
                        aria-label={playing ? "Pause" : "Play"}
                      >
                        {playing ? (
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="6" y="5" width="4" height="14" rx="1" />
                            <rect x="14" y="5" width="4" height="14" rx="1" />
                          </svg>
                        ) : (
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        )}
                      </button>
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-300 hover:bg-zinc-800"
                        aria-label="Volume"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3 10v4h4l5 5V5L7 10H3zm13.5 2A4.5 4.5 0 0014 7.97v8.05a4.5 4.5 0 002.5-4.02z" />
                        </svg>
                      </button>
                      <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] text-zinc-400">
                        1×
                      </span>
                      <input
                        type="range"
                        min={0}
                        max={duration}
                        step={0.05}
                        value={currentTime}
                        onChange={(e) => seekTo(Number(e.target.value))}
                        className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-zinc-800 accent-white"
                      />
                      <span className="font-mono text-[10px] text-zinc-500">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                      <button
                        type="button"
                        onClick={() => videoRef.current?.requestFullscreen?.()}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-300 hover:bg-zinc-800"
                        aria-label="Fullscreen"
                      >
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4" />
                        </svg>
                      </button>
                    </div>
                  </>
                )}

                {tab === "performance" && (
                  <>
                    <p className="text-sm font-semibold text-zinc-200">
                      How well Resonate predicts attention in this stimulus.
                    </p>
                    <p className="text-xs leading-relaxed text-zinc-500">
                      Hook quality is engineered from cortical engagement across the first 5
                      seconds — the curiosity window that decides whether viewers stay or scroll.
                    </p>
                    <HookScore score={result?.summary.hookScore ?? 0} visible={hasResults} />
                    <AttentionCharts
                      timeline={result?.timeline ?? []}
                      currentTime={currentTime}
                      visible={hasResults}
                    />
                    {hasResults && result && (
                      <div className="rounded-xl border border-zinc-800 p-4">
                        <p className="text-sm text-zinc-300">{result.summary.viralStructure}</p>
                        <span className="mt-2 inline-block rounded-full border border-yellow-600/50 bg-yellow-500/10 px-3 py-1 text-xs text-yellow-400">
                          {result.summary.viralBadge}
                        </span>
                      </div>
                    )}
                  </>
                )}

                {tab === "in-silico" && (
                  <>
                    <p className="text-sm font-semibold text-zinc-200">
                      Where attention breaks down in silico.
                    </p>
                    <p className="text-xs leading-relaxed text-zinc-500">
                      Click any timestamp to jump the player and light up the affected cortical
                      region. ROI bars reflect predicted activation at the current frame.
                    </p>
                    <RetentionMarkers
                      risks={result?.retentionRisks ?? []}
                      onSelect={handleRiskSelect}
                      activeT={activeRiskT}
                    />
                    <RoiBars rois={rois} />
                  </>
                )}

                {tab === "multimodality" && (
                  <>
                    <p className="text-sm font-semibold text-zinc-200">
                      AI rewrites tied to under-activated curiosity regions.
                    </p>
                    <p className="text-xs leading-relaxed text-zinc-500">
                      Each suggestion is anchored to a predicted attention drop — language,
                      visual, or reward — and offers a tighter hook.
                    </p>
                    <RewriteCards rewrites={result?.rewrites ?? []} />
                  </>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-zinc-900 px-6 py-4 text-xs text-zinc-500">
                <button
                  type="button"
                  onClick={() => {
                    setResult(null);
                    setPipelineStep(0);
                    setActiveRiskT(null);
                    setHighlightRegion(null);
                    setAnalyticsOpen("close");
                  }}
                  className="inline-flex items-center gap-2 text-zinc-400 transition hover:text-white"
                >
                  ← Back
                </button>
                <div className="flex items-center gap-3">
                  {(["narrative", "visual"] as TribeProfile[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => switchProfile(p)}
                      className={`rounded-full px-3 py-1 text-[11px] capitalize transition ${
                        profile === p
                          ? "bg-zinc-800 text-white"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {analyticsOpen === "open" && (
            <div className="space-y-6 border-t border-zinc-900 bg-[#050505] px-6 py-8">
              <PipelineBadges
                activeStep={pipelineStep}
                running={analyzing}
              />
              <div className="grid gap-6 md:grid-cols-3">
                <HookScore score={result?.summary.hookScore ?? 0} visible={hasResults} />
                <div className="md:col-span-2">
                  <AttentionCharts
                    timeline={result?.timeline ?? []}
                    currentTime={currentTime}
                    visible={hasResults}
                  />
                </div>
              </div>
              <RetentionMarkers
                risks={result?.retentionRisks ?? []}
                onSelect={handleRiskSelect}
                activeT={activeRiskT}
              />
              <RewriteCards rewrites={result?.rewrites ?? []} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

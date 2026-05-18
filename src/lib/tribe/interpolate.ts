import type { RoiSnapshot, TimelinePoint } from "./types";

export function interpolateTimeline(
  timeline: TimelinePoint[],
  t: number,
): { attention: number; emotion: number } {
  if (!timeline.length) return { attention: 0, emotion: 0 };
  const clamped = Math.max(0, Math.min(20, t));
  const idx = timeline.findIndex((p) => p.t >= clamped);
  if (idx <= 0) return { attention: timeline[0].attention, emotion: timeline[0].emotion };
  if (idx === -1) {
    const last = timeline[timeline.length - 1];
    return { attention: last.attention, emotion: last.emotion };
  }
  const a = timeline[idx - 1];
  const b = timeline[idx];
  const ratio = (clamped - a.t) / (b.t - a.t || 1);
  return {
    attention: a.attention + (b.attention - a.attention) * ratio,
    emotion: a.emotion + (b.emotion - a.emotion) * ratio,
  };
}

export function roiAtTime(
  roiBySecond: Record<number, RoiSnapshot[]>,
  t: number,
): RoiSnapshot[] {
  const keys = Object.keys(roiBySecond)
    .map(Number)
    .sort((a, b) => a - b);
  if (!keys.length) return [];
  let nearest = keys[0];
  for (const k of keys) {
    if (Math.abs(k - t) < Math.abs(nearest - t)) nearest = k;
  }
  return roiBySecond[nearest] ?? [];
}

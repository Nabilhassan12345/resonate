import type { RoiRegion, TribeProfile } from "@vendor/tribev2-reference/constants";

export interface TimelinePoint {
  t: number;
  attention: number;
  emotion: number;
}

export interface RetentionRisk {
  t: number;
  label: string;
  severity: "low" | "medium" | "high";
}

export interface RewriteSuggestion {
  before: string;
  after: string;
  reason: string;
}

export interface RoiSnapshot {
  region: RoiRegion;
  activation: number;
}

export interface AnalyzeSummary {
  hookScore: number;
  viralStructure: string;
  viralBadge: string;
}

export interface AnalyzeResponse {
  inference_mode: "simulated";
  profile: TribeProfile;
  timeline: TimelinePoint[];
  roiBySecond: Record<number, RoiSnapshot[]>;
  retentionRisks: RetentionRisk[];
  summary: AnalyzeSummary;
  rewrites: RewriteSuggestion[];
  pipeline: string[];
  vertex_count: number;
}

export interface ProfileSeed {
  timeline: TimelinePoint[];
  roiBySecond: Record<number, RoiSnapshot[]>;
  retentionRisks: RetentionRisk[];
  summary: AnalyzeSummary;
  rewrites: RewriteSuggestion[];
}

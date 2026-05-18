/** TRIBE v2 reference constants (demo; no live weights). */

export const INFERENCE_MODE = "simulated" as const;

export const VERTEX_COUNT = 20484;

export const PIPELINE_STEPS = [
  "extract_multimodal_events",
  "tri_modal_encoding",
  "transformer_inference",
  "brain_mapping_fsaverage5",
  "roi_aggregation",
  "engagement_scoring",
] as const;

export const PIPELINE_STEP_MS = 400;

export const ANALYZE_DELAY_MS = 3000;

export const TIMELINE_SECONDS = 20;

export const ROI_REGIONS = [
  "fusiform_face",
  "early_visual",
  "auditory_cortex",
  "language_network",
  "default_mode",
  "reward_anticipation",
] as const;

export type RoiRegion = (typeof ROI_REGIONS)[number];

export const PROFILES = ["narrative", "visual"] as const;
export type TribeProfile = (typeof PROFILES)[number];

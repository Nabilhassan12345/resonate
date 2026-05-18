import {
  INFERENCE_MODE,
  PIPELINE_STEPS,
  VERTEX_COUNT,
  type TribeProfile,
} from "@vendor/tribev2-reference/constants";
import narrativeSeed from "@/data/tribe-seed/narrative.json";
import visualSeed from "@/data/tribe-seed/visual.json";
import type { AnalyzeResponse, ProfileSeed } from "./types";

const seeds: Record<TribeProfile, ProfileSeed> = {
  narrative: narrativeSeed as ProfileSeed,
  visual: visualSeed as ProfileSeed,
};

export class TribeModel {
  private loaded = false;
  private profile: TribeProfile = "narrative";

  static async from_pretrained(_modelId = "meta/tribev2-simulated"): Promise<TribeModel> {
    await new Promise((r) => setTimeout(r, 120));
    const model = new TribeModel();
    model.loaded = true;
    return model;
  }

  setProfile(profile: TribeProfile) {
    this.profile = profile;
  }

  getProfile(): TribeProfile {
    return this.profile;
  }

  async predict(_stimulusRef?: string): Promise<AnalyzeResponse> {
    if (!this.loaded) {
      await TribeModel.from_pretrained();
      this.loaded = true;
    }
    const seed = seeds[this.profile];
    return {
      inference_mode: INFERENCE_MODE,
      profile: this.profile,
      timeline: seed.timeline,
      roiBySecond: seed.roiBySecond,
      retentionRisks: seed.retentionRisks,
      summary: seed.summary,
      rewrites: seed.rewrites,
      pipeline: [...PIPELINE_STEPS],
      vertex_count: VERTEX_COUNT,
    };
  }
}

export function getProfileSeed(profile: TribeProfile): ProfileSeed {
  return seeds[profile];
}

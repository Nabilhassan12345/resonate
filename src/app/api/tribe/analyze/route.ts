import { NextResponse } from "next/server";
import { ANALYZE_DELAY_MS, type TribeProfile } from "@vendor/tribev2-reference/constants";
import { TribeModel } from "@/lib/tribe/TribeModel";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const profile = (body.profile === "visual" ? "visual" : "narrative") as TribeProfile;

  await new Promise((r) => setTimeout(r, ANALYZE_DELAY_MS));

  const model = await TribeModel.from_pretrained();
  model.setProfile(profile);
  const result = await model.predict(body.stimulusRef);

  return NextResponse.json(result);
}

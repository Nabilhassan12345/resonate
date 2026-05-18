import { NextResponse } from "next/server";
import { VERTEX_COUNT, type TribeProfile } from "@vendor/tribev2-reference/constants";
import { getProfileSeed } from "@/lib/tribe/TribeModel";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ profile: string }> },
) {
  const { profile: raw } = await params;
  const profile = (raw === "visual" ? "visual" : "narrative") as TribeProfile;
  const seed = getProfileSeed(profile);

  return NextResponse.json({
    profile,
    inference_mode: "simulated",
    vertex_count: VERTEX_COUNT,
    ...seed,
  });
}

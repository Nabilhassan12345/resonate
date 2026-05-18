# Resonate — AI Attention Engineering Platform

We engineer high-performing human attention. The operating system for digital persuasion.

AI-directed content engineering for creators, brands, and advertisers — powered by TRIBE v2-style cortical response modeling (**simulated** for demo; no live weights).

## Quick start

```bash
cd resonate
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Optional assets (demo works without them):

- `public/brain.glb` — Draco-compressed brain mesh (falls back to procedural 3-part model)
- `public/videos/stimulus-a.mp4`, `stimulus-b.mp4` — demo stimulus clips

## 90-second judge demo script

| Time | Action | Say |
|------|--------|-----|
| 0:00 | Land on hero | "Resonate engineers human attention before you publish — not after views." |
| 0:15 | Scroll to Attention Studio | "This is the hackathon demo: upload or use analyze on a stimulus." |
| 0:25 | Click **Analyze** | "We run a simulated TRIBE v2 pipeline — six steps, ~3 seconds — no HuggingFace, no pip install." |
| 0:35 | Watch pipeline badges animate | "Multimodal events → tri-modal encoding → transformer → fsaverage5 mapping → ROI → engagement score." |
| 0:45 | Point at attention + emotion charts | "Predicted curiosity and emotional engagement over 20 seconds." |
| 0:55 | Highlight hook score count-up | "Hook quality score — engineered from cortical engagement, not vanity metrics." |
| 1:05 | Click retention marker **t=11s** | "Retention-risk timestamps jump the player and highlight brain ROI." |
| 1:15 | Scrub timeline / toggle **visual** profile | "Charts morph — narrative vs visual content profiles." |
| 1:25 | Open **Rewrites** tab | "AI hook rewrites with reasons tied to under-activated curiosity regions." |
| 1:30 | Footer | "Architecture inspired by Meta TRIBE v2 open source — Resonate is the product layer for creators." |

## API (mock)

- `POST /api/tribe/analyze` — body: `{ "profile": "narrative" \| "visual", "stimulusRef": "..." }`
- `GET /api/tribe/profiles/narrative` | `visual`

Response includes `inference_mode: "simulated"`, timeline, ROI snapshots, rewrites, retention risks.

## Stack

- Next.js 16 · React 19 · Tailwind CSS v4
- Framer Motion · Recharts · React Three Fiber
- Mock `TribeModel` in `src/lib/tribe/TribeModel.ts`
- Reference constants in `vendor/tribev2-reference/constants.ts`

## Positioning

**Not:** "We analyze videos" / live TRIBE weights  
**Yes:** AI-directed content engineering with simulated cortical projections

Footer credit: *Cortical modeling architecture inspired by Meta TRIBE v2 (open source)*

© 2026 Resonate · Medipol Hackathon 2026

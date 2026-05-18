# Resonate

**Engineer attention before you ship.**

Resonate is a pre-publish studio for creators and brands. It models how the brain pays attention to video — curiosity, emotion, where people drop — and tells you **what to change in your cut** so viewers stay to full engagement.

Not views after the post. **Attention before publish.**

---

## The problem

- Creators film and edit for hours, then find out from the algorithm if the hook worked.
- Brands spend millions on production, talent, and media — and still lose money when the first seconds don’t land.
- Almost nobody tests **brain-level engagement** before go-live.

---

## What Resonate does

Upload a video. Resonate shows:

| Output | What it means |
|--------|----------------|
| **Hook score** | How strong your opening is for predicted attention |
| **Retention risks** | Exact seconds where viewers are likely to drop |
| **AI rewrites** | What to say and how to re-hook — tied to those moments |
| **Brain heatmap** | Where cortical engagement peaks and fades over time |

**True vs Predicted** views let you compare noisy real-world signal with model projection — like the Meta TRIBE demo, built for **creator decisions**.

---

## Under the hood (one paragraph)

Powered by **[TRIBE v2](https://github.com/facebookresearch/tribev2)** — Meta’s open model trained on **1,000+ hours of fMRI** from people watching real video. Published benchmarks report **~70× finer brain resolution** than earlier models and **several-fold gains** over standard baselines on new clips.

This hackathon build uses **simulated** projections for the live demo. Inference was explored in **Google Colab** on creator-style clips; **Resonate is the product layer** — scores, timestamps, and rewrites creators actually use.

---

## 60-second pitch (what to say)

> Brands and creators spend millions on content — actors, shoots, ads — and still lose money when the hook fails. They only find out after it’s live.
>
> **Resonate fixes that before publish.** We model how the brain pays attention using **TRIBE v2** — trained on **a thousand-plus hours of fMRI** from people watching real video, benchmarked to predict new clips far better than older brain models. **I ran it in Google Colab; Resonate is the product on top.**
>
> **Upload your video. Get what to change** — hook, pacing, cuts — plus a **score**, **risk timestamps**, and **rewrites** tied to each moment, **so people watch to the end.**
>
> **Hours saved for creators. Millions protected for media teams.** **Resonate — engineer attention before you ship.**

---

## Run locally

```bash
git clone https://github.com/Nabilhassan12345/resonate.git
cd resonate
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → scroll to **Attention Studio** → click **Analyze**.

---

## Medipol Hackathon 2026

Cortical modeling architecture inspired by **Meta TRIBE v2** (open source).

© 2026 Resonate

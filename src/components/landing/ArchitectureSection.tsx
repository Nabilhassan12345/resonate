import { SectionHeader } from "@/components/ui/SectionHeader";

const STEPS = [
  {
    n: 1,
    title: "Multimodal encoding",
    body: "Video, audio, and language embeddings capture the features that drive human attention — aligned to how creators actually structure shorts and ads.",
  },
  {
    n: 2,
    title: "Cortical response prediction",
    body: "TRIBE v2-format projection onto fsaverage5 surfaces — 20,484 vertices in simulated demo mode — maps stimulus to predicted ROI activation over time.",
  },
  {
    n: 3,
    title: "Attention engineering outputs",
    body: "Hook scores, retention-risk timestamps, and AI rewrites translate brain-response patterns into decisions you can ship today.",
  },
];

export function ArchitectureSection() {
  return (
    <section id="architecture" className="bg-[#0a0a0a] px-6 py-20">
      <div className="mx-auto max-w-xl">
        <SectionHeader title="How Resonate models attention" />
        <p className="mb-10 text-zinc-400">
          A three-stage pipeline from stimulus to publish-ready recommendations:
        </p>
        <div className="space-y-8">
          {STEPS.map((step) => (
            <div key={step.n} className="flex gap-4">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-black">
                {step.n}
              </span>
              <p className="text-sm leading-relaxed text-zinc-400">
                <strong className="text-white">{step.title}:</strong> {step.body}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-16 rounded-xl border border-zinc-800 bg-zinc-900 p-8">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="space-y-4">
              <div className="mx-auto h-1 w-1/2 rounded-full bg-zinc-700" />
              <p className="text-[10px] uppercase tracking-widest text-zinc-500">Stimulus</p>
              <p className="text-xs text-zinc-400">Video · Audio · Language</p>
            </div>
            <div className="space-y-4">
              <div className="mx-auto h-1 w-1/2 rounded-full bg-red-500" />
              <p className="text-[10px] uppercase tracking-widest text-zinc-500">Predicted ROI</p>
              <p className="text-xs text-zinc-400">Hooks · Drops · Rewrites</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

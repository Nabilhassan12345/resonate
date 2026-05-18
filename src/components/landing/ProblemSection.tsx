import { SectionHeader } from "@/components/ui/SectionHeader";

export function ProblemSection() {
  return (
    <section id="problem" className="border-t border-zinc-800 px-6 py-20">
      <div className="mx-auto max-w-xl">
        <SectionHeader title="Attention is not random. Neither is virality." />
        <div className="space-y-6 leading-relaxed text-zinc-400">
          <p>
            Creators publish blind. Platforms reward hooks you cannot see until after the fact.
            Virality is not luck — it is curiosity loops, dopamine anticipation, tension, and
            surprise stacked in milliseconds.
          </p>
          <p>
            Resonate makes those patterns visible before you ship. We project cortical engagement
            onto your cut, surface retention cliffs, and rewrite hooks against predicted attention
            — not vanity metrics.
          </p>
        </div>
      </div>
    </section>
  );
}

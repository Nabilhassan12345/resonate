import { SectionHeader } from "@/components/ui/SectionHeader";

export function MoatSection() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-xl text-center">
        <SectionHeader title="Human attention datasets compound" className="text-center [&_h2]:mx-auto" />
        <p className="mb-12 text-sm leading-relaxed text-zinc-400">
          Every analyzed cut trains Resonate&apos;s attention graph. Creators, brands, and
          advertisers share a growing map of what holds gaze — without shipping another A/B
          guess.
        </p>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            <p className="text-3xl font-bold text-white">50M+</p>
            <p className="mt-1 text-xs uppercase tracking-widest text-zinc-500">Creators</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-white">$240B</p>
            <p className="mt-1 text-xs uppercase tracking-widest text-zinc-500">
              Digital persuasion TAM
            </p>
          </div>
          <div>
            <p className="text-3xl font-bold text-white">↗</p>
            <p className="mt-1 text-xs uppercase tracking-widest text-zinc-500">
              Compounding signal
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

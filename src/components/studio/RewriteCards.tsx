import type { RewriteSuggestion } from "@/lib/tribe/types";

interface RewriteCardsProps {
  rewrites: RewriteSuggestion[];
}

export function RewriteCards({ rewrites }: RewriteCardsProps) {
  if (!rewrites.length) return null;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {rewrites.map((r, i) => (
        <div
          key={i}
          className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 text-sm"
        >
          <p className="text-[10px] uppercase tracking-widest text-zinc-500">Before</p>
          <p className="mt-1 text-zinc-500 line-through">{r.before}</p>
          <p className="mt-3 text-[10px] uppercase tracking-widest text-red-400">After</p>
          <p className="mt-1 font-medium text-white">{r.after}</p>
          <p className="mt-3 text-xs text-zinc-500">{r.reason}</p>
        </div>
      ))}
    </div>
  );
}

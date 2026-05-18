"use client";

interface SegmentedToggleProps<T extends string> {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  size?: "sm" | "md";
}

export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  size = "md",
}: SegmentedToggleProps<T>) {
  const pad = size === "sm" ? "px-3 py-1 text-[11px]" : "px-4 py-1.5 text-xs";
  return (
    <div className="inline-flex items-center rounded-full bg-zinc-900/70 p-1 ring-1 ring-zinc-800">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`rounded-full font-medium transition-colors ${pad} ${
              active
                ? "bg-zinc-700/80 text-white shadow-inner"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

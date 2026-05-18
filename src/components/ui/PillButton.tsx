import type { ReactNode } from "react";

interface PillButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  active?: boolean;
  className?: string;
}

export function PillButton({
  children,
  href,
  onClick,
  active,
  className = "",
}: PillButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-1 rounded-full border px-5 py-2.5 text-sm font-medium transition-all duration-300";
  const styles = active
    ? "border-white bg-white/10 text-white"
    : "border-white/50 text-white hover:border-white hover:bg-white/10";

  if (href) {
    return (
      <a href={href} className={`${base} ${styles} ${className}`}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={`${base} ${styles} ${className}`}>
      {children}
    </button>
  );
}

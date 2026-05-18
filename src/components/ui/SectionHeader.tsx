interface SectionHeaderProps {
  title: string;
  className?: string;
}

export function SectionHeader({ title, className = "" }: SectionHeaderProps) {
  return (
    <div className={`mb-8 ${className}`}>
      <h2 className="max-w-xs text-2xl font-bold leading-tight md:max-w-md">{title}</h2>
    </div>
  );
}

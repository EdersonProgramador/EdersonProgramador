type SectionHeaderProps = {
  label: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeader({ label, title, description, align = "left", className = "" }: SectionHeaderProps) {
  const alignClass = align === "center" ? "text-center mx-auto" : "text-left";
  return (
    <header className={`max-w-3xl ${alignClass} ${className}`}>
      <p className="section-label">{label}</p>
      <h2 className="pro-headline mt-3 text-[1.65rem] leading-tight sm:mt-4 sm:text-3xl md:text-4xl lg:text-[2.75rem]">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 text-sm leading-relaxed text-white/60 sm:mt-4 sm:text-base md:text-lg">{description}</p>
      ) : null}
    </header>
  );
}

import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`group inline-flex items-baseline gap-2 ${className}`} aria-label="FAM De Studio, home">
      <span className="t-serif text-[1.375rem] leading-none tracking-[0.12em]">FAM</span>
      <span className="t-eyebrow text-[0.625rem] tracking-[0.3em] text-muted transition-colors duration-500 group-hover:text-champagne">
        De Studio
      </span>
    </Link>
  );
}

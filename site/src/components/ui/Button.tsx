import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  href?: string;
  children: ReactNode;
  variant?: "solid" | "outline" | "link";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
};

const base =
  "t-nav inline-flex items-center justify-center gap-3 whitespace-nowrap transition-colors duration-500 disabled:opacity-50";

const styles = {
  solid: "btn-gold px-7 py-4",
  outline:
    "px-7 py-4 border border-line-strong text-text hover:border-champagne hover:text-champagne [.surface-ivory_&]:border-line-d-strong [.surface-ivory_&]:text-text-d [.surface-ivory_&]:hover:border-text-d",
  link: "link-line",
};

function Arrow() {
  return (
    <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden className="shrink-0">
      <path d="M0 5h12M8.5 1 13 5l-4.5 4" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

export function Button({
  href,
  children,
  variant = "solid",
  className = "",
  type = "button",
  disabled,
  onClick,
}: Props) {
  const cls = `${base} ${styles[variant]} ${className}`.trim();
  const content = (
    <>
      <span>{children}</span>
      {variant === "link" && <Arrow />}
    </>
  );
  if (href) {
    return (
      <Link href={href} className={cls} data-cursor="link">
        {content}
      </Link>
    );
  }
  return (
    <button type={type} className={cls} disabled={disabled} onClick={onClick}>
      {content}
    </button>
  );
}

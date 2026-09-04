type Props = {
  /** Section number, e.g. "01". Rendered only where sequence carries meaning. */
  n?: string;
  children: React.ReactNode;
  className?: string;
};

export function Eyebrow({ n, children, className = "" }: Props) {
  return (
    <p className={`t-eyebrow flex items-center gap-4 text-champagne ${className}`}>
      {n && (
        <>
          <span className="t-num text-[0.8125rem] tracking-[0.1em]">{n}</span>
          <span aria-hidden className="h-px w-8 bg-current opacity-60" />
        </>
      )}
      <span>{children}</span>
    </p>
  );
}

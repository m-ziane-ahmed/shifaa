export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="border-b border-shifaa-border bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-shifaa-ink md:text-4xl">{title}</h1>
        {description && <p className="mt-3 max-w-2xl text-shifaa-muted leading-relaxed">{description}</p>}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </div>
  );
}

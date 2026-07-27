import Link from "next/link";

/**
 * Standard page header with title, subtitle, and optional action button.
 */
export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-bold sm:text-2xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/**
 * Back navigation link.
 */
export function BackLink({ href, children = "← Back", className }: { href: string; children?: React.ReactNode; className?: string }) {
  return (
    <Link href={href} className={`text-sm text-muted transition hover:text-gold ${className || ""}`}>
      {children}
    </Link>
  );
}

/**
 * Stat card for dashboards.
 */
export function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

/**
 * Empty state placeholder with optional action.
 */
export function EmptyState({
  message = "Nothing here yet.",
  action,
}: {
  message?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border p-6 text-center">
      <p className="text-sm text-muted">{message}</p>
      {action}
    </div>
  );
}

/**
 * Detail row for the <dl> pattern used in lead detail pages.
 */
export function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

/**
 * Detail section card — wraps a titled group of DetailRows.
 */
export function DetailCard({
  title,
  children,
  variant = "default",
}: {
  title: string;
  children: React.ReactNode;
  variant?: "default" | "gold";
}) {
  return (
    <div
      className={`rounded-xl border p-5 ${
        variant === "gold"
          ? "border-gold/30 bg-gold/5"
          : "border-border bg-card"
      }`}
    >
      <h3 className={`mb-3 text-sm font-semibold ${variant === "gold" ? "text-gold" : "text-gold"}`}>
        {title}
      </h3>
      {children}
    </div>
  );
}

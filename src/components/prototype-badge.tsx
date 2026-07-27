/**
 * Visual indicator that the app is running in prototype/mock mode.
 * Shown in navbar during development.
 */
export function PrototypeBadge() {
  return (
    <span className="rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-warning">
      Prototype
    </span>
  );
}

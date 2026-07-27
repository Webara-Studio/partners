/**
 * Webara Studio logo — text-based with gold accent.
 * Matches the webarastudio.com brand.
 */
export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const text = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
  }[size];

  return (
    <div className={`font-head font-bold tracking-tight ${text}`}>
      <span className="text-cream">Webara</span>{" "}
      <span className="text-gold">Studio</span>
    </div>
  );
}

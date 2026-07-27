/**
 * Shared loading spinner — full-screen centered.
 */
export function LoadingSpinner() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
    </main>
  );
}

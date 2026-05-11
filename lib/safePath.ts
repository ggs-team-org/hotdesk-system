export function safePath(p: string | undefined, fallback: string): string {
  if (!p) return fallback;
  if (!p.startsWith("/")) return fallback;
  if (p.startsWith("//") || p.startsWith("/\\")) return fallback;
  return p;
}

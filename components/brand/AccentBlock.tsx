import { cn } from "@/lib/utils";

export function AccentBlock({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("block bg-brand-cyan", className)}
    />
  );
}

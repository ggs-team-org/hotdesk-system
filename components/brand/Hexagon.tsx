import { cn } from "@/lib/utils";

export function Hexagon({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden
      className={cn("fill-current", className)}
    >
      <polygon points="50,4 93,27 93,73 50,96 7,73 7,27" />
    </svg>
  );
}

import { cn } from "@/lib/utils";

type Variant = "full" | "white";

export function Logo({
  variant = "full",
  className,
}: {
  variant?: Variant;
  className?: string;
}) {
  return (
    <img
      src="/logo/GGS-Primary-Logo.svg"
      alt="GGS"
      draggable={false}
      className={cn(
        "h-10 w-auto select-none",
        variant === "white" && "brightness-0 invert",
        className,
      )}
    />
  );
}

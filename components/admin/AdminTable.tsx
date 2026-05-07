import { cn } from "@/lib/utils";

export function AdminTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="-mx-4 overflow-x-auto pb-1 sm:mx-0">
      <div className="inline-block min-w-full px-4 sm:px-0 align-middle">
        <div className="overflow-hidden rounded-xl border border-brand-blue-200/60 bg-white shadow-sm">
          <table className="w-full min-w-[640px] text-left">{children}</table>
        </div>
      </div>
    </div>
  );
}

export function AdminThead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-brand-mist/70 text-[11px] font-semibold uppercase tracking-wider text-brand-navy/70 sm:text-[10px]">
      {children}
    </thead>
  );
}

export function AdminTh({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <th className={cn("px-3 py-3 font-semibold sm:px-4", className)}>{children}</th>;
}

export function AdminTr({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <tr
      className={cn(
        "border-t border-brand-blue-200/40 text-sm text-brand-navy transition-colors hover:bg-brand-mist/40",
        className,
      )}
    >
      {children}
    </tr>
  );
}

export function AdminTd({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={cn("px-3 py-3 align-middle sm:px-4", className)}>{children}</td>;
}

export function StatusPill({
  active,
}: {
  active: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
        active
          ? "bg-brand-cyan/30 text-brand-navy"
          : "bg-brand-blue-200/40 text-brand-navy/70",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          active ? "bg-brand-purple" : "bg-brand-navy/40",
        )}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

import { AccentBlock } from "@/components/brand/AccentBlock";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="relative inline-block">
        <AccentBlock className="absolute -left-2 top-2 h-5 w-16 -z-10 sm:h-6 sm:w-20" />
        <h1 className="relative text-2xl font-bold text-brand-navy sm:text-3xl">Admin</h1>
      </div>
      <p className="mt-2 text-xs italic text-brand-navy/60 sm:text-sm">
        Toggle desks between hot and cold, and assign owners to cold desks.
      </p>

      <div className="mt-6 sm:mt-8">{children}</div>
    </main>
  );
}

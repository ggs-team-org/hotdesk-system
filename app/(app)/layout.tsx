import { Toaster } from "sonner";
import { Header } from "@/components/layout/Header";
import { Hexagon } from "@/components/brand/Hexagon";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen w-full min-w-0 flex-col overflow-x-hidden">
      <Hexagon
        size={420}
        className="pointer-events-none fixed -top-32 -right-32 z-0 text-brand-cyan/10 motion-safe:animate-[float_12s_ease-in-out_infinite]"
      />
      <Hexagon
        size={520}
        className="pointer-events-none fixed -bottom-40 -left-40 z-0 text-brand-purple/[0.06] motion-safe:animate-[float_14s_ease-in-out_infinite_reverse]"
      />
      <Header />
      <div className="relative z-10 w-full min-w-0 flex-1 overflow-x-hidden">
        {children}
      </div>
      <Toaster
        position="top-center"
        richColors
        closeButton
        toastOptions={{
          classNames: {
            toast: "font-sans",
          },
        }}
      />
    </div>
  );
}

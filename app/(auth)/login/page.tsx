import { redirect } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { AccentBlock } from "@/components/brand/AccentBlock";
import { Hexagon } from "@/components/brand/Hexagon";
import { auth, signIn } from "@/auth";
import { safePath } from "@/lib/safePath";
import { SignInButton } from "./SignInButton";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const target = safePath(params.callbackUrl, "/book");
  if (session?.user) {
    redirect(target);
  }

  async function googleSignIn() {
    "use server";
    await signIn("google", { redirectTo: target });
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-brand-navy">
      <AccentBlock className="absolute -left-16 top-24 h-40 w-72 rotate-[-8deg] opacity-90 animate-in fade-in slide-in-from-left-16 duration-1000 fill-mode-backwards" />
      <AccentBlock className="absolute -right-20 bottom-32 h-28 w-56 rotate-[6deg] opacity-80 animate-in fade-in slide-in-from-right-16 duration-1000 delay-150 fill-mode-backwards" />
      <Hexagon
        size={220}
        className="absolute -bottom-20 -right-10 text-brand-purple/30 animate-in fade-in duration-[1500ms] delay-200 fill-mode-backwards motion-safe:animate-[float_8s_ease-in-out_infinite]"
      />
      <Hexagon
        size={140}
        className="absolute top-12 right-1/4 text-brand-cyan/10 animate-in fade-in duration-[1500ms] delay-300 fill-mode-backwards motion-safe:animate-[float_10s_ease-in-out_infinite_reverse]"
      />

      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-8 px-4 sm:gap-12 sm:px-6">
        <Logo
          variant="white"
          className="h-12 animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-700 fill-mode-backwards sm:h-16"
        />

        <div className="w-full max-w-md rounded-2xl bg-white/5 p-6 backdrop-blur-sm ring-1 ring-white/10 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300 fill-mode-backwards sm:p-8">
          <div className="space-y-2 text-center">
            <h1 className="text-xl font-bold text-white sm:text-2xl">
              Welcome to GGS Hotdesk
            </h1>
            <p className="text-sm text-white/70">
              Sign in with your GGS Google account to book a desk.
            </p>
          </div>

          <form action={googleSignIn}>
            <SignInButton />
          </form>

          {params.error && (
            <p className="mt-4 text-center text-xs text-brand-cyan">
              {params.error === "AccessDenied"
                ? "Access denied. Your account isn't allowed to sign in here."
                : "Sign-in failed. Please try again."}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

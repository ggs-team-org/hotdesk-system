import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { UserMenu } from "@/components/layout/UserMenu";
import { auth } from "@/auth";

export async function Header() {
  const session = await auth();
  const user = session?.user;

  const navItems = [
    { href: "/book", label: "Book" },
    { href: "/my-bookings", label: "My bookings" },
    ...(user?.role === "admin"
      ? [{ href: "/admin/desks", label: "Admin" }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-brand-blue-200/50 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:gap-8 sm:px-6">
        <Link href="/book" aria-label="GGS Hotdesk home" className="shrink-0">
          <Logo className="h-8 w-auto sm:h-10" />
        </Link>

        <nav className="flex items-center gap-2 sm:gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-xs font-medium text-brand-navy/80 transition-colors hover:text-brand-purple sm:text-sm"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {user && (
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right leading-tight sm:block">
              <div className="text-sm font-medium text-brand-navy">
                {user.name ?? user.email}
              </div>
              <div className="text-xs text-brand-navy/60">{user.email}</div>
            </div>
            <UserMenu user={user} />
          </div>
        )}
      </div>
    </header>
  );
}

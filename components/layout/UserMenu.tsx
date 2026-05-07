"use client";

import { LogOut } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { initials } from "@/lib/utils";
import { signOutAction } from "@/app/actions/auth";

export function UserMenu({
  user,
}: {
  user: {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    role: "admin" | "user";
  };
}) {
  const display = user.name ?? user.email;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Account menu"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-purple text-sm font-medium text-white ring-offset-2 transition hover:ring-2 hover:ring-brand-purple/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple"
        >
          {initials(display)}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="end">
        <div className="border-b border-brand-blue-200/40 px-2 py-2">
          <div className="text-sm font-medium text-brand-navy">
            {user.name ?? "Signed in"}
          </div>
          <div className="truncate text-xs text-brand-navy/60">
            {user.email}
          </div>
          {user.role === "admin" && (
            <span className="mt-1 inline-flex items-center rounded-full bg-brand-cyan/30 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-navy">
              Admin
            </span>
          )}
        </div>
        <form action={signOutAction} className="pt-1">
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm text-brand-navy hover:bg-brand-mist"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </form>
      </PopoverContent>
    </Popover>
  );
}

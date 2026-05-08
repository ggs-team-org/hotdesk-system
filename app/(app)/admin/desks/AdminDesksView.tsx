"use client";

import { useState, useTransition } from "react";
import { Flame, Snowflake } from "lucide-react";
import type { Attendee, Desk } from "@/lib/mock";
import { userColor } from "@/lib/brand";
import {
  AdminTable,
  AdminTd,
  AdminTh,
  AdminThead,
  AdminTr,
  StatusPill,
} from "@/components/admin/AdminTable";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn, initials } from "@/lib/utils";
import {
  makeDeskCold as makeDeskColdAction,
  makeDeskHot as makeDeskHotAction,
  reassignDesk as reassignDeskAction,
} from "@/app/actions/desks";
import { runAction } from "@/lib/toast";

export function AdminDesksView({
  desks,
  floorNameById,
  userDirectory,
}: {
  desks: Desk[];
  floorNameById: Record<string, string>;
  userDirectory: Attendee[];
}) {
  const [, startTransition] = useTransition();

  function floorName(floorId: string) {
    return floorNameById[floorId] ?? "—";
  }

  function handleMakeCold(deskId: string, deskLabel: string, owner: Attendee) {
    startTransition(() =>
      runAction(() => makeDeskColdAction(deskId, owner.id), {
        loading: `Assigning ${deskLabel} to ${owner.name}…`,
        success: `${deskLabel} assigned to ${owner.name}`,
      }),
    );
  }
  function handleMakeHot(deskId: string, deskLabel: string) {
    startTransition(() =>
      runAction(() => makeDeskHotAction(deskId), {
        loading: `Making ${deskLabel} hot…`,
        success: `${deskLabel} is now hot`,
      }),
    );
  }
  function handleReassign(deskId: string, deskLabel: string, owner: Attendee) {
    startTransition(() =>
      runAction(() => reassignDeskAction(deskId, owner.id), {
        loading: `Reassigning ${deskLabel} to ${owner.name}…`,
        success: `${deskLabel} reassigned to ${owner.name}`,
      }),
    );
  }

  return (
    <section>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <h2 className="text-xl font-bold text-brand-navy">Desks</h2>
        <p className="text-xs italic text-brand-navy/60">
          Toggle desks between hot (anyone books per day) and cold (assigned to
          one person).
        </p>
      </div>

      {/* Mobile: stacked card list */}
      <div className="space-y-3 sm:hidden">
        {desks.map((d) => (
          <DeskCard
            key={d.id}
            desk={d}
            floorName={floorName(d.floorId)}
            userDirectory={userDirectory}
            onMakeCold={(owner) => handleMakeCold(d.id, d.label, owner)}
            onMakeHot={() => handleMakeHot(d.id, d.label)}
            onReassign={(owner) => handleReassign(d.id, d.label, owner)}
          />
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden sm:block">
        <AdminTable>
          <AdminThead>
            <tr>
              <AdminTh>Label</AdminTh>
              <AdminTh>Floor</AdminTh>
              <AdminTh>Status</AdminTh>
              <AdminTh>Type</AdminTh>
              <AdminTh className="text-right">Actions</AdminTh>
            </tr>
          </AdminThead>
          <tbody>
            {desks.map((d) => (
              <AdminTr key={d.id}>
                <AdminTd className="font-medium">{d.label}</AdminTd>
                <AdminTd className="text-brand-navy/80">
                  {floorName(d.floorId)}
                </AdminTd>
                <AdminTd>
                  <StatusPill active={d.active} />
                </AdminTd>
                <AdminTd>
                  <TypeCell desk={d} />
                </AdminTd>
                <AdminTd className="text-right">
                  <RowActions
                    desk={d}
                    userDirectory={userDirectory}
                    onMakeCold={(owner) => handleMakeCold(d.id, d.label, owner)}
                    onMakeHot={() => handleMakeHot(d.id, d.label)}
                    onReassign={(owner) => handleReassign(d.id, d.label, owner)}
                  />
                </AdminTd>
              </AdminTr>
            ))}
          </tbody>
        </AdminTable>
      </div>
    </section>
  );
}

function DeskCard({
  desk,
  floorName,
  userDirectory,
  onMakeCold,
  onMakeHot,
  onReassign,
}: {
  desk: Desk;
  floorName: string;
  userDirectory: Attendee[];
  onMakeCold: (owner: Attendee) => void;
  onMakeHot: () => void;
  onReassign: (owner: Attendee) => void;
}) {
  return (
    <div className="rounded-xl border border-brand-blue-200/60 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <h3 className="text-base font-bold text-brand-navy">{desk.label}</h3>
            <span className="text-xs text-brand-navy/60">{floorName}</span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusPill active={desk.active} />
            <TypeCell desk={desk} />
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap justify-end gap-2 border-t border-brand-blue-200/30 pt-3">
        <RowActions
          desk={desk}
          userDirectory={userDirectory}
          onMakeCold={onMakeCold}
          onMakeHot={onMakeHot}
          onReassign={onReassign}
        />
      </div>
    </div>
  );
}

function TypeCell({ desk }: { desk: Desk }) {
  if (desk.type === "hot") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-brand-cyan/30 px-2 py-0.5 text-[11px] font-medium text-brand-navy">
        <Flame className="h-3 w-3" />
        Hot
      </span>
    );
  }
  if (!desk.assignedTo) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-brand-blue-200/40 px-2 py-0.5 text-[11px] font-medium italic text-brand-navy/70">
        <Snowflake className="h-3 w-3" />
        Cold · unassigned
      </span>
    );
  }
  const c = userColor(desk.assignedTo.id);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-mist px-1 py-0.5 text-[11px] font-medium text-brand-navy ring-1 ring-brand-blue-200/60">
      <span
        className={cn(
          "grid h-5 w-5 place-items-center rounded-full text-[9px] font-bold text-brand-navy ring-1 ring-white",
          c.dot,
        )}
      >
        {initials(desk.assignedTo.name)}
      </span>
      <span>{desk.assignedTo.name}</span>
      <span className="pr-1.5 text-brand-navy/50">· cold</span>
    </span>
  );
}

function RowActions({
  desk,
  userDirectory,
  onMakeCold,
  onMakeHot,
  onReassign,
}: {
  desk: Desk;
  userDirectory: Attendee[];
  onMakeCold: (owner: Attendee) => void;
  onMakeHot: () => void;
  onReassign: (owner: Attendee) => void;
}) {
  if (desk.type === "hot") {
    return (
      <div className="flex justify-end gap-1.5">
        <UserPickerPopover
          label="Make cold…"
          icon={<Snowflake className="h-3.5 w-3.5" />}
          variant="outline"
          userDirectory={userDirectory}
          onPick={onMakeCold}
        />
      </div>
    );
  }
  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      <UserPickerPopover
        label="Reassign…"
        icon={null}
        variant="outline"
        userDirectory={userDirectory}
        onPick={onReassign}
      />
      <Button
        variant="outline"
        size="sm"
        onClick={onMakeHot}
        className="gap-1.5 border-brand-purple/40 text-brand-purple hover:bg-brand-purple/10 hover:text-brand-purple"
      >
        <Flame className="h-3.5 w-3.5" />
        Make hot
      </Button>
    </div>
  );
}

function UserPickerPopover({
  label,
  icon,
  variant,
  userDirectory,
  onPick,
}: {
  label: string;
  icon: React.ReactNode;
  variant: "default" | "outline";
  userDirectory: Attendee[];
  onPick: (user: Attendee) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={variant}
          size="sm"
          className={cn(
            "gap-1.5",
            variant === "outline" &&
              "border-brand-blue-200 text-brand-navy/80 hover:border-brand-purple hover:text-brand-purple",
          )}
        >
          {icon}
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-1" align="end">
        {userDirectory.length === 0 ? (
          <div className="px-2 py-1.5 text-xs italic text-brand-navy/60">
            No users yet — sign-ins will appear here.
          </div>
        ) : (
          <ul className="max-h-60 overflow-y-auto">
            {userDirectory.map((u) => {
              const c = userColor(u.id);
              return (
                <li key={u.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onPick(u);
                      setOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm text-brand-navy hover:bg-brand-mist"
                  >
                    <span
                      className={cn(
                        "grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold text-brand-navy",
                        c.dot,
                      )}
                    >
                      {initials(u.name)}
                    </span>
                    {u.name}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}

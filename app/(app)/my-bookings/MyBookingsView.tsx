"use client";

import { useMemo, useState, useTransition } from "react";
import { format } from "date-fns";
import { ChevronDown, Inbox } from "lucide-react";
import { AccentBlock } from "@/components/brand/AccentBlock";
import {
  ColdDeskCard,
  DeskBookingCard,
  RoomBookingCard,
} from "@/components/booking/BookingCard";
import type { Booking, Desk, RoomBooking } from "@/lib/mock";
import {
  cancelDeskBooking as cancelDeskBookingAction,
  cancelRoomBooking as cancelRoomBookingAction,
} from "@/app/actions/bookings";
import { cn } from "@/lib/utils";

type Item =
  | { kind: "desk"; data: Booking }
  | { kind: "room"; data: RoomBooking };

function compare(a: Item, b: Item): number {
  const aDate = a.data.date;
  const bDate = b.data.date;
  if (aDate !== bDate) return aDate.localeCompare(bDate);
  const aTime = a.kind === "room" ? a.data.startTime : "00:00";
  const bTime = b.kind === "room" ? b.data.startTime : "00:00";
  return aTime.localeCompare(bTime);
}

export type DeskRef = { id: string; label: string; floorName: string };
export type RoomRef = { id: string; label: string; floorName: string };

export function MyBookingsView({
  bookings,
  roomBookings,
  myColdDesks,
  coldDeskFloorById,
  deskRefs,
  roomRefs,
}: {
  bookings: Booking[];
  roomBookings: RoomBooking[];
  myColdDesks: Desk[];
  coldDeskFloorById: Record<string, string>;
  deskRefs: Record<string, DeskRef>;
  roomRefs: Record<string, RoomRef>;
}) {
  const [showPast, setShowPast] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const today = format(new Date(), "yyyy-MM-dd");

  const { upcoming, past } = useMemo(() => {
    const mine: Item[] = [
      ...bookings.map<Item>((b) => ({ kind: "desk", data: b })),
      ...roomBookings.map<Item>((b) => ({ kind: "room", data: b })),
    ];

    const upcoming = mine.filter((it) => it.data.date >= today).sort(compare);
    const past = mine
      .filter((it) => it.data.date < today)
      .sort((a, b) => -compare(a, b));

    return { upcoming, past };
  }, [bookings, roomBookings, today]);

  function handleCancelDesk(id: string) {
    startTransition(async () => {
      const result = await cancelDeskBookingAction(id);
      if (!result.ok) setError(result.error);
    });
  }

  function handleCancelRoom(id: string) {
    startTransition(async () => {
      const result = await cancelRoomBookingAction(id);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="relative inline-block">
        <AccentBlock className="absolute -left-2 top-2 h-5 w-16 -z-10 sm:h-6 sm:w-20" />
        <h1 className="relative text-2xl font-bold text-brand-navy sm:text-3xl">
          My bookings
        </h1>
      </div>
      <p className="mt-2 text-sm italic text-brand-navy/60">
        Times shown in Europe/Warsaw.
      </p>

      {error && (
        <div className="mt-3 rounded-md border border-brand-purple/40 bg-brand-purple/10 px-3 py-2 text-xs text-brand-purple">
          {error}{" "}
          <button
            type="button"
            onClick={() => setError(null)}
            className="ml-2 font-medium underline"
          >
            dismiss
          </button>
        </div>
      )}

      {myColdDesks.length > 0 && (
        <section className="mt-8 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-navy/60">
            Permanent desk{myColdDesks.length > 1 ? "s" : ""}
          </h2>
          <div className="space-y-3">
            {myColdDesks.map((desk) => (
              <ColdDeskCard
                key={desk.id}
                desk={desk}
                floorName={coldDeskFloorById[desk.id] ?? "—"}
              />
            ))}
          </div>
        </section>
      )}

      <section className="mt-8 space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-navy/60">
          Upcoming
        </h2>
        {upcoming.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {upcoming.map((it) =>
              renderCard(
                it,
                false,
                deskRefs,
                roomRefs,
                handleCancelDesk,
                handleCancelRoom,
              ),
            )}
          </div>
        )}
      </section>

      <section className="mt-10">
        <button
          type="button"
          onClick={() => setShowPast((s) => !s)}
          className="flex w-full items-center justify-between gap-2 border-b border-brand-blue-200/50 pb-2 text-xs font-semibold uppercase tracking-wider text-brand-navy/60 hover:text-brand-purple"
        >
          <span>Past · {past.length}</span>
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              showPast && "rotate-180",
            )}
          />
        </button>
        {showPast && (
          <div className="mt-3 space-y-3">
            {past.length === 0 ? (
              <p className="text-sm italic text-brand-navy/60">
                No past bookings.
              </p>
            ) : (
              past.map((it) =>
                renderCard(
                  it,
                  true,
                  deskRefs,
                  roomRefs,
                  handleCancelDesk,
                  handleCancelRoom,
                ),
              )
            )}
          </div>
        )}
      </section>
    </main>
  );
}

function renderCard(
  it: Item,
  past: boolean,
  deskRefs: Record<string, DeskRef>,
  roomRefs: Record<string, RoomRef>,
  cancelDesk: (id: string) => void,
  cancelRoom: (id: string) => void,
) {
  if (it.kind === "desk") {
    const ref = deskRefs[it.data.deskId];
    return (
      <DeskBookingCard
        key={it.data.id}
        booking={it.data}
        deskLabel={ref?.label ?? it.data.deskId}
        floorName={ref?.floorName ?? "—"}
        past={past}
        onCancel={past ? undefined : () => cancelDesk(it.data.id)}
      />
    );
  }
  const ref = roomRefs[it.data.roomId];
  return (
    <RoomBookingCard
      key={it.data.id}
      booking={it.data}
      roomName={ref?.label ?? it.data.roomId}
      floorName={ref?.floorName ?? "—"}
      past={past}
      onCancel={past ? undefined : () => cancelRoom(it.data.id)}
    />
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-brand-blue-200/70 bg-white/60 px-6 py-12 text-center">
      <div className="grid h-10 w-10 place-items-center rounded-full bg-brand-mist text-brand-navy/60">
        <Inbox className="h-5 w-5" />
      </div>
      <p className="text-sm font-medium text-brand-navy">
        No upcoming bookings yet
      </p>
      <p className="text-xs text-brand-navy/60">
        Head to <span className="font-medium text-brand-purple">Book</span> to
        reserve a desk or room.
      </p>
    </div>
  );
}

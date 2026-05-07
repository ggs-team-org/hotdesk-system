"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Armchair, CalendarClock, Snowflake, Trash2 } from "lucide-react";
import type { Attendee, Booking, Desk, RoomBooking } from "@/lib/mock";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { userColor } from "@/lib/brand";
import { cn, initials } from "@/lib/utils";

export function DeskBookingCard({
  booking,
  deskLabel,
  floorName,
  past,
  onCancel,
}: {
  booking: Booking;
  deskLabel: string;
  floorName: string;
  past: boolean;
  onCancel?: () => void;
}) {
  return (
    <CardShell
      kind="DESK"
      icon={<Armchair className="h-3.5 w-3.5" />}
      meta={format(parseISO(booking.date), "EEE d MMM yyyy")}
      past={past}
      onCancel={onCancel}
      title={deskLabel}
      titleAccent={booking.userId}
    >
      <p className="text-sm text-brand-navy/70">{floorName}</p>
    </CardShell>
  );
}

export function ColdDeskCard({
  desk,
  floorName,
}: {
  desk: Desk;
  floorName: string;
}) {
  return (
    <CardShell
      kind="COLD DESK"
      icon={<Snowflake className="h-3.5 w-3.5" />}
      meta="Permanent assignment"
      past={false}
      title={desk.label}
      titleAccent={desk.assignedTo?.id ?? "u1"}
    >
      <p className="text-sm text-brand-navy/70">{floorName}</p>
    </CardShell>
  );
}

export function RoomBookingCard({
  booking,
  roomName,
  floorName,
  past,
  onCancel,
}: {
  booking: RoomBooking;
  roomName: string;
  floorName: string;
  past: boolean;
  onCancel?: () => void;
}) {
  const timeLabel = booking.wholeDay
    ? "Whole day"
    : `${booking.startTime}–${booking.endTime}`;

  return (
    <CardShell
      kind="ROOM"
      icon={<CalendarClock className="h-3.5 w-3.5" />}
      meta={format(parseISO(booking.date), "EEE d MMM yyyy")}
      past={past}
      onCancel={onCancel}
      title={booking.title}
      titleAccent={booking.userId}
    >
      <p className="text-sm text-brand-navy/70">
        {roomName} · {floorName}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-brand-navy/70">
        <span className="font-medium text-brand-navy">{timeLabel}</span>
        <AttendeeStack attendees={booking.attendees} />
      </div>
    </CardShell>
  );
}

function AttendeeStack({ attendees }: { attendees: Attendee[] }) {
  const visible = attendees.slice(0, 5);
  const rest = attendees.length - visible.length;
  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-1.5">
        {visible.map((a) => {
          const c = userColor(a.id);
          return (
            <span
              key={a.id}
              title={a.name}
              className={cn(
                "grid h-6 w-6 place-items-center rounded-full ring-2 ring-white text-[9px] font-bold text-brand-navy",
                c.dot,
              )}
            >
              {initials(a.name)}
            </span>
          );
        })}
      </div>
      <span className="text-brand-navy/60">
        {attendees.length} {attendees.length === 1 ? "attendee" : "attendees"}
        {rest > 0 ? ` (+${rest})` : ""}
      </span>
    </div>
  );
}

function CardShell({
  kind,
  icon,
  meta,
  past,
  onCancel,
  title,
  titleAccent,
  children,
}: {
  kind: string;
  icon: React.ReactNode;
  meta: string;
  past: boolean;
  onCancel?: () => void;
  title: string;
  titleAccent: string;
  children: React.ReactNode;
}) {
  const accent = userColor(titleAccent);
  const [confirming, setConfirming] = useState(false);

  return (
    <Card
      className={cn(
        "relative overflow-hidden border-brand-blue-200/60 bg-white shadow-sm",
        past && "opacity-70",
      )}
    >
      <span
        aria-hidden
        className={cn("absolute left-0 top-0 h-full w-1", accent.dot)}
      />
      <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:p-5">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-semibold uppercase tracking-wider text-brand-navy/60">
            <span className="inline-flex items-center gap-1 rounded bg-brand-mist px-1.5 py-0.5 text-brand-navy/80">
              {icon}
              {kind}
            </span>
            <span className="text-brand-navy/40">·</span>
            <span>{meta}</span>
          </div>
          <h3 className="truncate text-base font-bold text-brand-navy sm:text-lg">
            {title}
          </h3>
          {children}
        </div>

        {onCancel && !past && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirming(true)}
              className="shrink-0 gap-1.5 self-start border-brand-purple/40 text-brand-purple hover:bg-brand-purple/10 hover:text-brand-purple"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Cancel
            </Button>
            <Dialog open={confirming} onOpenChange={setConfirming}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-brand-navy">
                    Cancel this {kind.toLowerCase()} booking?
                  </DialogTitle>
                  <DialogDescription>
                    <span className="font-medium text-brand-navy">{title}</span>
                    {" · "}
                    {meta}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setConfirming(false)}
                    className="border-brand-blue-200"
                  >
                    Keep booking
                  </Button>
                  <Button
                    onClick={() => {
                      onCancel();
                      setConfirming(false);
                    }}
                    className="gap-1.5 bg-brand-purple text-white hover:bg-brand-purple/90"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Cancel booking
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
        {past && (
          <span className="shrink-0 self-start rounded-full bg-brand-mist px-3 py-1 text-xs font-medium italic text-brand-navy/60">
            past
          </span>
        )}
      </div>
    </Card>
  );
}

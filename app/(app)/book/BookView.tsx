"use client";

import { useMemo, useState, useTransition } from "react";
import { format } from "date-fns";
import { AccentBlock } from "@/components/brand/AccentBlock";
import { DatePicker } from "@/components/booking/DatePicker";
import { BookingModal } from "@/components/booking/BookingModal";
import {
  RoomBookingModal,
  type NewRoomBooking,
} from "@/components/booking/RoomBookingModal";
import { FloorSelector } from "@/components/floor-plan/FloorSelector";
import { FloorPlanSvg } from "@/components/floor-plan/FloorPlanSvg";
import {
  roomBookingsForRoom,
  type Attendee,
  type Booking,
  type Desk,
  type Floor,
  type Room,
  type RoomBooking,
} from "@/lib/mock";
import {
  cancelRoomBooking as cancelRoomBookingAction,
  createDeskBooking,
  createRoomBooking as createRoomBookingAction,
  updateRoomBooking as updateRoomBookingAction,
} from "@/app/actions/bookings";
import { runAction } from "@/lib/toast";

function toIso(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function BookView({
  floors,
  desks,
  rooms,
  bookings,
  roomBookings,
  organizer,
  userDirectory,
}: {
  floors: Floor[];
  desks: Desk[];
  rooms: Room[];
  bookings: Booking[];
  roomBookings: RoomBooking[];
  organizer: Attendee;
  userDirectory: Attendee[];
}) {
  const [date, setDate] = useState<Date>(new Date());
  const [floorId, setFloorId] = useState<string>(floors[0]?.id ?? "");
  const [pendingDesk, setPendingDesk] = useState<Desk | null>(null);
  const [pendingRoom, setPendingRoom] = useState<Room | null>(null);
  const [, startTransition] = useTransition();

  const isoDate = toIso(date);
  const floor = useMemo(
    () => floors.find((f) => f.id === floorId) ?? floors[0],
    [floorId, floors],
  );

  function handleDeskConfirm() {
    if (!pendingDesk) return;
    const desk = pendingDesk;
    setPendingDesk(null);
    startTransition(() =>
      runAction(() => createDeskBooking(desk.id, isoDate), {
        loading: `Booking ${desk.label}…`,
        success: `Booked ${desk.label}`,
      }),
    );
  }

  function handleRoomCreate(form: NewRoomBooking) {
    if (!pendingRoom) return;
    const room = pendingRoom;
    setPendingRoom(null);
    startTransition(() =>
      runAction(
        () =>
          createRoomBookingAction(room.id, isoDate, {
            title: form.title,
            attendeeIds: form.attendees.map((a) => a.id),
            wholeDay: form.wholeDay,
            startTime: form.startTime,
            endTime: form.endTime,
          }),
        {
          loading: `Booking ${room.label}…`,
          success: `Booked ${room.label}`,
        },
      ),
    );
  }

  function handleRoomUpdate(id: string, form: NewRoomBooking) {
    setPendingRoom(null);
    startTransition(() =>
      runAction(
        () =>
          updateRoomBookingAction(id, {
            title: form.title,
            attendeeIds: form.attendees.map((a) => a.id),
            wholeDay: form.wholeDay,
            startTime: form.startTime,
            endTime: form.endTime,
          }),
        {
          loading: "Saving changes…",
          success: "Booking updated",
        },
      ),
    );
  }

  function handleRoomDelete(id: string) {
    setPendingRoom(null);
    startTransition(() =>
      runAction(() => cancelRoomBookingAction(id), {
        loading: "Cancelling booking…",
        success: "Booking cancelled",
      }),
    );
  }

  if (!floor) {
    return (
      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 sm:py-10">
        <p className="text-sm italic text-brand-navy/70">No floors configured.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1600px] overflow-x-hidden px-4 py-6 sm:px-6 sm:py-10">
      <div
        className="mx-auto"
        style={{
          width: `min(100%, calc((100vh - 320px) * ${floor.width / floor.height}))`,
        }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div className="min-w-0">
            <div className="relative inline-block">
              <AccentBlock className="absolute -left-2 top-2 h-5 w-16 -z-10 sm:h-6 sm:w-20" />
              <h1 className="relative text-2xl font-bold text-brand-navy sm:text-3xl short:sm:text-2xl">
                Book a desk or room
              </h1>
            </div>
            <p className="mt-2 text-sm text-brand-navy/70 short:hidden">
              Pick a date, then click an available desk or room on the floor plan.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-4">
            <Field label="Date">
              <DatePicker value={date} onChange={setDate} maxDaysAhead={30} />
            </Field>
            <Field label="Floor">
              <FloorSelector
                floors={floors}
                value={floorId}
                onChange={setFloorId}
              />
            </Field>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-brand-navy/70 sm:mt-6">
          <LegendGroup title="Desks">
            <Legend swatch="bg-brand-cyan" label="Available" />
            <Legend swatch="bg-brand-purple" label="Booked" />
            <Legend swatch="bg-brand-navy" label="Cold (assigned)" />
            <Legend swatch="bg-brand-blue-200/50" label="Inactive" />
          </LegendGroup>
          <LegendGroup title="Rooms">
            <Legend swatch="bg-brand-lilac/60" label="Partially booked" />
            <Legend swatch="bg-brand-purple/30" label="Whole day" />
          </LegendGroup>
        </div>

        <div className="mt-4 w-full min-w-0 max-w-full overflow-x-auto pb-2 sm:mt-6">
          <FloorPlanSvg
            floor={floor}
            desks={desks}
            bookings={bookings}
            rooms={rooms}
            roomBookings={roomBookings}
            date={isoDate}
            onDeskClick={(desk) => {
              if (!desk.active || desk.type === "cold") return;
              const isFree = !bookings.some(
                (b) => b.deskId === desk.id && b.date === isoDate,
              );
              if (isFree) setPendingDesk(desk);
            }}
            onRoomClick={(room) => {
              if (room.active) setPendingRoom(room);
            }}
          />
        </div>
      </div>

      <BookingModal
        desk={pendingDesk}
        date={isoDate}
        open={pendingDesk !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDesk(null);
        }}
        onConfirm={handleDeskConfirm}
      />

      <RoomBookingModal
        room={pendingRoom}
        date={isoDate}
        existingBookings={
          pendingRoom
            ? roomBookingsForRoom(pendingRoom, isoDate, roomBookings)
            : []
        }
        open={pendingRoom !== null}
        organizer={organizer}
        userDirectory={userDirectory}
        onOpenChange={(open) => {
          if (!open) setPendingRoom(null);
        }}
        onCreate={handleRoomCreate}
        onUpdate={handleRoomUpdate}
        onDelete={handleRoomDelete}
      />
    </main>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <label className="block text-xs font-medium uppercase tracking-wide text-brand-navy/60">
        {label}
      </label>
      {children}
    </div>
  );
}

function LegendGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-navy/50">
        {title}
      </span>
      {children}
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`h-3 w-3 rounded-full border border-white shadow-sm ${swatch}`}
      />
      <span>{label}</span>
    </div>
  );
}

import { redirect } from "next/navigation";
import { format, subYears } from "date-fns";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { displayName } from "@/lib/displayName";
import type { Booking, Desk, RoomBooking } from "@/lib/mock";
import { MyBookingsView, type DeskRef, type RoomRef } from "./MyBookingsView";

export const dynamic = "force-dynamic";

export default async function MyBookingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const horizon = subYears(new Date(), 1);

  const [
    floorsRaw,
    desksRaw,
    roomsRaw,
    myBookingsRaw,
    myRoomBookingsRaw,
    myColdDesksRaw,
  ] = await Promise.all([
    prisma.floor.findMany(),
    prisma.desk.findMany(),
    prisma.room.findMany(),
    prisma.booking.findMany({
      where: { userId, date: { gte: horizon } },
      include: { user: true },
      orderBy: { date: "asc" },
    }),
    prisma.roomBooking.findMany({
      where: {
        date: { gte: horizon },
        OR: [
          { organizerId: userId },
          { attendees: { some: { userId } } },
        ],
      },
      include: {
        organizer: true,
        attendees: { include: { user: true } },
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    }),
    prisma.desk.findMany({
      where: { type: "cold", assignedToId: userId },
      include: { assignedTo: true },
    }),
  ]);

  const floorNameById = new Map(floorsRaw.map((f) => [f.id, f.name]));

  const deskRefs: Record<string, DeskRef> = {};
  for (const d of desksRaw) {
    deskRefs[d.id] = {
      id: d.id,
      label: d.label,
      floorName: floorNameById.get(d.floorId) ?? "—",
    };
  }

  const roomRefs: Record<string, RoomRef> = {};
  for (const r of roomsRaw) {
    roomRefs[r.id] = {
      id: r.id,
      label: r.label,
      floorName: floorNameById.get(r.floorId) ?? "—",
    };
  }

  const bookings: Booking[] = myBookingsRaw.map((b) => ({
    id: b.id,
    deskId: b.deskId,
    userId: b.userId,
    userName: displayName(b.user.name, b.user.email),
    date: format(b.date, "yyyy-MM-dd"),
  }));

  const roomBookings: RoomBooking[] = myRoomBookingsRaw.map((rb) => ({
    id: rb.id,
    roomId: rb.roomId,
    userId: rb.organizerId,
    userName: displayName(rb.organizer.name, rb.organizer.email),
    title: rb.title,
    date: format(rb.date, "yyyy-MM-dd"),
    wholeDay: rb.wholeDay,
    startTime: rb.startTime,
    endTime: rb.endTime,
    attendees: rb.attendees.map((a) => ({
      id: a.user.id,
      name: displayName(a.user.name, a.user.email),
    })),
  }));

  const myColdDesks: Desk[] = myColdDesksRaw.map((d) => ({
    id: d.id,
    label: d.label,
    floorId: d.floorId,
    x: d.x,
    y: d.y,
    active: d.active,
    type: d.type as "hot" | "cold",
    orientation: (d.orientation as "vertical" | "horizontal") ?? "vertical",
    assignedTo: d.assignedTo
      ? {
          id: d.assignedTo.id,
          name: displayName(d.assignedTo.name, d.assignedTo.email),
        }
      : undefined,
  }));

  const coldDeskFloorById: Record<string, string> = {};
  for (const d of myColdDesks) {
    coldDeskFloorById[d.id] = floorNameById.get(d.floorId) ?? "—";
  }

  return (
    <MyBookingsView
      bookings={bookings}
      roomBookings={roomBookings}
      myColdDesks={myColdDesks}
      coldDeskFloorById={coldDeskFloorById}
      deskRefs={deskRefs}
      roomRefs={roomRefs}
    />
  );
}

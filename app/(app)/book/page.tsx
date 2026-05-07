import { redirect } from "next/navigation";
import { addDays, format, startOfDay, subDays } from "date-fns";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type {
  Booking,
  Desk,
  Room,
  RoomBooking,
} from "@/lib/mock";
import { BookView } from "./BookView";

export const dynamic = "force-dynamic";

export default async function BookPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const today = startOfDay(new Date());
  const dateFloor = subDays(today, 1);
  const dateCeiling = addDays(today, 31);

  const [floorsRaw, desksRaw, roomsRaw, bookingsRaw, roomBookingsRaw, usersRaw] =
    await Promise.all([
      prisma.floor.findMany({ orderBy: { name: "asc" } }),
      prisma.desk.findMany({
        include: { assignedTo: true },
        orderBy: { label: "asc" },
      }),
      prisma.room.findMany({ orderBy: { label: "asc" } }),
      prisma.booking.findMany({
        where: { date: { gte: dateFloor, lte: dateCeiling } },
        include: { user: true },
      }),
      prisma.roomBooking.findMany({
        where: { date: { gte: dateFloor, lte: dateCeiling } },
        include: {
          organizer: true,
          attendees: { include: { user: true } },
        },
        orderBy: { startTime: "asc" },
      }),
      prisma.user.findMany({
        select: { id: true, name: true, email: true },
        orderBy: { name: "asc" },
      }),
    ]);

  const floors = floorsRaw.map((f) => ({
    id: f.id,
    name: f.name,
    svgPath: f.svgPath,
    width: f.width,
    height: f.height,
  }));

  const desks: Desk[] = desksRaw.map((d) => ({
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
          name: d.assignedTo.name ?? d.assignedTo.email,
        }
      : undefined,
  }));

  const rooms: Room[] = roomsRaw.map((r) => ({
    id: r.id,
    label: r.label,
    floorId: r.floorId,
    x: r.x,
    y: r.y,
    width: r.width,
    height: r.height,
    active: r.active,
  }));

  const bookings: Booking[] = bookingsRaw.map((b) => ({
    id: b.id,
    deskId: b.deskId,
    userId: b.userId,
    userName: b.user.name ?? b.user.email,
    date: format(b.date, "yyyy-MM-dd"),
  }));

  const roomBookings: RoomBooking[] = roomBookingsRaw.map((rb) => ({
    id: rb.id,
    roomId: rb.roomId,
    userId: rb.organizerId,
    userName: rb.organizer.name ?? rb.organizer.email,
    title: rb.title,
    date: format(rb.date, "yyyy-MM-dd"),
    wholeDay: rb.wholeDay,
    startTime: rb.startTime,
    endTime: rb.endTime,
    attendees: rb.attendees.map((a) => ({
      id: a.user.id,
      name: a.user.name ?? a.user.email,
    })),
  }));

  const userDirectory = usersRaw.map((u) => ({
    id: u.id,
    name: u.name ?? u.email,
  }));
  const me = usersRaw.find((u) => u.id === session.user!.id);
  const organizer = {
    id: session.user.id,
    name: me?.name ?? me?.email ?? session.user.name ?? session.user.email ?? "You",
  };

  return (
    <BookView
      floors={floors}
      desks={desks}
      rooms={rooms}
      bookings={bookings}
      roomBookings={roomBookings}
      organizer={organizer}
      userDirectory={userDirectory}
    />
  );
}

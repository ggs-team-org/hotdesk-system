"use server";

import { revalidatePath } from "next/cache";
import { addDays, parseISO, startOfDay } from "date-fns";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Result<T = void> = { ok: true; data?: T } | { ok: false; error: string };

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("UNAUTHENTICATED");
  return session.user;
}

function parseDateOnly(dateStr: string): Date {
  // Stored as @db.Date; build a UTC midnight Date so comparisons line up
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

// ──────────────────────────── Desk bookings ────────────────────────────

export async function createDeskBooking(
  deskId: string,
  dateStr: string,
): Promise<Result> {
  try {
    const user = await requireUser();
    const date = parseDateOnly(dateStr);
    const today = startOfDay(new Date());
    const maxDate = addDays(today, 30);

    if (date < today || date > maxDate) {
      return { ok: false, error: "Date must be within the next 30 days." };
    }

    const desk = await prisma.desk.findUnique({ where: { id: deskId } });
    if (!desk) return { ok: false, error: "Desk not found." };
    if (!desk.active) return { ok: false, error: "Desk is not active." };
    if (desk.type === "cold") {
      return { ok: false, error: "This is a cold desk — not bookable." };
    }

    await prisma.booking.create({
      data: { deskId, userId: user.id, date },
    });

    revalidatePath("/book");
    revalidatePath("/my-bookings");
    return { ok: true };
  } catch (e: unknown) {
    if (e && typeof e === "object" && "code" in e && e.code === "P2002") {
      return { ok: false, error: "This desk is already booked for that date." };
    }
    return { ok: false, error: "Could not create booking." };
  }
}

export async function cancelDeskBooking(
  bookingId: string,
): Promise<Result> {
  try {
    const user = await requireUser();
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });
    if (!booking) return { ok: false, error: "Booking not found." };
    if (booking.userId !== user.id && user.role !== "admin") {
      return { ok: false, error: "Not allowed to cancel this booking." };
    }

    await prisma.booking.delete({ where: { id: bookingId } });
    revalidatePath("/book");
    revalidatePath("/my-bookings");
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not cancel booking." };
  }
}

// ──────────────────────────── Room bookings ────────────────────────────

export type RoomBookingPayload = {
  title: string;
  attendeeIds: string[];
  wholeDay: boolean;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
};

function timeToMin(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

async function checkRoomAvailable(
  roomId: string,
  date: Date,
  startTime: string,
  endTime: string,
  ignoreBookingId?: string,
): Promise<string | null> {
  // Find any booking on this room+date that overlaps the requested range
  const sameDay = await prisma.roomBooking.findMany({
    where: { roomId, date, ...(ignoreBookingId ? { NOT: { id: ignoreBookingId } } : {}) },
  });
  const reqStart = timeToMin(startTime);
  const reqEnd = timeToMin(endTime);
  for (const b of sameDay) {
    const bStart = b.wholeDay ? 0 : timeToMin(b.startTime);
    const bEnd = b.wholeDay ? 24 * 60 : timeToMin(b.endTime);
    if (reqStart < bEnd && bStart < reqEnd) {
      return `Conflicts with “${b.title}” (${b.wholeDay ? "whole day" : `${b.startTime}–${b.endTime}`}).`;
    }
  }
  return null;
}

export async function createRoomBooking(
  roomId: string,
  dateStr: string,
  payload: RoomBookingPayload,
): Promise<Result> {
  try {
    const user = await requireUser();
    const date = parseDateOnly(dateStr);
    const today = startOfDay(new Date());
    const maxDate = addDays(today, 30);

    if (date < today || date > maxDate) {
      return { ok: false, error: "Date must be within the next 30 days." };
    }
    if (!payload.title.trim()) {
      return { ok: false, error: "Title is required." };
    }

    const startTime = payload.wholeDay ? "08:00" : payload.startTime;
    const endTime = payload.wholeDay ? "18:00" : payload.endTime;

    if (!payload.wholeDay && timeToMin(endTime) <= timeToMin(startTime)) {
      return { ok: false, error: "End time must be after start time." };
    }

    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room || !room.active) return { ok: false, error: "Room not available." };

    const conflict = await checkRoomAvailable(roomId, date, startTime, endTime);
    if (conflict) return { ok: false, error: conflict };

    const attendeeIds = Array.from(
      new Set([user.id, ...(payload.attendeeIds ?? [])]),
    );

    await prisma.roomBooking.create({
      data: {
        roomId,
        organizerId: user.id,
        title: payload.title.trim(),
        date,
        wholeDay: payload.wholeDay,
        startTime,
        endTime,
        attendees: {
          create: attendeeIds.map((userId) => ({ userId })),
        },
      },
    });

    revalidatePath("/book");
    revalidatePath("/my-bookings");
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not create room booking." };
  }
}

export async function updateRoomBooking(
  bookingId: string,
  payload: RoomBookingPayload,
): Promise<Result> {
  try {
    const user = await requireUser();
    const booking = await prisma.roomBooking.findUnique({
      where: { id: bookingId },
    });
    if (!booking) return { ok: false, error: "Booking not found." };
    if (booking.organizerId !== user.id && user.role !== "admin") {
      return { ok: false, error: "Only the organizer can edit this booking." };
    }
    if (!payload.title.trim()) {
      return { ok: false, error: "Title is required." };
    }

    const startTime = payload.wholeDay ? "08:00" : payload.startTime;
    const endTime = payload.wholeDay ? "18:00" : payload.endTime;

    if (!payload.wholeDay && timeToMin(endTime) <= timeToMin(startTime)) {
      return { ok: false, error: "End time must be after start time." };
    }

    const conflict = await checkRoomAvailable(
      booking.roomId,
      booking.date,
      startTime,
      endTime,
      bookingId,
    );
    if (conflict) return { ok: false, error: conflict };

    const attendeeIds = Array.from(
      new Set([booking.organizerId, ...(payload.attendeeIds ?? [])]),
    );

    await prisma.$transaction([
      prisma.roomBooking.update({
        where: { id: bookingId },
        data: {
          title: payload.title.trim(),
          wholeDay: payload.wholeDay,
          startTime,
          endTime,
        },
      }),
      prisma.roomBookingAttendee.deleteMany({ where: { bookingId } }),
      prisma.roomBookingAttendee.createMany({
        data: attendeeIds.map((userId) => ({ bookingId, userId })),
      }),
    ]);

    revalidatePath("/book");
    revalidatePath("/my-bookings");
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not update booking." };
  }
}

export async function cancelRoomBooking(
  bookingId: string,
): Promise<Result> {
  try {
    const user = await requireUser();
    const booking = await prisma.roomBooking.findUnique({
      where: { id: bookingId },
    });
    if (!booking) return { ok: false, error: "Booking not found." };
    if (booking.organizerId !== user.id && user.role !== "admin") {
      return { ok: false, error: "Only the organizer can cancel this booking." };
    }

    await prisma.roomBooking.delete({ where: { id: bookingId } });
    revalidatePath("/book");
    revalidatePath("/my-bookings");
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not cancel booking." };
  }
}

"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { addDays, startOfDay } from "date-fns";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";

type Result<T = void> = { ok: true; data?: T } | { ok: false; error: string };

const MAX_TITLE_LENGTH = 200;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("UNAUTHENTICATED");
  return session.user;
}

function handleActionError(e: unknown, fallback: string): Result {
  if (e instanceof Error && e.message === "UNAUTHENTICATED") {
    return { ok: false, error: "Please sign in again." };
  }
  if (e instanceof Error && e.message === "RATE_LIMITED") {
    return { ok: false, error: "Too many requests. Please slow down." };
  }
  return { ok: false, error: fallback };
}

function checkRate(userId: string) {
  if (!rateLimit(`booking:${userId}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS)) {
    throw new Error("RATE_LIMITED");
  }
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
    checkRate(user.id);
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
    return handleActionError(e, "Could not create booking.");
  }
}

export async function cancelDeskBooking(
  bookingId: string,
): Promise<Result> {
  try {
    const user = await requireUser();
    checkRate(user.id);
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
  } catch (e) {
    return handleActionError(e, "Could not cancel booking.");
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

function findOverlap(
  bookings: { wholeDay: boolean; startTime: string; endTime: string; title: string }[],
  startTime: string,
  endTime: string,
): string | null {
  const reqStart = timeToMin(startTime);
  const reqEnd = timeToMin(endTime);
  for (const b of bookings) {
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
    checkRate(user.id);
    const date = parseDateOnly(dateStr);
    const today = startOfDay(new Date());
    const maxDate = addDays(today, 30);

    if (date < today || date > maxDate) {
      return { ok: false, error: "Date must be within the next 30 days." };
    }
    const title = payload.title.trim();
    if (!title) {
      return { ok: false, error: "Title is required." };
    }
    if (title.length > MAX_TITLE_LENGTH) {
      return { ok: false, error: `Title must be ${MAX_TITLE_LENGTH} characters or fewer.` };
    }

    const startTime = payload.wholeDay ? "08:00" : payload.startTime;
    const endTime = payload.wholeDay ? "18:00" : payload.endTime;

    if (!payload.wholeDay && timeToMin(endTime) <= timeToMin(startTime)) {
      return { ok: false, error: "End time must be after start time." };
    }

    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room || !room.active) return { ok: false, error: "Room not available." };

    const attendeeIds = Array.from(
      new Set([user.id, ...(payload.attendeeIds ?? [])]),
    );

    try {
      await prisma.$transaction(
        async (tx) => {
          const sameDay = await tx.roomBooking.findMany({
            where: { roomId, date },
            select: { wholeDay: true, startTime: true, endTime: true, title: true },
          });
          const conflict = findOverlap(sameDay, startTime, endTime);
          if (conflict) throw new ConflictError(conflict);

          await tx.roomBooking.create({
            data: {
              roomId,
              organizerId: user.id,
              title,
              date,
              wholeDay: payload.wholeDay,
              startTime,
              endTime,
              attendees: {
                create: attendeeIds.map((userId) => ({ userId })),
              },
            },
          });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (e) {
      if (e instanceof ConflictError) return { ok: false, error: e.message };
      if (isSerializationError(e)) {
        return { ok: false, error: "Someone else just booked this slot — please try again." };
      }
      throw e;
    }

    revalidatePath("/book");
    revalidatePath("/my-bookings");
    return { ok: true };
  } catch (e) {
    return handleActionError(e, "Could not create room booking.");
  }
}

export async function updateRoomBooking(
  bookingId: string,
  payload: RoomBookingPayload,
): Promise<Result> {
  try {
    const user = await requireUser();
    checkRate(user.id);
    const booking = await prisma.roomBooking.findUnique({
      where: { id: bookingId },
    });
    if (!booking) return { ok: false, error: "Booking not found." };
    if (booking.organizerId !== user.id && user.role !== "admin") {
      return { ok: false, error: "Only the organizer can edit this booking." };
    }
    const title = payload.title.trim();
    if (!title) {
      return { ok: false, error: "Title is required." };
    }
    if (title.length > MAX_TITLE_LENGTH) {
      return { ok: false, error: `Title must be ${MAX_TITLE_LENGTH} characters or fewer.` };
    }

    const startTime = payload.wholeDay ? "08:00" : payload.startTime;
    const endTime = payload.wholeDay ? "18:00" : payload.endTime;

    if (!payload.wholeDay && timeToMin(endTime) <= timeToMin(startTime)) {
      return { ok: false, error: "End time must be after start time." };
    }

    const attendeeIds = Array.from(
      new Set([booking.organizerId, ...(payload.attendeeIds ?? [])]),
    );

    try {
      await prisma.$transaction(
        async (tx) => {
          const sameDay = await tx.roomBooking.findMany({
            where: { roomId: booking.roomId, date: booking.date, NOT: { id: bookingId } },
            select: { wholeDay: true, startTime: true, endTime: true, title: true },
          });
          const conflict = findOverlap(sameDay, startTime, endTime);
          if (conflict) throw new ConflictError(conflict);

          await tx.roomBooking.update({
            where: { id: bookingId },
            data: { title, wholeDay: payload.wholeDay, startTime, endTime },
          });
          await tx.roomBookingAttendee.deleteMany({ where: { bookingId } });
          await tx.roomBookingAttendee.createMany({
            data: attendeeIds.map((userId) => ({ bookingId, userId })),
          });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (e) {
      if (e instanceof ConflictError) return { ok: false, error: e.message };
      if (isSerializationError(e)) {
        return { ok: false, error: "Someone else just changed this booking — please try again." };
      }
      throw e;
    }

    revalidatePath("/book");
    revalidatePath("/my-bookings");
    return { ok: true };
  } catch (e) {
    return handleActionError(e, "Could not update booking.");
  }
}

export async function cancelRoomBooking(
  bookingId: string,
): Promise<Result> {
  try {
    const user = await requireUser();
    checkRate(user.id);
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
  } catch (e) {
    return handleActionError(e, "Could not cancel booking.");
  }
}

class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}

function isSerializationError(e: unknown): boolean {
  // Postgres returns 40001 on serialization failure
  return (
    e instanceof Prisma.PrismaClientKnownRequestError &&
    e.code === "P2034"
  );
}

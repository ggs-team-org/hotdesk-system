"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Result = { ok: true } | { ok: false; error: string };

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("UNAUTHENTICATED");
  if (session.user.role !== "admin") {
    throw new Error("FORBIDDEN");
  }
  return session.user;
}

export async function makeDeskCold(
  deskId: string,
  ownerId: string,
): Promise<Result> {
  try {
    await requireAdmin();
    const desk = await prisma.desk.findUnique({ where: { id: deskId } });
    if (!desk) return { ok: false, error: "Desk not found." };
    const owner = await prisma.user.findUnique({ where: { id: ownerId } });
    if (!owner) return { ok: false, error: "User not found." };

    // If owner already has a cold desk elsewhere, unassign that one first
    await prisma.desk.updateMany({
      where: { assignedToId: ownerId, NOT: { id: deskId } },
      data: { type: "hot", assignedToId: null },
    });

    // Cancel any pending bookings for this desk on or after today
    await prisma.booking.deleteMany({
      where: { deskId, date: { gte: new Date() } },
    });

    await prisma.desk.update({
      where: { id: deskId },
      data: { type: "cold", assignedToId: ownerId },
    });

    revalidatePath("/admin/desks");
    revalidatePath("/book");
    revalidatePath("/my-bookings");
    return { ok: true };
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") {
      return { ok: false, error: "Admin access required." };
    }
    return { ok: false, error: "Could not update desk." };
  }
}

export async function makeDeskHot(deskId: string): Promise<Result> {
  try {
    await requireAdmin();
    const desk = await prisma.desk.findUnique({ where: { id: deskId } });
    if (!desk) return { ok: false, error: "Desk not found." };

    await prisma.desk.update({
      where: { id: deskId },
      data: { type: "hot", assignedToId: null },
    });

    revalidatePath("/admin/desks");
    revalidatePath("/book");
    revalidatePath("/my-bookings");
    return { ok: true };
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") {
      return { ok: false, error: "Admin access required." };
    }
    return { ok: false, error: "Could not update desk." };
  }
}

export async function reassignDesk(
  deskId: string,
  ownerId: string,
): Promise<Result> {
  try {
    await requireAdmin();
    const desk = await prisma.desk.findUnique({ where: { id: deskId } });
    if (!desk) return { ok: false, error: "Desk not found." };
    if (desk.type !== "cold") return { ok: false, error: "Desk is not cold." };
    const owner = await prisma.user.findUnique({ where: { id: ownerId } });
    if (!owner) return { ok: false, error: "User not found." };

    // Unassign new owner from any other cold desk
    await prisma.desk.updateMany({
      where: { assignedToId: ownerId, NOT: { id: deskId } },
      data: { type: "hot", assignedToId: null },
    });

    await prisma.desk.update({
      where: { id: deskId },
      data: { assignedToId: ownerId },
    });

    revalidatePath("/admin/desks");
    revalidatePath("/book");
    revalidatePath("/my-bookings");
    return { ok: true };
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN") {
      return { ok: false, error: "Admin access required." };
    }
    return { ok: false, error: "Could not reassign desk." };
  }
}

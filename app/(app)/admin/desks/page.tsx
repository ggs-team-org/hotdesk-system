import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { displayName } from "@/lib/displayName";
import type { Desk } from "@/lib/mock";
import { AdminDesksView } from "./AdminDesksView";

export const dynamic = "force-dynamic";

export default async function AdminDesksPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "admin") redirect("/book");

  const [floorsRaw, desksRaw, usersRaw] = await Promise.all([
    prisma.floor.findMany(),
    prisma.desk.findMany({
      include: { assignedTo: true },
      orderBy: { label: "asc" },
    }),
    prisma.user.findMany({
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const floorNameById: Record<string, string> = {};
  for (const f of floorsRaw) floorNameById[f.id] = f.name;

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
          name: displayName(d.assignedTo.name, d.assignedTo.email),
        }
      : undefined,
  }));

  const userDirectory = usersRaw.map((u) => ({
    id: u.id,
    name: displayName(u.name, u.email),
  }));

  return (
    <AdminDesksView
      desks={desks}
      floorNameById={floorNameById}
      userDirectory={userDirectory}
    />
  );
}

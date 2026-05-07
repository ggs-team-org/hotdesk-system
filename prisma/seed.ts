import { PrismaClient } from "@prisma/client";
import { floors, initialDesks, rooms } from "../lib/mock";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding floors…");
  for (const f of floors) {
    await prisma.floor.upsert({
      where: { id: f.id },
      update: { name: f.name, svgPath: f.svgPath, width: f.width, height: f.height },
      create: { id: f.id, name: f.name, svgPath: f.svgPath, width: f.width, height: f.height },
    });
  }

  console.log("Seeding desks…");
  for (const d of initialDesks) {
    await prisma.desk.upsert({
      where: { id: d.id },
      update: {
        label: d.label,
        floorId: d.floorId,
        x: d.x,
        y: d.y,
        active: d.active,
        type: d.type,
        orientation: d.orientation ?? "vertical",
        // assignedToId is reset on seed; cold desk assignments are admin-managed at runtime
        assignedToId: null,
      },
      create: {
        id: d.id,
        label: d.label,
        floorId: d.floorId,
        x: d.x,
        y: d.y,
        active: d.active,
        type: d.type,
        orientation: d.orientation ?? "vertical",
      },
    });
  }

  console.log("Seeding rooms…");
  for (const r of rooms) {
    await prisma.room.upsert({
      where: { id: r.id },
      update: {
        label: r.label,
        floorId: r.floorId,
        x: r.x,
        y: r.y,
        width: r.width,
        height: r.height,
        active: r.active,
      },
      create: {
        id: r.id,
        label: r.label,
        floorId: r.floorId,
        x: r.x,
        y: r.y,
        width: r.width,
        height: r.height,
        active: r.active,
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

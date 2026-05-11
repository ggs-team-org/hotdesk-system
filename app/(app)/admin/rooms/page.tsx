import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { floors, rooms } from "@/lib/mock";
import {
  AdminTable,
  AdminTd,
  AdminTh,
  AdminThead,
  AdminTr,
  StatusPill,
} from "@/components/admin/AdminTable";

function floorName(floorId: string) {
  return floors.find((f) => f.id === floorId)?.name ?? "—";
}

export default async function AdminRoomsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "admin") redirect("/book");

  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="text-xl font-bold text-brand-navy">Rooms</h2>
        <p className="text-xs italic text-brand-navy/60">
          Rooms are configured by the platform team — read-only here.
        </p>
      </div>

      <AdminTable>
        <AdminThead>
          <tr>
            <AdminTh>Label</AdminTh>
            <AdminTh>Floor</AdminTh>
            <AdminTh className="text-right">Position</AdminTh>
            <AdminTh className="text-right">Size</AdminTh>
            <AdminTh>Status</AdminTh>
          </tr>
        </AdminThead>
        <tbody>
          {rooms.map((r) => (
            <AdminTr key={r.id}>
              <AdminTd className="font-medium">{r.label}</AdminTd>
              <AdminTd className="text-brand-navy/80">
                {floorName(r.floorId)}
              </AdminTd>
              <AdminTd className="text-right font-mono text-xs tabular-nums text-brand-navy/70">
                ({r.x}, {r.y})
              </AdminTd>
              <AdminTd className="text-right font-mono text-xs tabular-nums text-brand-navy/70">
                {r.width}×{r.height}
              </AdminTd>
              <AdminTd>
                <StatusPill active={r.active} />
              </AdminTd>
            </AdminTr>
          ))}
        </tbody>
      </AdminTable>
    </section>
  );
}

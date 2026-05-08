import { initialDesks, floors, rooms } from "@/lib/mock";
import {
  AdminTable,
  AdminTd,
  AdminTh,
  AdminThead,
  AdminTr,
} from "@/components/admin/AdminTable";

export default function AdminFloorsPage() {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="text-xl font-bold text-brand-navy">Floors</h2>
        <p className="text-xs italic text-brand-navy/60">
          Floors are configured by the platform team — read-only here.
        </p>
      </div>

      <AdminTable>
        <AdminThead>
          <tr>
            <AdminTh>Name</AdminTh>
            <AdminTh>SVG path</AdminTh>
            <AdminTh className="text-right">Desks</AdminTh>
            <AdminTh className="text-right">Rooms</AdminTh>
          </tr>
        </AdminThead>
        <tbody>
          {floors.map((f) => {
            const deskCount = initialDesks.filter(
              (d) => d.floorId === f.id,
            ).length;
            const roomCount = rooms.filter((r) => r.floorId === f.id).length;
            return (
              <AdminTr key={f.id}>
                <AdminTd className="font-medium">{f.name}</AdminTd>
                <AdminTd className="font-mono text-xs text-brand-navy/70">
                  {f.svgPath}
                </AdminTd>
                <AdminTd className="text-right tabular-nums">
                  {deskCount}
                </AdminTd>
                <AdminTd className="text-right tabular-nums">
                  {roomCount}
                </AdminTd>
              </AdminTr>
            );
          })}
        </tbody>
      </AdminTable>
    </section>
  );
}

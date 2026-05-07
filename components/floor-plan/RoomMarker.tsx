"use client";

import type { Room, RoomBooking, RoomStatus } from "@/lib/mock";
import { roomStatusColor, roomStatusLabel } from "@/lib/brand";
import { cn } from "@/lib/utils";

export function RoomMarker({
  room,
  status,
  bookings,
  floorWidth,
  floorHeight,
  onClick,
}: {
  room: Room;
  status: RoomStatus;
  bookings: RoomBooking[];
  floorWidth: number;
  floorHeight: number;
  onClick: () => void;
}) {
  const leftPct = (room.x / floorWidth) * 100;
  const topPct = (room.y / floorHeight) * 100;
  const widthPct = (room.width / floorWidth) * 100;
  const heightPct = (room.height / floorHeight) * 100;

  return (
    <div
      className="absolute"
      style={{
        left: `${leftPct}%`,
        top: `${topPct}%`,
        width: `${widthPct}%`,
        height: `${heightPct}%`,
      }}
    >
      <div className="group relative h-full w-full">
        <button
          type="button"
          onClick={onClick}
          disabled={status === "inactive"}
          aria-label={`Room ${room.label} (${roomStatusLabel(status)})`}
          className={cn(
            "block h-full w-full rounded-md border border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple",
            roomStatusColor(status),
            status !== "inactive" &&
              "cursor-pointer hover:border-brand-purple/40",
          )}
        />

        <div
          className={cn(
            "pointer-events-none absolute left-1/2 top-2 z-20 -translate-x-1/2 whitespace-nowrap rounded-md bg-brand-navy px-2 py-1 text-xs font-medium text-white opacity-0 shadow-md transition-opacity",
            "group-hover:opacity-100",
          )}
        >
          <span className="font-semibold">{room.label}</span>
          <span className="text-white/80"> · {roomStatusLabel(status)}</span>
          {bookings.length > 0 && (
            <ul className="mt-1 space-y-0.5 border-t border-white/15 pt-1 text-[11px] font-normal text-white/80">
              {bookings.slice(0, 3).map((b) => (
                <li key={b.id}>
                  <span className="font-semibold text-white">{b.title}</span>
                  <span className="text-white/70">
                    {" · "}
                    {b.wholeDay ? "whole day" : `${b.startTime}–${b.endTime}`}
                    {" · "}
                    {b.userName}
                  </span>
                </li>
              ))}
              {bookings.length > 3 && (
                <li className="italic text-white/60">
                  +{bookings.length - 3} more
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

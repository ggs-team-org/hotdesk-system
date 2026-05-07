"use client";

import type {
  Booking,
  Desk,
  Floor,
  Room,
  RoomBooking,
} from "@/lib/mock";
import {
  bookingForDesk,
  deskStatus,
  roomBookingsForRoom,
  roomStatus,
} from "@/lib/mock";
import { DeskMarker } from "./DeskMarker";
import { RoomMarker } from "./RoomMarker";

const MOBILE_MIN_WIDTH = 900;

export function FloorPlanSvg({
  floor,
  desks,
  bookings,
  rooms,
  roomBookings,
  date,
  onDeskClick,
  onRoomClick,
}: {
  floor: Floor;
  desks: Desk[];
  bookings: Booking[];
  rooms: Room[];
  roomBookings: RoomBooking[];
  date: string;
  onDeskClick: (desk: Desk) => void;
  onRoomClick: (room: Room) => void;
}) {
  return (
    <div
      className="relative mx-auto overflow-hidden rounded-xl border border-brand-blue-200/60 bg-white shadow-sm"
      style={{
        width: "100%",
        minWidth: `${MOBILE_MIN_WIDTH}px`,
        containerType: "inline-size",
      }}
    >
      <img
        src={floor.svgPath}
        alt={`${floor.name} floor plan`}
        className="block h-auto w-full select-none"
        draggable={false}
      />

      {rooms
        .filter((r) => r.floorId === floor.id)
        .map((room) => {
          const status = roomStatus(room, date, roomBookings);
          const todays = roomBookingsForRoom(room, date, roomBookings);
          return (
            <RoomMarker
              key={room.id}
              room={room}
              status={status}
              bookings={todays}
              floorWidth={floor.width}
              floorHeight={floor.height}
              onClick={() => onRoomClick(room)}
            />
          );
        })}

      {desks
        .filter((d) => d.floorId === floor.id)
        .map((desk) => {
          const status = deskStatus(desk, date, bookings);
          const booking = bookingForDesk(desk, date, bookings);
          return (
            <DeskMarker
              key={desk.id}
              desk={desk}
              status={status}
              booking={booking}
              floorWidth={floor.width}
              floorHeight={floor.height}
              onClick={() => onDeskClick(desk)}
            />
          );
        })}
    </div>
  );
}

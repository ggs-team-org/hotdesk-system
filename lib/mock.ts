export type Floor = {
  id: string;
  name: string;
  svgPath: string;
  width: number;
  height: number;
};

export type DeskType = "hot" | "cold";
export type DeskOrientation = "vertical" | "horizontal";

export type Desk = {
  id: string;
  label: string;
  floorId: string;
  x: number;
  y: number;
  active: boolean;
  type: DeskType;
  orientation?: DeskOrientation;
  assignedTo?: { id: string; name: string };
};

export type Booking = {
  id: string;
  deskId: string;
  userId: string;
  userName: string;
  date: string;
};

export type DeskStatus = "free" | "booked" | "inactive" | "assigned";

export type Room = {
  id: string;
  label: string;
  floorId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  active: boolean;
};

export type Attendee = {
  id: string;
  name: string;
};

export type RoomBooking = {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  title: string;
  attendees: Attendee[];
  date: string;
  wholeDay: boolean;
  startTime: string;
  endTime: string;
};

export type RoomStatus = "free" | "partially-booked" | "fully-booked" | "inactive";


export const TIME_SLOTS: string[] = (() => {
  const slots: string[] = [];
  for (let h = 8; h <= 18; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
    if (h !== 18) slots.push(`${String(h).padStart(2, "0")}:30`);
  }
  return slots;
})();

export const floors: Floor[] = [
  { id: "f1", name: "Ground Floor", svgPath: "/floors/office-ground.svg", width: 1200, height: 600 },
  { id: "f2", name: "Second Floor", svgPath: "/floors/office-second.svg", width: 1440, height: 600 },
];

export const initialDesks: Desk[] = [
  // Ground Floor — Party Room (4 desks, 2x2, all vertical)
  { id: "d1",  label: "A1", floorId: "f1", x: 130, y: 130, active: true, type: "hot",  orientation: "vertical" },
  { id: "d2",  label: "A2", floorId: "f1", x: 230, y: 130, active: true, type: "hot",  orientation: "vertical" },
  { id: "d3",  label: "A3", floorId: "f1", x: 130, y: 240, active: true, type: "cold", orientation: "vertical", assignedTo: { id: "u2", name: "Anna K." } },
  { id: "d4",  label: "A4", floorId: "f1", x: 230, y: 240, active: true, type: "hot",  orientation: "vertical" },

  // Ground Floor — Open Space B (10 desks, 3+3+4, all vertical)
  { id: "d5",  label: "B1", floorId: "f1", x: 410, y: 150, active: true, type: "cold", orientation: "vertical", assignedTo: { id: "u3", name: "Marcin W." } },
  { id: "d6",  label: "B2", floorId: "f1", x: 510, y: 150, active: true, type: "hot",  orientation: "vertical" },
  { id: "d7",  label: "B3", floorId: "f1", x: 610, y: 150, active: true, type: "hot",  orientation: "vertical" },
  { id: "d8",  label: "B4", floorId: "f1", x: 410, y: 300, active: true, type: "cold", orientation: "vertical", assignedTo: { id: "u5", name: "Lena P." } },
  { id: "d9",  label: "B5", floorId: "f1", x: 510, y: 300, active: true, type: "hot",  orientation: "vertical" },
  { id: "d10", label: "B6", floorId: "f1", x: 610, y: 300, active: true, type: "hot",  orientation: "vertical" },
  { id: "d11", label: "B7", floorId: "f1", x: 410, y: 460, active: true, type: "hot",  orientation: "vertical" },
  { id: "d12", label: "B8", floorId: "f1", x: 490, y: 460, active: true, type: "hot",  orientation: "vertical" },
  { id: "d13", label: "B9", floorId: "f1", x: 570, y: 460, active: true, type: "hot",  orientation: "vertical" },
  { id: "d14", label: "B10", floorId: "f1", x: 670, y: 460, active: true, type: "cold", orientation: "vertical", assignedTo: { id: "u4", name: "Tomek L." } },

  // Second Floor — HR (6 desks, 2x3, all vertical)
  { id: "d15", label: "C1", floorId: "f2", x: 120, y: 140, active: true, type: "cold", orientation: "vertical", assignedTo: { id: "u7", name: "Maja B." } },
  { id: "d16", label: "C2", floorId: "f2", x: 215, y: 140, active: true, type: "cold", orientation: "vertical", assignedTo: { id: "u1", name: "Karol" } },
  { id: "d17", label: "C3", floorId: "f2", x: 120, y: 240, active: true, type: "hot",  orientation: "vertical" },
  { id: "d18", label: "C4", floorId: "f2", x: 215, y: 240, active: true, type: "hot",  orientation: "vertical" },
  { id: "d19", label: "C5", floorId: "f2", x: 120, y: 350, active: true, type: "hot",  orientation: "vertical" },
  { id: "d20", label: "C6", floorId: "f2", x: 215, y: 350, active: true, type: "hot",  orientation: "vertical" },

  // Second Floor — Open Space D (10 desks: 3v / 3v / 2v / 2 horizontal, all aligned to columns at x=400, 510, 620)
  { id: "d21", label: "D1",  floorId: "f2", x: 400, y: 140, active: true, type: "hot", orientation: "vertical" },
  { id: "d22", label: "D2",  floorId: "f2", x: 510, y: 140, active: true, type: "hot", orientation: "vertical" },
  { id: "d23", label: "D3",  floorId: "f2", x: 620, y: 140, active: true, type: "hot", orientation: "vertical" },
  { id: "d24", label: "D4",  floorId: "f2", x: 400, y: 250, active: true, type: "hot", orientation: "vertical" },
  { id: "d25", label: "D5",  floorId: "f2", x: 510, y: 250, active: true, type: "hot", orientation: "vertical" },
  { id: "d26", label: "D6",  floorId: "f2", x: 620, y: 250, active: true, type: "hot", orientation: "vertical" },
  { id: "d27", label: "D7",  floorId: "f2", x: 400, y: 360, active: true, type: "hot", orientation: "vertical" },
  { id: "d28", label: "D8",  floorId: "f2", x: 510, y: 360, active: true, type: "hot", orientation: "vertical" },
  { id: "d29", label: "D9",  floorId: "f2", x: 400, y: 470, active: true, type: "hot", orientation: "horizontal" },
  { id: "d30", label: "D10", floorId: "f2", x: 510, y: 470, active: true, type: "hot", orientation: "horizontal" },

  // Second Floor — Board (6 vertical, 3 rows x 2 cols, fills full Board area y=60-540)
  { id: "d31", label: "E1", floorId: "f2", x: 988,  y: 160, active: true, type: "cold", orientation: "vertical", assignedTo: { id: "u6", name: "Igor S." } },
  { id: "d32", label: "E2", floorId: "f2", x: 1102, y: 160, active: true, type: "hot",  orientation: "vertical" },
  { id: "d33", label: "E3", floorId: "f2", x: 988,  y: 310, active: true, type: "hot",  orientation: "vertical" },
  { id: "d34", label: "E4", floorId: "f2", x: 1102, y: 310, active: true, type: "hot",  orientation: "vertical" },
  { id: "d35", label: "E5", floorId: "f2", x: 988,  y: 460, active: true, type: "hot",  orientation: "vertical" },
  { id: "d36", label: "E6", floorId: "f2", x: 1102, y: 460, active: true, type: "hot",  orientation: "vertical" },
];

export const rooms: Room[] = [
  { id: "r1", label: "Mercedes", floorId: "f1", x: 60,   y: 310, width: 270, height: 230, active: true },
  { id: "r2", label: "BMW",      floorId: "f1", x: 960,  y: 300, width: 200, height: 240, active: true },
  { id: "r3", label: "Audi",     floorId: "f2", x: 1190, y: 60,  width: 190, height: 230, active: true },
];

export function deskStatus(
  desk: Desk,
  date: string,
  bookings: Booking[],
): DeskStatus {
  if (!desk.active) return "inactive";
  if (desk.type === "cold" && desk.assignedTo) return "assigned";
  return bookings.some((b) => b.deskId === desk.id && b.date === date)
    ? "booked"
    : "free";
}

export function bookingForDesk(
  desk: Desk,
  date: string,
  bookings: Booking[],
): Booking | undefined {
  return bookings.find((b) => b.deskId === desk.id && b.date === date);
}

export function roomBookingsForRoom(
  room: Room,
  date: string,
  bookings: RoomBooking[],
): RoomBooking[] {
  return bookings
    .filter((b) => b.roomId === room.id && b.date === date)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
}

export function roomStatus(
  room: Room,
  date: string,
  bookings: RoomBooking[],
): RoomStatus {
  if (!room.active) return "inactive";
  const todays = roomBookingsForRoom(room, date, bookings);
  if (todays.length === 0) return "free";
  if (todays.some((b) => b.wholeDay)) return "fully-booked";
  return "partially-booked";
}

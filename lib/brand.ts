import type { DeskStatus, RoomStatus } from "./mock";

export function statusColor(status: DeskStatus): string {
  switch (status) {
    case "free":
      return "bg-brand-cyan";
    case "booked":
      return "bg-brand-purple";
    case "assigned":
      return "bg-brand-navy";
    case "inactive":
      return "bg-brand-blue-200/50";
  }
}

export function roomStatusColor(status: RoomStatus): string {
  switch (status) {
    case "free":
      return "bg-brand-cyan/0 hover:bg-brand-cyan/15";
    case "partially-booked":
      return "bg-brand-lilac/40 hover:bg-brand-lilac/60";
    case "fully-booked":
      return "bg-brand-purple/25 hover:bg-brand-purple/35";
    case "inactive":
      return "bg-brand-blue-200/30";
  }
}

export function roomStatusLabel(status: RoomStatus): string {
  switch (status) {
    case "free":
      return "available";
    case "partially-booked":
      return "partially booked";
    case "fully-booked":
      return "booked all day";
    case "inactive":
      return "inactive";
  }
}

export type UserColor = {
  soft: string;
  border: string;
  dot: string;
};

const USER_COLOR_PALETTE: UserColor[] = [
  { soft: "bg-brand-purple/20",     border: "border-l-brand-purple",     dot: "bg-brand-purple" },
  { soft: "bg-brand-cyan/30",       border: "border-l-brand-cyan",       dot: "bg-brand-cyan" },
  { soft: "bg-brand-lilac/60",      border: "border-l-brand-purple/70",  dot: "bg-brand-lilac" },
  { soft: "bg-brand-blue-200/40",   border: "border-l-brand-blue-200",   dot: "bg-brand-blue-200" },
  { soft: "bg-brand-navy/15",       border: "border-l-brand-navy",       dot: "bg-brand-navy" },
];

export function userColor(userId: string): UserColor {
  const hash = Array.from(userId).reduce(
    (acc, c) => acc + c.charCodeAt(0),
    0,
  );
  return USER_COLOR_PALETTE[hash % USER_COLOR_PALETTE.length];
}

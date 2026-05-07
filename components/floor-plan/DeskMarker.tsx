"use client";

import type { Desk, DeskStatus, Booking } from "@/lib/mock";
import { statusColor } from "@/lib/brand";
import { cn, initials } from "@/lib/utils";

export function DeskMarker({
  desk,
  status,
  booking,
  floorWidth,
  floorHeight,
  onClick,
}: {
  desk: Desk;
  status: DeskStatus;
  booking?: Booking;
  floorWidth: number;
  floorHeight: number;
  onClick: () => void;
}) {
  const leftPct = (desk.x / floorWidth) * 100;
  const topPct = (desk.y / floorHeight) * 100;
  const interactive = status === "free";
  const horizontal = desk.orientation === "horizontal";

  const dotContent =
    status === "booked" && booking
      ? initials(booking.userName)
      : status === "assigned" && desk.assignedTo
        ? initials(desk.assignedTo.name)
        : "";

  const longSize = "clamp(34px, 3.4cqw, 56px)";
  const shortSize = "clamp(20px, 2cqw, 32px)";
  const dotSize = "clamp(16px, 1.6cqw, 26px)";
  const fontSize = "clamp(7px, 0.65cqw, 11px)";

  return (
    <div
      className="pointer-events-none absolute z-10"
      style={{
        left: `${leftPct}%`,
        top: `${topPct}%`,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div
        className="relative"
        style={{
          width: horizontal ? longSize : shortSize,
          height: horizontal ? shortSize : longSize,
        }}
      >
        <svg
          viewBox={horizontal ? "0 0 48 28" : "0 0 28 48"}
          aria-hidden
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="none"
        >
          <rect
            x="2"
            y="2"
            width={horizontal ? 44 : 24}
            height={horizontal ? 24 : 44}
            rx="3"
            fill="#ffffff"
            stroke="#9db2e6"
            strokeWidth="1.5"
          />
        </svg>

        <div className="group pointer-events-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <button
            type="button"
            aria-label={`Desk ${desk.label} (${status})`}
            onClick={onClick}
            disabled={status === "inactive" || status === "assigned"}
            className={cn(
              "block rounded-full p-0.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2",
              interactive && "cursor-pointer",
              status === "booked" && "cursor-help",
              (status === "inactive" || status === "assigned") &&
                "cursor-not-allowed",
            )}
          >
            <span
              style={{
                width: dotSize,
                height: dotSize,
                fontSize,
              }}
              className={cn(
                "flex items-center justify-center rounded-full border-2 border-white font-bold leading-none text-white shadow-sm transition",
                statusColor(status),
                interactive &&
                  "group-hover:ring-2 group-hover:ring-brand-purple group-hover:ring-offset-1 group-hover:ring-offset-white",
              )}
            >
              {dotContent}
            </span>
          </button>

          <div
            className={cn(
              "pointer-events-none absolute left-1/2 top-full z-20 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-brand-navy px-2 py-1 text-xs font-medium text-white opacity-0 shadow-md transition-opacity",
              "group-hover:opacity-100",
            )}
          >
            <span className="font-semibold">{desk.label}</span>
            {status === "booked" && booking && (
              <span className="text-white/80"> · {booking.userName}</span>
            )}
            {status === "assigned" && desk.assignedTo && (
              <span className="text-white/80">
                {" "}
                · {desk.assignedTo.name} · cold desk
              </span>
            )}
            {status === "free" && (
              <span className="text-white/80"> · available</span>
            )}
            {status === "inactive" && (
              <span className="text-white/80"> · inactive</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

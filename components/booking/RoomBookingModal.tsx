"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { Plus, Trash2, X } from "lucide-react";
import type { Attendee, Room, RoomBooking } from "@/lib/mock";
import { TIME_SLOTS } from "@/lib/mock";
import { userColor } from "@/lib/brand";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn, initials } from "@/lib/utils";

const DAY_START_MIN = 8 * 60;
const DAY_END_MIN = 18 * 60;
const DAY_RANGE = DAY_END_MIN - DAY_START_MIN;

function toMin(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}
function topPct(time: string) {
  return ((toMin(time) - DAY_START_MIN) / DAY_RANGE) * 100;
}

export type NewRoomBooking = {
  title: string;
  attendees: Attendee[];
  wholeDay: boolean;
  startTime: string;
  endTime: string;
};

type RoomBookingModalProps = {
  room: Room | null;
  date: string;
  existingBookings: RoomBooking[];
  open: boolean;
  organizer: Attendee;
  userDirectory: Attendee[];
  onOpenChange: (open: boolean) => void;
  onCreate: (booking: NewRoomBooking) => void;
  onUpdate: (id: string, booking: NewRoomBooking) => void;
  onDelete: (id: string) => void;
};

export function RoomBookingModal(props: RoomBookingModalProps) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        {/* Radix unmounts DialogContent's children on close, and the key
            forces a remount when the room changes while open — both give
            us fresh form state for free, no effect needed. */}
        <RoomBookingForm key={props.room?.id ?? "none"} {...props} />
      </DialogContent>
    </Dialog>
  );
}

function RoomBookingForm({
  room,
  date,
  existingBookings,
  organizer,
  userDirectory,
  onOpenChange,
  onCreate,
  onUpdate,
  onDelete,
}: RoomBookingModalProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [attendees, setAttendees] = useState<Attendee[]>([organizer]);
  const [wholeDay, setWholeDay] = useState(false);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [popoverOpen, setPopoverOpen] = useState(false);

  function resetToCreate() {
    setEditingId(null);
    setTitle("");
    setAttendees([organizer]);
    setWholeDay(false);
    setStartTime("09:00");
    setEndTime("10:00");
  }

  function loadFromBooking(b: RoomBooking) {
    setEditingId(b.id);
    setTitle(b.title);
    setAttendees(b.attendees);
    setWholeDay(b.wholeDay);
    setStartTime(b.startTime);
    setEndTime(b.endTime);
  }

  const formattedDate = format(parseISO(date), "EEEE d MMMM yyyy");
  const validRange = wholeDay || endTime > startTime;
  const valid = title.trim().length > 0 && validRange;
  const editing = editingId !== null;

  const availableUsers = useMemo(
    () => userDirectory.filter((u) => !attendees.some((a) => a.id === u.id)),
    [attendees, userDirectory],
  );

  function addAttendee(user: Attendee) {
    setAttendees((prev) => [...prev, user]);
    setPopoverOpen(false);
  }
  function removeAttendee(id: string) {
    if (id === organizer.id) return;
    setAttendees((prev) => prev.filter((a) => a.id !== id));
  }

  function buildPayload(): NewRoomBooking {
    return wholeDay
      ? { title: title.trim(), attendees, wholeDay: true, startTime: "08:00", endTime: "18:00" }
      : { title: title.trim(), attendees, wholeDay: false, startTime, endTime };
  }

  function handleSubmit() {
    if (!valid) return;
    const payload = buildPayload();
    if (editingId) onUpdate(editingId, payload);
    else onCreate(payload);
  }

  function handleDelete() {
    if (!editingId) return;
    onDelete(editingId);
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-brand-navy">
          {editing ? "Edit booking" : "Book"} · {room?.label}
        </DialogTitle>
        <DialogDescription>{formattedDate}</DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 sm:grid-cols-[200px_1fr] sm:gap-6">
        <DaySchedule
          existing={existingBookings}
          preview={
            wholeDay
              ? { startTime: "08:00", endTime: "18:00", title: title || "New booking" }
              : { startTime, endTime, title: title || "New booking" }
          }
          previewValid={valid && !editing}
          previewEditingId={editingId}
          onSelect={loadFromBooking}
        />

        <div className="space-y-3 sm:space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-brand-navy/60">
              {editing ? "Editing existing" : "New booking"}
            </span>
            {editing && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetToCreate}
                className="h-7 gap-1 border-brand-blue-200 text-xs text-brand-navy/80"
              >
                <Plus className="h-3 w-3" />
                New booking
              </Button>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium uppercase tracking-wide text-brand-navy/60">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sprint planning"
              className="w-full rounded-md border border-brand-blue-200 bg-white px-3 py-2 text-sm text-brand-navy shadow-sm placeholder:text-brand-navy/40 focus:border-brand-purple focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium uppercase tracking-wide text-brand-navy/60">
              When
            </label>
            <label className="flex items-center gap-2 text-sm text-brand-navy">
              <input
                type="checkbox"
                checked={wholeDay}
                onChange={(e) => setWholeDay(e.target.checked)}
                className="h-4 w-4 cursor-pointer accent-brand-purple"
              />
              Book for the whole day
            </label>
            {!wholeDay && (
              <div className="grid grid-cols-2 gap-3">
                <TimeField label="Start" value={startTime} onChange={setStartTime} />
                <TimeField label="End" value={endTime} onChange={setEndTime} />
              </div>
            )}
            {!wholeDay && !validRange && (
              <p className="text-xs text-brand-purple">
                End time must be after start time.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium uppercase tracking-wide text-brand-navy/60">
              Attendees
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {attendees.map((a) => (
                <AttendeeChip
                  key={a.id}
                  attendee={a}
                  isOrganizer={a.id === organizer.id}
                  onRemove={() => removeAttendee(a.id)}
                />
              ))}
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={availableUsers.length === 0}
                    className="h-8 gap-1 border-dashed border-brand-blue-200 text-brand-navy/80 hover:border-brand-purple hover:text-brand-purple"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-1" align="start">
                  {availableUsers.length === 0 ? (
                    <div className="px-2 py-1.5 text-xs italic text-brand-navy/60">
                      Everyone added.
                    </div>
                  ) : (
                    <ul className="max-h-56 overflow-y-auto">
                      {availableUsers.map((u) => (
                        <li key={u.id}>
                          <button
                            type="button"
                            onClick={() => addAttendee(u)}
                            className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm text-brand-navy hover:bg-brand-mist"
                          >
                            <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-lilac text-[10px] font-bold text-brand-navy">
                              {initials(u.name)}
                            </span>
                            {u.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter className="items-center gap-2 sm:gap-2">
        {editing && (
          <Button
            variant="outline"
            onClick={handleDelete}
            className="mr-auto gap-1.5 border-brand-purple/40 text-brand-purple hover:bg-brand-purple/10 hover:text-brand-purple"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          className="border-brand-blue-200"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!valid}
          className="bg-brand-purple text-white hover:bg-brand-purple/90"
        >
          {editing ? "Save changes" : "Confirm"}
        </Button>
      </DialogFooter>
    </>
  );
}

function AttendeeChip({
  attendee,
  isOrganizer,
  onRemove,
}: {
  attendee: Attendee;
  isOrganizer: boolean;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-brand-mist px-2 py-1 text-xs font-medium text-brand-navy ring-1 ring-brand-blue-200/60">
      <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-purple text-[9px] font-bold text-white">
        {initials(attendee.name)}
      </span>
      {attendee.name}
      {isOrganizer ? (
        <span className="ml-0.5 text-[10px] italic text-brand-navy/50">
          organizer
        </span>
      ) : (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${attendee.name}`}
          className="ml-0.5 rounded-full p-0.5 text-brand-navy/50 hover:bg-brand-blue-200/30 hover:text-brand-purple"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}

function TimeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="block text-[11px] font-medium uppercase tracking-wide text-brand-navy/60">
        {label}
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="border-brand-blue-200 bg-white text-brand-navy">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {TIME_SLOTS.map((slot) => (
            <SelectItem key={slot} value={slot}>
              {slot}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function computeBookingColumns(bookings: RoomBooking[]): {
  colByBooking: Map<string, number>;
  totalCols: number;
} {
  const sorted = bookings
    .map((b) => ({
      id: b.id,
      start: toMin(b.startTime),
      end: toMin(b.endTime),
    }))
    .sort((a, b) => a.start - b.start || a.end - b.end);

  const columns: { end: number }[] = [];
  const colByBooking = new Map<string, number>();

  for (const item of sorted) {
    let placed = false;
    for (let i = 0; i < columns.length; i++) {
      if (columns[i].end <= item.start) {
        columns[i].end = item.end;
        colByBooking.set(item.id, i);
        placed = true;
        break;
      }
    }
    if (!placed) {
      columns.push({ end: item.end });
      colByBooking.set(item.id, columns.length - 1);
    }
  }

  return { colByBooking, totalCols: Math.max(columns.length, 1) };
}

function DaySchedule({
  existing,
  preview,
  previewValid,
  previewEditingId,
  onSelect,
}: {
  existing: RoomBooking[];
  preview: { startTime: string; endTime: string; title: string };
  previewValid: boolean;
  previewEditingId: string | null;
  onSelect: (b: RoomBooking) => void;
}) {
  const hours = Array.from({ length: 11 }, (_, i) => 8 + i);
  const { colByBooking, totalCols } = useMemo(
    () => computeBookingColumns(existing),
    [existing],
  );

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium uppercase tracking-wide text-brand-navy/60">
        Day schedule
      </label>
      <div className="relative h-[420px] overflow-hidden rounded-md border border-brand-blue-200/60 bg-brand-mist/40">
        <div className="absolute inset-0 flex flex-col">
          {hours.map((h) => (
            <div
              key={h}
              className="flex-1 border-t border-brand-blue-200/40 first:border-t-0"
            />
          ))}
        </div>

        <div className="absolute left-1 top-0 z-10 flex h-full flex-col text-[10px] font-medium text-brand-navy/50">
          {hours.map((h) => (
            <div key={h} className="flex-1 leading-none">
              {String(h).padStart(2, "0")}:00
            </div>
          ))}
        </div>

        <div className="absolute inset-y-0 left-9 right-1.5">
          {existing.map((b) => {
            const color = userColor(b.userId);
            const selected = previewEditingId === b.id;
            const col = colByBooking.get(b.id) ?? 0;
            const widthPct = 100 / totalCols;
            const leftPct = col * widthPct;
            return (
              <ScheduleBlock
                key={b.id}
                top={topPct(b.startTime)}
                height={topPct(b.endTime) - topPct(b.startTime)}
                left={leftPct}
                width={widthPct}
                title={b.title}
                sub={`${b.wholeDay ? "Whole day" : `${b.startTime}–${b.endTime}`} · ${b.userName}`}
                color={color}
                selected={selected}
                onClick={() => onSelect(b)}
              />
            );
          })}
          {previewValid && (
            <PreviewBlock
              top={topPct(preview.startTime)}
              height={topPct(preview.endTime) - topPct(preview.startTime)}
              label={preview.title}
              sub={`${preview.startTime}–${preview.endTime}`}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ScheduleBlock({
  top,
  height,
  left,
  width,
  title,
  sub,
  color,
  selected,
  onClick,
}: {
  top: number;
  height: number;
  left: number;
  width: number;
  title: string;
  sub: string;
  color: { soft: string; border: string };
  selected: boolean;
  onClick: () => void;
}) {
  const showSub = height > 8;
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        top: `${top}%`,
        height: `${Math.max(height, 4)}%`,
        left: `calc(${left}% + 1px)`,
        width: `calc(${width}% - 2px)`,
      }}
      className={cn(
        "absolute cursor-pointer overflow-hidden rounded-sm border-l-[3px] px-1.5 py-1 text-left text-[10px] leading-tight text-brand-navy transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple",
        color.soft,
        color.border,
        selected
          ? "ring-2 ring-brand-purple ring-offset-1"
          : "hover:brightness-95",
      )}
    >
      <div className="truncate font-semibold">{title}</div>
      {showSub && <div className="truncate text-brand-navy/70">{sub}</div>}
    </button>
  );
}

function PreviewBlock({
  top,
  height,
  label,
  sub,
}: {
  top: number;
  height: number;
  label: string;
  sub: string;
}) {
  const showSub = height > 8;
  return (
    <div
      className="pointer-events-none absolute left-0 right-0 overflow-hidden rounded-sm border border-dashed border-brand-purple bg-brand-cyan/40 px-1.5 py-1 text-[10px] leading-tight text-brand-navy"
      style={{ top: `${top}%`, height: `${Math.max(height, 4)}%` }}
    >
      <div className="truncate font-semibold">{label}</div>
      {showSub && <div className="truncate text-brand-navy/70">{sub}</div>}
    </div>
  );
}

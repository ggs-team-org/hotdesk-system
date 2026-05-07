"use client";

import { useState } from "react";
import { format, addDays, startOfDay } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function DatePicker({
  value,
  onChange,
  maxDaysAhead = 30,
}: {
  value: Date;
  onChange: (date: Date) => void;
  maxDaysAhead?: number;
}) {
  const [open, setOpen] = useState(false);
  const today = startOfDay(new Date());
  const maxDate = addDays(today, maxDaysAhead);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start gap-2 border-brand-blue-200 bg-white font-medium text-brand-navy hover:bg-brand-mist hover:text-brand-navy sm:w-[260px]",
          )}
        >
          <CalendarIcon className="h-4 w-4 text-brand-purple" />
          {format(value, "EEE d MMM yyyy")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(d) => {
            if (d) {
              onChange(d);
              setOpen(false);
            }
          }}
          disabled={{ before: today, after: maxDate }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

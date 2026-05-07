"use client";

import type { Floor } from "@/lib/mock";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function FloorSelector({
  floors,
  value,
  onChange,
}: {
  floors: Floor[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full border-brand-blue-200 bg-white text-brand-navy sm:w-[260px]">
        <SelectValue placeholder="Select a floor" />
      </SelectTrigger>
      <SelectContent>
        {floors.map((floor) => (
          <SelectItem key={floor.id} value={floor.id}>
            {floor.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

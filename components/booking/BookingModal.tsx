"use client";

import { format, parseISO } from "date-fns";
import type { Desk } from "@/lib/mock";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function BookingModal({
  desk,
  date,
  open,
  onOpenChange,
  onConfirm,
}: {
  desk: Desk | null;
  date: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  const formattedDate = format(parseISO(date), "EEEE d MMMM yyyy");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-brand-navy">
            Book desk {desk?.label}
          </DialogTitle>
          <DialogDescription>
            Confirm your booking for{" "}
            <span className="font-medium text-brand-navy">{formattedDate}</span>
            .
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-brand-blue-200"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-brand-purple text-white hover:bg-brand-purple/90"
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

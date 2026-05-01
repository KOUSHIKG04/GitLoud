"use client";

import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { DateRange } from "react-day-picker";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function parseDateParam(value: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return undefined;
  }

  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(5, 7));
  const day = Number(value.slice(8, 10));
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined;
  }

  return date;
}

export function HistoryDatePicker() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const selectedRange: DateRange | undefined = {
    from: parseDateParam(searchParams.get("from")),
    to: parseDateParam(searchParams.get("to")),
  };
  const hasSelectedRange = Boolean(selectedRange.from);

  function updateRange(range: DateRange | undefined) {
    const params = new URLSearchParams(searchParams.toString());

    params.delete("page");
    params.delete("date");

    if (range?.from) {
      params.set("from", format(range.from, "yyyy-MM-dd"));
    } else {
      params.delete("from");
    }

    if (range?.to) {
      params.set("to", format(range.to, "yyyy-MM-dd"));
    } else {
      params.delete("to");
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="justify-start"
          aria-label="Filter history by date range"
        >
          <CalendarIcon className="size-4" />
          {selectedRange.from ? (
            selectedRange.to ? (
              <>
                {format(selectedRange.from, "MMM d, yyyy")} - {" "}
                {format(selectedRange.to, "MMM d, yyyy")}
              </>
            ) : (
              format(selectedRange.from, "MMM d, yyyy")
            )
          ) : (
            "Filter by date range"
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-auto gap-0 p-0 rounded-none">
        <Calendar
          mode="range"
          defaultMonth={selectedRange.from}
          selected={selectedRange}
          onSelect={updateRange}
          numberOfMonths={1}
          className="p-3 [--cell-size:--spacing(8)] rounded-none"
          classNames={{
            day: "focus-within:outline-none focus-within:ring-0",
            day_button:
              "rounded-none data-[range-start=true]:rounded-none data-[range-end=true]:rounded-none data-[range-middle=true]:rounded-none data-[selected-single=true]:rounded-none focus-visible:border-transparent focus-visible:ring-0 group-data-[focused=true]/day:border-transparent group-data-[focused=true]/day:ring-0",
            range_start: "rounded-none after:hidden",
            range_middle: "rounded-none",
            range_end: "rounded-none after:hidden",
            today: "rounded-none data-[selected=true]:rounded-none",
            month: "gap-2",
            month_caption: "h-(--cell-size) mt-1 text-center",
            week: "mt-1 flex w-full gap-1",
            weekday: "text-[0.72rem] w-full mt-2",
          }}
        />

        {hasSelectedRange ? (
          <div className="border-t p-2">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                updateRange(undefined);
                setOpen(false);
              }}
            >
              <X className="size-4" />
              Clear date
            </Button>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

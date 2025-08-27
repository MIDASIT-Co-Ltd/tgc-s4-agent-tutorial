"use client";

import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { useMemo, useState } from "react";

type DatePickerProps = {
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
  align?: "start" | "center" | "end";
};

export default function DatePicker({
  value,
  onChange,
  placeholder = "날짜 선택",
  disabled,
  align = "start",
}: DatePickerProps) {
  const label = useMemo(() => {
    if (!value) return placeholder;
    try {
      return format(value, "yyyy.MM.dd");
    } catch {
      return placeholder;
    }
  }, [value, placeholder]);

  const [open, setOpen] = useState(false);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          className="input-glass ring-focus w-full sm:w-auto inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-left"
          onClick={() => setOpen(true)}
        >
          <CalendarIcon size={16} className="opacity-70" />
          <span>{label}</span>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align={align}
          sideOffset={8}
          className="card-glass rounded-xl p-2"
        >
          <DayPicker
            mode="single"
            selected={value ?? undefined}
            onSelect={(d) => {
              onChange(d ?? null);
              setOpen(false);
            }}
          />
          <div className="flex justify-end pt-1">
            <button
              type="button"
              className="btn-outline rounded-md px-2 py-1 text-xs"
              onClick={() => {
                onChange(new Date());
                setOpen(false);
              }}
            >
              오늘로 설정
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

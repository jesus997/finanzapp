"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  name: string;
  defaultValue?: string | null;
  required?: boolean;
}

export function DatePicker({ name, defaultValue, required }: Props) {
  const [date, setDate] = useState<Date | undefined>(
    defaultValue ? new Date(defaultValue) : undefined
  );

  return (
    <>
      <input type="hidden" name={name} value={date?.toISOString() ?? ""} />
      <Popover>
        <PopoverTrigger
          className={cn(
            "flex h-8 w-full items-center rounded-lg border border-input bg-transparent px-2.5 text-sm",
            !date && "text-muted-foreground"
          )}
        >
          {date ? format(date, "d 'de' MMMM, yyyy", { locale: es }) : "Selecciona una fecha"}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            locale={es}
            required={required}
          />
        </PopoverContent>
      </Popover>
    </>
  );
}

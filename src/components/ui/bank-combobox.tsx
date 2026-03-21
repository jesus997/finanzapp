"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { MEXICAN_BANKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface Props {
  name: string;
  defaultValue?: string;
}

export function BankCombobox({ name, defaultValue }: Props) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue ?? "");
  const [isCustom, setIsCustom] = useState(
    !!defaultValue && !MEXICAN_BANKS.includes(defaultValue as typeof MEXICAN_BANKS[number])
  );

  return (
    <>
      <input type="hidden" name={name} value={value} />
      {isCustom ? (
        <div className="flex gap-2">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Nombre del banco"
            required
          />
          <button
            type="button"
            onClick={() => { setIsCustom(false); setValue(""); }}
            className="text-xs text-muted-foreground hover:underline whitespace-nowrap"
          >
            Volver a lista
          </button>
        </div>
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            className={cn(
              "flex h-8 w-full items-center rounded-lg border border-input bg-transparent px-2.5 text-sm",
              !value && "text-muted-foreground"
            )}
          >
            {value || "Selecciona un banco"}
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
            <Command>
              <CommandInput placeholder="Buscar banco..." />
              <CommandList>
                <CommandEmpty>No encontrado</CommandEmpty>
                <CommandGroup>
                  {MEXICAN_BANKS.map((bank) => (
                    <CommandItem
                      key={bank}
                      value={bank}
                      onSelect={(v) => {
                        setValue(v);
                        setOpen(false);
                      }}
                    >
                      {bank}
                    </CommandItem>
                  ))}
                  <CommandItem
                    value="__other__"
                    onSelect={() => {
                      setIsCustom(true);
                      setValue("");
                      setOpen(false);
                    }}
                  >
                    Otro...
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </>
  );
}

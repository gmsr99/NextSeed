// Escolha de concelho com pesquisa (os 308 concelhos).
import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { MUNICIPALITIES, MUNICIPALITY_BY_CODE } from "./agendaUi";

interface Props {
  value: string | null;
  onChange: (code: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

export default function MunicipalityPicker({ value, onChange, placeholder = "Escolher concelho", className, id }: Props) {
  const [open, setOpen] = useState(false);
  const current = value ? MUNICIPALITY_BY_CODE.get(value) : null;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button id={id} variant="outline" role="combobox" aria-expanded={open} className={cn("justify-between font-normal", className)}>
          <span className={cn("truncate", !current && "text-muted-foreground")}>{current ? current.name : placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] min-w-[240px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Procurar concelho…" />
          <CommandList>
            <CommandEmpty>Não encontrámos esse concelho.</CommandEmpty>
            {MUNICIPALITIES.map((m) => (
              <CommandItem
                key={m.code}
                value={`${m.name} ${m.district}`}
                onSelect={() => {
                  onChange(m.code);
                  setOpen(false);
                }}
              >
                <Check className={cn("mr-2 h-4 w-4", value === m.code ? "opacity-100" : "opacity-0")} />
                <span>{m.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">{m.district}</span>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

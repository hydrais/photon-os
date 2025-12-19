import { Link } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { ControlCenter } from "./control-center";

export function StatusBarTray() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex flex-row items-center gap-2 rounded-full focus:ring-0 focus:outline-none focus:bg-background/20 hover:bg-background/20 active:bg-background/30 transition-all p-1 flex items-center justify-center border-3 border-transparent active:border-background/50">
          <Link className="size-3" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="bg-foreground text-background mx-3">
        <ControlCenter />
      </PopoverContent>
    </Popover>
  );
}

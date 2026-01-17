import { Circle } from "lucide-react";
import { NavigationBarButton } from "./navigation-bar-button";
import { cn } from "@/lib/utils";

export function NavigationBar({
  onHome,
  onMultitasking,
  side,
}: {
  onHome: () => void;
  onMultitasking: () => void;
  side: "left" | "center" | "right";
}) {
  return (
    <div
      className={cn(
        "h-12 bg-foreground text-background flex flex-row items-center justify-around gap-8 px-6",
        side === "right" && "md:justify-end",
        side === "left" && "md:justify-start"
      )}
    >
      <NavigationBarButton onClick={onHome} onLongPress={onMultitasking}>
        <Circle className="size-5" />
        <span className="sr-only">Home (long press for multitasking)</span>
      </NavigationBarButton>
    </div>
  );
}

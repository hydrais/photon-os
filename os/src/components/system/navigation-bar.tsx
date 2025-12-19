import { Circle, Square, Triangle } from "lucide-react";
import { NavigationBarButton } from "./navigation-bar-button";
import { cn } from "@/lib/utils";

export function NavigationBar({
  onBack,
  onHome,
  onMultitasking,
  side,
}: {
  onBack: () => void;
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
      <NavigationBarButton onClick={onBack}>
        <Triangle className="-rotate-90 -ml-0.5 mr-0.5 size-5" />
        <span className="sr-only">Global Back</span>
      </NavigationBarButton>
      <NavigationBarButton onClick={onHome}>
        <Circle className="size-5" />
        <span className="sr-only">Home</span>
      </NavigationBarButton>
      <NavigationBarButton onClick={onMultitasking}>
        <Square className="size-5" />
        <span className="sr-only">Multitasking</span>
      </NavigationBarButton>
    </div>
  );
}

import { StatusBarClock } from "./status-bar-clock";
import { StatusBarTray } from "./status-bar-tray";

export function StatusBar() {
  return (
    <div className="h-8 bg-foreground text-background flex flex-row items-center justify-between gap-8 px-3">
      <StatusBarClock showSeconds={false} clockType="12-hour" />
      <StatusBarTray />
    </div>
  );
}

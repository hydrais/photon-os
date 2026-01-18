import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function PhotonTabBarItem({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  icon: LucideIcon;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "cursor-pointer flex flex-col gap-1 hover:text-primary",
        active && "text-primary",
      )}
      onClick={onClick}
    >
      <div
        className={cn(
          "p-2 min-w-[60px] rounded-full flex items-center justify-center",
          active && "bg-primary/10",
        )}
      >
        <Icon className="size-4.5" />
      </div>
      <p className="text-xs font-medium">{label}</p>
    </button>
  );
}

import { ChevronRight, type LucideIcon } from "lucide-react";

export function PhotonSectionItem({
  label,
  icon: Icon,
  onClick,
}: {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-row items-center gap-3 py-3 hover:bg-muted/50 px-4 transition-colors w-full text-left first:rounded-tl-md first:rounded-tr-md last:rounded-bl-md last:rounded-br-md"
    >
      {Icon && <Icon className="size-4 text-muted-foreground" />}
      <span className="flex-1 text-sm font-medium text-foreground">
        {label}
      </span>
      <ChevronRight className="size-4 text-muted-foreground" />
    </button>
  );
}

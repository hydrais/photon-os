import type { SettingsSection } from "../types";
import { ChevronRight } from "lucide-react";

interface SettingsSectionCardProps {
  section: SettingsSection;
  onClick: () => void;
}

export function SettingsSectionCard({ section, onClick }: SettingsSectionCardProps) {
  const Icon = section.icon;

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 p-4 rounded-2xl bg-card ring-1 ring-foreground/10
                 hover:bg-muted/50 transition-all text-left group
                 focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
        <Icon className="size-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium">{section.name}</div>
        <div className="text-sm text-muted-foreground truncate">
          {section.description}
        </div>
      </div>
      <ChevronRight className="size-5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
    </button>
  );
}

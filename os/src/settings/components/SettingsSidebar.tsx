import type { SettingsSection, SettingsSectionId } from "../types";
import { cn } from "@/lib/utils";

interface SettingsSidebarProps {
  sections: SettingsSection[];
  activeSection: SettingsSectionId | null;
  onSectionSelect: (section: SettingsSectionId) => void;
}

export function SettingsSidebar({
  sections,
  activeSection,
  onSectionSelect,
}: SettingsSidebarProps) {
  return (
    <aside className="w-64 border-r border-border bg-muted/30 p-4 flex flex-col gap-1">
      <h1 className="text-xl font-bold px-3 py-2 mb-2">Settings</h1>
      {sections.map((section) => {
        const Icon = section.icon;
        const isActive = activeSection === section.id;

        return (
          <button
            key={section.id}
            onClick={() => onSectionSelect(section.id)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-full text-left transition-all",
              "hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
              isActive
                ? "bg-primary/10 text-primary font-medium"
                : "text-foreground"
            )}
          >
            <Icon className="size-5" />
            <span>{section.name}</span>
          </button>
        );
      })}
    </aside>
  );
}

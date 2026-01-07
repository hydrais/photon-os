import type { SettingsSection, SettingsSectionId } from "../types";
import { SettingsSectionCard } from "./SettingsSectionCard";

interface SettingsHomeProps {
  sections: SettingsSection[];
  onSectionSelect: (section: SettingsSectionId) => void;
}

export function SettingsHome({ sections, onSectionSelect }: SettingsHomeProps) {
  return (
    <div className="h-full overflow-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <div className="flex flex-col gap-3">
        {sections.map((section) => (
          <SettingsSectionCard
            key={section.id}
            section={section}
            onClick={() => onSectionSelect(section.id)}
          />
        ))}
      </div>
    </div>
  );
}

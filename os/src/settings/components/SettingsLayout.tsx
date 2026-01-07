import type { SettingsSectionId } from "../types";
import { SettingsSidebar } from "./SettingsSidebar";
import { SettingsHome } from "./SettingsHome";
import { SettingsHeader } from "./SettingsHeader";
import { SETTINGS_SECTIONS } from "../sections";

interface SettingsLayoutProps {
  activeSection: SettingsSectionId | null;
  onSectionSelect: (section: SettingsSectionId) => void;
  onBack: () => void;
}

export function SettingsLayout({
  activeSection,
  onSectionSelect,
  onBack,
}: SettingsLayoutProps) {
  const activeSectionConfig = activeSection
    ? SETTINGS_SECTIONS.find((s) => s.id === activeSection)
    : null;

  const ActiveComponent = activeSectionConfig?.component;

  return (
    <div className="h-full bg-background overflow-hidden">
      {/* Desktop Layout (md+): Sidebar + Content */}
      <div className="hidden md:flex h-full">
        <SettingsSidebar
          sections={SETTINGS_SECTIONS}
          activeSection={activeSection}
          onSectionSelect={onSectionSelect}
        />
        <div className="flex-1 overflow-auto p-6">
          {ActiveComponent ? (
            <ActiveComponent />
          ) : (
            <div className="text-muted-foreground">
              Select a section from the sidebar
            </div>
          )}
        </div>
      </div>

      {/* Mobile Layout (< md): Stack Navigation */}
      <div className="md:hidden h-full flex flex-col">
        {activeSection && activeSectionConfig ? (
          <>
            <SettingsHeader
              title={activeSectionConfig.name}
              onBack={onBack}
            />
            <div className="flex-1 overflow-auto p-4 animate-in slide-in-from-right-4 duration-200">
              {ActiveComponent && <ActiveComponent />}
            </div>
          </>
        ) : (
          <SettingsHome
            sections={SETTINGS_SECTIONS}
            onSectionSelect={onSectionSelect}
          />
        )}
      </div>
    </div>
  );
}

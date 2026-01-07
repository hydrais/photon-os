import { useSettingsNavigation } from "./settings/hooks/useSettingsNavigation";
import { SettingsLayout } from "./settings/components/SettingsLayout";

export function Settings() {
  const { activeSection, setActiveSection, goBack } = useSettingsNavigation();

  return (
    <div className="fixed inset-0">
      <SettingsLayout
        activeSection={activeSection}
        onSectionSelect={setActiveSection}
        onBack={goBack}
      />
    </div>
  );
}

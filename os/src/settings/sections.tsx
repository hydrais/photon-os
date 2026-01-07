import { User, Palette, Grid3X3 } from "lucide-react";
import type { SettingsSection } from "./types";
import { AccountSection } from "./sections/AccountSection";
import { AppearanceSection } from "./sections/AppearanceSection";
import { AppsSection } from "./sections/AppsSection";

export const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    id: "account",
    name: "Account",
    description: "Manage your account and sign out",
    icon: User,
    component: AccountSection,
  },
  {
    id: "appearance",
    name: "Appearance",
    description: "Customize launcher background",
    icon: Palette,
    component: AppearanceSection,
  },
  {
    id: "apps",
    name: "Apps",
    description: "Manage installed applications",
    icon: Grid3X3,
    component: AppsSection,
  },
];

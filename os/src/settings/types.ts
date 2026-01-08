import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";

export type SettingsSectionId = "account" | "appearance" | "apps" | "devices";

export interface SettingsSection {
  id: SettingsSectionId;
  name: string;
  description: string;
  icon: LucideIcon;
  component: ComponentType;
}

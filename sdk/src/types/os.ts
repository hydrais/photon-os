import { AppDefinition } from "./app";

export type AppLaunchResult = {
  launched: boolean;
  error: Error | null;
  app: AppDefinition;
};

export type OperatingSystemAPI = {
  system_homeButton: () => Promise<void>;
  apps_getInstalledApps: () => Promise<AppDefinition[]>;
  apps_launchApp: (app: AppDefinition) => Promise<AppLaunchResult>;
  apps_foregroundApp: (app: AppDefinition) => Promise<void>;
};

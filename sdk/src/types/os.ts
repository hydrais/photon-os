import { AppDefinition } from "./app";
import { PhotonUser } from "./user";

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
  apps_requestAppInstall: (app: AppDefinition) => Promise<void>;
  apps_requestAppUninstall: (app: AppDefinition) => Promise<void>;
  user_getCurrentUser: () => Promise<PhotonUser>;
};

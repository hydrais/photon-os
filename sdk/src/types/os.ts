import { AppDefinition } from "./app";

export type OperatingSystemAPI = {
  apps_getInstalledApps: () => Promise<AppDefinition[]>;
};

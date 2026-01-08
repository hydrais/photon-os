import { AppDefinition } from "./app";
import { DeviceMessage, SendMessageResult, SLDevice } from "./devices";
import { PreferenceValue } from "./preferences";
import { SecondLifeAccount } from "./secondlife";
import { PhotonUser } from "./user";

export type AppLaunchResult = {
  launched: boolean;
  error: Error | null;
  app: AppDefinition;
};

export type LinkingCode = {
  code: string;
  expiresAt: string;
};

export type OperatingSystemAPI = {
  system_homeButton: () => Promise<void>;
  apps_getInstalledApps: () => Promise<AppDefinition[]>;
  apps_launchApp: (app: AppDefinition) => Promise<AppLaunchResult>;
  apps_foregroundApp: (app: AppDefinition) => Promise<void>;
  apps_requestAppInstall: (app: AppDefinition) => Promise<void>;
  apps_requestAppUninstall: (app: AppDefinition) => Promise<void>;
  user_getCurrentUser: () => Promise<PhotonUser>;

  // Preferences API
  prefs_getSandboxed: (key: string) => Promise<PreferenceValue>;
  prefs_setSandboxed: (key: string, value: PreferenceValue) => Promise<void>;
  prefs_deleteSandboxed: (key: string) => Promise<void>;
  prefs_getShared: (key: string) => Promise<PreferenceValue>;
  prefs_setShared: (key: string, value: PreferenceValue) => Promise<void>;
  prefs_deleteShared: (key: string) => Promise<void>;

  // Second Life Accounts API
  accounts_getLinkedSecondLifeAccounts: () => Promise<SecondLifeAccount[]>;
  accounts_unlinkSecondLifeAccount: (avatarUuid: string) => Promise<void>;
  accounts_generateLinkingCode: () => Promise<LinkingCode>;

  // Second Life Devices API
  devices_getRegistered: () => Promise<SLDevice[]>;
  devices_sendMessage: (
    deviceId: string,
    type: string,
    payload: Record<string, unknown>
  ) => Promise<SendMessageResult>;
  devices_unregister: (deviceId: string) => Promise<void>;
  devices_subscribe: (callback: (message: DeviceMessage) => void) => Promise<void>;
  devices_unsubscribe: () => Promise<void>;
};

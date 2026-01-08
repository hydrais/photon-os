import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import type {
  AppBundleId,
  AppDefinition,
  RunningAppInstance,
  OperatingSystemAPI,
  PhotonUser,
  PreferenceValue,
  SecondLifeAccount,
  LinkingCode,
} from "@photon-os/sdk";
import { useApps } from "./hooks/useApps";
import { useAuth } from "../auth/AuthContext";
import { Spinner } from "@/components/ui/spinner";
import * as pmrpc from "pm-rpc";
import { InstallAppDrawer } from "@/components/system/install-app-drawer";
import { UninstallAppDrawer } from "@/components/system/uninstall-app-drawer";
import {
  fetchSandboxedPreference,
  setSandboxedPreference,
  deleteSandboxedPreference,
  fetchSharedPreference,
  setSharedPreference,
  deleteSharedPreference,
} from "../supabase/preferences";
import {
  fetchLinkedSecondLifeAccounts,
  deleteLinkedSecondLifeAccount,
} from "../supabase/linkedSecondLifeAccounts";
import { createLinkingCode } from "../supabase/linkingCodes";

export const LAUNCHER_APP: AppDefinition = {
  bundleId: "com.photon-os.launcher",
  author: "Photon OS",
  name: "Launcher",
  url: "/__launcher",
};

export const SYSTEM_APPS: AppDefinition[] = [
  LAUNCHER_APP,
  {
    bundleId: "com.photon-os.settings",
    author: "Photon OS",
    name: "Settings",
    url: "/__settings",
  },
];

type OperatingSystemContextType = {
  api: OperatingSystemAPI;
  runningApps: RunningAppInstance[];
  installedApps: AppDefinition[];
  appIframeRefs: Record<AppBundleId, HTMLIFrameElement>;
  setAppIframeRef: (
    bundleId: string,
    element: HTMLIFrameElement | null
  ) => void;
  foregroundApp: (app: AppDefinition) => void;
  closeApp: (app: AppDefinition) => void;
  multitasking: boolean;
  setMultitasking: (value: boolean) => void;
};

export const OperatingSystemContext = createContext<OperatingSystemContextType>(
  {} as OperatingSystemContextType
);

export function OperatingSystemProvider({ children }: PropsWithChildren) {
  const [apiLoading, setApiLoading] = useState(true);
  const [installAppRequest, setInstallAppRequest] =
    useState<AppDefinition | null>(null);
  const [uninstallAppRequest, setUninstallAppRequest] =
    useState<AppDefinition | null>(null);
  const [multitasking, setMultitasking] = useState(false);

  // Track the last message source for identifying calling apps
  const lastMessageSourceRef = useRef<Window | null>(null);

  const { user } = useAuth();

  const {
    runningApps,
    installedApps,
    appIframeRefs,
    setAppIframeRef,
    launchApp,
    foregroundApp,
    closeApp,
    installApp,
    uninstallApp,
    isLoadingApps,
  } = useApps(user?.id);

  // Capture message source before pm-rpc processes it
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.source && event.source !== window) {
        lastMessageSourceRef.current = event.source as Window;
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Identify which app sent the current RPC call
  const identifyCallingApp = useCallback((): string | null => {
    const source = lastMessageSourceRef.current;
    if (!source) return null;

    for (const [bundleId, iframe] of Object.entries(appIframeRefs)) {
      if (iframe.contentWindow === source) {
        return bundleId;
      }
    }
    return null;
  }, [appIframeRefs]);

  const api: OperatingSystemAPI = useMemo(
    () => ({
      async system_homeButton() {
        foregroundApp(LAUNCHER_APP);
      },
      async apps_getInstalledApps() {
        return installedApps;
      },
      async apps_launchApp(app) {
        launchApp(app);
        return { launched: true, app, error: null };
      },
      async apps_foregroundApp(app) {
        foregroundApp(app);
      },
      async apps_requestAppInstall(app) {
        setInstallAppRequest(app);
      },
      async apps_requestAppUninstall(app) {
        setUninstallAppRequest(app);
      },
      async user_getCurrentUser(): Promise<PhotonUser> {
        if (!user) throw new Error("Not authenticated");
        return {
          id: user.id,
          displayName:
            user.user_metadata?.display_name ||
            user.email?.split("@")[0] ||
            "User",
        };
      },

      // Preferences API - Sandboxed (app-specific)
      async prefs_getSandboxed(key: string): Promise<PreferenceValue> {
        if (!user) throw new Error("Not authenticated");
        const bundleId = identifyCallingApp();
        if (!bundleId) throw new Error("Could not identify calling app");
        return await fetchSandboxedPreference(user.id, bundleId, key);
      },
      async prefs_setSandboxed(key: string, value: PreferenceValue): Promise<void> {
        if (!user) throw new Error("Not authenticated");
        const bundleId = identifyCallingApp();
        if (!bundleId) throw new Error("Could not identify calling app");
        await setSandboxedPreference(user.id, bundleId, key, value);
      },
      async prefs_deleteSandboxed(key: string): Promise<void> {
        if (!user) throw new Error("Not authenticated");
        const bundleId = identifyCallingApp();
        if (!bundleId) throw new Error("Could not identify calling app");
        await deleteSandboxedPreference(user.id, bundleId, key);
      },

      // Preferences API - Shared (global)
      async prefs_getShared(key: string): Promise<PreferenceValue> {
        if (!user) throw new Error("Not authenticated");
        return await fetchSharedPreference(user.id, key);
      },
      async prefs_setShared(key: string, value: PreferenceValue): Promise<void> {
        if (!user) throw new Error("Not authenticated");
        await setSharedPreference(user.id, key, value);
      },
      async prefs_deleteShared(key: string): Promise<void> {
        if (!user) throw new Error("Not authenticated");
        await deleteSharedPreference(user.id, key);
      },

      // Second Life Accounts API
      async accounts_getLinkedSecondLifeAccounts(): Promise<SecondLifeAccount[]> {
        if (!user) throw new Error("Not authenticated");
        return await fetchLinkedSecondLifeAccounts(user.id);
      },
      async accounts_unlinkSecondLifeAccount(avatarUuid: string): Promise<void> {
        if (!user) throw new Error("Not authenticated");
        await deleteLinkedSecondLifeAccount(user.id, avatarUuid);
      },
      async accounts_generateLinkingCode(): Promise<LinkingCode> {
        if (!user) throw new Error("Not authenticated");
        return await createLinkingCode(user.id);
      },
    }),
    [installedApps, runningApps, user, identifyCallingApp]
  );

  useEffect(() => {
    pmrpc.api.set("photon_os", api);
    setApiLoading(false);
  }, [api]);

  const loading = apiLoading || isLoadingApps;

  return (
    <OperatingSystemContext.Provider
      value={{
        api,
        runningApps,
        installedApps,
        appIframeRefs,
        setAppIframeRef,
        foregroundApp,
        closeApp,
        multitasking,
        setMultitasking,
      }}
    >
      {loading ? (
        <div className="fixed inset-0 flex items-center justify-center bg-foreground text-background">
          <Spinner />
        </div>
      ) : (
        <>
          {children}
          <InstallAppDrawer
            app={installAppRequest}
            type="permanent"
            onDecline={() => setInstallAppRequest(null)}
            onInstall={() => {
              if (!installAppRequest) return;
              installApp(installAppRequest);
              setInstallAppRequest(null);
            }}
          />
          <UninstallAppDrawer
            app={uninstallAppRequest}
            onDecline={() => setUninstallAppRequest(null)}
            onUninstall={() => {
              if (!uninstallAppRequest) return;
              uninstallApp(uninstallAppRequest);
              setUninstallAppRequest(null);
            }}
          />
        </>
      )}
    </OperatingSystemContext.Provider>
  );
}

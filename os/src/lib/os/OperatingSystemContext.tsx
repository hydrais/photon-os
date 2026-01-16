import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import { useLocation } from "react-router";
import type {
  AppBundleId,
  AppDefinition,
  RunningAppInstance,
  OperatingSystemAPI,
  PhotonUser,
  PreferenceValue,
  SecondLifeAccount,
  LinkingCode,
  SLDevice,
  SendMessageResult,
  DeviceMessage,
} from "@photon-os/sdk";
import type { PermissionType } from "../supabase/permissions";
import { useApps } from "./hooks/useApps";
import { useAuth } from "../auth/AuthContext";
import { Spinner } from "@/components/ui/spinner";
import * as pmrpc from "pm-rpc";
import { InstallAppDrawer } from "@/components/system/install-app-drawer";
import { UninstallAppDrawer } from "@/components/system/uninstall-app-drawer";
import {
  PermissionDrawer,
  type PermissionRequest,
} from "@/components/system/permission-drawer";
import {
  fetchPermission,
  setPermission,
} from "../supabase/permissions";
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
import {
  fetchRegisteredDevices,
  deleteRegisteredDevice,
  sendMessageToDevice,
  subscribeToDeviceMessages,
  unsubscribeFromDeviceMessages,
  addDeviceMessageListener,
} from "../supabase/slDevices";

type InstallAppRequest = {
  app: AppDefinition;
  suggestedBy?: {
    deviceId: string;
    objectName: string;
  };
};

export const LAUNCHER_APP: AppDefinition = {
  bundleId: "com.hydrais.photon.launcher",
  author: "Photon OS",
  name: "Launcher",
  url: "/__launcher",
};

export const SYSTEM_APPS: AppDefinition[] = [
  LAUNCHER_APP,
  {
    bundleId: "com.hydrais.photon.settings",
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
  invalidatePermissionCache: (bundleId?: string) => void;
};

export const OperatingSystemContext = createContext<OperatingSystemContextType>(
  {} as OperatingSystemContextType
);

export function OperatingSystemProvider({ children }: PropsWithChildren) {
  const [apiLoading, setApiLoading] = useState(true);
  const [installAppRequest, setInstallAppRequest] =
    useState<InstallAppRequest | null>(null);
  const [uninstallAppRequest, setUninstallAppRequest] =
    useState<AppDefinition | null>(null);
  const [multitasking, setMultitasking] = useState(false);
  const [permissionRequest, setPermissionRequest] =
    useState<PermissionRequest | null>(null);

  // Cache for permission checks: "bundleId:permissionType" -> boolean | null
  const permissionCacheRef = useRef<Map<string, boolean | null>>(new Map());

  // Track the last message source for identifying calling apps
  const lastMessageSourceRef = useRef<Window | null>(null);

  // Ref to access installedApps without causing callback recreation
  const installedAppsRef = useRef<AppDefinition[]>([]);

  // Ref to access appIframeRefs without causing callback recreation
  const appIframeRefsRef = useRef<Record<AppBundleId, HTMLIFrameElement>>({});

  const { user } = useAuth();
  const location = useLocation();

  // Only render system drawers at the root path (not in system app iframes)
  const isRootShell = location.pathname === "/";

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

  // Keep refs in sync for use in callbacks without causing recreation
  installedAppsRef.current = installedApps;
  appIframeRefsRef.current = appIframeRefs;

  // Track loading state for RPC calls that need to wait for apps to load
  const isLoadingAppsRef = useRef(isLoadingApps);
  const appsLoadedResolversRef = useRef<Array<() => void>>([]);
  isLoadingAppsRef.current = isLoadingApps;

  // Resolve any pending waiters when loading completes
  useEffect(() => {
    if (!isLoadingApps && appsLoadedResolversRef.current.length > 0) {
      appsLoadedResolversRef.current.forEach((resolve) => resolve());
      appsLoadedResolversRef.current = [];
    }
  }, [isLoadingApps]);

  // Helper to wait for apps to finish loading
  const waitForAppsLoaded = useCallback((): Promise<void> => {
    if (!isLoadingAppsRef.current) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      appsLoadedResolversRef.current.push(resolve);
    });
  }, []);

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

    // Use ref to avoid dependency on appIframeRefs
    for (const [bundleId, iframe] of Object.entries(appIframeRefsRef.current)) {
      if (iframe.contentWindow === source) {
        return bundleId;
      }
    }
    return null;
  }, []);

  // Invalidate permission cache (called when permissions change in Settings)
  const invalidatePermissionCache = useCallback((bundleId?: string) => {
    if (bundleId) {
      // Invalidate specific app's permissions
      for (const key of permissionCacheRef.current.keys()) {
        if (key.startsWith(`${bundleId}:`)) {
          permissionCacheRef.current.delete(key);
        }
      }
    } else {
      // Invalidate all cached permissions
      permissionCacheRef.current.clear();
    }
  }, []);

  // Check if an app has a specific permission
  const checkPermission = useCallback(
    async (permissionType: PermissionType): Promise<void> => {
      if (!user) throw new Error("Not authenticated");

      const bundleId = identifyCallingApp();
      if (!bundleId) throw new Error("Could not identify calling app");

      // System apps bypass permission checks
      if (SYSTEM_APPS.some((app) => app.bundleId === bundleId)) {
        return;
      }

      const cacheKey = `${bundleId}:${permissionType}`;

      // Check cache first
      if (permissionCacheRef.current.has(cacheKey)) {
        const cached = permissionCacheRef.current.get(cacheKey);
        if (cached === true) return;
        if (cached === false) {
          throw new Error(
            `Permission "${permissionType}" denied for app "${bundleId}"`
          );
        }
        // cached === null means not yet requested, fall through to prompt
      }

      // Query database if not cached
      let permission = permissionCacheRef.current.get(cacheKey);
      if (permission === undefined) {
        permission = await fetchPermission(user.id, bundleId, permissionType);
        permissionCacheRef.current.set(cacheKey, permission);
      }

      // If already granted or denied, handle accordingly
      if (permission === true) return;
      if (permission === false) {
        throw new Error(
          `Permission "${permissionType}" denied for app "${bundleId}"`
        );
      }

      // Permission not yet requested - show prompt and await user response
      // Use ref to avoid dependency on installedApps (only used for display name)
      const appDef = installedAppsRef.current.find((app) => app.bundleId === bundleId);
      const appName = appDef?.name || bundleId;

      const granted = await new Promise<boolean>((resolve) => {
        setPermissionRequest({
          bundleId,
          appName,
          permissionType,
          resolve,
        });
      });

      // Store decision in DB and update cache
      await setPermission(user.id, bundleId, permissionType, granted);
      permissionCacheRef.current.set(cacheKey, granted);

      if (!granted) {
        throw new Error(
          `Permission "${permissionType}" denied for app "${bundleId}"`
        );
      }
    },
    [user]
  );

  const api: OperatingSystemAPI = useMemo(
    () => ({
      async system_homeButton() {
        foregroundApp(LAUNCHER_APP);
      },
      async apps_getInstalledApps() {
        await waitForAppsLoaded();
        return installedAppsRef.current;
      },
      async apps_launchApp(app) {
        launchApp(app);
        return { launched: true, app, error: null };
      },
      async apps_foregroundApp(app) {
        foregroundApp(app);
      },
      async apps_requestAppInstall(app) {
        setInstallAppRequest({ app });
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
      async prefs_setSandboxed(
        key: string,
        value: PreferenceValue
      ): Promise<void> {
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
      async prefs_setShared(
        key: string,
        value: PreferenceValue
      ): Promise<void> {
        if (!user) throw new Error("Not authenticated");
        await setSharedPreference(user.id, key, value);
      },
      async prefs_deleteShared(key: string): Promise<void> {
        if (!user) throw new Error("Not authenticated");
        await deleteSharedPreference(user.id, key);
      },

      // Second Life Accounts API
      async accounts_getLinkedSecondLifeAccounts(): Promise<
        SecondLifeAccount[]
      > {
        if (!user) throw new Error("Not authenticated");
        return await fetchLinkedSecondLifeAccounts(user.id);
      },
      async accounts_unlinkSecondLifeAccount(
        avatarUuid: string
      ): Promise<void> {
        if (!user) throw new Error("Not authenticated");
        await deleteLinkedSecondLifeAccount(user.id, avatarUuid);
      },
      async accounts_generateLinkingCode(): Promise<LinkingCode> {
        if (!user) throw new Error("Not authenticated");
        return await createLinkingCode(user.id);
      },

      // Second Life Devices API
      async devices_getRegistered(): Promise<SLDevice[]> {
        if (!user) throw new Error("Not authenticated");
        await checkPermission("devices");
        return await fetchRegisteredDevices(user.id);
      },
      async devices_sendMessage(
        deviceId: string,
        type: string,
        payload: Record<string, unknown>
      ): Promise<SendMessageResult> {
        if (!user) throw new Error("Not authenticated");
        await checkPermission("devices");
        return await sendMessageToDevice(deviceId, type, payload);
      },
      async devices_unregister(deviceId: string): Promise<void> {
        if (!user) throw new Error("Not authenticated");
        await checkPermission("devices");
        await deleteRegisteredDevice(user.id, deviceId);
      },
      async devices_subscribe(
        callback: (message: DeviceMessage) => void
      ): Promise<void> {
        if (!user) throw new Error("Not authenticated");
        await checkPermission("devices");
        subscribeToDeviceMessages(user.id, callback);
      },
      async devices_unsubscribe(): Promise<void> {
        unsubscribeFromDeviceMessages();
      },

      // Permissions API (for Settings app)
      async permissions_invalidateCache(bundleId?: string): Promise<void> {
        invalidatePermissionCache(bundleId);
      },
    }),
    [installedApps, runningApps, user, identifyCallingApp, checkPermission, invalidatePermissionCache, waitForAppsLoaded]
  );

  useEffect(() => {
    pmrpc.api.set("photon_os", api);
    setApiLoading(false);
  }, [api]);

  // OS-level device message subscription for system messages
  useEffect(() => {
    if (!user) {
      console.log("[OS] No user, skipping device message subscription");
      return;
    }

    console.log("[OS] Setting up device message listener for user:", user.id);
    const unsubscribe = addDeviceMessageListener(user.id, (message) => {
      console.log("[OS] Received device message:", message.type, message);
      if (message.type === "photon:suggest_app_install") {
        const payload = message.payload as {
          bundleId?: string;
          name?: string;
          author?: string;
          url?: string;
        };

        // Validate required fields
        if (!payload.bundleId || !payload.name || !payload.author || !payload.url) {
          console.warn("Invalid suggest_app_install payload from device:", message.deviceId);
          return;
        }

        // Check if already installed
        const alreadyInstalled = installedApps.some(
          (app) => app.bundleId === payload.bundleId
        );
        if (alreadyInstalled) {
          return;
        }

        // Show install drawer with device info
        setInstallAppRequest({
          app: {
            bundleId: payload.bundleId,
            name: payload.name,
            author: payload.author,
            url: payload.url,
          },
          suggestedBy: {
            deviceId: message.deviceId,
            objectName: message.objectName,
          },
        });
      }
    });

    return unsubscribe;
  }, [user, installedApps]);

  const loading = apiLoading || isLoadingApps;

  // Memoize context value to prevent unnecessary consumer re-renders
  const contextValue = useMemo(
    () => ({
      api,
      runningApps,
      installedApps,
      appIframeRefs,
      setAppIframeRef,
      foregroundApp,
      closeApp,
      multitasking,
      setMultitasking,
      invalidatePermissionCache,
    }),
    [
      api,
      runningApps,
      installedApps,
      appIframeRefs,
      setAppIframeRef,
      foregroundApp,
      closeApp,
      multitasking,
      setMultitasking,
      invalidatePermissionCache,
    ]
  );

  return (
    <OperatingSystemContext.Provider value={contextValue}>
      {/* Always render children to preserve iframe state */}
      <div className={loading ? "hidden" : undefined}>
        {children}
      </div>
      {isRootShell && (
        <>
          {loading && (
            <div className="fixed inset-0 flex items-center justify-center bg-foreground text-background">
              <Spinner />
            </div>
          )}
          <InstallAppDrawer
            app={installAppRequest?.app ?? null}
            suggestedBy={installAppRequest?.suggestedBy}
            type="permanent"
            onDecline={() => setInstallAppRequest(null)}
            onInstall={() => {
              if (!installAppRequest?.app) return;
              installApp(installAppRequest.app);
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
          <PermissionDrawer
            request={permissionRequest}
            onAllow={() => {
              if (permissionRequest) {
                permissionRequest.resolve(true);
                setPermissionRequest(null);
              }
            }}
            onDeny={() => {
              if (permissionRequest) {
                permissionRequest.resolve(false);
                setPermissionRequest(null);
              }
            }}
          />
        </>
      )}
    </OperatingSystemContext.Provider>
  );
}

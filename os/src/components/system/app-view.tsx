import { OperatingSystemContext } from "@/lib/os/OperatingSystemContext";
import { cn } from "@/lib/utils";
import { useCallback, useContext } from "react";
import type { RunningAppInstance } from "@photon-os/sdk";
import { LAUNCHER_APP } from "@/lib/os/OperatingSystemContext";

function AppIframe({
  app,
  setAppIframeRef,
}: {
  app: RunningAppInstance;
  setAppIframeRef: (
    bundleId: string,
    element: HTMLIFrameElement | null
  ) => void;
}) {
  const refCallback = useCallback(
    (e: HTMLIFrameElement | null) => {
      setAppIframeRef(app.definition.bundleId, e);
    },
    [app.definition.bundleId, setAppIframeRef]
  );

  return (
    <iframe
      className="h-full w-full border-0"
      src={app.definition.url}
      ref={refCallback}
    />
  );
}

export function AppView() {
  const { runningApps, setAppIframeRef } = useContext(OperatingSystemContext);

  const launcherApp = runningApps.find(
    (app) => app.definition.bundleId === LAUNCHER_APP.bundleId
  );
  const foregroundApps = runningApps.filter(
    (app) => app.definition.bundleId !== LAUNCHER_APP.bundleId
  );

  return (
    <div className="flex-1 bg-foreground flex flex-col gap-2 relative">
      {/* Launcher layer - always beneath other apps */}
      {launcherApp && (
        <div className="absolute inset-0 rounded-xl overflow-hidden">
          <AppIframe app={launcherApp} setAppIframeRef={setAppIframeRef} />
        </div>
      )}

      {/* Foreground apps layer */}
      {foregroundApps.map((app) => (
        <div
          key={app.definition.bundleId}
          className={cn(
            "rounded-xl bg-background flex-1 flex-col overflow-hidden relative z-10",
            "transition-all duration-150 ease-out",
            app.isInBackground
              ? "scale-75 opacity-0 pointer-events-none"
              : "animate-in zoom-in-75 fade-in-0 scale-100 opacity-100"
          )}
        >
          <AppIframe app={app} setAppIframeRef={setAppIframeRef} />
        </div>
      ))}
    </div>
  );
}

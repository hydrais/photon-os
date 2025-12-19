import { OperatingSystemContext } from "@/lib/os/OperatingSystemContext";
import { cn } from "@/lib/utils";
import { useCallback, useContext } from "react";
import type { RunningAppInstance } from "@photon-os/sdk";

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

  return (
    <div className="flex-1 bg-foreground flex flex-col gap-2">
      {runningApps.map((app) => (
        <div
          key={app.definition.bundleId}
          className={cn(
            "rounded-xl bg-background flex-1 flex-col overflow-hidden",
            app.isInBackground && "display-none"
          )}
        >
          <AppIframe app={app} setAppIframeRef={setAppIframeRef} />
        </div>
      ))}
    </div>
  );
}

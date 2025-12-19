import { useInstalledApps } from "@photon-os/react";

export function Launcher() {
  const { installedApps } = useInstalledApps();

  return (
    <div className="fixed inset-0 bg-blue-200 items-center justify-center">
      {JSON.stringify(installedApps, null, 2)}
    </div>
  );
}

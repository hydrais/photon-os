import { useContext } from "react";
import { AppView } from "./components/system/app-view";
import { NavigationBar } from "./components/system/navigation-bar";
import { StatusBar } from "./components/system/status-bar";
import { OperatingSystemContext } from "./lib/os/OperatingSystemContext";

export function System() {
  const { api } = useContext(OperatingSystemContext);

  return (
    <div className="h-screen flex flex-col">
      <StatusBar />
      <div className="flex-1 bg-background flex flex-col">
        <AppView />
      </div>
      <NavigationBar
        onBack={() => {}}
        onHome={api.system_homeButton}
        onMultitasking={() => {}}
        side="right"
      />
    </div>
  );
}

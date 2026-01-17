import { useContext } from "react";
import { AppView } from "./components/system/app-view";
import { NavigationBar } from "./components/system/navigation-bar";
import { StatusBar } from "./components/system/status-bar";
import { OperatingSystemContext } from "./lib/os/OperatingSystemContext";

export function System() {
  const { api, multitasking, setMultitasking } = useContext(
    OperatingSystemContext,
  );

  return (
    <div id="frame" className="flex flex-col">
      <StatusBar />
      <div className="flex-1 bg-background flex flex-col">
        <AppView showMultitasking={multitasking} />
      </div>
      <NavigationBar
        onBack={() => {}}
        onHome={api.system_homeButton}
        onMultitasking={() => setMultitasking(!multitasking)}
        side="right"
      />
    </div>
  );
}

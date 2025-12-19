import { AppView } from "./components/system/app-view";
import { NavigationBar } from "./components/system/navigation-bar";
import { StatusBar } from "./components/system/status-bar";

export function System() {
  return (
    <div className="h-screen flex flex-col">
      <StatusBar />
      <div className="flex-1 bg-background flex flex-col">
        <AppView />
      </div>
      <NavigationBar
        onBack={() => {}}
        onHome={() => {}}
        onMultitasking={() => {}}
        side="right"
      />
    </div>
  );
}

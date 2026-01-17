import { Outlet } from "react-router";
import { TabBar } from "./TabBar";

export function TabLayout() {
  return (
    <div className="min-h-screen pb-16">
      <Outlet />
      <TabBar />
    </div>
  );
}

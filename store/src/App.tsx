import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { useApplyScale } from "@photon-os/react";
import { TabLayout } from "./components/navigation/TabLayout";
import { DiscoverScreen } from "./screens/DiscoverScreen";
import { SearchScreen } from "./screens/SearchScreen";
import { MoreScreen } from "./screens/MoreScreen";
import { InstallHistoryScreen } from "./screens/InstallHistoryScreen";
import { RecentUpdatesScreen } from "./screens/RecentUpdatesScreen";
import { SubmitAppScreen } from "./screens/SubmitApp";
import { ProfileSetupScreen } from "./screens/ProfileSetup";
import { ProfileEditScreen } from "./screens/ProfileEdit";
import { DeveloperProfileScreen } from "./screens/DeveloperProfile";
import { DeveloperDashboardScreen } from "./screens/DeveloperDashboard";
import { EditAppScreen } from "./screens/EditApp";
import { AppDetailScreen } from "./screens/AppDetailScreen";
import { NewUI } from "./screens/NewUI";

export default function App() {
  useApplyScale();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<NewUI />} />
      </Routes>
    </BrowserRouter>
  );
}

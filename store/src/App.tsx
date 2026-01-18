import {
  Routes,
  Route,
  useNavigate,
  Navigate,
  useLocation,
} from "react-router";
import { useApplyScale } from "@photon-os/react";
import { DiscoverScreen } from "./screens/DiscoverScreen";
import { Star, Shirt, ToolCase, MoreHorizontal } from "lucide-react";
import { PhotonTabBar } from "./components/ui/photon/tab-bar";
import { PhotonTabBarItem } from "./components/ui/photon/tab-bar-item";
import { MoreScreen } from "./screens/MoreScreen";
import { StoreDashboardScreen } from "./screens/DeveloperDashboard";
import { ProfileSetupScreen } from "./screens/ProfileSetup";
import { ProfileEditScreen } from "./screens/ProfileEdit";
import { InstallHistoryScreen } from "./screens/InstallHistoryScreen";
import { RecentUpdatesScreen } from "./screens/RecentUpdatesScreen";
import { AppDetailScreen } from "./screens/AppDetailScreen";

export default function App() {
  useApplyScale();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="h-screen flex flex-col">
      <Routes>
        <Route path="/" element={<Navigate to="/discover" replace />} />

        <Route path="/app/:appId" element={<AppDetailScreen />} />

        <Route path="/discover" element={<DiscoverScreen />} />
        <Route path="/avatar" element={<DiscoverScreen />} />
        <Route path="/tools" element={<DiscoverScreen />} />

        <Route path="/more" element={<MoreScreen />} />
        <Route path="/more/history" element={<InstallHistoryScreen />} />
        <Route path="/more/updates" element={<RecentUpdatesScreen />} />

        <Route
          path="/more/store/dashboard"
          element={<StoreDashboardScreen />}
        />

        <Route path="/more/store/edit" element={<ProfileEditScreen />} />

        <Route path="/more/store/setup" element={<ProfileSetupScreen />} />

        <Route
          path="/more/store"
          element={<Navigate to="/more/store/dashboard" replace />}
        />

        <Route
          path="*"
          element={
            <main className="flex-1 flex flex-col items-center justify-center">
              <h1 className="text-lg font-semibold">Not found</h1>
            </main>
          }
        />
      </Routes>

      <PhotonTabBar>
        <PhotonTabBarItem
          icon={Star}
          label="Discover"
          active={location.pathname.startsWith("/discover")}
          onClick={() => navigate("/discover")}
        />
        <PhotonTabBarItem
          icon={Shirt}
          label="Avatar"
          active={location.pathname.startsWith("/avatar")}
          onClick={() => navigate("/avatar")}
        />
        <PhotonTabBarItem
          icon={ToolCase}
          label="Tools"
          active={location.pathname.startsWith("/tools")}
          onClick={() => navigate("/tools")}
        />
        <PhotonTabBarItem
          icon={MoreHorizontal}
          label="More"
          active={location.pathname.startsWith("/more")}
          onClick={() => navigate("/more")}
        />
      </PhotonTabBar>
    </div>
  );
}

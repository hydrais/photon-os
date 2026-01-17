import { BrowserRouter, Routes, Route } from "react-router";
import { MainScreen } from "./screens/Main";
import { SubmitAppScreen } from "./screens/SubmitApp";
import { ProfileSetupScreen } from "./screens/ProfileSetup";
import { ProfileEditScreen } from "./screens/ProfileEdit";
import { DeveloperProfileScreen } from "./screens/DeveloperProfile";
import { DeveloperDashboardScreen } from "./screens/DeveloperDashboard";
import { EditAppScreen } from "./screens/EditApp";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainScreen />} />
        <Route path="/submit" element={<SubmitAppScreen />} />
        <Route path="/profile/setup" element={<ProfileSetupScreen />} />
        <Route path="/profile/edit" element={<ProfileEditScreen />} />
        <Route path="/developer/:developerId" element={<DeveloperProfileScreen />} />
        <Route path="/dashboard" element={<DeveloperDashboardScreen />} />
        <Route path="/dashboard/app/:appId/edit" element={<EditAppScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

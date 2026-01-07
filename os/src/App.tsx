import { BrowserRouter, Routes, Route } from "react-router";
import { AuthProvider } from "./lib/auth/AuthContext";
import { OperatingSystemProvider } from "./lib/os/OperatingSystemContext";
import { ConfirmPage } from "./lib/auth/components/ConfirmPage";
import { System } from "./System";
import { Launcher } from "./Launcher";
import { Settings } from "./Settings";

function AuthenticatedApp() {
  return (
    <AuthProvider>
      <OperatingSystemProvider>
        <Routes>
          <Route path="/" element={<System />} />
          <Route path="/__launcher" element={<Launcher />} />
          <Route path="/__settings" element={<Settings />} />
        </Routes>
      </OperatingSystemProvider>
    </AuthProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/__confirm" element={<ConfirmPage />} />
        <Route path="/*" element={<AuthenticatedApp />} />
      </Routes>
    </BrowserRouter>
  );
}

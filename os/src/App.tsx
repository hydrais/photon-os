import { BrowserRouter, Routes, Route } from "react-router";
import { OperatingSystemProvider } from "./lib/os/OperatingSystemContext";
import { System } from "./System";
import { Launcher } from "./Launcher";
import { Settings } from "./Settings";

export default function App() {
  return (
    <OperatingSystemProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<System />} />
          <Route path="/__launcher" element={<Launcher />} />
          <Route path="/__settings" element={<Settings />} />
        </Routes>
      </BrowserRouter>
    </OperatingSystemProvider>
  );
}

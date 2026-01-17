import { BrowserRouter, Routes, Route } from "react-router";
import { useApplyScale } from "@photon-os/react";
import { MainScreen } from "./screens/Main";

export default function App() {
  useApplyScale();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<MainScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

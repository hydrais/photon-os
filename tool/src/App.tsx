import { BrowserRouter, Routes, Route } from "react-router";
import { MainScreen } from "./screens/Main";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<MainScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

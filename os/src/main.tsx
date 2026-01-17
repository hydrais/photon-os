import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import App from "./App.tsx"

// Parse scale from URL query parameter
function getScale(): number | null {
  const params = new URLSearchParams(window.location.search);
  const scaleParam = params.get("scale");
  if (scaleParam) {
    const parsed = parseFloat(scaleParam);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  return null;
}

// Apply scale to document only if specified
const scale = getScale();
if (scale !== null) {
  document.documentElement.style.setProperty("--os-scale", String(scale));
  document.documentElement.style.zoom = String(scale);
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
)

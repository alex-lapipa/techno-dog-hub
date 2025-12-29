import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// HelmetProvider is now in App.tsx - no duplicate needed
createRoot(document.getElementById("root")!).render(<App />);

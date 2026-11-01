import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// Same bundled fonts as the landing page.
import "@fontsource/michroma/400.css";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-mono/400.css";
import "../shared/ui.css";
import UploadPage from "./UploadPage.jsx";
import { initPageTransitions } from "../motion/pageTransition.js";
import MotionRoot from "../motion/MotionRoot.jsx";

initPageTransitions(); // fade between pages (settings: src/motion/motion.config.js)

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MotionRoot>
      <UploadPage />
    </MotionRoot>
  </StrictMode>
);

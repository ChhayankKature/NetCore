import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/michroma/400.css";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-mono/400.css";
import "./landing.css";
import Landing from "./Landing.jsx";
import site from "./site.config.js";
import { loadSite } from "./site-config.js";
import { initPageTransitions } from "../motion/pageTransition.js";
import MotionRoot from "../motion/MotionRoot.jsx";

initPageTransitions(); // fade between pages (settings: src/motion/motion.config.js)

// Wait up to this long for the saved settings, then show the page with site.config.js instead.
const SETTINGS_WAIT_MS = 4000;

// Settings saved in the admin panel (Site settings tab) are copied into `site` before the page
// renders, so every landing component keeps reading `site` exactly as before.
Promise.race([loadSite(), new Promise((resolve) => setTimeout(() => resolve(null), SETTINGS_WAIT_MS))])
  .then((saved) => {
    if (!saved) return;
    Object.assign(site, saved);
    // The default theme only applies to first-time visitors (nobody has picked one yet).
    try {
      if (!localStorage.getItem(site.theme.storageKey)) document.documentElement.dataset.theme = site.theme.default;
    } catch (e) { /* storage blocked: keep the theme the page already set */ }
  })
  .catch(() => {})
  .finally(() => {
    createRoot(document.getElementById("root")).render(
      <StrictMode>
        <MotionRoot>
          <Landing />
        </MotionRoot>
      </StrictMode>
    );
  });

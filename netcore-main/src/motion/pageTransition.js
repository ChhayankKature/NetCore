// Fade between pages.
//
// The site is separate HTML pages, so a page change is a real browser navigation.
// This fades the old page out before the browser leaves, and fades the new page in
// once it has drawn. It works in every browser, and it only touches the opacity of
// #root, so the globe and the sticky header are not affected.
//
//   initPageTransitions()  call once, first thing in each page's entry file
//   enterPage()            fades the page in (MotionRoot calls it after the first render)
//   leaveTo(url)           fades out, then opens url (use it instead of window.location.assign)
//
// Links are handled automatically. A link is skipped (opens normally) when it:
// points to another site, has target="_blank", has a download attribute, only changes
// the #hash on this page, or has data-no-transition. Ctrl/Cmd/Shift/Alt/middle clicks are ignored.
import { animate } from "motion";
import cfg from "./motion.config.js";
import { motionOn } from "./env.js";

const rootEl = () => document.getElementById("root");
const seconds = (ms) => ms / 1000;
const active = () => cfg.pageTransition.enabled && motionOn();

let installed = false;
let entered = false;
let leaving = false;
let safetyTimer = 0;

// Put the page back to fully visible, immediately.
function showNow() {
  const el = rootEl();
  if (el) el.style.opacity = "";
  leaving = false;
  clearTimeout(safetyTimer);
}

export function initPageTransitions() {
  if (installed) return;
  installed = true;

  const el = rootEl();
  if (el && active()) {
    el.style.opacity = "0";               // hidden until the page has drawn
    safetyTimer = setTimeout(showNow, 3000); // if anything goes wrong, never leave it blank
  }

  document.addEventListener("click", onClick);
  // Back/forward can bring a page back from the browser's memory in its faded-out state.
  window.addEventListener("pageshow", (e) => { if (e.persisted) showNow(); });
}

export function enterPage() {
  if (entered) return;
  entered = true;
  const el = rootEl();
  if (!el) return;
  clearTimeout(safetyTimer);
  if (!active()) { el.style.opacity = ""; return; }
  animate(el, { opacity: [0, 1] }, { duration: seconds(cfg.pageTransition.enterMs), ease: cfg.pageTransition.ease })
    .then(() => { el.style.opacity = ""; });
}

export function leaveTo(href, { replace = false } = {}) {
  const go = () => (replace ? window.location.replace(href) : window.location.assign(href));
  const el = rootEl();
  if (!el || !active()) { go(); return; }
  if (leaving) return;
  leaving = true;
  animate(el, { opacity: 0 }, { duration: seconds(cfg.pageTransition.exitMs), ease: cfg.pageTransition.ease })
    .then(go);
  // If the browser never actually left (navigation was blocked), show the page again.
  safetyTimer = setTimeout(showNow, 5000);
}

function onClick(e) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  if (!active()) return;
  const a = e.target instanceof Element ? e.target.closest("a[href]") : null;
  if (!a) return;
  if ((a.target && a.target !== "_self") || a.hasAttribute("download") || a.hasAttribute("data-no-transition")) return;

  let url;
  try { url = new URL(a.href, window.location.href); } catch { return; }
  if (url.protocol !== "http:" && url.protocol !== "https:") return; // mailto:, tel: ...
  if (url.origin !== window.location.origin) return;                 // another website
  if (url.pathname === window.location.pathname && url.search === window.location.search) return; // same page (#hash)

  e.preventDefault();
  leaveTo(url.href);
}

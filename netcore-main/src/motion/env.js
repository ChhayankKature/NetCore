import cfg from "./motion.config.js";

// True when the visitor has asked their device for less motion.
export const prefersReducedMotion = () =>
  typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

// Should animations run right now? (switched on in the config, and the visitor allows it)
export const motionOn = () => cfg.enabled && !prefersReducedMotion();

// Small building blocks used by the pages. Settings are in motion.config.js.
//
//   <ScrollFade>      fades and slides a block in as it scrolls into view and out as it leaves,
//                     tied to the scroll position (scroll up and it plays backwards)
//   <Stagger>/<Item>  items that rise in one after another (once)
//   <ScrollProgress>  thin bar showing how far down the page you are
//   <Swap id=...>     fades the old content out and the new content in when `id` changes
//   useHeaderFade()   0 to 1 as the page scrolls off the top (used by the landing header)
import { createContext, useContext, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import cfg from "./motion.config.js";

// ── ScrollFade ────────────────────────────────────────────────
// mode "inOut" (default): fade in while entering, fade out while leaving.
// mode "out": starts visible, fades and drifts up as you scroll away (used on the hero).
export function ScrollFade({ as = "div", mode = "inOut", offset, distance, className, style, children, ...rest }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const s = cfg.scroll;
  const out = mode === "out";
  const z = Math.min(0.4, Math.max(0.05, s.fadeZone));
  const move = distance ?? (out ? s.heroDrift : s.distance);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: offset ?? (out ? ["start start", "end start"] : ["start end", "end start"])
  });
  const opacity = useTransform(scrollYProgress, out ? [0, 0.7] : [0, z, 1 - z, 1], out ? [1, 0] : [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, out ? [0, 1] : [0, z, 1 - z, 1], out ? [0, -move] : [move, 0, 0, -move]);

  const enabled = cfg.enabled && !reduced && (out ? s.heroFadeOut : s.sectionFade);
  if (!enabled) {
    const Plain = as;
    return <Plain ref={ref} className={className} style={style} {...rest}>{children}</Plain>;
  }
  const Tag = motion[as];
  return (
    <Tag ref={ref} className={className} style={{ ...style, opacity, y }} {...rest}>
      {children}
    </Tag>
  );
}

// ── Stagger / Item ────────────────────────────────────────────
// <Stagger mode="load">  plays when the page opens (hero).  <Stagger> plays once when scrolled into view.
const StaggerContext = createContext("off");

export function Stagger({ as = "div", mode = "view", delay = 0, className, children, ...rest }) {
  const reduced = useReducedMotion();
  const load = mode === "load";
  const enabled = cfg.enabled && !reduced && (load ? cfg.hero.enabled : true);
  if (!enabled) {
    const Plain = as;
    return (
      <StaggerContext.Provider value="off">
        <Plain className={className} {...rest}>{children}</Plain>
      </StaggerContext.Provider>
    );
  }
  const Tag = motion[as];
  const gap = load ? cfg.hero.staggerMs / 1000 : cfg.reveal.stagger;
  const first = load ? cfg.hero.delayMs / 1000 : delay;
  const variants = { hidden: {}, show: { transition: { staggerChildren: gap, delayChildren: first } } };
  const trigger = load
    ? { initial: "hidden", animate: "show" }
    : { initial: "hidden", whileInView: "show", viewport: { once: true, amount: cfg.reveal.amount } };
  return (
    <StaggerContext.Provider value={load ? "load" : "view"}>
      <Tag className={className} variants={variants} {...trigger} {...rest}>{children}</Tag>
    </StaggerContext.Provider>
  );
}

export function Item({ as = "div", className, children, ...rest }) {
  const kind = useContext(StaggerContext);
  if (kind === "off") {
    const Plain = as;
    return <Plain className={className} {...rest}>{children}</Plain>;
  }
  const load = kind === "load";
  const variants = {
    hidden: { opacity: 0, y: load ? cfg.hero.rise : cfg.reveal.rise },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: load ? cfg.hero.durationMs / 1000 : cfg.reveal.duration, ease: cfg.pageTransition.ease }
    }
  };
  const Tag = motion[as];
  return <Tag className={className} variants={variants} {...rest}>{children}</Tag>;
}

// ── ScrollProgress ────────────────────────────────────────────
export function ScrollProgress() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, restDelta: 0.001 });
  if (!cfg.enabled || !cfg.scroll.progressBar || reduced) return null;
  return <motion.div className="scroll-progress" style={{ scaleX }} aria-hidden="true" />;
}

// ── useHeaderFade ─────────────────────────────────────────────
export function useHeaderFade() {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const value = useTransform(scrollY, [0, cfg.scroll.headerFadeDistance], [0, 1]);
  return cfg.enabled && cfg.scroll.headerFade && !reduced ? value : null;
}

// ── Swap ──────────────────────────────────────────────────────
// Wrap content that changes between states. When `id` changes, the old content fades out
// and the new content fades in. Changing the content without changing `id` does nothing.
export function Swap({ id, className, children }) {
  const reduced = useReducedMotion();
  if (!cfg.enabled) return <div className={className}>{children}</div>;
  const duration = reduced ? 0 : cfg.ui.duration;
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={id}
        className={className}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

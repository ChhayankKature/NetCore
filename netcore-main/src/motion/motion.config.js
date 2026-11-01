// ─────────────────────────────────────────────────────────────
//  ANIMATION SETTINGS. Every timing, distance and on/off switch lives here.
//  Edit a number, save, and `npm run dev` shows it. Details: ANIMATIONS.md
//
//  People who turned on "reduce motion" in their device settings get no
//  sliding or scrolling effects and no page fades, whatever is set here.
// ─────────────────────────────────────────────────────────────
const motionConfig = {
  enabled: true, // false = every animation off (pages just appear)

  // ── Changing page ───────────────────────────────────────────
  // The old page fades out, then the new page fades in (all pages except the loading screen).
  pageTransition: {
    enabled: true,
    exitMs: 260,   // old page fading out
    enterMs: 420,  // new page fading in
    ease: [0.22, 1, 0.36, 1]
  },

  // ── Landing page hero (the first screen) ────────────────────
  hero: {
    enabled: true,   // text rises in one line after another when the page opens
    delayMs: 250,    // wait before the first line
    staggerMs: 90,   // gap between lines
    durationMs: 700, // each line
    rise: 18         // px each line travels
  },

  // ── Tied to scrolling (moves exactly as far as you scroll) ───
  scroll: {
    progressBar: true,       // thin line at the top of the landing page: how far down you are
    heroFadeOut: true,       // hero text fades and drifts up as you scroll away from it
    heroDrift: 70,           // px the hero text drifts up
    sectionFade: true,       // About and Contact blocks fade in as they rise into view and out as they leave
    fadeZone: 0.18,          // how much of each block's scroll path is spent fading, per edge (0.05 to 0.4)
    distance: 36,            // px a block slides while it fades
    headerFade: true,        // the header's background and line fade in as you scroll off the top
    headerFadeDistance: 80,  // px of scrolling for that
    smoothAnchors: true      // nav links like #about glide instead of jumping
  },

  // ── One-time entrance for small groups (the skill chips) ────
  reveal: {
    duration: 0.6, // seconds
    rise: 16,      // px
    stagger: 0.07, // seconds between items
    amount: 0.25   // how much must be visible before it plays (0 to 1)
  },

  // ── Panels swapping on sign-in, upload and admin pages ──────
  ui: {
    duration: 0.22 // seconds for one fade (out, then in)
  }
};

export default motionConfig;

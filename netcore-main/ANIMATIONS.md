# Animations and where to change things

All animation uses the `motion` package that was already in the project. Nothing else was added to `package.json`.

## What moves, and where

| What | Where you see it | Code |
|------|------------------|------|
| **Page change fade.** The old page fades out (0.26 s), the new one fades in (0.42 s) | every page except the loading screen | `src/motion/pageTransition.js` |
| **Hero entrance.** The hero lines rise in one after another | landing page, when it opens | `src/landing/Hero.jsx` |
| **Hero fades out with scrolling.** The hero text fades and drifts up exactly as far as you scroll | landing page | `src/landing/Hero.jsx` |
| **Blocks fade in and out with scrolling.** About text, facts, Contact text and form fade in as they rise into view and out as they leave. Scroll back up and they play backwards | landing page | `src/landing/About.jsx`, `Contact.jsx` |
| **Skill chips rise in** one by one, once | landing page, About | `src/landing/About.jsx` |
| **Scroll progress bar** (thin line at the very top) | landing page | `src/landing/Landing.jsx` |
| **Header fades in with scrolling.** Transparent at the top, background and line appear as you scroll off the top | landing page | `src/landing/Header.jsx` + `landing.css` |
| **Smooth anchor scrolling** for the About and Contact links | landing page | `src/landing/Landing.jsx` |
| **Panels fade between states** (sign in form to "verify your email", upload form to "under review", admin tabs) | auth, upload, admin pages | `Swap` in `AuthPage.jsx`, `UploadPage.jsx`, `AdminPage.jsx` |
| **Seat dots appear in a wave** | sign-in page | `src/auth/SeatGrid.jsx` |

The projects page keeps its own animations (the globe and the project panel) and also gets the page change fade.
The loading screen is unchanged; it fades out by itself and the landing page then fades in.

People who turned on "reduce motion" in their device get none of this: no page fade, no sliding, no scroll effects, no smooth scrolling.

## Change how it feels: one file

**`src/motion/motion.config.js`** holds every number, with a comment on each. The ones you will want:

- `enabled: false` turns all animation off.
- `pageTransition.exitMs`, `enterMs`: how long a page change takes. `pageTransition.enabled: false` turns just that off.
- `hero.delayMs`, `staggerMs`, `durationMs`, `rise`: the hero entrance. `hero.enabled: false` shows the hero at once.
- `scroll.fadeZone`: how much of each block's trip across the screen is spent fading (0.05 = quick, 0.4 = long and slow).
- `scroll.distance`: how far blocks slide while fading. `scroll.heroDrift`: how far the hero drifts up.
- `scroll.progressBar`, `heroFadeOut`, `sectionFade`, `headerFade`, `smoothAnchors`: each scroll effect can be switched off on its own.
- `reveal.*`: the chips. `ui.duration`: the panel fades.

## Add animation to something new

Import from `src/motion/components.jsx`:

```jsx
import { ScrollFade, Stagger, Item, Swap } from "../motion/components.jsx";

// fades in and out with scrolling (a different tag: as="section", as="ul", as="form" ...)
<ScrollFade className="my-block">...</ScrollFade>

// items that rise in one after another, once, when scrolled into view
<Stagger as="ul" className="chips">
  <Item as="li">One</Item>
  <Item as="li">Two</Item>
</Stagger>

// old content fades out and new content fades in when `id` changes
<Swap id={screenName}>{content}</Swap>
```

## A new page

1. Copy an existing `src/<page>/entry.jsx`.
2. Call `initPageTransitions()` before rendering and wrap the page in `<MotionRoot>`. Then links to and from the page fade automatically.
3. Add the `.html` file to `build.rollupOptions.input` in `vite.config.js` (as before).

Links are faded automatically. These are left alone: links to other websites, `mailto:`, `target="_blank"`, `download`, links that only change the `#hash` on the same page, and Ctrl/Cmd/Shift-clicks. Add `data-no-transition` to a link to skip the fade on it. To go to another page from code, use `leaveTo("page.html")` from `src/motion/pageTransition.js` instead of `window.location.assign`.

## Where to change the sample content

| What | File |
|------|------|
| **Landing page text:** name, headline, tagline, hero details, About text and facts, skills, Contact text, email, social links, footer. Everything marked `SAMPLE` | `src/landing/site.config.js` |
| **Name and links in the header on the sign-in, upload and admin pages** | `src/config.js` (`BRAND`, `NAV`) |
| **Browser tab titles** ("... \| Dr. Anita Sharma") | the `<title>` line in `landing.html`, `projects.html`, `auth.html`, `upload.html`, `admin.html` |
| **Where the contact form sends messages** | `src/landing/site.config.js` > `contact.formEndpoint` (empty = opens the visitor's email app) |
| **Colors and fonts:** landing page / sign-in and upload / admin | `src/landing/landing.css` (top `:root`) / `src/shared/ui.css` / `src/admin/admin.css` |
| **Loading screen** look, text and timing | `src/netcore.config.js` |
| **Allowed emails, 80 seats, file size limits (1 MB cover, 5 MB file), categories, upload rules** | `src/config.js` (the matching server rules are in `firestore.rules` and `storage.rules`) |
| **Firebase project** | `src/firebase.js`, or copy `.env.example` to `.env` |
| **Animations** | `src/motion/motion.config.js` |

Not sample data any more: the **projects on the gallery** come from Firestore (`submissions`, approved in the admin panel).
Only for previews: `src/sampleData.js` (three fake loading tasks) is used by `preview.jsx`, `preview2.jsx` and `vite.single.config.js`, not by the real site. Delete those files together if you don't need the previews.

## Notes

- Tested in Chromium (desktop and phone size): page fade in and out, Back button, hash links, reduced motion, and the scroll values. Not yet tried in Safari or Firefox. The page fade is plain opacity through the `motion` package, so it should behave the same there.
- The page fade changes only the opacity of the page's root, so the globe and the sticky header are not affected.
- If a page ever looks blank after a click, the page puts itself back after a few seconds. Set `pageTransition.enabled: false` to turn the fade off.

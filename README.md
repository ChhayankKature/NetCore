# NetCore Site

A student project showcase. Students sign in with their college email and upload one project. An admin reviews it. Approved projects appear on an interactive 3D globe that anyone can explore, with no account needed.

Built with **React, Vite and Firebase**. One Vite project, one Firebase project, several pages.

<!--
Add screenshots here once you have them, for example:
![Landing page](docs/screenshots/landing.png)
![Project globe](docs/screenshots/projects.png)
-->

## Features

- **Public gallery.** Approved projects are nodes on a 3D globe, grouped by category. Click one to see the cover, team and an **Open project** button. No sign-in needed.
- **College-only uploads.** Only verified `@rbunagpur.in` and `@rknec.edu` emails can sign up and upload.
- **One upload per email.** A person who has used their upload can ask an admin for another, one request at a time.
- **Review queue.** Uploads go to an admin first. Approved projects are published. If one is declined, the person's upload comes back, with the admin's reason.
- **Admin panel.** Review projects, handle upload requests, grant uploads, block people, and export contacts.
- **80 people at a time.** Only 80 people can be signed in at once, shown as a live grid of seats.
- **Upload rules.** Cover image in WebP up to 1 MB, project file up to 5 MB, title of letters only (up to 25), a team of 1 to 6 people, and a file or link that depends on the category.
- **Motion.** Page-change fades, scroll-linked animations and an animated loading screen. All of it respects "reduce motion" settings.
- **Light and dark themes.**

## Pages

| Page | File | Who can use it |
|------|------|----------------|
| Loading screen | `index.html` | Everyone. Follows real loading, then opens the landing page |
| Landing | `landing.html` | Everyone |
| Projects (globe) | `projects.html` | Everyone. Reads approved projects from Firestore |
| Sign in / create account | `auth.html` | Everyone |
| Upload a project | `upload.html` | Signed-in college users and admins. Guests see a sign-in prompt |
| Admin panel | `admin.html` | Accounts with an `admins/{uid}` document in Firestore |

`globe.html` and `loading.html` are standalone demos of the globe and the loading text.

## Tech stack

- **React 19** and **Vite**, as a multi-page app
- **Firebase**: Authentication (email and password), Firestore, Storage, and security rules
- **three.js** for the globe, **motion** for animation
- Fonts: Michroma and IBM Plex (bundled, no external requests)

## Getting started

You need **Node.js 20.19 or newer** and a Firebase project.

```bash
git clone <your-repo-url>
cd <your-repo-folder>
npm install
npm run dev
```

Open the address Vite prints. It starts on the loading screen.

### Scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Starts the dev server |
| `npm run build` | Builds every page into `dist/` |
| `npm run preview` | Serves the built site locally |
| `npm test` | Runs the form validation tests |

## Configuration

The Firebase web config is in `src/firebase.js`. To use a different Firebase project, copy `.env.example` to `.env` and fill in the values:

| Variable | Where to find it |
|----------|------------------|
| `VITE_FIREBASE_API_KEY` | Firebase console > Project settings > Your apps |
| `VITE_FIREBASE_AUTH_DOMAIN` | same |
| `VITE_FIREBASE_PROJECT_ID` | same |
| `VITE_FIREBASE_STORAGE_BUCKET` | same |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | same |
| `VITE_FIREBASE_APP_ID` | same |

Firebase web config values identify your project. They are not secrets, and the security rules are what protect your data. Still, don't commit `.env` (it is already in `.gitignore`).

If the app says "API key not valid", copy the key again from the Firebase console.

## Firebase setup (one time)

1. **Authentication.** Turn on the **Email/Password** sign-in method. Under Settings > Authorized domains, add the domain your site runs on (including your Vercel domain if you deploy there).
2. **Firestore.** Create a database.
3. **Storage.** Click Get started. New Firebase projects need the **Blaze (pay-as-you-go) plan** for Storage. It has a free monthly allowance.
4. **Deploy the security rules.** They are what actually enforce the limits. In the Firebase console, paste the contents of `firestore.rules` into Firestore > Rules and `storage.rules` into Storage > Rules, then press Publish. Or use the command line:
   ```bash
   npx firebase-tools login
   npx firebase-tools deploy --only firestore:rules,storage
   ```
5. **Create the first admin.** In Authentication > Users, add or find an account and copy its user ID. In Firestore, add a document `admins/<that user ID>` with any field, for example `{ ok: true }`. Nobody can make themselves an admin from the website.
6. **Optional: restrict the API key** to your website in Google Cloud Console > APIs & Services > Credentials.

## How it works

1. A signed-in person uploads on `upload.html`. It is saved as `submissionRequests/{uid}_{n}` with `status: "pending"`.
2. An admin opens `admin.html` and approves or declines it.
   - **Approve:** the project is copied to `submissions/{uid}_{n}`, the public collection the globe reads.
   - **Decline:** the queue entry is removed, the person's upload count goes back (for example from 1 of 1 to 0 of 1), and they see the reason.
3. `projects.html` shows approved projects to everyone.

Only an admin can write to `submissions`, so nothing reaches the gallery without review.

### Rules the server enforces

These are enforced in `firestore.rules` and `storage.rules`, not only in the pages:

| Rule | How |
|------|-----|
| Only `@rbunagpur.in` and `@rknec.edu` | Verified email on those domains, no `+` aliases |
| One upload per email | `users/{uid}` counts uploads. Only an admin can raise the limit or give an upload back |
| One upload request at a time | `uploadRequests/{uid}` can only go back to pending after it was accepted or denied |
| 80 people signed in at once | 80 numbered seats that expire if not refreshed. Uploading needs a live seat |
| File sizes | Cover image 1 MB, project file 5 MB, only the allowed types |
| Blocked people | A document at `blocked/{uid}` stops all writes |

Team member emails are stored in a private record that only the uploader and admins can read. The public project shows names only.

## Project structure

```
index.html, landing.html, projects.html,
auth.html, upload.html, admin.html   Page entry points
src/
  landing/        Landing page (text lives in site.config.js)
  projects/       The globe gallery
  data/           Reads projects from Firestore
  auth/           Sign in, sign up, seat grid
  upload/         Upload form and "upload another" requests
  admin/          Admin panel
  shared/         Shared header, styles, sign-in session hook
  motion/         Animation settings and components
  firebase.js     Firebase setup
  config.js       Domains, seats, size limits, categories
  api.js, session.js, validation.js, errors.js
firestore.rules   Database security rules
storage.rules     File storage security rules
functions/        Optional Cloud Function (blocks other email domains from creating accounts)
tests/            Validation tests
scripts/          One-off helper (generates the globe's land points)
```

## Customising

| What | Where |
|------|-------|
| Landing page text, name, contact details | `src/landing/site.config.js` |
| Header name and links on the sign-in, upload and admin pages | `src/config.js` |
| Allowed emails, seats, size limits, categories | `src/config.js` (and the matching rules in `firestore.rules` and `storage.rules`) |
| Animation timing and on/off switches | `src/motion/motion.config.js` |
| Loading screen look and timing | `src/netcore.config.js` |
| Colors and fonts | `src/landing/landing.css`, `src/shared/ui.css`, `src/admin/admin.css` |

If you change a limit that appears in the rules, change the rules too and publish them again. More detail is in [`ANIMATIONS.md`](ANIMATIONS.md).

## Deployment

The site is static. On **Vercel** (or any static host):

- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: the `VITE_FIREBASE_*` values above, if you use them
- Add your site's domain to Firebase Authentication > Settings > Authorized domains

Publish the Firebase rules separately (see Firebase setup).

## Documentation

- [`ANIMATIONS.md`](ANIMATIONS.md): how the animations work and where to change the sample content
- [`changes.md`](changes.md): log of changes, newest first
- [`decision.md`](decision.md): why things were built the way they were

## Known limits

- The security rules were not run against the Firebase emulator. After deploying, test them: a Gmail address must be refused, and a normal user must not be able to write to `submissions`.
- Firebase cannot refuse a sign-in itself, so the 80-person limit is enforced by seats. An 81st person can sign in at Firebase's level, but gets no seat and cannot upload.
- Pages were checked in Chromium (desktop and phone size). Safari and Firefox have not been tried.
- The globe shows the newest 120 projects to stay smooth.
- Titles are letters only (no spaces), so the gallery shows `MyProject` as "My Project".

## License

No license has been chosen yet. Add a `LICENSE` file before making the repository public.

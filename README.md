# Whybook

> **Learn to build it yourself:** [`course/`](course/README.md) is a self-paced course in the style of Full Stack Open (TypeScript, React, Node.js): parts with lessons, tested exercises and a checklist. When you finish the last exercise, you have built Whybook.

A todo list that remembers what you learned. Built for iPad (installable from Safari) and computer.

- **Simple tasks** you just tick off.
- **Complex tasks** end with a short write-up: the **result** (what happened, what you found out) and your **decision** (what you chose, and why), filed under a **web development category**.
- **Decisions** shows everything you've decided. Filter by group (Frontend, Backend, Workflow), by category (HTML, CSS, Layout, Accessibility, React, State management, Performance, Testing, PWA, Node.js, APIs, Deployment…) or by text, and export it all as Markdown.
- **Animated rooms**: Coffee shop, Cozy room, Library, Rainy window, Night city, or Plain. Pick one in the header or in Settings; animations stop when Reduce Motion is on.
- **Your tasks on the wall**: in a room, a board shows today's counts and your next tasks. Tap it to open the app, or tap **+** to add a task without leaving the room.
- **A room that reflects your day**: the light follows the clock, cups empty as you finish today's tasks, and plants droop when something is overdue.
- **My room**: build your own background in Settings.
  - Choose each part: wall, floor, window, view, furniture, shelves, light, plant, drink and board.
  - Use your own colour for the wall, floor and furniture.
  - **Move and resize things**: drag them in the room, or use the arrow and size buttons.
  - **Your pictures**: add a photo as a poster, as the view from the window, or as the whole background, or draw a poster with your finger or Apple Pencil.
  - **A collection to earn**: eight extra items open as you record decisions (the first after 1 decision, the last after 50).
- **Earlier decisions come back**: when you record a result, decisions on the same topic appear next to the form.
- **Folders and stickers**: the Decisions page is a shelf of illustrated folders, one per category. Open one to see its decisions as paper notes, each with the sticker you picked (insight, proud, shipped, gotcha, loved it, tricky, confirmed, revisit later).
- A weekly summary on the task list: to do, overdue, done today and this week, decisions this week, and the topic you decided about most.

No build step and no server of its own: a static web app with optional sync through your own Firebase project.

The same app is built step by step, in TypeScript, React and Node.js, in the course in [`course/`](course/README.md).

## Run it locally
From the repository root:
```
python3 -m http.server 8000
```
Open http://localhost:8000/

## Put it on your iPad
1. Host the repository on GitHub Pages: **Settings → Pages**, branch `main`, root folder. The app is then at `https://<user>.github.io/<repo>/`.
2. Open that address in Safari on the iPad and tap **Share → Add to Home Screen**.
3. Open Whybook from the home screen and create your account. **Settings → Add example tasks** shows what a filled-in decision log looks like.

## Sign-in and where your data lives
- **Without sync (default)**: everything is saved on the device in IndexedDB. Your password locks the app on that device. It is stored only as a salted PBKDF2 hash and it cannot be recovered. It does not encrypt the data. Use **Settings → Backup** to download a copy regularly.
- **With sync**: you sign in with an account in your own Firebase project, and the same data appears on your iPad and your computer. Sync works on the free Spark plan.

### Set up sync (about 10 minutes, once)
1. Go to https://console.firebase.google.com and **Add project** (Google Analytics is not needed).
2. **Build → Authentication → Get started → Email/Password → Enable → Save.**
3. **Authentication → Settings → Authorized domains → Add domain**: your GitHub Pages domain, for example `oanh-hth.github.io`.
4. **Build → Firestore Database → Create database**, production mode, pick a location near you.
5. **Firestore → Rules**, replace everything with the rules below and **Publish**:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{uid}/{document=**} {
         allow read, write: if request.auth != null && request.auth.uid == uid;
       }
     }
   }
   ```
6. **Project settings (gear) → General → Your apps → Web (`</>`)**, register an app called Whybook (no Hosting needed) and copy the `firebaseConfig` block.
7. In Whybook: **Settings → Sync → paste the config → Connect sync**, then **Create account**. On your second device, paste the same config and **Sign in**.
8. Optional but recommended: once your account exists, **Authentication → Settings → User actions → untick "Enable create (sign-up)"** so nobody else can create an account in your project.

The Firebase web config identifies your project; it is not a password. Access is protected by the rules above. The config is kept in the browser only and is never committed to this repository.

When you connect a device that already has data and the account also has data, Whybook asks which copy to keep. After that, the newest save wins. If you edit on both devices while one is offline, the device that saves last wins for the whole state, so let a device sync before switching.

Limits: one sync document holds all text data (up to about 1 MB, which is thousands of tasks and notes).

## Categories
The list is in `js/categories.js`: 21 frontend topics, 6 backend and 7 workflow. Tasks store the category **id**, so you can rename a category without breaking saved decisions. Add your own topics whenever something is missing.

## Data from the earlier version
If this device used the earlier Whybook (with notes, sketches and the garden), its tasks are kept and become simple tasks. The other data is no longer shown. Download a backup first if you want to keep it.

## Files
| File | What it does |
|---|---|
| `index.html`, `styles.css` | Page shell and styles |
| `js/app.js` | Pages (Tasks, Decisions, Settings), the outcome form, sign-in screens, sync wiring |
| `js/logic.js` | The rules: tasks, outcomes, decisions, filters, weekly summary, Markdown export |
| `js/categories.js` | The decision categories |
| `js/art.js` | The illustrations: background scenes, stickers and the folder drawing (plain SVG) |
| `js/store.js`, `js/db.js` | Saving on the device (IndexedDB) |
| `js/auth.js` | Local account (PBKDF2 password hash, 30-day session) |
| `js/cloud.js` | Optional Firebase sync (loaded only when configured) |
| `sw.js`, `manifest.webmanifest`, `icons/` | Offline support and home-screen install |

When you change a file, bump `CACHE` in `sw.js` so installed copies pick up the update.

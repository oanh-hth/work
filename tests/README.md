# Smoke test for the app

`smoke.mjs` opens the app at the top of this repository in a real browser (Chromium, through Playwright) and goes through what a person does: sign up, add a task, record a decision, build a room, reload. It fails when something is broken **or can't be seen**, which ordinary "is the element in the page" checks miss.

## Run it

```
cd tests
npm run setup    # once: installs Playwright and its browser
npm test
```

Run it before every push that changes the app. It takes about half a minute and prints one line per check. On a failure it saves a screenshot next to this file (`failure-….png`).

## What it checks

- The release is consistent: `VERSION` in `js/app.js` matches `CACHE` in `sw.js`, every file the service worker caches exists, and `.nojekyll` is there (without it GitHub Pages fails to build).
- First visit: the sign-up card is **on top** (not hidden behind the room) and shows the version.
- After signing up: the board is on the wall and on top; **+** adds a task without leaving the room.
- The panel opens from the board; the "What do you need to do?" box is on top; a task can be added and ticked off.
- A complex task can be recorded as a decision, appears under Decisions, and opens the first collection item.
- **Edit room** opens the builder; a choice and a colour change the room; arranging moves things; *Done* returns.
- After a reload everything is still there, and the page never scrolls sideways.
- On a phone-sized screen the header's buttons can be reached and the board sits below the header.
- No JavaScript errors anywhere along the way.

"On top" means: the element painted on top at that spot is the element itself. The app once shipped with its sign-in screen drawn underneath the background, and every test that only looked for the element passed. Even `document.elementFromPoint` was fooled, because the background lets touches through and that function skips such elements; the test switches that off while it looks.

The test has been checked against the bugs it exists for: with the sign-in screen put back under the background, with the start-up crash put back, and with the two version numbers out of step, it fails each time.

It tests Chromium only. Safari on the iPad still needs a look by hand.

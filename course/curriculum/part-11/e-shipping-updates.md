# Part 11e: Shipping updates

*[Part 11: Make it yours](README.md) · section e*

The app is finished. Tomorrow you'll change it. This last section is about the gap between "I pushed it" and "it's on my iPad", told through two failures that happened while this very app was being built.

## Failure one: the deploy that didn't

For a day and a half, seven pushes in a row, the live site showed an old version. The code was right, the tests passed, and the hosting service (GitHub Pages) had quietly failed every build.

The likely cause: by default GitHub Pages runs every Markdown file through Jekyll, a site generator whose template language uses `{{ … }}`. The builds started failing with the push that added this course, whose lessons are full of JSX like `style={{ "--tilt": … }}`, which Jekyll would try to evaluate. One empty file named `.nojekyll` at the top of the repository says "serve these files as they are", and with it the builds went green.

The technical cause matters less than the lesson: **a push is not a deploy.** After you ship, check that it shipped: look at the build's status, then open the live site and look for something you just changed. Which leads to the next idea.

## A version you can see

"Is my iPad running the new version?" should be answerable by looking. So the app has a number (`VERSION` in `version.ts`) shown in Settings. Raise it with every release. When something looks wrong, the first question is no longer "have you tried reloading" but "which version does it say".

## How a service worker updates

The service worker from 7d makes the app work offline by keeping copies of its files. That's also what can keep an old version alive. Its life cycle:

1. The browser fetches `sw.js` when you open the app. If the file differs by even one byte from the one it has, a **new** worker is installed. That's why `sw.ts` has a `CACHE` name with a number: changing it changes the file.
2. The new worker waits until every tab using the old one is closed. `self.skipWaiting()` skips the wait, and `clients.claim()` makes it take over open pages at once.
3. The page that was already open still runs the old JavaScript it loaded earlier.

Three small things in `version.ts` (given) close the remaining gaps:

- `register(url, { updateViaCache: "none" })`: never let the browser's HTTP cache hand back an old `sw.js`;
- `registration.update()`: check now, not whenever the browser gets round to it;
- on `controllerchange`, reload once, **only if the page already had a worker**. Without that condition the very first visit would reload for no reason.

And for when all else fails, *Check for updates*: unregister the worker, delete its caches, reload. It deletes saved copies of the app's **files**, never your data, which lives elsewhere (localStorage and the server).

## Failure two: the screen that was there but invisible

Early on, the sign-in screen was drawn *underneath* the room's background. The automated tests filled in the form and clicked the button, successfully, because the background let clicks through. Everything was green, and a person saw only a coffee shop.

A test that finds an element in the page proves it exists. It doesn't prove anyone can see it. For the things that matter (can I sign in, can I add a task) check what is **on top** at that spot, or look at a screenshot. `document.elementFromPoint(x, y)` answers "what would a finger hit here".

## A button that waits

`VersionInfo` shows the version and the *Check for updates* button. The check takes a moment, and during that moment a second tap must not start a second check. The pattern is the one from the sign-in form (7c):

```tsx
const [busy, setBusy] = useState(false);
const check = async () => {
  setBusy(true);
  try { await onCheck(); } catch { /* show a message */ } finally { setBusy(false); }
};
<button disabled={busy}>{busy ? "Checking…" : "Check for updates"}</button>
```

`finally` runs whether the check worked or failed, so the button can never stay stuck on "Checking…". When it fails (you're offline), say so in a `role="alert"`.

## You've finished

Every part of Whybook is now yours: the data model, the reducers, the components, the server, the sync, the drawings, the room you built, and the way it reaches your devices. The best next exercise is the one nobody wrote for you: use it for a month, notice what annoys you, and change that.

## Read more
- The service worker lifecycle (web.dev): <https://web.dev/articles/service-worker-lifecycle>
- `ServiceWorkerRegistration.update` (MDN): <https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/update>
- Bypassing Jekyll on GitHub Pages (GitHub blog): <https://github.blog/news-insights/the-library/bypassing-jekyll-on-github-pages/>
- `Document.elementFromPoint` (MDN): <https://developer.mozilla.org/en-US/docs/Web/API/Document/elementFromPoint>

---

## Exercise 11.7

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 11.7: VersionInfo

**Edit:** `app/client/src/components/VersionInfo.tsx` · **Tests:** `tests/part-11/11.7-version-info.test.tsx` · **Run:** `npm run ex 11.7`

Build `VersionInfo`: a section named "Version" with "Version 3 · 16 Nov 2026" and a *Check for updates* button that is disabled and reads "Checking…" while the check runs, and an alert when it fails. Then raise `VERSION` in `version.ts` and `CACHE` in `sw.ts`, build, and watch the new number appear after one reload.

---

[← 11d A collection to earn](d-a-collection.md) · [Back to the course overview →](../../README.md)

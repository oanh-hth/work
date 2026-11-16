// Given: which version this is, and how the app gets a newer one (11.7 and section 11e).

/** Shown in Settings, so you can tell which version a device is running. Raise it, and CACHE in sw.ts, with every release. */
export const VERSION = 1;
export const VERSION_DATE = "16 Nov 2026";

/**
 * Forget every saved copy of the app's files (never your data: that lives in localStorage and on the server),
 * then load the page again so the newest files are fetched.
 */
export async function checkForUpdates(): Promise<void> {
  if (!navigator.onLine) throw new Error("offline");
  for (const registration of await navigator.serviceWorker?.getRegistrations?.() ?? []) await registration.unregister();
  for (const key of await caches?.keys?.() ?? []) await caches.delete(key);
  location.reload();
}

/**
 * Register the service worker so that a new version is picked up without anyone doing anything:
 * - updateViaCache "none": always ask the server for sw.js itself, never an HTTP-cached copy;
 * - update(): check now, not only when the browser gets round to it;
 * - when a new worker takes control of a page that already had one, reload once to show the new version.
 */
export function registerServiceWorker(url: string): void {
  if (!("serviceWorker" in navigator)) return;
  const hadOne = !!navigator.serviceWorker.controller;
  let reloaded = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => { if (hadOne && !reloaded) { reloaded = true; location.reload(); } });
  navigator.serviceWorker.register(url, { updateViaCache: "none" }).then(r => r.update()).catch(() => { /* not available (for example in a private window) */ });
}

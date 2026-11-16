// Smoke test for the Whybook app: see README.md. Run with `npm test` from this folder.
import { chromium } from "playwright";
import http from "node:http";
import { readFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".webmanifest": "application/manifest+json", ".json": "application/json" };

/** Serves the repository's top folder, the way GitHub Pages does. */
function serve() {
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, "http://x");
    const file = path.join(ROOT, decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname));
    if (!file.startsWith(ROOT)) { res.writeHead(403).end(); return; }
    try { const body = await readFile(file); res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] ?? "application/octet-stream" }).end(body); }
    catch { res.writeHead(404).end("Not found"); }
  });
  return new Promise(resolve => server.listen(0, "127.0.0.1", () => resolve({ server, url: `http://127.0.0.1:${server.address().port}/` })));
}

let passed = 0, failed = 0, page;
async function check(name, fn) {
  try { await fn(); passed++; console.log(`  ✓ ${name}`); }
  catch (e) {
    failed++; console.log(`  ✗ ${name}\n      ${String(e.message).split("\n")[0]}`);
    try { await page?.screenshot({ path: path.join(ROOT, "tests", `failure-${failed}.png`) }); } catch { /* no page yet */ }
  }
}
const expect = (ok, message) => { if (!ok) throw new Error(message); };
/**
 * Is this element the thing painted on top at its middle? Being in the page isn't enough: it must not be covered.
 * elementFromPoint skips anything with "pointer-events: none", and the room's background has exactly that, so a form
 * painted UNDER the background would still be reported as hit. For the length of the check, every element takes
 * pointer events, so the answer is about what you can see, not about what a click would reach.
 */
const onTop = sel => page.$eval(sel, el => {
  const all = document.createElement("style");
  all.textContent = "*{pointer-events:auto!important}";
  document.head.append(all);
  const r = el.getBoundingClientRect(), hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  all.remove();
  return !!hit && (el === hit || el.contains(hit));
});
const seeTop = async (sel, what) => {
  await page.locator(sel).first().scrollIntoViewIfNeeded();   // further down the page is fine; covered is not
  expect(await onTop(sel), `${what} is covered by something or off screen (${sel})`);
};
const settle = (ms = 400) => page.waitForTimeout(ms);

/* ------------------------------------------------------------------ the release itself */
console.log("Release");
const app = await readFile(path.join(ROOT, "js/app.js"), "utf8"), sw = await readFile(path.join(ROOT, "sw.js"), "utf8");
await check("VERSION in js/app.js matches CACHE in sw.js", async () => {
  const version = /const VERSION=(\d+)/.exec(app)?.[1], cache = /const CACHE = '[a-z]+-v(\d+)'/.exec(sw)?.[1];
  expect(version && cache, "couldn't find VERSION or CACHE");
  expect(version === cache, `VERSION is ${version} but CACHE is v${cache}: raise both together`);
});
await check("every file the service worker caches exists", async () => {
  const list = /const FILES = \[([^\]]+)\]/s.exec(sw)?.[1].match(/'([^']+)'/g).map(s => s.slice(1, -1)) ?? [];
  expect(list.length > 5, "couldn't read FILES from sw.js");
  for (const f of list) if (f !== "./") await access(path.join(ROOT, f)).catch(() => { throw new Error(`sw.js caches "${f}", which doesn't exist: the app would never update`); });
});
await check(".nojekyll is present", () => access(path.join(ROOT, ".nojekyll")).catch(() => { throw new Error("without .nojekyll, GitHub Pages fails to build this repository"); }));

/* ------------------------------------------------------------------ the app in a browser */
const { server, url } = await serve();
const browser = await chromium.launch();
const errors = [];
async function open(viewport) {
  const context = await browser.newContext({ viewport, serviceWorkers: "block" });   // test the files as they are now, not a cached copy
  page = await context.newPage();
  page.setDefaultTimeout(5000);   // a broken app should fail in seconds, not minutes
  page.on("pageerror", e => errors.push(e.message));
  await page.goto(url); await settle(900);
  return context;
}
async function signUp() {
  await page.fill("#a-name", "Test"); await page.fill("#a-email", "test@example.com");
  await page.fill("#a-pass", "a-long-test-password"); await page.fill("#a-pass2", "a-long-test-password");
  await page.locator("#login form button[type=submit]").first().click(); await settle(1300);
}

console.log("First visit (tablet size)");
const tablet = await open({ width: 1024, height: 1366 });
await check("the sign-up card is on top and shows the version", async () => {
  await seeTop("#a-name", "The sign-up form");
  expect(/Version \d+/.test(await page.textContent("#version")), "no version on the sign-in card");
});
await check("signing up shows the room with the board on top", async () => {
  await signUp();
  expect(await page.isVisible("#app"), "the app didn't open");
  await seeTop("#board", "The board"); await seeTop("#board-add", "The + on the board");
});
await check("+ adds a task without leaving the room", async () => {
  await page.click("#board-add"); await settle(200);
  await seeTop("#board-input", "The quick-add box");
  await page.fill("#board-input", "Water the plants"); await page.keyboard.press("Enter"); await settle();
  await page.fill("#board-input", "Pick a date library"); await page.check("#board-complex"); await page.keyboard.press("Enter"); await settle();
  await page.keyboard.press("Escape");
  const notes = await page.$$eval(".b-note", a => a.map(x => x.textContent));
  expect(notes.some(n => n.includes("Water the plants")) && notes.some(n => n.includes("Pick a date library")), `the board shows ${JSON.stringify(notes)}`);
  expect(await page.isVisible("#board"), "the room was left");
});
await check("the board opens the panel, with the task box on top", async () => {
  await page.click("#board"); await settle(600);
  await seeTop("#capture", '"What do you need to do?"');
  await page.fill("#capture", "Reply to an email"); await page.keyboard.press("Enter"); await settle();
  expect(await page.locator("#view >> text=Reply to an email").count() > 0, "the task wasn't added");
});
await check("a simple task can be ticked off", async () => {
  await page.locator('input.tick[aria-label="Done: Reply to an email"]').click(); await settle();   // click, not check(): the box is gone once ticked
  expect(await page.locator('[data-status="done"] >> text=Reply to an email').count() > 0, "the task isn't under Done");
});
await check("a complex task is recorded as a decision and opens the first collection item", async () => {
  await page.locator('[data-act=record]').first().click(); await settle();
  await seeTop("#o-result", "The result box");
  await page.fill("#o-result", "Compared two libraries"); await page.fill("#o-decision", "Use the platform's Intl API");
  await page.selectOption("#o-category", { index: 3 });
  await page.click("#outcome-form button[type=submit]"); await settle();
  expect((await page.textContent("#toast")).includes("New for your room"), "no message about a new item");
  await page.click('.tabs a[href="#decisions"]'); await settle();
  expect(await page.locator("#view .folder").count() === 1, "the decision didn't get a folder on the Decisions page");
  await page.locator("#view .folder").first().click(); await settle();
  expect(await page.locator("#view >> text=Pick a date library").count() > 0, "the decision isn't inside its folder");
});
await check("Edit room opens the builder, and choices change the room", async () => {
  await seeTop(".edit-room", "The Edit room button");
  await page.click(".edit-room"); await settle(700);
  expect(await page.isVisible("#room-builder"), "the builder didn't open");
  await page.click('.chip[data-slot=wall][data-id=midnight]'); await settle();
  expect(await page.$eval("#backdrop svg.sc-room > rect", e => e.getAttribute("fill")) === "#3A3150", "the wall didn't change");
  expect(await page.locator('.chip[data-slot=plant][data-id=bonsai]').count() === 1, "the bonsai didn't open after one decision");
  await page.$eval("input[data-color=wall]", e => { e.value = "#ffcc00"; e.dispatchEvent(new Event("change", { bubbles: true })); }); await settle();
  expect(await page.$eval("#backdrop svg.sc-room > rect", e => e.getAttribute("fill")) === "#ffcc00", "your own colour wasn't used");
});
await check("arranging: the controls are on top, things move, Done returns", async () => {
  await page.click("[data-act=arrange]"); await settle(3600);   // wait out any message, which would cover the controls
  await seeTop("[data-act=arrange-done]", "The Done button");
  await page.selectOption("#arrange-part", "plant");
  const before = await page.getAttribute('#backdrop [data-part=plant]', "transform");
  await page.click('[data-act=nudge][data-dx="20"]'); await settle(200);
  expect(await page.getAttribute('#backdrop [data-part=plant]', "transform") !== before, "the plant didn't move with the arrow button");
  const box = await page.locator('#backdrop [data-part=plant]').boundingBox(), x = box.x + box.width / 2, y = box.y + box.height * 0.3;
  await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x + 40, y - 40, { steps: 5 }); await page.mouse.up(); await settle();
  const after = await page.locator('#backdrop [data-part=plant]').boundingBox();
  expect(Math.abs(after.x - box.x - 40) < 6 && Math.abs(after.y - box.y + 40) < 6, `dragging moved the plant by ${Math.round(after.x - box.x)}, ${Math.round(after.y - box.y)} instead of 40, -40`);
  await page.click("[data-act=arrange-done]"); await settle();
  expect(await page.isVisible("#room-builder") && await page.isHidden("#arrange-bar"), "Done didn't return to the builder");
});
await check("after a reload everything is still there", async () => {
  await settle(500); await page.reload(); await settle(1300);
  expect(await page.isVisible("#app"), "signed out by a reload");
  expect(await page.evaluate(() => document.documentElement.dataset.backdrop) === "custom", "the room choice was lost");
  expect(await page.$eval("#backdrop svg.sc-room > rect", e => e.getAttribute("fill")) === "#ffcc00", "your colour was lost");
  expect((await page.$$eval(".b-note", a => a.map(x => x.textContent))).some(n => n.includes("Water the plants")), "a task was lost");
});
await check("the page never scrolls sideways", async () => {
  for (const tab of ["tasks", "decisions", "settings"]) {
    await page.click(`.tabs a[href="#${tab}"]`); await settle();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `the ${tab} page is wider than the screen`);
  }
});
await tablet.close();

console.log("Phone size");
const phone = await open({ width: 390, height: 844 });
await check("sign-up fits and is on top", async () => { await seeTop("#a-name", "The sign-up form"); await signUp(); });
await check("the header's buttons can be reached and the board sits below the header", async () => {
  await seeTop(".edit-room", "The Edit room button"); await seeTop("#backdrop-pick", "The background menu");
  const gap = await page.evaluate(() => document.querySelector("#board").getBoundingClientRect().top - document.querySelector(".top").getBoundingClientRect().bottom);
  expect(gap >= 0, `the board overlaps the header by ${Math.round(-gap)}px`);
  const b = await page.locator("#board").boundingBox();
  expect(b.x >= 0 && b.x + b.width <= 390, "the board is partly off screen");
});
await check("the task box is on top, and nothing scrolls sideways", async () => {
  await page.click("#board"); await settle(600);
  await seeTop("#capture", '"What do you need to do?"');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), "the page is wider than the screen");
});
await phone.close();

console.log("Throughout");
await check("no JavaScript errors", async () => expect(errors.length === 0, `errors: ${[...new Set(errors)].join(" | ")}`));

await browser.close(); server.close();
console.log(failed ? `\n${failed} failed, ${passed} passed.` : `\nAll ${passed} checks passed.`);
process.exit(failed ? 1 : 0);

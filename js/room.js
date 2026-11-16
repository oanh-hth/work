// "My room": a background you put together yourself. Every slot has a few choices; a room is one choice per slot.
// Each choice draws a fragment of SVG in the same 1200 × 800 space as the ready-made scenes in art.js.
// Parts that react to your work use the same classes as those scenes (see styles.css):
//   .sky (time of day) · .drink and .steam (work left) · .leaf l / r / c (plants droop when something is overdue).

/* ---------------------------------------------------------------- helpers */
const dark = hex => { const n = parseInt(hex.slice(1), 16); return ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 < 110; };
const books = (x, y, list) => list.map(([w, h, c], i) => { const out = `<rect x="${x}" y="${y - h}" width="${w}" height="${h}" fill="${c}"/>`; x += w + 2; return out; }).join("");
const BOOK = ["#D96C4E", "#4E7FD9", "#E8C35A", "#5DA27A", "#9A6FD0", "#C9B79C"];

/* ---------------------------------------------------------------- walls and floors */
const WALLS = [
  { id: "cream", name: "Cream", color: "#E8D5BE" },
  { id: "sage", name: "Sage", color: "#C9D6C3" },
  { id: "blush", name: "Blush", color: "#EBCFC9" },
  { id: "sky", name: "Pale blue", color: "#CFE0EA" },
  { id: "midnight", name: "Midnight", color: "#3A3150" },
  { id: "slate", name: "Slate", color: "#4B5868" },
  { id: "stripes", name: "Stripes", color: "#EADBC6", extra: `<pattern id="rm-stripes" width="80" height="10" patternUnits="userSpaceOnUse"><rect width="40" height="10" fill="#DFCDB3"/></pattern><rect width="1200" height="600" fill="url(#rm-stripes)"/>` },
  { id: "brick", name: "Brick", color: "#B5654A", extra: `<pattern id="rm-brick" width="120" height="60" patternUnits="userSpaceOnUse"><path d="M0 0H120M0 30H120M0 60H120M60 0V30M0 30V60M120 30V60" stroke="#8E4A35" stroke-width="4" fill="none"/></pattern><rect width="1200" height="600" fill="url(#rm-brick)"/>` },
];
const FLOORS = [
  { id: "wood", name: "Wood", color: "#8A5A3C", edge: "#6E452E" },
  { id: "dark", name: "Dark wood", color: "#4A3628", edge: "#33241A" },
  { id: "carpet", name: "Carpet", color: "#8C8FA3", edge: "#70738A" },
  { id: "rug", name: "Wood and a rug", color: "#8A5A3C", edge: "#6E452E", extra: `<ellipse cx="430" cy="716" rx="380" ry="52" fill="#B5564A" opacity=".85"/><ellipse cx="430" cy="716" rx="300" ry="36" fill="none" stroke="#F2E0C0" stroke-width="4" opacity=".7"/>` },
];

/* ---------------------------------------------------------------- windows and views */
// Each window: its box (for the view), the glass outline, and the frame drawn on top.
const WINDOWS = [
  { id: "square", name: "Square", box: [110, 120, 340, 320],
    glass: `<rect x="110" y="120" width="340" height="320" rx="10"/>`,
    frame: c => `<rect x="110" y="120" width="340" height="320" rx="10" fill="none" stroke="${c}" stroke-width="14"/><path d="M280 120V440M110 280H450" stroke="${c}" stroke-width="10"/>` },
  { id: "arched", name: "Arched", box: [110, 100, 340, 340],
    glass: `<path d="M110 440V260A170 160 0 0 1 450 260V440Z"/>`,
    frame: c => `<path d="M110 440V260A170 160 0 0 1 450 260V440Z" fill="none" stroke="${c}" stroke-width="14"/><path d="M280 100V440M110 290H450" stroke="${c}" stroke-width="10"/>` },
  { id: "wide", name: "Wide", box: [90, 150, 440, 240],
    glass: `<rect x="90" y="150" width="440" height="240" rx="8"/>`,
    frame: c => `<rect x="90" y="150" width="440" height="240" rx="8" fill="none" stroke="${c}" stroke-width="14"/><path d="M237 150V390M383 150V390" stroke="${c}" stroke-width="10"/>` },
  { id: "round", name: "Round", box: [130, 110, 320, 320],
    glass: `<circle cx="290" cy="270" r="160"/>`,
    frame: c => `<circle cx="290" cy="270" r="160" fill="none" stroke="${c}" stroke-width="14"/><path d="M290 110V430M130 270H450" stroke="${c}" stroke-width="10"/>` },
  { id: "none", name: "No window", box: null, glass: "", frame: () => "" },
];
// Each view fills the window's box [x, y, w, h].
const VIEWS = [
  { id: "sky", name: "Sky", draw: ([x, y, w, h]) => `<rect class="sky" x="${x}" y="${y}" width="${w}" height="${h}" fill="#9CC7E0"/>
<g class="cloud"><ellipse cx="${x + 60}" cy="${y + 80}" rx="60" ry="22" fill="#fff" opacity=".9"/><ellipse cx="${x + 100}" cy="${y + 66}" rx="40" ry="20" fill="#fff" opacity=".9"/></g>
<g class="cloud b"><ellipse cx="${x + 20}" cy="${y + 170}" rx="50" ry="18" fill="#fff" opacity=".8"/></g>` },
  { id: "garden", name: "Garden", draw: ([x, y, w, h]) => `<rect class="sky" x="${x}" y="${y}" width="${w}" height="${h}" fill="#9CC7E0"/>
<g class="cloud"><ellipse cx="${x + 70}" cy="${y + 60}" rx="50" ry="18" fill="#fff" opacity=".9"/></g>
<ellipse cx="${x + w * .3}" cy="${y + h}" rx="${w * .5}" ry="${h * .34}" fill="#8FC27E"/><ellipse cx="${x + w * .8}" cy="${y + h}" rx="${w * .45}" ry="${h * .26}" fill="#79B36A"/>
<rect x="${x + w * .7 - 6}" y="${y + h * .52}" width="12" height="${h * .3}" fill="#6E452E"/><circle cx="${x + w * .7}" cy="${y + h * .46}" r="${h * .15}" fill="#4E8A5E"/>` },
  { id: "city", name: "City", draw: ([x, y, w, h]) => `<rect class="sky" x="${x}" y="${y}" width="${w}" height="${h}" fill="#9CC7E0"/>
${[[.04, .5, .16], [.22, .68, .2], [.44, .42, .14], [.6, .6, .18], [.8, .36, .16]].map(([px, ph, pw], i) => `<rect x="${x + w * px}" y="${y + h * (1 - ph)}" width="${w * pw}" height="${h * ph}" fill="${i % 2 ? "#B97C58" : "#C98F6B"}"/>`).join("")}
<g fill="#FFE2A0" opacity=".8">${Array.from({ length: 10 }, (_, i) => `<rect x="${x + w * (.08 + ((i * .19) % .84))}" y="${y + h * (.5 + ((i * .13) % .4))}" width="8" height="10"/>`).join("")}</g>` },
  { id: "sea", name: "Sea", draw: ([x, y, w, h]) => `<rect class="sky" x="${x}" y="${y}" width="${w}" height="${h}" fill="#9CC7E0"/>
<circle cx="${x + w * .72}" cy="${y + h * .3}" r="${h * .1}" fill="#FFE9A8"/>
<rect x="${x}" y="${y + h * .58}" width="${w}" height="${h * .42}" fill="#3E86B8"/>
<g class="wave" stroke="#CFE8F5" stroke-width="3" stroke-linecap="round" fill="none" opacity=".8">${[.68, .78, .9].map((p, i) => `<path d="M${x + 20 + i * 30} ${y + h * p}q20 -8 40 0t40 0t40 0"/>`).join("")}</g>
<path d="M${x + w * .2} ${y + h * .58}l14 -34l14 34Z" fill="#fff"/>` },
  { id: "night", name: "Night sky", draw: ([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#18203F"/>
<circle cx="${x + w * .74}" cy="${y + h * .28}" r="32" fill="#F4EBC8"/><circle cx="${x + w * .74 + 14}" cy="${y + h * .28 - 10}" r="28" fill="#18203F"/>
<g fill="#fff">${Array.from({ length: 12 }, (_, i) => `<circle class="star" cx="${x + 20 + ((i * 97) % (w - 40))}" cy="${y + 20 + ((i * 61) % (h - 40))}" r="${2 + (i % 2)}"/>`).join("")}</g>` },
];

/* ---------------------------------------------------------------- furniture */
const SEATS = [
  { id: "sofa", name: "Sofa", svg: `<g transform="translate(130 470)"><rect y="40" width="340" height="140" rx="40" fill="#8E5C7E"/><rect x="20" width="300" height="110" rx="40" fill="#A86F95"/><rect x="-20" y="60" width="70" height="120" rx="30" fill="#8E5C7E"/><rect x="290" y="60" width="70" height="120" rx="30" fill="#8E5C7E"/><rect x="120" y="50" width="90" height="60" rx="14" fill="#F2C38B" transform="rotate(-8 165 80)"/></g>` },
  { id: "armchair", name: "Armchair", svg: `<g transform="translate(200 470)"><rect x="10" width="200" height="130" rx="36" fill="#D9A441"/><rect y="70" width="220" height="110" rx="30" fill="#C48F2E"/><rect x="-16" y="60" width="56" height="120" rx="26" fill="#C48F2E"/><rect x="180" y="60" width="56" height="120" rx="26" fill="#C48F2E"/><rect x="14" y="176" width="12" height="18" fill="#5A4636"/><rect x="194" y="176" width="12" height="18" fill="#5A4636"/></g>` },
  { id: "desk", name: "Desk", svg: `<g transform="translate(110 540)"><rect width="380" height="22" rx="4" fill="#6E452E"/><rect x="18" y="22" width="16" height="120" fill="#5A3A2A"/><rect x="346" y="22" width="16" height="120" fill="#5A3A2A"/><rect x="250" y="22" width="96" height="70" fill="#5A3A2A"/><circle cx="298" cy="57" r="5" fill="#C7A97F"/>
<rect x="110" y="-82" width="140" height="80" rx="6" fill="#2A2A33"/><rect class="screen" x="118" y="-74" width="124" height="64" rx="3" fill="#8FD0FF"/><rect x="90" y="-4" width="180" height="6" rx="3" fill="#B8BEC4"/>
<rect x="40" y="-26" width="46" height="26" rx="3" fill="#F2E8D6"/><rect x="36" y="-34" width="46" height="10" rx="3" fill="#D96C4E"/></g>` },
  { id: "none", name: "Nothing", svg: "" },
];
const SHELVES = [
  { id: "bookshelf", name: "Bookshelf", svg: `<g transform="translate(900 180)"><rect width="250" height="440" fill="#6D4C3D"/>
${[20, 130, 240, 350].map(y => `<rect x="14" y="${y}" width="222" height="12" fill="#523629"/>`).join("")}
${books(24, 130, [[22, 92, BOOK[0]], [18, 80, BOOK[1]], [26, 88, BOOK[2]], [16, 72, BOOK[3]]])}<rect x="150" y="66" width="60" height="64" rx="30" fill="#7AA5A0"/>
${books(24, 240, [[30, 84, BOOK[4]], [20, 72, BOOK[2]], [24, 80, BOOK[0]]])}<rect x="160" y="176" width="64" height="64" fill="#C9B79C"/>
${books(28, 350, [[26, 82, BOOK[1]], [22, 72, BOOK[3]]])}<rect x="170" y="276" width="40" height="74" rx="6" fill="#B5564A"/>
${books(110, 440, [[24, 62, BOOK[5]], [20, 70, BOOK[0]], [28, 58, BOOK[4]]])}</g>` },
  { id: "floating", name: "Wall shelves", svg: `<g transform="translate(900 0)">${[250, 380, 510].map(y => `<rect y="${y}" width="240" height="12" rx="3" fill="#6E452E"/><path d="M20 ${y + 12}l14 22M220 ${y + 12}l-14 22" stroke="#523629" stroke-width="5"/>`).join("")}
${books(16, 250, [[22, 80, BOOK[0]], [18, 70, BOOK[1]], [24, 84, BOOK[2]]])}<circle cx="180" cy="222" r="28" fill="#7AA5A0"/>
<rect x="30" y="322" width="70" height="58" rx="4" fill="#F2E8D6"/><circle cx="65" cy="351" r="16" fill="#E8C35A"/>${books(140, 380, [[20, 72, BOOK[3]], [26, 80, BOOK[4]]])}
${books(20, 510, [[28, 66, BOOK[5]], [20, 76, BOOK[0]]])}<path d="M150 510v-50a26 26 0 0 1 52 0v50Z" fill="#B5564A"/></g>` },
  { id: "pictures", name: "Pictures", svg: `<g transform="translate(900 200)"><rect width="110" height="140" fill="#F7F1E8" stroke="#5A3A2A" stroke-width="8"/><circle cx="55" cy="60" r="26" fill="#E4572E"/><path d="M10 120l34 -40l26 26l16 -14l20 28Z" fill="#4E8A5E"/>
<rect x="140" y="30" width="100" height="100" fill="#F7F1E8" stroke="#5A3A2A" stroke-width="8"/><path d="M160 110q30 -70 60 0" fill="none" stroke="#4E7FD9" stroke-width="8"/>
<rect x="60" y="180" width="130" height="90" fill="#F7F1E8" stroke="#5A3A2A" stroke-width="8"/><rect x="76" y="196" width="40" height="58" fill="#E8C35A"/><rect x="124" y="196" width="50" height="26" fill="#9A6FD0"/><rect x="124" y="228" width="50" height="26" fill="#5DA27A"/></g>` },
  { id: "none", name: "Nothing", svg: "" },
];
const LIGHTS = [
  { id: "hanging", name: "Hanging lamp", svg: `<g transform="translate(862 0)"><g class="lamp"><line y2="96" stroke="#3A2A20" stroke-width="3"/><path d="M-34 132Q0 80 34 132Z" fill="#B5542F"/><ellipse class="glow" cy="140" rx="50" ry="18" fill="#FFE2A0" opacity=".85"/></g></g>` },
  { id: "floor", name: "Floor lamp", svg: `<g transform="translate(760 380)"><line y2="262" stroke="#2A2230" stroke-width="8"/><ellipse cy="262" rx="40" ry="10" fill="#2A2230"/><ellipse class="glow" cy="10" rx="150" ry="120" fill="#FFD9A0" opacity=".35"/><path d="M-60 30L60 30L36 -40L-36 -40Z" fill="#F2C38B"/></g>` },
  { id: "string", name: "String lights", svg: `<path d="M0 60Q300 120 600 60T1200 60" fill="none" stroke="#2A2438" stroke-width="2"/>
${[[80, 76], [200, 92], [320, 100], [440, 92], [560, 66], [680, 44], [800, 30], [920, 36], [1040, 48], [1160, 56]].map(([x, y], i) => `<circle class="bulb" cx="${x}" cy="${y}" r="7" fill="${["#FFD27A", "#FF9D7A", "#A8E0FF"][i % 3]}"/>`).join("")}` },
  { id: "none", name: "Nothing", svg: "" },
];

/* ---------------------------------------------------------------- plants (all droop when something is overdue) */
const POT = `<path d="M-30 -4h60l-8 44h-44Z" fill="#C1693F"/><rect x="-34" y="-10" width="68" height="12" rx="4" fill="#D07A4E"/>`;
const leaf = (side, d, fill) => `<path class="leaf ${side}" style="transform-origin:0 0" d="${d}" fill="${fill}"/>`;
const plant = inner => `<g transform="translate(556 648)"><ellipse cy="38" rx="40" ry="8" fill="#000" opacity=".25"/><g class="sway">${inner}</g>${POT}</g>`;
const PLANTS = [
  { id: "fern", name: "Leafy plant", svg: plant(
    leaf("l", "M0 0C-50 -20 -84 -70 -70 -120C-34 -96 -10 -50 0 0Z", "#4E9A60") + leaf("r", "M0 0C50 -20 84 -70 70 -120C34 -96 10 -50 0 0Z", "#4E9A60") +
    leaf("l", "M0 0C-34 -40 -44 -110 -24 -150C-2 -112 4 -50 0 0Z", "#5FA571") + leaf("r", "M0 0C34 -40 44 -110 24 -150C2 -112 -4 -50 0 0Z", "#5FA571") +
    leaf("c", "M0 0C-22 -50 -18 -130 0 -176C18 -130 22 -50 0 0Z", "#3F7D4E")) },
  { id: "monstera", name: "Monstera", svg: plant(
    leaf("l", "M0 0Q-30 -50 -62 -70A44 40 0 1 1 -70 -150A44 40 0 0 1 -30 -84Q-10 -40 0 0Z", "#3F7D4E") +
    leaf("r", "M0 0Q30 -50 62 -70A44 40 0 1 0 70 -150A44 40 0 0 0 30 -84Q10 -40 0 0Z", "#4E9A60") +
    leaf("c", "M0 0Q-6 -70 0 -110A46 44 0 1 1 1 -110Q6 -70 0 0Z", "#5FA571")) },
  { id: "cactus", name: "Cactus", svg: plant(
    `<rect x="-22" y="-150" width="44" height="150" rx="22" fill="#4E8A5E"/>` +
    leaf("l", "M-16 -50H-56a16 16 0 0 1 -16 -16V-96a12 12 0 0 1 24 0V-74H-16Z", "#5FA571") +
    leaf("r", "M16 -70H52a16 16 0 0 0 16 -16V-120a12 12 0 0 0 -24 0V-94H16Z", "#5FA571") +
    `<circle cx="0" cy="-152" r="10" fill="#F28BA8"/>`) },
  { id: "flowers", name: "Flowers", svg: plant(
    [["l", -56, -110, "#F28BA8"], ["r", 56, -110, "#E8C35A"], ["l", -24, -150, "#E4572E"], ["r", 26, -146, "#9A6FD0"], ["c", 0, -176, "#F28BA8"]].map(([side, x, y, c]) =>
      `<g class="leaf ${side}" style="transform-origin:0 0"><path d="M0 0Q${x / 2} ${y / 2} ${x} ${y}" stroke="#4E8A5E" stroke-width="6" fill="none"/><circle cx="${x}" cy="${y}" r="20" fill="${c}"/><circle cx="${x}" cy="${y}" r="8" fill="#FFF3C9"/></g>`).join("")) },
  { id: "none", name: "No plant", svg: "" },
];

/* ---------------------------------------------------------------- drinks (empty as today's tasks get done) */
const TABLE = `<rect x="-46" y="0" width="92" height="10" rx="5" fill="#6E452E"/><rect x="-5" y="10" width="10" height="70" fill="#5A3A2A"/><rect x="-30" y="78" width="60" height="8" rx="4" fill="#5A3A2A"/>`;
const drink = (cup, liquid) => `<g transform="translate(832 560)">${TABLE}<g transform="translate(-28 -62)"><path d="M0 0h56v42a18 18 0 0 1 -18 18h-20a18 18 0 0 1 -18 -18z" fill="${cup}"/><path d="M56 12a12 12 0 0 1 0 24" fill="none" stroke="${cup}" stroke-width="7"/>
<ellipse cx="28" cy="3" rx="26" ry="5" fill="#CDBFA8"/><clipPath id="rm-cup"><ellipse cx="28" cy="3" rx="26" ry="5"/></clipPath><g clip-path="url(#rm-cup)"><ellipse class="drink" cx="28" cy="3" rx="26" ry="5" fill="${liquid}"/></g>
<g class="steam" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"><path d="M18 -10q-10 -14 0 -28q10 -14 0 -28"/><path d="M38 -10q-10 -14 0 -28q10 -14 0 -28"/></g></g></g>`;
const DRINKS = [
  { id: "coffee", name: "Coffee", svg: drink("#F7F1E8", "#6B3E25") },
  { id: "tea", name: "Green tea", svg: drink("#2F6E8F", "#A9B865") },
  { id: "cocoa", name: "Cocoa", svg: drink("#E7B34B", "#4A2A1A") },
  { id: "none", name: "Nothing", svg: "" },
];

/* ---------------------------------------------------------------- the board */
const BOARDS = [
  { id: "cork", name: "Corkboard" },
  { id: "chalk", name: "Chalkboard" },
  { id: "white", name: "Whiteboard" },
];
/** Where the board hangs in a built room, in scene coordinates. */
export const ROOM_BOARD = { x: 560, y: 130, w: 262, h: 190 };

/* ---------------------------------------------------------------- slots */
/** The slots of a room, in the order the builder shows them. */
export const SLOTS = [
  { id: "wall", name: "Wall", options: WALLS },
  { id: "floor", name: "Floor", options: FLOORS },
  { id: "window", name: "Window", options: WINDOWS },
  { id: "view", name: "View", options: VIEWS },
  { id: "seat", name: "Furniture", options: SEATS },
  { id: "shelf", name: "On the wall", options: SHELVES },
  { id: "light", name: "Light", options: LIGHTS },
  { id: "plant", name: "Plant", options: PLANTS },
  { id: "drink", name: "Drink", options: DRINKS },
  { id: "board", name: "Board", options: BOARDS },
];
export const DEFAULT_ROOM = { wall: "sage", floor: "rug", window: "arched", view: "garden", seat: "armchair", shelf: "floating", light: "floor", plant: "monstera", drink: "tea", board: "cork" };

const pick = (slot, id) => slot.options.find(o => o.id === id) ?? slot.options.find(o => o.id === DEFAULT_ROOM[slot.id]) ?? slot.options[0];
/** A complete, valid room from anything saved: unknown slots and choices fall back to the default room. */
export function normalizeRoom(room) {
  const out = {};
  for (const slot of SLOTS) out[slot.id] = pick(slot, room?.[slot.id]).id;
  return out;
}
/** A room with one choice changed. */
export const setSlot = (room, slotId, optionId) => normalizeRoom({ ...room, [slotId]: optionId });
/** A random room. `random` is a function like Math.random, passed in so the result can be tested. */
export function randomRoom(random = Math.random) {
  const out = {};
  for (const slot of SLOTS) out[slot.id] = slot.options[Math.floor(random() * slot.options.length)].id;
  return out;
}
/** The colour behind a room's thumbnail. */
export const roomTint = room => pick(SLOTS[0], normalizeRoom(room).wall).color;
/** How the board looks in this room: "cork", "chalk" or "white". */
export const roomBoardLook = room => normalizeRoom(room).board;

const STYLE = `<style>
.sc-room .lamp{transform-origin:0 0;animation:rm-swing 6s ease-in-out infinite}
.sc-room .glow{animation:rm-glow 5s ease-in-out infinite}
.sc-room .bulb{animation:rm-twinkle 2.4s ease-in-out infinite}.sc-room .bulb:nth-of-type(2n){animation-delay:-1.2s}
.sc-room .star{animation:rm-twinkle 3s ease-in-out infinite}.sc-room .star:nth-of-type(3n){animation-delay:-1s}
.sc-room .cloud{animation:rm-drift 70s linear infinite}.sc-room .cloud.b{animation-duration:95s;animation-delay:-40s}
.sc-room .wave{animation:rm-wave 5s ease-in-out infinite}
.sc-room .screen{animation:rm-glow 4s ease-in-out infinite}
.sc-room .sway{transform-origin:0 0;animation:rm-sway 7s ease-in-out infinite}
.sc-room .steam path{animation:rm-steam 4s ease-in-out infinite;opacity:0}.sc-room .steam path:nth-child(2){animation-delay:-2s}
@keyframes rm-swing{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2deg)}}
@keyframes rm-glow{50%{opacity:.55}}
@keyframes rm-twinkle{50%{opacity:.25}}
@keyframes rm-drift{from{transform:translateX(-160px)}to{transform:translateX(460px)}}
@keyframes rm-wave{50%{transform:translateX(14px)}}
@keyframes rm-sway{0%,100%{transform:rotate(-1.5deg)}50%{transform:rotate(1.5deg)}}
@keyframes rm-steam{0%{opacity:0;transform:translateY(8px)}30%{opacity:.7}100%{opacity:0;transform:translateY(-36px)}}
@media (prefers-reduced-motion: reduce){.sc-room *{animation:none!important}}
</style>`;

/** The whole room as one SVG string, back to front: wall, floor, window, things on the wall, furniture, light, plant, drink. */
export function buildRoom(room) {
  const r = normalizeRoom(room), get = id => pick(SLOTS.find(s => s.id === id), r[id]);
  const wall = get("wall"), floor = get("floor"), win = get("window"), frame = dark(wall.color) ? "#E9DCC7" : "#5B3A2A";
  const windowSvg = win.box ? `<clipPath id="rm-win">${win.glass}</clipPath><g clip-path="url(#rm-win)">${get("view").draw(win.box)}</g>${win.frame(frame)}` : "";
  return `<svg class="sc-room" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${STYLE}
<rect width="1200" height="800" fill="${wall.color}"/>${wall.extra ?? ""}
<rect y="600" width="1200" height="200" fill="${floor.color}"/><rect y="592" width="1200" height="16" fill="${floor.edge}"/>${floor.extra ?? ""}
${windowSvg}
${get("shelf").svg}
${get("light").id === "string" ? get("light").svg : ""}
${get("seat").svg}
${get("light").id !== "string" ? get("light").svg : ""}
${get("drink").svg}
${get("plant").svg}
</svg>`;
}

// "My room": a background you put together yourself. Every slot has a few choices; a room is one choice per slot.
// Each choice draws a fragment of SVG in the same 1200 × 800 space as the ready-made scenes in art.js.
// Parts that react to your work use the same classes as those scenes (see styles.css):
//   .sky (time of day) · .drink and .steam (work left) · .leaf l / r / c (plants droop when something is overdue).
// On top of the choices a room can carry: your own colours (colors), where you moved and how you resized things (pos),
// and your own pictures (images). Options with `unlock: n` are earned: they open after n recorded decisions.

/* ---------------------------------------------------------------- helpers */
/** A darker (factor below 1) or lighter shade of a colour. */
export const shade = (hex, f = .82) => "#" + [1, 3, 5].map(i => Math.max(0, Math.min(255, Math.round(parseInt(hex.slice(i, i + 2), 16) * f))).toString(16).padStart(2, "0")).join("");
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
  { id: "stripes", name: "Stripes", color: "#EADBC6", extra: `<pattern id="rm-stripes" width="80" height="10" patternUnits="userSpaceOnUse"><rect width="40" height="10" fill="#000" opacity=".06"/></pattern><rect width="1200" height="600" fill="url(#rm-stripes)"/>` },
  { id: "brick", name: "Brick", color: "#B5654A", extra: `<pattern id="rm-brick" width="120" height="60" patternUnits="userSpaceOnUse"><path d="M0 0H120M0 30H120M0 60H120M60 0V30M0 30V60M120 30V60" stroke="#000" stroke-opacity=".28" stroke-width="4" fill="none"/></pattern><rect width="1200" height="600" fill="url(#rm-brick)"/>` },
  { id: "starry", name: "Starry wallpaper", color: "#232B55", unlock: 40, extra: `<pattern id="rm-starry" width="150" height="120" patternUnits="userSpaceOnUse"><g fill="#F4EBC8"><circle cx="20" cy="24" r="2.5"/><circle cx="96" cy="60" r="2"/><circle cx="60" cy="100" r="3"/><path d="M124 20l3 7l7 1l-5 5l1 7l-6 -3l-6 3l1 -7l-5 -5l7 -1Z"/></g></pattern><rect width="1200" height="600" fill="url(#rm-starry)"/>` },
  { id: "photo", name: "My picture", color: "#888888", photo: "wall" },
];
const FLOORS = [
  { id: "wood", name: "Wood", color: "#8A5A3C", edge: "#6E452E" },
  { id: "dark", name: "Dark wood", color: "#4A3628", edge: "#33241A" },
  { id: "carpet", name: "Carpet", color: "#8C8FA3", edge: "#70738A" },
  { id: "rug", name: "Wood and a rug", color: "#8A5A3C", edge: "#6E452E", extra: `<ellipse cx="430" cy="716" rx="380" ry="52" fill="#B5564A" opacity=".85"/><ellipse cx="430" cy="716" rx="300" ry="36" fill="none" stroke="#F2E0C0" stroke-width="4" opacity=".7"/>` },
  { id: "checker", name: "Checker tiles", color: "#E9E4DA", edge: "#8A8478", unlock: 50, extra: `<pattern id="rm-checker" width="120" height="80" patternUnits="userSpaceOnUse"><path d="M0 0h60v40H0ZM60 40h60v40H60Z" fill="#2E2E36"/></pattern><rect y="608" width="1200" height="192" fill="url(#rm-checker)"/>` },
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
  { id: "mountains", name: "Mountains", unlock: 15, draw: ([x, y, w, h]) => `<rect class="sky" x="${x}" y="${y}" width="${w}" height="${h}" fill="#9CC7E0"/>
<circle cx="${x + w * .24}" cy="${y + h * .26}" r="${h * .08}" fill="#FFE9A8"/>
<path d="M${x} ${y + h}L${x + w * .3} ${y + h * .34}L${x + w * .52} ${y + h * .72}L${x + w * .72} ${y + h * .24}L${x + w} ${y + h * .8}V${y + h}Z" fill="#6F8296"/>
<path d="M${x + w * .3} ${y + h * .34}l${w * .06} ${h * .12}l-${w * .05} -${h * .03}l-${w * .05} ${h * .05}ZM${x + w * .72} ${y + h * .24}l${w * .07} ${h * .14}l-${w * .06} -${h * .04}l-${w * .06} ${h * .06}Z" fill="#fff"/>
<path d="M${x} ${y + h}L${x + w * .2} ${y + h * .7}L${x + w * .44} ${y + h}Z" fill="#4E8A5E"/>` },
  { id: "photo", name: "My picture", photo: "view", draw: () => "" },
];

/* ---------------------------------------------------------------- furniture */
const SEATS = [
  { id: "sofa", name: "Sofa", main: "#A86F95", low: "#8E5C7E", svg: `<g transform="translate(130 470)"><rect y="40" width="340" height="140" rx="40" fill="#8E5C7E"/><rect x="20" width="300" height="110" rx="40" fill="#A86F95"/><rect x="-20" y="60" width="70" height="120" rx="30" fill="#8E5C7E"/><rect x="290" y="60" width="70" height="120" rx="30" fill="#8E5C7E"/><rect x="120" y="50" width="90" height="60" rx="14" fill="#F2C38B" transform="rotate(-8 165 80)"/></g>` },
  { id: "armchair", name: "Armchair", main: "#D9A441", low: "#C48F2E", svg: `<g transform="translate(200 470)"><rect x="10" width="200" height="130" rx="36" fill="#D9A441"/><rect y="70" width="220" height="110" rx="30" fill="#C48F2E"/><rect x="-16" y="60" width="56" height="120" rx="26" fill="#C48F2E"/><rect x="180" y="60" width="56" height="120" rx="26" fill="#C48F2E"/><rect x="14" y="176" width="12" height="18" fill="#5A4636"/><rect x="194" y="176" width="12" height="18" fill="#5A4636"/></g>` },
  { id: "desk", name: "Desk", main: "#6E452E", low: "#5A3A2A", svg: `<g transform="translate(110 540)"><rect width="380" height="22" rx="4" fill="#6E452E"/><rect x="18" y="22" width="16" height="120" fill="#5A3A2A"/><rect x="346" y="22" width="16" height="120" fill="#5A3A2A"/><rect x="250" y="22" width="96" height="70" fill="#5A3A2A"/><circle cx="298" cy="57" r="5" fill="#C7A97F"/>
<rect x="110" y="-82" width="140" height="80" rx="6" fill="#2A2A33"/><rect class="screen" x="118" y="-74" width="124" height="64" rx="3" fill="#8FD0FF"/><rect x="90" y="-4" width="180" height="6" rx="3" fill="#B8BEC4"/>
<rect x="40" y="-26" width="46" height="26" rx="3" fill="#F2E8D6"/><rect x="36" y="-34" width="46" height="10" rx="3" fill="#D96C4E"/></g>` },
  { id: "beanbag", name: "Beanbag", main: "#4E9AA8", low: "#3C7C88", unlock: 20, svg: `<g transform="translate(180 500)"><path d="M10 150C-30 90 20 10 110 0C210 -6 280 70 250 150Z" fill="#4E9AA8"/><path d="M40 150C30 110 70 70 130 72C190 74 230 110 222 150Z" fill="#3C7C88"/><circle cx="120" cy="-4" r="12" fill="#3C7C88"/></g>` },
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
  { id: "trophies", name: "Trophy shelf", unlock: 30, svg: `<g transform="translate(900 300)"><rect y="100" width="240" height="14" rx="3" fill="#6E452E"/><path d="M20 114l14 22M220 114l-14 22" stroke="#523629" stroke-width="5"/>
<g fill="#E8C35A"><path d="M30 20h50v24a25 25 0 0 1 -50 0Z"/><rect x="50" y="66" width="10" height="20"/><rect x="38" y="86" width="34" height="14" rx="3"/><path d="M30 26h-12v10a14 14 0 0 0 14 14M80 26h12v10a14 14 0 0 1 -14 14" fill="none" stroke="#E8C35A" stroke-width="5"/></g>
<g transform="translate(120 44)"><circle cx="0" cy="20" r="22" fill="#C9CED4"/><path d="M-10 -24h20l-4 26h-12Z" fill="#4E7FD9"/><rect x="-18" y="42" width="36" height="14" rx="3" fill="#8A93A6"/></g>
<g transform="translate(196 30)"><path d="M0 0l8 18l20 2l-15 14l4 20l-17 -10l-17 10l4 -20l-15 -14l20 -2Z" fill="#F28BA8"/><rect x="-14" y="56" width="28" height="14" rx="3" fill="#B5564A"/></g></g>` },
  { id: "none", name: "Nothing", svg: "" },
];
const LIGHTS = [
  { id: "hanging", name: "Hanging lamp", svg: `<g transform="translate(862 0)"><g class="lamp"><line y2="96" stroke="#3A2A20" stroke-width="3"/><path d="M-34 132Q0 80 34 132Z" fill="#B5542F"/><ellipse class="glow" cy="140" rx="50" ry="18" fill="#FFE2A0" opacity=".85"/></g></g>` },
  { id: "floor", name: "Floor lamp", svg: `<g transform="translate(760 380)"><line y2="262" stroke="#2A2230" stroke-width="8"/><ellipse cy="262" rx="40" ry="10" fill="#2A2230"/><ellipse class="glow" cy="10" rx="150" ry="120" fill="#FFD9A0" opacity=".35"/><path d="M-60 30L60 30L36 -40L-36 -40Z" fill="#F2C38B"/></g>` },
  { id: "string", name: "String lights", svg: `<path d="M0 60Q300 120 600 60T1200 60" fill="none" stroke="#2A2438" stroke-width="2"/>
${[[80, 76], [200, 92], [320, 100], [440, 92], [560, 66], [680, 44], [800, 30], [920, 36], [1040, 48], [1160, 56]].map(([x, y], i) => `<circle class="bulb" cx="${x}" cy="${y}" r="7" fill="${["#FFD27A", "#FF9D7A", "#A8E0FF"][i % 3]}"/>`).join("")}` },
  { id: "neon", name: "Neon sign", unlock: 10, svg: `<g transform="translate(590 400)" fill="none" stroke-linecap="round" stroke-linejoin="round"><g class="glow"><path d="M0 60l24 -60l24 60l24 -60l24 60" stroke="#FF6FB5" stroke-width="16" opacity=".35"/><path d="M0 60l24 -60l24 60l24 -60l24 60" stroke="#FFD1E8" stroke-width="6"/>
<path d="M124 0v60M124 30h30M154 0v60" stroke="#6FE3FF" stroke-width="16" opacity=".35"/><path d="M124 0v60M124 30h30M154 0v60" stroke="#D4F6FF" stroke-width="6"/>
<path d="M182 0l22 30l22 -30M204 30v30" stroke="#FFE66F" stroke-width="16" opacity=".35"/><path d="M182 0l22 30l22 -30M204 30v30" stroke="#FFF7C9" stroke-width="6"/></g></g>` },
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
  { id: "bonsai", name: "Bonsai", unlock: 1, svg: plant(
    `<path d="M0 0C-4 -30 -30 -40 -26 -70C-22 -90 6 -84 10 -110" stroke="#6E452E" stroke-width="12" fill="none" stroke-linecap="round"/>` +
    `<g class="leaf l" style="transform-origin:-26px -70px"><ellipse cx="-58" cy="-82" rx="40" ry="20" fill="#4E9A60"/></g>` +
    `<g class="leaf r" style="transform-origin:10px -110px"><ellipse cx="46" cy="-104" rx="42" ry="20" fill="#3F7D4E"/></g>` +
    `<g class="leaf c" style="transform-origin:10px -110px"><ellipse cx="6" cy="-136" rx="46" ry="22" fill="#5FA571"/></g>`) },
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
  { id: "bubble", name: "Bubble tea", unlock: 5, svg: `<g transform="translate(832 560)">${TABLE}<g transform="translate(-24 -84)"><path d="M0 0h48l-6 84h-36Z" fill="#fff" opacity=".55"/>
<clipPath id="rm-cup"><path d="M3 12h42l-5 70h-32Z"/></clipPath><g clip-path="url(#rm-cup)"><rect class="drink" x="0" y="12" width="48" height="72" fill="#D9A77A"/></g>
<g fill="#3A2A20"><circle cx="14" cy="74" r="5"/><circle cx="26" cy="77" r="5"/><circle cx="36" cy="72" r="5"/><circle cx="20" cy="64" r="5"/></g>
<rect x="-3" y="-6" width="54" height="8" rx="4" fill="#F28BA8"/><rect x="26" y="-40" width="7" height="90" rx="3" fill="#E4572E" transform="rotate(8 30 0)"/></g></g>` },
  { id: "none", name: "Nothing", svg: "" },
];

/* ---------------------------------------------------------------- the board */
const BOARDS = [
  { id: "cork", name: "Corkboard" },
  { id: "chalk", name: "Chalkboard" },
  { id: "white", name: "Whiteboard" },
];
/** Where the board hangs in a built room before you move it, in scene coordinates. */
export const ROOM_BOARD = { x: 560, y: 130, w: 262, h: 190 };

/* ---------------------------------------------------------------- slots */
/** The slots of a room, in the order the builder shows them. `tint` names the slots you can give your own colour. */
export const SLOTS = [
  { id: "wall", name: "Wall", options: WALLS, tint: true },
  { id: "floor", name: "Floor", options: FLOORS, tint: true },
  { id: "window", name: "Window", options: WINDOWS },
  { id: "view", name: "View", options: VIEWS },
  { id: "seat", name: "Furniture", options: SEATS, tint: true },
  { id: "shelf", name: "On the wall", options: SHELVES },
  { id: "light", name: "Light", options: LIGHTS },
  { id: "plant", name: "Plant", options: PLANTS },
  { id: "drink", name: "Drink", options: DRINKS },
  { id: "board", name: "Board", options: BOARDS },
];
const CHOICES = { wall: "sage", floor: "rug", window: "arched", view: "garden", seat: "armchair", shelf: "floating", light: "floor", plant: "monstera", drink: "tea", board: "cork" };
export const DEFAULT_ROOM = { ...CHOICES, colors: {}, pos: {}, images: {} };

/** The things you can move and resize, and the point each one grows from. */
export const PARTS = [
  { id: "window", name: "Window", anchor: [280, 280] },
  { id: "shelf", name: "On the wall", anchor: [1020, 400] },
  { id: "poster", name: "Poster", anchor: [953, 225] },
  { id: "seat", name: "Furniture", anchor: [300, 560] },
  { id: "light", name: "Light", anchor: [800, 300] },
  { id: "drink", name: "Drink", anchor: [832, 560] },
  { id: "plant", name: "Plant", anchor: [556, 640] },
  { id: "board", name: "Board", anchor: [691, 225] },
];
export const LIMITS = { x: 1000, y: 520, min: .5, max: 1.8 };
const IMAGES = ["poster", "view", "wall"];
const isHex = v => typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v);
const clamp = (v, lo, hi) => Math.min(Math.max(lo, v), hi);
const record = v => (v && typeof v === "object" && !Array.isArray(v) ? v : {});

/* ---------------------------------------------------------------- rules */
/** Can this option be chosen at all in this room? "My picture" options need their picture. */
const available = (o, images) => !o.photo || !!images[o.photo];
/** A complete, valid room from anything saved: unknown slots, choices, colours, positions and pictures are dropped or replaced by defaults. */
export function normalizeRoom(room) {
  const from = record(room), out = { colors: {}, pos: {}, images: {} };
  for (const k of IMAGES) { const v = record(from.images)[k]; if (typeof v === "string" && v.startsWith("data:image/")) out.images[k] = v; }
  for (const slot of SLOTS) {
    const o = slot.options.find(x => x.id === from[slot.id] && available(x, out.images));
    out[slot.id] = o ? o.id : CHOICES[slot.id];
    const c = record(from.colors)[slot.id];
    if (slot.tint && isHex(c)) out.colors[slot.id] = c.toLowerCase();
  }
  for (const part of PARTS) {
    const p = record(from.pos)[part.id];
    if (p && [p.x, p.y, p.s].every(Number.isFinite)) out.pos[part.id] = { x: clamp(Math.round(p.x), -LIMITS.x, LIMITS.x), y: clamp(Math.round(p.y), -LIMITS.y, LIMITS.y), s: clamp(Math.round(p.s * 100) / 100, LIMITS.min, LIMITS.max) };
  }
  return out;
}
/** A room with one choice changed. */
export const setSlot = (room, slotId, optionId) => normalizeRoom({ ...room, [slotId]: optionId });
/** A room with your own colour for a slot, or the standard colour again when `color` is null. */
export function setColor(room, slotId, color) {
  const colors = { ...normalizeRoom(room).colors };
  if (color) colors[slotId] = color; else delete colors[slotId];
  return normalizeRoom({ ...room, colors });
}
const posOf = (room, id) => room.pos?.[id] ?? { x: 0, y: 0, s: 1 };
/** A room with one thing moved by (dx, dy) scene units and resized by ds. */
export function movePart(room, partId, dx = 0, dy = 0, ds = 0) {
  const p = posOf(room, partId);
  return normalizeRoom({ ...room, pos: { ...room.pos, [partId]: { x: p.x + dx, y: p.y + dy, s: p.s + ds } } });
}
/** Everything back where it started. */
export const resetLayout = room => normalizeRoom({ ...room, pos: {} });
/** A room with one of your pictures set ("poster", "view" or "wall"), or removed when `data` is null. A view or wall picture is also chosen. */
export function setImage(room, kind, data) {
  const images = { ...room.images };
  if (data) images[kind] = data; else delete images[kind];
  const next = { ...room, images };
  if (data && kind !== "poster") next[kind] = "photo";
  return normalizeRoom(next);
}

/* ---------------------------------------------------------------- earned options */
/** Every earned option, cheapest first: { slot, id, name, unlock }. */
export const REWARDS = SLOTS.flatMap(s => s.options.filter(o => o.unlock).map(o => ({ slot: s.id, slotName: s.name, id: o.id, name: o.name, unlock: o.unlock }))).sort((a, b) => a.unlock - b.unlock);
/** Is this option open with this many recorded decisions? */
export const isUnlocked = (option, decisions) => (option.unlock ?? 0) <= decisions;
/** What you have collected so far, what comes next, and what opened between two counts. */
export function collection(decisions, before = decisions) {
  return {
    earned: REWARDS.filter(r => r.unlock <= decisions),
    next: REWARDS.find(r => r.unlock > decisions) ?? null,
    fresh: REWARDS.filter(r => r.unlock > before && r.unlock <= decisions),
  };
}
/** A random room from what you have unlocked. `random` works like Math.random and is passed in so the result can be tested. Your pictures stay. */
export function randomRoom(random = Math.random, decisions = 0, room = DEFAULT_ROOM) {
  const out = { images: room.images };
  for (const slot of SLOTS) {
    const open = slot.options.filter(o => !o.photo && isUnlocked(o, decisions));
    out[slot.id] = open[Math.floor(random() * open.length)].id;
  }
  return normalizeRoom(out);
}

const pick = (slotId, r) => { const slot = SLOTS.find(s => s.id === slotId); return slot.options.find(o => o.id === r[slotId]) ?? slot.options[0]; };
/** The colour behind a room's thumbnail. */
export const roomTint = room => { const r = normalizeRoom(room); return r.colors.wall ?? pick("wall", r).color; };
/** How the board looks in this room: "cork", "chalk" or "white". */
export const roomBoardLook = room => normalizeRoom(room).board;
/** Where the board hangs in this room, after you moved or resized it. */
export function roomBoardSpot(room) {
  const r = normalizeRoom(room), p = posOf(r, "board"), w = ROOM_BOARD.w * p.s, h = ROOM_BOARD.h * p.s;
  return { x: ROOM_BOARD.x + p.x - (w - ROOM_BOARD.w) / 2, y: ROOM_BOARD.y + p.y - (h - ROOM_BOARD.h) / 2, w, h, look: r.board };
}
/** The SVG transform that puts a part where you moved it, grown around its anchor. */
export function partTransform(room, partId) {
  const p = posOf(room, partId), [ax, ay] = PARTS.find(x => x.id === partId).anchor;
  return `translate(${p.x} ${p.y}) translate(${ax} ${ay}) scale(${p.s}) translate(${-ax} ${-ay})`;
}

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

/** The whole room as one SVG string, back to front: wall, floor, window, things on the wall, furniture, light, drink, plant. */
export function buildRoom(room) {
  const r = normalizeRoom(room), get = id => pick(id, r);
  const wall = get("wall"), floor = get("floor"), win = get("window"), seat = get("seat"), light = get("light");
  const wallColor = r.colors.wall ?? wall.color, floorColor = r.colors.floor ?? floor.color, floorEdge = r.colors.floor ? shade(floorColor) : floor.edge;
  const photoWall = wall.photo && r.images.wall;
  const frame = !photoWall && dark(wallColor) ? "#E9DCC7" : "#5B3A2A";
  // Every movable thing is wrapped in a group that carries where you put it.
  const part = (id, inner) => (inner ? `<g class="part" data-part="${id}" transform="${partTransform(r, id)}">${inner}</g>` : "");
  const img = (src, x, y, w, h) => `<image href="${src}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice"/>`;
  const view = win.box ? (get("view").photo ? img(r.images.view, ...win.box) : get("view").draw(win.box)) : "";
  const windowSvg = win.box ? `<clipPath id="rm-win">${win.glass}</clipPath><g clip-path="url(#rm-win)">${view}</g>${win.frame(frame)}` : "";
  const seatSvg = r.colors.seat && seat.main ? seat.svg.replaceAll(seat.main, r.colors.seat).replaceAll(seat.low, shade(r.colors.seat)) : seat.svg;
  const poster = r.images.poster ? `<rect x="868" y="120" width="170" height="210" fill="#F7F1E8" stroke="#5A3A2A" stroke-width="10"/>${img(r.images.poster, 876, 128, 154, 194)}` : "";
  return `<svg class="sc-room" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${STYLE}
${photoWall ? img(r.images.wall, 0, 0, 1200, 800) : `<rect width="1200" height="800" fill="${wallColor}"/>${wall.extra ?? ""}
<rect y="600" width="1200" height="200" fill="${floorColor}"/><rect y="592" width="1200" height="16" fill="${floorEdge}"/>${floor.extra ?? ""}`}
${part("window", windowSvg)}
${part("shelf", get("shelf").svg)}
${part("poster", poster)}
${light.id === "string" ? part("light", light.svg) : ""}
${part("seat", seatSvg)}
${light.id !== "string" ? part("light", light.svg) : ""}
${part("drink", get("drink").svg)}
${part("plant", get("plant").svg)}
</svg>`;
}

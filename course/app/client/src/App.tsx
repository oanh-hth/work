// Given: the app shell. It puts your components together into the finished Whybook.
// You don't need to change it, but reading it shows how every piece connects.
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type Dispatch } from "react";
import { createApi, type Api } from "@app/client/src/api/client";
import { AppProvider, useApp } from "@app/client/src/state/AppContext";
import type { AppState } from "@app/shared/types";
import type { AppAction } from "@app/client/src/state/rootReducer";
import { Backdrop, THEMES, RoomContext, sceneFor } from "@app/client/src/components/Art";
import type { Theme } from "@app/client/src/art/art";
import { SLOTS, DEFAULT_ROOM, PARTS, PART_IDS, PICTURES, TINT_SLOTS, transformFor } from "@app/client/src/art/room";
import { NO_EXTRAS, type PartPos, type RoomExtras } from "@app/shared/room-extras";
import { normalizeColors } from "@app/shared/colors";
import { normalizePos, movePart, toScene } from "@app/shared/layout";
import { normalizeImages } from "@app/shared/pictures";
import { ArrangeBar } from "@app/client/src/components/ArrangeBar";
import { normalizeRoom, type Room } from "@app/shared/room-choices";
import { placeBoard, boardNotes } from "@app/shared/board";
import { WallBoard } from "@app/client/src/components/WallBoard";
import { BoardQuickAdd } from "@app/client/src/components/BoardQuickAdd";
import { roomState } from "@app/shared/room";
import { useLocalStorage } from "@app/client/src/hooks/useLocalStorage";
import { useHashRoute } from "@app/client/src/hooks/useHashRoute";
import { useServerSync, type SyncStatus } from "@app/client/src/hooks/useServerSync";
import { ErrorBoundary } from "@app/client/src/components/ErrorBoundary";
import { LoginForm } from "@app/client/src/components/LoginForm";
import { Playground } from "@app/client/src/Playground";
import { ROUTES, ROUTE_NAMES, todayKey, newId } from "@app/client/src/views/shared";
import { TasksView } from "@app/client/src/views/TasksView";
import { DecisionsView } from "@app/client/src/views/DecisionsView";
import { SettingsView } from "@app/client/src/views/SettingsView";

const OFFLINE = "offline";

export function App() {
  const [hash, setHash] = useState(location.hash);
  useEffect(() => { const on = () => setHash(location.hash); window.addEventListener("hashchange", on); return () => window.removeEventListener("hashchange", on); }, []);
  if (hash === "#playground") return <Playground />;
  return <ErrorBoundary area="The app"><Main /></ErrorBoundary>;
}

function Main() {
  const [token, setToken] = useLocalStorage<string | null>("whybook.token", null);
  const [mode, setMode] = useState<"login" | "register">("login");
  const api = useMemo(() => (token && token !== OFFLINE ? createApi({ getToken: () => token }) : null), [token]);
  if (!token) {
    const anon = createApi();
    return (
      <main className="center">
        <h1 className="brand-big">Whybook</h1>
        <p className="muted">Tasks, results and the decisions you make along the way.</p>
        <ErrorBoundary area="Sign-in">
          <LoginForm mode={mode} onSwitchMode={() => setMode(m => (m === "login" ? "register" : "login"))}
            onSubmit={async (email, pw) => setToken(mode === "login" ? await anon.login(email, pw) : await anon.register(email, pw))} />
        </ErrorBoundary>
        <p className="muted"><button className="link" onClick={() => setToken(OFFLINE)}>Use without the server</button> · <a href="#playground">Component playground</a></p>
      </main>
    );
  }
  return <Synced api={api} onSignOut={() => { setToken(null); location.hash = ""; }} />;
}

function Synced({ api, onSignOut }: { api: Api | null; onSignOut: () => void }) {
  const dispatchRef = useRef<Dispatch<AppAction> | null>(null);
  const replace = useCallback((state: AppState) => dispatchRef.current?.({ type: "replace", state }), []);
  const sync = useServerSync(api, replace);
  return (
    <AppProvider onChange={sync.onChange}>
      <Bridge onReady={(d, s) => { dispatchRef.current = d; sync.remember(s); }} />
      <Shell status={sync.status} onResolve={sync.resolve} onSignOut={onSignOut} />
    </AppProvider>
  );
}

function Bridge({ onReady }: { onReady: (d: Dispatch<AppAction>, s: AppState) => void }) {
  const { state, dispatch } = useApp();
  const once = useRef(false);
  useEffect(() => { if (!once.current) { once.current = true; onReady(dispatch, state); } });
  return null;
}

function syncText(status: SyncStatus): string {
  if (status.kind === "conflict") return "Changed on two devices";
  return { offline: "Saved on this device only", syncing: "Syncing…", synced: "Synced", error: `Sync problem: ${status.message ?? ""}` }[status.kind];
}

/** Use a rule from Part 11, or `fallback` until that exercise is done. */
function safe<T>(rule: () => T, fallback: T): T { try { return rule(); } catch { return fallback; } }

function Shell({ status, onResolve, onSignOut }: { status: SyncStatus; onResolve: (k: "this" | "other") => void; onSignOut: () => void }) {
  const [route, navigate] = useHashRoute(ROUTES, "tasks");
  const [editId, setEditId] = useState<string | null>(null);
  const [backdrop, setBackdrop] = useLocalStorage("whybook.backdrop", "coffee");
  useEffect(() => { document.documentElement.dataset.backdrop = backdrop; }, [backdrop]);
  useRoomState();
  // The room you built (Part 10). Whatever was saved is checked first (10.1); until 10.1 is done, the default room is used.
  const [savedRoom, setRoom] = useLocalStorage<unknown>("whybook.room", DEFAULT_ROOM);
  const room = useMemo<Room>(() => safe(() => normalizeRoom(SLOTS, DEFAULT_ROOM, savedRoom), DEFAULT_ROOM), [savedRoom]);
  // What you added to it (Part 11): colours (11.1), positions (11.2) and pictures (11.4). Each is checked by its own rule.
  const [savedExtras, setExtras] = useLocalStorage<unknown>("whybook.room-extras", NO_EXTRAS);
  const extras = useMemo<RoomExtras>(() => {
    const from = (typeof savedExtras === "object" && savedExtras !== null ? savedExtras : {}) as Partial<Record<keyof RoomExtras, unknown>>;
    return {
      colors: safe(() => normalizeColors(from.colors, TINT_SLOTS), {}),
      pos: safe(() => normalizePos(from.pos, PART_IDS), {}),
      images: safe(() => normalizeImages(from.images, PICTURES.map(p => p.kind)), {}),
    };
  }, [savedExtras]);
  const scene = useMemo(() => ({ room, extras }), [room, extras]);

  // Arranging (11.2, 11.3): the panel is put away, and things in the room can be dragged or moved with the toolbar.
  const [arranging, setArranging] = useState(false);
  const [selected, setSelected] = useState("plant");
  const [live, setLive] = useState<Record<string, PartPos> | null>(null);   // positions while a drag is going on
  const pos = live ?? extras.pos;
  const spot = sceneFor(backdrop, room, { ...extras, pos }).board;
  const [open, setOpen] = useState(false);
  const inRoom = !!spot && (!open || arranging);
  const stopArranging = useCallback(() => { setArranging(false); setLive(null); }, []);
  useEffect(() => { document.documentElement.classList.toggle("arranging", arranging); return () => document.documentElement.classList.remove("arranging"); }, [arranging]);
  useArrangeDrag(arranging, extras, pos => setExtras({ ...extras, pos }), setLive, setSelected);
  const present = PARTS.filter(p => p.id === "board" || (p.id === "poster" ? !!extras.images.poster : room[p.id] !== "none" && (p.id !== "window" || room.window !== "none")));

  useEffect(() => {
    if (!spot || (!open && !arranging)) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || document.querySelector("[role=dialog]")) return;
      if (arranging) stopArranging(); else setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [spot, open, arranging, stopArranging]);
  return (
    <RoomContext.Provider value={scene}>
    <div className="shell">
      <Backdrop id={backdrop} />
      <header className="top">
        <strong className="brand">Whybook</strong>
        <nav aria-label="Main" className="tabs">
          {ROUTES.map(r => <a key={r} href={`#${r}`} aria-current={route === r && !inRoom ? "page" : undefined} onClick={() => { stopArranging(); setOpen(true); }}>{ROUTE_NAMES[r]}</a>)}
        </nav>
        {status.kind === "conflict"
          ? <div className="banner" role="alert">Changed on another device too. Keep{" "}
              <button onClick={() => onResolve("this")}>this device's copy</button> or <button onClick={() => onResolve("other")}>the other copy</button>?</div>
          : <span className="sync">{syncText(status)}</span>}
        <button type="button" className="edit-room" aria-label="Build my room" onClick={() => { stopArranging(); setBackdrop("custom"); navigate("settings"); setOpen(true); }}>🎨<span> Edit room</span></button>
        <label className="backdrop-pick"><span className="visually-hidden">Background</span>
          <select aria-label="Background" value={backdrop} onChange={e => { stopArranging(); setBackdrop(e.target.value); }}>
            {THEMES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select></label>
      </header>
      {inRoom
        ? <>
            <ErrorBoundary area="The board"><Board spot={spot} arranging={arranging} selected={arranging && selected === "board"} onOpen={() => { if (!arranging) setOpen(true); }} /></ErrorBoundary>
            {arranging && (
              <ErrorBoundary area="Arranging the room">
                <ArrangeBar parts={present} selected={present.some(p => p.id === selected) ? selected : "board"} scale={pos[selected]?.s ?? 1}
                  onSelect={setSelected}
                  onMove={(dx, dy) => setExtras({ ...extras, pos: movePart(extras.pos, selected, dx, dy) })}
                  onResize={ds => setExtras({ ...extras, pos: movePart(extras.pos, selected, 0, 0, ds) })}
                  onReset={() => setExtras({ ...extras, pos: {} })}
                  onDone={() => { stopArranging(); navigate("settings"); setOpen(true); }} />
              </ErrorBoundary>
            )}
          </>
        : <>
            {spot && <button type="button" className="back-to-room" onClick={() => { setOpen(false); scrollTo(0, 0); }}>← Back to the room</button>}
            <main className="view">
              <ErrorBoundary key={route} area={ROUTE_NAMES[route]}>
                {route === "tasks" && <TasksView editId={editId} onEdited={() => setEditId(null)} />}
                {route === "decisions" && <DecisionsView onEdit={id => { setEditId(id); navigate("tasks"); }} />}
                {route === "settings" && <SettingsView onSignOut={onSignOut} syncText={syncText(status)} backdrop={backdrop} onBackdrop={setBackdrop}
                  room={room} onRoom={setRoom} extras={extras} onExtras={setExtras} onArrange={() => { setArranging(true); scrollTo(0, 0); }} />}
              </ErrorBoundary>
            </main>
          </>}
    </div>
    </RoomContext.Provider>
  );
}

/**
 * Dragging things while arranging. Pointer events cover mouse, finger and Apple Pencil with one set of handlers.
 * A drag is turned into scene units with toScene and applied with movePart (both 11.2).
 * While the finger is down the part's transform is set straight on its SVG element, which is instant;
 * the new positions are saved once, when the finger lifts, and only then is the scene drawn again.
 */
function useArrangeDrag(arranging: boolean, extras: RoomExtras, commit: (pos: Record<string, PartPos>) => void,
  setLive: (pos: Record<string, PartPos> | null) => void, select: (partId: string) => void) {
  const latest = useRef({ extras, commit });
  latest.current = { extras, commit };
  useEffect(() => {
    if (!arranging) return;
    let drag: { pointer: number; part: string; x: number; y: number; pos: Record<string, PartPos> } | null = null;
    const down = (e: PointerEvent) => {
      const hit = (e.target as Element).closest?.(".backdrop .part, .board-spot");
      if (!hit) return;
      e.preventDefault();
      const part = hit instanceof HTMLElement ? "board" : hit.getAttribute("data-part")!;
      select(part);
      drag = { pointer: e.pointerId, part, x: e.clientX, y: e.clientY, pos: latest.current.extras.pos };
    };
    const move = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.pointer) return;
      try {
        const was = drag.pos[drag.part] ?? { x: 0, y: 0, s: 1 };
        const perPixel = toScene(1, 1, { width: innerWidth, height: innerHeight });   // scene units for one screen pixel
        const next = movePart(drag.pos, drag.part, (e.clientX - drag.x) * perPixel.dx, (e.clientY - drag.y) * perPixel.dy);
        const now = next[drag.part]!;
        // Only count what was really applied (after rounding and limits), so the thing never drifts away from the finger.
        drag.x += (now.x - was.x) / perPixel.dx;
        drag.y += (now.y - was.y) / perPixel.dy;
        drag.pos = next;
        if (drag.part === "board") setLive(next);
        else document.querySelector(`.backdrop [data-part="${drag.part}"]`)?.setAttribute("transform", transformFor(next, drag.part));
      } catch { /* 11.2 isn't done yet */ }
    };
    const up = (e: PointerEvent) => {
      if (!drag || e.pointerId !== drag.pointer) return;
      latest.current.commit(drag.pos);
      drag = null; setLive(null);
    };
    document.addEventListener("pointerdown", down);
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", up);
    document.addEventListener("pointercancel", up);
    return () => { document.removeEventListener("pointerdown", down); document.removeEventListener("pointermove", move); document.removeEventListener("pointerup", up); document.removeEventListener("pointercancel", up); };
  }, [arranging, select, setLive]);
}

/**
 * The room reflects your work (9.4): the scene's light, cups and plants are styled in styles.css from
 * data-time and data-mood on <html> and the CSS variable --left. Until 9.4 is done the room just stays calm.
 */
function useRoomState() {
  const { state } = useApp();
  const [hour, setHour] = useState(() => new Date().getHours());
  useEffect(() => { const t = setInterval(() => setHour(new Date().getHours()), 5 * 60 * 1000); return () => clearInterval(t); }, []);
  useEffect(() => {
    const html = document.documentElement;
    try {
      const r = roomState(state.tasks, todayKey(), hour);
      html.dataset.time = r.time; html.dataset.mood = r.mood; html.style.setProperty("--left", r.left.toFixed(2));
    } catch { delete html.dataset.time; delete html.dataset.mood; html.style.removeProperty("--left"); }
  }, [state.tasks, hour]);
}

/** Hangs your WallBoard (8.9) on the wall, at the spot placeBoard (8.8) works out for this screen. */
function Board({ spot, onOpen, arranging = false, selected = false }: { spot: NonNullable<Theme["board"]>; onOpen: () => void; arranging?: boolean; selected?: boolean }) {
  const { state, dispatch } = useApp();
  const [adding, setAdding] = useState(false);
  const [viewport, setViewport] = useState({ width: innerWidth, height: innerHeight });
  useEffect(() => {
    const on = () => setViewport({ width: innerWidth, height: innerHeight });
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  // The header's real height, measured after layout and again whenever it changes (it wraps onto more lines on a phone).
  const [header, setHeader] = useState(56);
  useLayoutEffect(() => {
    const top = document.querySelector<HTMLElement>(".top");
    if (!top) return;
    const measure = () => setHeader(top.offsetHeight);
    measure();
    const watch = new ResizeObserver(measure);
    watch.observe(top);
    return () => watch.disconnect();
  }, []);
  const rect = placeBoard(spot, viewport, header);
  return (
    <div className={selected ? "board-spot sel" : "board-spot"} style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height, fontSize: rect.fontSize }}>
      <WallBoard notes={boardNotes(state.tasks, todayKey())} look={spot.look} onOpen={onOpen} />
      {/* A sibling of the board, not inside it: a button can't hold another button (9.3). */}
      {!arranging && <button type="button" className="board-add" aria-expanded={adding} aria-label={adding ? "Close add a task" : "Add a task"} onClick={() => setAdding(a => !a)}>{adding ? "×" : "+"}</button>}
      {adding && !arranging && (
        <ErrorBoundary area="Adding from the board">
          <BoardQuickAdd onClose={() => setAdding(false)}
            onAdd={(title, complexity) => dispatch({ type: "add", id: newId(), title, complexity, due: null, today: todayKey() })} />
        </ErrorBoundary>
      )}
    </div>
  );
}

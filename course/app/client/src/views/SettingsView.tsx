// Given: the Settings page: background (8.1), your own room (Parts 10 and 11), sync status, backup, version and sign-out.
import { useState } from "react";
import { useApp } from "@app/client/src/state/AppContext";
import { download, todayKey } from "@app/client/src/views/shared";
import { ThemePicker } from "@app/client/src/components/ThemePicker";
import { RoomBuilder } from "@app/client/src/components/RoomBuilder";
import { VersionInfo } from "@app/client/src/components/VersionInfo";
import { ErrorBoundary } from "@app/client/src/components/ErrorBoundary";
import { SLOTS, DEFAULT_ROOM, PICTURES, buildRoom, type RoomSlot } from "@app/client/src/art/room";
import { DrawingPad } from "@app/client/src/room/DrawingPad";
import { shrinkImage } from "@app/client/src/room/pictures";
import { VERSION, VERSION_DATE, checkForUpdates } from "@app/client/src/version";
import { setSlot, randomRoom, type Room } from "@app/shared/room-choices";
import type { RoomExtras } from "@app/shared/room-extras";
import { setColor } from "@app/shared/colors";
import { setImage } from "@app/shared/pictures";
import { collection, openSlots, rewardsOf } from "@app/shared/collection";
import { decisionsOf } from "@app/shared/decisions";

interface SettingsProps {
  onSignOut: () => void; syncText: string;
  backdrop: string; onBackdrop: (id: string) => void;
  room: Room; onRoom: (room: Room) => void;
  extras: RoomExtras; onExtras: (extras: RoomExtras) => void;
  onArrange: () => void;
}
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export function SettingsView({ onSignOut, syncText, backdrop, onBackdrop, room, onRoom, extras, onExtras, onArrange }: SettingsProps) {
  const { state } = useApp();
  const [drawing, setDrawing] = useState(false);
  const [problem, setProblem] = useState("");
  // Decisions you recorded: what the collection counts (11.6). 0 until decisionsOf (2.3) is written.
  let decisions = 0;
  try { decisions = decisionsOf(state.tasks).length; } catch { /* 2.3 not done yet */ }
  // The builder offers what is open: earned options once you have them (11.6), "My picture" once you added one (11.4).
  let slots: RoomSlot[] = SLOTS.map(s => ({ ...s, options: s.options.filter(o => !o.unlock) }));   // until 11.6: nothing earned
  try { slots = openSlots(SLOTS, decisions); } catch { /* 11.6 not done yet */ }
  slots = slots.map(s => ({ ...s, options: s.options.filter(o => !o.photo || !!extras.images[o.photo]) }));

  const addPicture = async (kind: "poster" | "view" | "wall", max: number, file: File | undefined) => {
    if (!file) return;
    try {
      const data = await shrinkImage(file, max);
      onExtras({ ...extras, images: setImage(extras.images, kind, data) });
      if (kind !== "poster") onRoom(setSlot(SLOTS, DEFAULT_ROOM, room, kind, "photo"));   // a view or wall picture is also chosen
      setProblem("");
    } catch { setProblem("That file couldn't be used as a picture. Is exercise 11.4 done?"); }
  };

  return (
    <section className="card stack">
      <h1>Settings</h1>
      <h2>Background</h2>
      <p className="muted">An animated scene behind your tasks. Pick a ready-made room, or <b>My room</b> to put one together yourself. Animations stop when Reduce Motion is on.</p>
      <ErrorBoundary area="The theme picker"><ThemePicker value={backdrop} onChange={onBackdrop} /></ErrorBoundary>
      {backdrop === "custom" && <>
        <h2>Build your room</h2>
        <p className="muted">Choose each part. The room behind this panel changes as you go.</p>
        <div className="room-preview" aria-hidden="true" dangerouslySetInnerHTML={{ __html: buildRoom(room, extras) }} />
        <div className="row"><button type="button" className="primary" onClick={onArrange}>✋ Move and resize things</button></div>
        <ErrorBoundary area="The room builder">
          <RoomBuilder slots={slots} room={room}
            onChange={(slotId, optionId) => onRoom(setSlot(SLOTS, DEFAULT_ROOM, room, slotId, optionId))}
            onRandom={() => onRoom(randomRoom(slots.map(s => ({ ...s, options: s.options.filter(o => !o.photo) }))))}
            onReset={() => { onRoom(DEFAULT_ROOM); onExtras({ colors: {}, pos: {}, images: extras.images }); }} />
        </ErrorBoundary>

        <h3>Your own colours</h3>
        <ErrorBoundary area="Your own colours">
          <div className="own-colours">
            {SLOTS.filter(s => s.tint).map(s => {
              const standard = s.options.find(o => o.id === room[s.id]), own = extras.colors[s.id];
              return (
                <div key={s.id} className="own-colour">
                  <label>{s.name} <input type="color" value={own ?? standard?.main ?? standard?.color ?? "#888888"}
                    onChange={e => onExtras({ ...extras, colors: setColor(extras.colors, s.id, e.target.value) })} /></label>
                  {own && <button type="button" className="link" onClick={() => onExtras({ ...extras, colors: setColor(extras.colors, s.id, null) })}>Use the standard colour</button>}
                </div>
              );
            })}
          </div>
        </ErrorBoundary>

        <h3>Your pictures</h3>
        <p className="muted">Add a photo or a drawing from your device, or draw a poster here with your finger or Apple Pencil. Pictures are made smaller before they are saved.</p>
        <div className="pictures">
          {PICTURES.map(({ kind, name, max }) => (
            <div key={kind} className="picture">
              {extras.images[kind] ? <img src={extras.images[kind]} alt="" /> : <span className="empty" aria-hidden="true">＋</span>}
              <b>{name}</b>
              <div className="row">
                <label className="file">{extras.images[kind] ? "Change" : "Choose a picture"}
                  <input type="file" accept="image/*" className="visually-hidden" aria-label={`${name}: choose a picture`}
                    onChange={e => { void addPicture(kind, max, e.target.files?.[0]); e.target.value = ""; }} /></label>
                {kind === "poster" && <button type="button" onClick={() => setDrawing(true)}>✏️ Draw</button>}
                {extras.images[kind] && <button type="button" className="link" aria-label={`Remove: ${name}`}
                  onClick={() => { try { onExtras({ ...extras, images: setImage(extras.images, kind, null) }); } catch { setProblem("Removing needs exercise 11.4."); } }}>Remove</button>}
              </div>
            </div>
          ))}
        </div>
        {problem && <p role="alert" className="error">{problem}</p>}
        {drawing && (
          <ErrorBoundary area="The drawing pad">
            <DrawingPad base={extras.images.poster} onCancel={() => setDrawing(false)}
              onSave={data => { try { onExtras({ ...extras, images: setImage(extras.images, "poster", data) }); } catch { setProblem("Saving a drawing needs exercise 11.4."); } setDrawing(false); }} />
          </ErrorBoundary>
        )}

        <h3>Your collection</h3>
        <ErrorBoundary area="Your collection"><Collection decisions={decisions} /></ErrorBoundary>
      </>}
      <h2>Your data</h2>
      <p>{syncText}</p>
      <div><button onClick={() => download(`whybook-backup-${todayKey()}.json`, JSON.stringify({ app: "whybook", exportedAt: new Date().toISOString(), state }), "application/json")}>Download a backup</button></div>
      <h2>Version</h2>
      <ErrorBoundary area="The version"><VersionInfo version={VERSION} date={VERSION_DATE} onCheck={checkForUpdates} /></ErrorBoundary>
      <h2>Account</h2>
      <div><button onClick={onSignOut}>Sign out</button></div>
    </section>
  );
}

/** What you have earned and what comes next (11.6). */
function Collection({ decisions }: { decisions: number }) {
  const rewards = rewardsOf(SLOTS), c = collection(rewards, decisions);
  return (
    <div className="stack">
      <p className="muted">Every decision you record counts. {c.next
        ? <>Next: <b>{c.next.name}</b> ({c.next.slotName}) at {plural(c.next.unlock, "decision", "decisions")}, {c.next.unlock - decisions} to go.</>
        : "You have collected everything."}</p>
      <progress className="collect" max={rewards.length} value={c.earned.length} aria-label={`Collected ${c.earned.length} of ${rewards.length}`} />
      <ul className="rewards">
        {rewards.map(r => <li key={r.slot + r.id} className={r.unlock <= decisions ? "got" : undefined}>{r.unlock <= decisions ? "✓" : "🔒"} {r.name} <span className="muted">· {r.unlock}</span></li>)}
      </ul>
    </div>
  );
}

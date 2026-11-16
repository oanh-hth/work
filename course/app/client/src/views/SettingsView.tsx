// Given: the Settings page: background (8.1), your own room (10.1, 10.2), sync status, backup and sign-out.
import { useApp } from "@app/client/src/state/AppContext";
import { download, todayKey } from "@app/client/src/views/shared";
import { ThemePicker } from "@app/client/src/components/ThemePicker";
import { RoomBuilder } from "@app/client/src/components/RoomBuilder";
import { ErrorBoundary } from "@app/client/src/components/ErrorBoundary";
import { SLOTS, DEFAULT_ROOM, buildRoom } from "@app/client/src/art/room";
import { setSlot, randomRoom, type Room } from "@app/shared/room-choices";

interface SettingsProps {
  onSignOut: () => void; syncText: string;
  backdrop: string; onBackdrop: (id: string) => void;
  room: Room; onRoom: (room: Room) => void;
}

export function SettingsView({ onSignOut, syncText, backdrop, onBackdrop, room, onRoom }: SettingsProps) {
  const { state } = useApp();
  return (
    <section className="card stack">
      <h1>Settings</h1>
      <h2>Background</h2>
      <p className="muted">An animated scene behind your tasks. Pick a ready-made room, or <b>My room</b> to put one together yourself. Animations stop when Reduce Motion is on.</p>
      <ErrorBoundary area="The theme picker"><ThemePicker value={backdrop} onChange={onBackdrop} /></ErrorBoundary>
      {backdrop === "custom" && <>
        <h2>Build your room</h2>
        <p className="muted">Choose each part. The room behind this panel changes as you go.</p>
        <div className="room-preview" aria-hidden="true" dangerouslySetInnerHTML={{ __html: buildRoom(room) }} />
        <ErrorBoundary area="The room builder">
          <RoomBuilder slots={SLOTS} room={room}
            onChange={(slotId, optionId) => onRoom(setSlot(SLOTS, DEFAULT_ROOM, room, slotId, optionId))}
            onRandom={() => onRoom(randomRoom(SLOTS))}
            onReset={() => onRoom(DEFAULT_ROOM)} />
        </ErrorBoundary>
      </>}
      <h2>Your data</h2>
      <p>{syncText}</p>
      <div><button onClick={() => download(`whybook-backup-${todayKey()}.json`, JSON.stringify({ app: "whybook", exportedAt: new Date().toISOString(), state }), "application/json")}>Download a backup</button></div>
      <h2>Account</h2>
      <div><button onClick={onSignOut}>Sign out</button></div>
    </section>
  );
}

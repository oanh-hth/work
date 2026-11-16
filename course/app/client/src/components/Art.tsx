// Given: React wrappers around the SVG art. The SVG strings are our own, so injecting them is safe.
// Never use dangerouslySetInnerHTML with text that a user or another site could control.
import { createContext, memo, useContext, useMemo } from "react";
import { GROUP_COLORS, THEMES, folderSvg, themeById, type Theme } from "@app/client/src/art/art";
import { DEFAULT_ROOM, buildRoom, roomBoardSpot, roomTint } from "@app/client/src/art/room";
import type { Room } from "@app/shared/room-choices";
import { NO_EXTRAS, type RoomExtras } from "@app/shared/room-extras";

/** The room you built (Part 10) and what you added to it (Part 11). The app shell provides it; scenes read it, so ThemePicker needn't know about it. */
export const RoomContext = createContext<{ room: Room; extras: RoomExtras }>({ room: DEFAULT_ROOM, extras: NO_EXTRAS });

/** The theme with this id. "My room" is drawn from the room; the others are ready-made. */
export function sceneFor(id: string, room: Room, extras: RoomExtras = NO_EXTRAS): Theme {
  const t = themeById(id);
  return t.id === "custom" ? { ...t, svg: buildRoom(room, extras), tint: roomTint(room, extras), board: roomBoardSpot(room, extras.pos) } : t;
}

export function FolderArt({ group, stickers }: { group: string; stickers: string[] }) {
  return <span className="folder-art" aria-hidden="true" dangerouslySetInnerHTML={{ __html: folderSvg(GROUP_COLORS[group] ?? "#8A93A6", stickers) }} />;
}

export function SceneThumb({ id }: { id: string }) {
  const { room, extras } = useContext(RoomContext);
  const t = useMemo(() => sceneFor(id, room, extras), [id, room, extras]);
  return <span className="thumb" aria-hidden="true" style={{ background: t.tint || "var(--paper)" }} dangerouslySetInnerHTML={{ __html: t.svg }} />;
}

/** The animated scene behind the whole app. Memoised: it is only drawn again when the room really changes, not on every render of the shell. */
export const Backdrop = memo(function Backdrop({ id }: { id: string }) {
  const { room, extras } = useContext(RoomContext);
  const svg = useMemo(() => sceneFor(id, room, extras).svg, [id, room, extras]);
  return <div className="backdrop" aria-hidden="true" dangerouslySetInnerHTML={{ __html: svg }} />;
});

export { THEMES };

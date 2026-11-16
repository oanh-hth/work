// Exercise 10.2: RoomBuilder. Read curriculum/part-10/b-the-room-builder.md first.
import type { Room } from "@app/shared/room-choices";
import type { RoomSlot } from "@app/client/src/art/room";
import { Todo } from "@app/client/src/components/Todo";

export interface RoomBuilderProps {
  slots: readonly RoomSlot[];
  room: Room;
  onChange: (slotId: string, optionId: string) => void;
  onRandom: () => void;
  onReset: () => void;
}

/**
 * <section aria-label="Build your room"> with, for each slot:
 * - an <h3> with the slot's name
 * - a <div role="radiogroup"> named by that heading (aria-labelledby + an id, e.g. from useId), with one
 *   <button type="button" role="radio" className="chip" aria-checked={chosen}> per option, named by the option's name.
 *   When the option has a `color`, start the button with <span className="swatch" style={{ background: color }} />.
 *   Clicking calls onChange(slot.id, option.id).
 * And two buttons: "Surprise me" (onRandom) and "Start again" (onReset).
 */
export function RoomBuilder(props: RoomBuilderProps) {
  // TODO 10.2
  return <Todo exercise="10.2" what="The room builder" />;
}

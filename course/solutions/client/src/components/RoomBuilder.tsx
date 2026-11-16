import { useId } from "react";
import type { Room } from "@app/shared/room-choices";
import type { RoomSlot } from "@app/client/src/art/room";

export interface RoomBuilderProps {
  slots: readonly RoomSlot[];
  room: Room;
  onChange: (slotId: string, optionId: string) => void;
  onRandom: () => void;
  onReset: () => void;
}

export function RoomBuilder({ slots, room, onChange, onRandom, onReset }: RoomBuilderProps) {
  const base = useId();
  return (
    <section aria-label="Build your room" className="stack">
      {slots.map(slot => (
        <div key={slot.id} className="slot">
          <h3 id={`${base}-${slot.id}`}>{slot.name}</h3>
          <div role="radiogroup" aria-labelledby={`${base}-${slot.id}`} className="chips">
            {slot.options.map(option => (
              <button key={option.id} type="button" role="radio" className="chip" aria-checked={room[slot.id] === option.id}
                onClick={() => onChange(slot.id, option.id)}>
                {option.color && <span className="swatch" style={{ background: option.color }} />}
                {option.name}
              </button>
            ))}
          </div>
        </div>
      ))}
      <div className="row">
        <button type="button" onClick={onRandom}>Surprise me</button>
        <button type="button" onClick={onReset}>Start again</button>
      </div>
    </section>
  );
}

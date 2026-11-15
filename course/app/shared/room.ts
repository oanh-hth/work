// Exercise 9.4: The room reflects your work. Read curriculum/part-9/c-a-room-that-reacts.md first.
import type { Day, Task } from "@app/shared/types";
import { weekSummary } from "@app/shared/summary";

export type TimeOfDay = "morning" | "day" | "evening" | "night";
export interface RoomState {
  time: TimeOfDay;           // night before 6, morning before 11, day before 17, evening before 21, then night again
  left: number;              // the share of today's work still open, from 1 (a full cup) to 0 (empty)
  mood: "calm" | "alert";    // alert when something is overdue: the plants droop
}

/** Part of the day for an hour from 0 to 23. */
export function timeOfDay(hour: number): TimeOfDay {
  // TODO 9.4
  throw new Error("TODO 9.4");
}

/**
 * Use weekSummary (2.4). Today's work = open + doneToday; left = open / today's work, and 1 when there is no work at all.
 * mood is "alert" when anything is overdue.
 */
export function roomState(tasks: readonly Task[], today: Day, hour: number): RoomState {
  // TODO 9.4
  throw new Error("TODO 9.4");
}

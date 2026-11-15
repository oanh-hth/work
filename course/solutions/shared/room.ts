// Reference solution for exercise 9.4.
import type { Day, Task } from "@app/shared/types";
import { weekSummary } from "@app/shared/summary";

export type TimeOfDay = "morning" | "day" | "evening" | "night";
export interface RoomState {
  time: TimeOfDay;           // night before 6, morning before 11, day before 17, evening before 21, then night again
  left: number;              // the share of today's work still open, from 1 (a full cup) to 0 (empty)
  mood: "calm" | "alert";    // alert when something is overdue: the plants droop
}

export function timeOfDay(hour: number): TimeOfDay {
  if (hour < 6) return "night";
  if (hour < 11) return "morning";
  if (hour < 17) return "day";
  if (hour < 21) return "evening";
  return "night";
}

export function roomState(tasks: readonly Task[], today: Day, hour: number): RoomState {
  const s = weekSummary(tasks, today);
  const work = s.open + s.doneToday;
  return { time: timeOfDay(hour), left: work ? s.open / work : 1, mood: s.overdue > 0 ? "alert" : "calm" };
}

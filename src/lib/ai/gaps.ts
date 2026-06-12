import type { DraftSession } from "@/lib/evenn/types";
import { toClock, toMinutes } from "@/lib/evenn/time";

// When the agenda leaves a long hole in a day (nothing relevant running),
// fill it with a micro-meetup: a short networking slot with attendees who
// share the user's interests. Micro items get negative indexes so they never
// collide with real session indexes.

const MIN_GAP = 75; // minutes free before a meetup is worth inserting
const BREAK = 15; // short breather either side of the meetup
const MEETUP_MAX = 40;

export function fillGapsWithMeetups(
  draft: DraftSession[],
  topics: string[]
): DraftSession[] {
  const out: DraftSession[] = [];
  let n = 0;

  draft.forEach((item, i) => {
    out.push(item);
    const next = draft[i + 1];
    if (!next || next.day !== item.day) return;

    const end = toMinutes(item.endsAt);
    const start = toMinutes(next.startsAt);
    if (end === null || start === null || start - end < MIN_GAP) return;

    const topic = topics[n % Math.max(topics.length, 1)] ?? "your field";
    n += 1;
    const from = end + BREAK;
    out.push({
      index: -n,
      day: item.day,
      startsAt: toClock(from),
      endsAt: toClock(Math.min(from + MEETUP_MAX, start - BREAK)),
      title: `Micro-meetup: ${topic}`,
      room: "Networking lounge",
      type: "micro",
      reason: `Free hour — meet attendees who share your interest in ${topic}`,
    });
  });

  return out;
}

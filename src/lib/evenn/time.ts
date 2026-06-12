// Tiny helpers for the "HH:MM" display times used across demo and DB sessions.

export function toMinutes(value: string | null | undefined): number | null {
  const m = /(\d{1,2}):(\d{2})/.exec(value ?? "");
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

export function toClock(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

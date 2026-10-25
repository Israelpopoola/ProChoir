/** Today's date (YYYY-MM-DD) in the church's time zone. */
export function todayISO(): string {
  const timeZone = process.env.CHOIR_TIMEZONE || "America/Chicago";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function parse(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function formatServiceDate(iso: string): string {
  return parse(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function shortDate(iso: string): { day: string; month: string; weekday: string } {
  const d = parse(iso);
  return {
    day: String(d.getUTCDate()),
    month: d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }),
    weekday: d.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }),
  };
}

/** "Today", "Tomorrow", "In 5 days" — or null if further out than two weeks. */
export function relativeDay(iso: string, today: string): string | null {
  const diff = Math.round((parse(iso).getTime() - parse(today).getTime()) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff > 1 && diff <= 13) return `In ${diff} days`;
  return null;
}

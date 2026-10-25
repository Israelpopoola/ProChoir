import Link from "next/link";
import { SetlistDrawer } from "@/components/SetlistDrawer";
import { SetupNotice } from "@/components/SetupNotice";
import { getUpcomingSetlists } from "@/lib/data";
import { formatServiceDate, relativeDay, shortDate, todayISO } from "@/lib/dates";
import { isConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function Home() {
  if (!isConfigured) return <SetupNotice />;

  const today = todayISO();
  const setlists = await getUpcomingSetlists(today);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Upcoming</h1>
        <p className="text-sm text-muted">Tap a service to see its songs.</p>
      </div>

      {setlists.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted">
          No upcoming set lists yet. Check back soon!
        </div>
      ) : (
        <div className="space-y-3">
          {setlists.map((s, i) => (
            <SetlistDrawer
              key={s.id}
              setlist={s}
              dateLabel={shortDate(s.service_date)}
              longDate={formatServiceDate(s.service_date)}
              badge={relativeDay(s.service_date, today)}
              defaultOpen={i === 0}
            />
          ))}
        </div>
      )}

      <Link href="/past" className="block py-2 text-center text-sm font-medium text-muted hover:text-accent">
        See past set lists
      </Link>
    </div>
  );
}

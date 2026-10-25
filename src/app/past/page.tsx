import Link from "next/link";
import { SetupNotice } from "@/components/SetupNotice";
import { ChevronRight } from "@/components/icons";
import { getPastSetlists } from "@/lib/data";
import { formatServiceDate, todayISO } from "@/lib/dates";
import { isConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const metadata = { title: "Past set lists" };

export default async function PastPage() {
  if (!isConfigured) return <SetupNotice />;
  const setlists = await getPastSetlists(todayISO());

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Past set lists</h1>
      {setlists.length === 0 ? (
        <p className="text-muted">Nothing here yet.</p>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
          {setlists.map((s) => (
            <li key={s.id}>
              <Link href={`/setlists/${s.id}`} className="flex items-center gap-3 p-4 active:opacity-60">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{s.title}</p>
                  <p className="text-sm text-muted">
                    {formatServiceDate(s.service_date)} · {s.setlist_songs.length} songs
                  </p>
                </div>
                <ChevronRight className="size-4 text-muted" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

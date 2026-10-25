import Link from "next/link";
import { notFound } from "next/navigation";
import { ExportSetlistButton } from "@/components/ExportButtons";
import { BookIcon, ChevronLeft, ChevronRight } from "@/components/icons";
import { SetupNotice } from "@/components/SetupNotice";
import { ShareButton } from "@/components/ShareButton";
import { getSetlist } from "@/lib/data";
import { formatServiceDate } from "@/lib/dates";
import { isConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/setlists/[id]">) {
  if (!isConfigured) return {};
  const s = await getSetlist((await params).id);
  return { title: s ? `${s.title} – ${formatServiceDate(s.service_date)}` : "Set list" };
}

export default async function SetlistPage({ params }: PageProps<"/setlists/[id]">) {
  if (!isConfigured) return <SetupNotice />;
  const setlist = await getSetlist((await params).id);
  if (!setlist) notFound();
  const items = setlist.setlist_songs.filter((i) => i.songs);
  const longDate = formatServiceDate(setlist.service_date);

  return (
    <div className="space-y-5">
      <Link href="/" className="flex items-center gap-1 text-sm font-medium text-muted">
        <ChevronLeft className="size-4" /> All set lists
      </Link>
      <header>
        <p className="text-sm font-semibold text-accent">{longDate}</p>
        <h1 className="text-2xl font-bold tracking-tight">{setlist.title}</h1>
      </header>
      {setlist.notes && <p className="whitespace-pre-wrap rounded-2xl bg-surface-2 p-3 text-sm">{setlist.notes}</p>}

      <ol className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
        {items.map((item, i) => (
          <li key={item.id}>
            <Link href={`/songs/${item.song_id}?set=${setlist.id}`} className="flex items-center gap-3 p-4 active:opacity-60">
              <span className="w-6 text-center font-semibold text-muted">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{item.songs!.title}</p>
                {(item.notes || item.songs!.artist) && <p className="truncate text-sm text-muted">{item.notes || item.songs!.artist}</p>}
              </div>
              {(item.song_key || item.songs!.song_key) && (
                <span className="rounded-lg bg-surface-2 px-2 py-1 text-xs font-semibold">{item.song_key || item.songs!.song_key}</span>
              )}
              <ChevronRight className="size-4 text-muted" />
            </Link>
          </li>
        ))}
        {items.length === 0 && <li className="p-6 text-center text-muted">No songs added yet.</li>}
      </ol>

      <div className="grid grid-cols-2 gap-2">
        <Link href={`/setlists/${setlist.id}/lyrics`} className="btn btn-primary col-span-2">
          <BookIcon className="size-4" /> All lyrics in order
        </Link>
        <ShareButton path={`/setlists/${setlist.id}`} title={`${setlist.title} – ${longDate}`} />
        <ExportSetlistButton
          setlistTitle={setlist.title}
          date={setlist.service_date}
          songIds={items.map((i) => i.song_id)}
          className="btn btn-secondary text-sm"
        />
      </div>
    </div>
  );
}

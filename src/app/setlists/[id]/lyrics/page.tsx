import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "@/components/icons";
import { Lyrics, TextSizeControls } from "@/components/Lyrics";
import { SetupNotice } from "@/components/SetupNotice";
import { getSetlist, getSongsByIds } from "@/lib/data";
import { formatServiceDate } from "@/lib/dates";
import { isServerConfigured as isConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const metadata = { title: "Lyrics" };

export default async function SetlistLyricsPage({ params }: PageProps<"/setlists/[id]/lyrics">) {
  if (!isConfigured) return <SetupNotice />;
  const setlist = await getSetlist((await params).id);
  if (!setlist) notFound();
  const items = setlist.setlist_songs.filter((i) => i.songs);
  const songs = new Map((await getSongsByIds(items.map((i) => i.song_id))).map((s) => [s.id, s]));

  return (
    <div className="space-y-5">
      <Link href={`/setlists/${setlist.id}`} className="flex items-center gap-1 text-sm font-medium text-muted">
        <ChevronLeft className="size-4" /> {setlist.title} · {formatServiceDate(setlist.service_date)}
      </Link>

      <div className="sticky top-[69px] z-10 -mx-4 flex items-center gap-2 overflow-x-auto bg-bg/90 px-4 py-2 backdrop-blur">
        <TextSizeControls />
        {items.map((item, i) => (
          <a key={item.id} href={`#song-${i + 1}`} className="shrink-0 rounded-full bg-surface-2 px-3 py-1.5 text-sm font-medium">
            {i + 1}. {item.songs!.title}
          </a>
        ))}
      </div>

      {items.map((item, i) => {
        const song = songs.get(item.song_id);
        if (!song) return null;
        const key = item.song_key || song.song_key;
        return (
          <section key={item.id} id={`song-${i + 1}`} className="scroll-mt-32 rounded-2xl border border-border bg-surface p-5">
            <header className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-muted">Song {i + 1}</p>
                <h2 className="text-xl font-bold leading-tight">{song.title}</h2>
                {item.notes && <p className="text-sm text-muted">{item.notes}</p>}
              </div>
              {key && <span className="rounded-lg bg-accent-soft px-2 py-1 text-sm font-bold text-accent">{key}</span>}
            </header>
            <Lyrics text={song.lyrics} />
          </section>
        );
      })}
    </div>
  );
}

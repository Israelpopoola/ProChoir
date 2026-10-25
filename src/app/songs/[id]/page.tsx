import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyLyricsButton } from "@/components/CopyLyricsButton";
import { ExportSongButton } from "@/components/ExportButtons";
import { ChevronLeft, ChevronRight } from "@/components/icons";
import { Lyrics, TextSizeControls } from "@/components/Lyrics";
import { MediaList } from "@/components/MediaList";
import { SetupNotice } from "@/components/SetupNotice";
import { getSetlist, getSong } from "@/lib/data";
import { formatServiceDate } from "@/lib/dates";
import { isServerConfigured as isConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/songs/[id]">) {
  if (!isConfigured) return {};
  const found = await getSong((await params).id);
  return { title: found?.song.title ?? "Song" };
}

export default async function SongPage({ params, searchParams }: PageProps<"/songs/[id]">) {
  if (!isConfigured) return <SetupNotice />;
  const { id } = await params;
  const { set } = await searchParams;
  const setId = typeof set === "string" ? set : undefined;

  const [found, setlist] = await Promise.all([getSong(id), setId ? getSetlist(setId) : null]);
  if (!found) notFound();
  const { song, media } = found;

  // When opened from a set list: show its position, key override and prev/next
  const items = setlist?.setlist_songs.filter((i) => i.songs) ?? [];
  const index = items.findIndex((i) => i.song_id === id);
  const item = index >= 0 ? items[index] : null;
  const prev = index > 0 ? items[index - 1] : null;
  const next = index >= 0 && index < items.length - 1 ? items[index + 1] : null;
  const key = item?.song_key || song.song_key;

  return (
    <article className="space-y-5">
      {setlist && item ? (
        <Link href={`/setlists/${setlist.id}`} className="flex items-center gap-1 text-sm font-medium text-muted">
          <ChevronLeft className="size-4" />
          {setlist.title} · {formatServiceDate(setlist.service_date)} · {index + 1} of {items.length}
        </Link>
      ) : (
        <Link href="/songs" className="flex items-center gap-1 text-sm font-medium text-muted">
          <ChevronLeft className="size-4" />
          All songs
        </Link>
      )}

      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold leading-tight tracking-tight">{song.title}</h1>
          {song.artist && <p className="text-muted">{song.artist}</p>}
        </div>
        {key && (
          <div className="shrink-0 rounded-xl bg-accent-soft px-3 py-1.5 text-center text-accent">
            <p className="text-[10px] font-semibold uppercase leading-none">Key</p>
            <p className="text-lg font-bold leading-tight">{key}</p>
          </div>
        )}
      </header>

      {(item?.notes || song.notes) && (
        <div className="space-y-1 rounded-2xl bg-surface-2 p-3 text-sm">
          {item?.notes && <p className="whitespace-pre-wrap font-medium">{item.notes}</p>}
          {song.notes && <p className="whitespace-pre-wrap text-muted">{song.notes}</p>}
        </div>
      )}

      <MediaList media={media} />

      <section className="rounded-2xl border border-border bg-surface p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted">Lyrics</h2>
          <TextSizeControls />
        </div>
        <Lyrics text={song.lyrics} />
      </section>

      <div className="flex flex-wrap gap-2">
        <CopyLyricsButton lyrics={song.lyrics} />
        <ExportSongButton title={song.title} lyrics={song.lyrics} />
      </div>

      {setlist && (prev || next) && (
        <nav className="grid grid-cols-2 gap-2 pt-2">
          {prev ? (
            <Link href={`/songs/${prev.song_id}?set=${setlist.id}`} className="rounded-2xl border border-border bg-surface p-3">
              <span className="flex items-center gap-1 text-xs text-muted">
                <ChevronLeft className="size-3" /> Previous
              </span>
              <span className="block truncate font-medium">{prev.songs!.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={`/songs/${next.song_id}?set=${setlist.id}`} className="rounded-2xl border border-border bg-surface p-3 text-right">
              <span className="flex items-center justify-end gap-1 text-xs text-muted">
                Next <ChevronRight className="size-3" />
              </span>
              <span className="block truncate font-medium">{next.songs!.title}</span>
            </Link>
          )}
        </nav>
      )}
    </article>
  );
}

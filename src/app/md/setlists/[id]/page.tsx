"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowUp, ChevronDown, ChevronLeft, PlusIcon, SearchIcon, TrashIcon } from "@/components/icons";
import { browserClient } from "@/lib/supabase";

type SongRow = { id: string; title: string; artist: string | null; song_key: string | null };
type Item = { key: string; song_id: string; song_key: string; notes: string };

function nextSunday() {
  const d = new Date();
  d.setDate(d.getDate() + ((7 - d.getDay()) % 7 || 7));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function SetlistEditorPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";
  const router = useRouter();
  const db = browserClient();

  const [date, setDate] = useState(nextSunday);
  const [title, setTitle] = useState("Sunday Service");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [library, setLibrary] = useState<SongRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    const songsQ = db.from("songs").select("id, title, artist, song_key").order("title");
    const setQ = isNew
      ? Promise.resolve({ data: null })
      : db.from("setlists").select("*, setlist_songs(*)").eq("id", id).maybeSingle();
    Promise.all([songsQ, setQ]).then(([{ data: songs }, { data: s }]) => {
      setLibrary((songs as SongRow[]) ?? []);
      if (s) {
        setDate(s.service_date);
        setTitle(s.title);
        setNotes(s.notes ?? "");
        setItems(
          [...s.setlist_songs]
            .sort((a: { position: number }, b: { position: number }) => a.position - b.position)
            .map((i: { id: string; song_id: string; song_key: string | null; notes: string | null }) => ({
              key: i.id,
              song_id: i.song_id,
              song_key: i.song_key ?? "",
              notes: i.notes ?? "",
            })),
        );
      }
      setLoaded(true);
    });
  }, [id, isNew, db]);

  const songById = useMemo(() => new Map(library.map((s) => [s.id, s])), [library]);
  const matches = useMemo(() => {
    const t = q.toLowerCase().trim();
    if (!t) return [];
    return library.filter((s) => `${s.title} ${s.artist ?? ""}`.toLowerCase().includes(t)).slice(0, 8);
  }, [q, library]);

  function add(song: SongRow) {
    setItems((xs) => [...xs, { key: crypto.randomUUID(), song_id: song.id, song_key: "", notes: "" }]);
    setQ("");
  }
  function move(i: number, dir: -1 | 1) {
    setItems((xs) => {
      const j = i + dir;
      if (j < 0 || j >= xs.length) return xs;
      const copy = [...xs];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });
  }
  function update(i: number, patch: Partial<Item>) {
    setItems((xs) => xs.map((x, k) => (k === i ? { ...x, ...patch } : x)));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    const row = { service_date: date, title: title.trim() || "Service", notes: notes.trim() || null, updated_at: new Date().toISOString() };

    let setlistId = id;
    if (isNew) {
      const { data, error } = await db.from("setlists").insert(row).select("id").single();
      if (error) {
        setSaving(false);
        return setStatus(error.message);
      }
      setlistId = data.id;
    } else {
      const { error } = await db.from("setlists").update(row).eq("id", id);
      if (error) {
        setSaving(false);
        return setStatus(error.message);
      }
      const { error: delErr } = await db.from("setlist_songs").delete().eq("setlist_id", id);
      if (delErr) {
        setSaving(false);
        return setStatus(delErr.message);
      }
    }

    if (items.length) {
      const { error } = await db.from("setlist_songs").insert(
        items.map((it, position) => ({
          setlist_id: setlistId,
          song_id: it.song_id,
          position,
          song_key: it.song_key.trim() || null,
          notes: it.notes.trim() || null,
        })),
      );
      if (error) {
        setSaving(false);
        return setStatus(error.message);
      }
    }
    setSaving(false);
    if (isNew) router.replace(`/md/setlists/${setlistId}`);
    else setStatus("Saved ✓");
  }

  async function remove() {
    if (!confirm("Delete this set list? The songs themselves stay in the library.")) return;
    const { error } = await db.from("setlists").delete().eq("id", id);
    if (error) return alert(error.message);
    router.replace("/md");
  }

  if (!loaded) return <p className="py-10 text-center text-muted">Loading…</p>;

  return (
    <div className="space-y-6">
      <Link href="/md" className="flex items-center gap-1 text-sm font-medium text-muted">
        <ChevronLeft className="size-4" /> Dashboard
      </Link>
      <h1 className="text-2xl font-bold tracking-tight">{isNew ? "New set list" : "Edit set list"}</h1>

      <form onSubmit={save} className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold">Date</span>
            <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} required />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold">Service</span>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Sunday Service" />
          </label>
        </div>
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold">Notes for the choir</span>
          <textarea className="input min-h-20" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Call time 8:30am, wear white…" />
        </label>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold">Songs ({items.length})</h2>
          {items.length > 0 && (
            <ol className="space-y-2">
              {items.map((it, i) => {
                const s = songById.get(it.song_id);
                return (
                  <li key={it.key} className="rounded-2xl border border-border bg-surface p-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 text-center text-sm font-bold text-muted">{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{s?.title ?? "Deleted song"}</p>
                        {s?.song_key && <p className="text-xs text-muted">Usual key {s.song_key}</p>}
                      </div>
                      <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="rounded-lg p-2 text-muted disabled:opacity-30" aria-label="Move up">
                        <ArrowUp className="size-4" />
                      </button>
                      <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} className="rounded-lg p-2 text-muted disabled:opacity-30" aria-label="Move down">
                        <ChevronDown className="size-4" />
                      </button>
                      <button type="button" onClick={() => setItems((xs) => xs.filter((_, k) => k !== i))} className="rounded-lg p-2 text-muted hover:text-danger" aria-label="Remove">
                        <TrashIcon className="size-4" />
                      </button>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2 pl-8">
                      <input className="input py-1.5 text-sm" placeholder="Key" value={it.song_key} onChange={(e) => update(i, { song_key: e.target.value })} />
                      <input className="input col-span-2 py-1.5 text-sm" placeholder="Note (e.g. Sarah leads)" value={it.notes} onChange={(e) => update(i, { notes: e.target.value })} />
                    </div>
                  </li>
                );
              })}
            </ol>
          )}

          <div className="rounded-2xl border border-dashed border-border p-3">
            <label className="relative block">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted" />
              <input className="input pl-10" placeholder="Add a song — start typing" value={q} onChange={(e) => setQ(e.target.value)} />
            </label>
            {matches.length > 0 && (
              <ul className="mt-2 divide-y divide-border">
                {matches.map((s) => (
                  <li key={s.id}>
                    <button type="button" onClick={() => add(s)} className="flex w-full items-center gap-3 py-2.5 text-left">
                      <PlusIcon className="size-4 text-accent" />
                      <span className="min-w-0 flex-1 truncate">{s.title}</span>
                      {s.song_key && <span className="text-xs text-muted">{s.song_key}</span>}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {q && matches.length === 0 && (
              <p className="mt-2 text-sm text-muted">
                Not in the library yet.{" "}
                <Link href="/md/songs/new" className="font-medium text-accent underline">
                  Add it as a new song
                </Link>
              </p>
            )}
          </div>
        </section>

        <div className="sticky bottom-4 z-10 flex items-center gap-3 rounded-2xl border border-border bg-surface/95 p-2 backdrop-blur">
          <button type="submit" className="btn btn-primary flex-1" disabled={saving}>
            {saving ? "Saving…" : isNew ? "Create set list" : "Save changes"}
          </button>
          {status && <span className="pr-2 text-sm text-muted">{status}</span>}
        </div>
      </form>

      {!isNew && (
        <div className="flex justify-between gap-2 border-t border-border pt-6">
          <Link href={`/setlists/${id}`} className="btn btn-secondary">
            View as choir
          </Link>
          <button onClick={remove} className="btn btn-danger">
            <TrashIcon className="size-4" /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronLeft, LinkIcon, PlayIcon, TrashIcon } from "@/components/icons";
import { audioUrl, browserClient } from "@/lib/supabase";
import type { Song, SongMedia } from "@/lib/types";

const MAX_MB = 50;
const LYRICS_HELP = `[Verse 1]
Line one
Line two

[Chorus]
Line one
Line two`;

type Form = { title: string; artist: string; song_key: string; lyrics: string; notes: string };
const empty: Form = { title: "", artist: "", song_key: "", lyrics: "", notes: "" };

export default function SongEditorPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";
  const router = useRouter();
  const db = browserClient();

  const [form, setForm] = useState<Form>(empty);
  const [media, setMedia] = useState<SongMedia[]>([]);
  const [loaded, setLoaded] = useState(isNew);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (isNew) return;
    Promise.all([
      db.from("songs").select("*").eq("id", id).maybeSingle(),
      db.from("song_media").select("*").eq("song_id", id).order("position").order("created_at"),
    ]).then(([{ data: song }, { data: m }]) => {
      if (song) {
        const s = song as Song;
        setForm({ title: s.title, artist: s.artist ?? "", song_key: s.song_key ?? "", lyrics: s.lyrics, notes: s.notes ?? "" });
      }
      setMedia((m as SongMedia[]) ?? []);
      setLoaded(true);
    });
  }, [id, isNew, db]);

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    const row = {
      title: form.title.trim(),
      artist: form.artist.trim() || null,
      song_key: form.song_key.trim() || null,
      lyrics: form.lyrics,
      notes: form.notes.trim() || null,
      updated_at: new Date().toISOString(),
    };
    if (isNew) {
      const { data, error } = await db.from("songs").insert(row).select("id").single();
      setSaving(false);
      if (error) return setStatus(error.message);
      router.replace(`/md/songs/${data.id}`);
    } else {
      const { error } = await db.from("songs").update(row).eq("id", id);
      setSaving(false);
      setStatus(error ? error.message : "Saved ✓");
    }
  }

  async function remove() {
    if (!confirm(`Delete "${form.title}"? It will also be removed from any set lists.`)) return;
    const paths = media.filter((m) => m.storage_path).map((m) => m.storage_path!);
    if (paths.length) await db.storage.from("audio").remove(paths);
    const { error } = await db.from("songs").delete().eq("id", id);
    if (error) return alert(error.message);
    router.replace("/md");
  }

  if (!loaded) return <p className="py-10 text-center text-muted">Loading…</p>;

  return (
    <div className="space-y-6">
      <Link href="/md" className="flex items-center gap-1 text-sm font-medium text-muted">
        <ChevronLeft className="size-4" /> Dashboard
      </Link>
      <h1 className="text-2xl font-bold tracking-tight">{isNew ? "New song" : "Edit song"}</h1>

      <form onSubmit={save} className="space-y-4">
        <Field label="Title">
          <input className="input" value={form.title} onChange={set("title")} required />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <Field label="Artist / writer">
              <input className="input" value={form.artist} onChange={set("artist")} />
            </Field>
          </div>
          <Field label="Key">
            <input className="input" value={form.song_key} onChange={set("song_key")} placeholder="G" />
          </Field>
        </div>
        <Field label="Lyrics" hint="Put a blank line between slides. Label sections like [Verse 1], [Chorus], [Bridge].">
          <textarea className="input min-h-80 font-mono text-[15px] leading-relaxed" value={form.lyrics} onChange={set("lyrics")} placeholder={LYRICS_HELP} />
        </Field>
        <Field label="Notes for the choir" hint="Parts, harmonies, who leads, anything to remember.">
          <textarea className="input min-h-24" value={form.notes} onChange={set("notes")} />
        </Field>
        <div className="sticky bottom-4 z-10 flex items-center gap-3 rounded-2xl border border-border bg-surface/95 p-2 backdrop-blur">
          <button type="submit" className="btn btn-primary flex-1" disabled={saving || !form.title.trim()}>
            {saving ? "Saving…" : isNew ? "Create song" : "Save changes"}
          </button>
          {status && <span className="pr-2 text-sm text-muted">{status}</span>}
        </div>
      </form>

      {isNew ? (
        <p className="rounded-2xl border border-dashed border-border p-4 text-center text-sm text-muted">
          Create the song first, then you can add links and audio.
        </p>
      ) : (
        <>
          <MediaEditor songId={id} media={media} setMedia={setMedia} />
          <div className="flex justify-between gap-2 border-t border-border pt-6">
            <Link href={`/songs/${id}`} className="btn btn-secondary">
              View as choir
            </Link>
            <button onClick={remove} className="btn btn-danger">
              <TrashIcon className="size-4" /> Delete song
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-semibold">{label}</span>
      {children}
      {hint && <span className="block text-xs text-muted">{hint}</span>}
    </label>
  );
}

function MediaEditor({ songId, media, setMedia }: { songId: string; media: SongMedia[]; setMedia: (m: SongMedia[]) => void }) {
  const db = browserClient();
  const [linkLabel, setLinkLabel] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [audioLabel, setAudioLabel] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function addLink(e: React.FormEvent) {
    e.preventDefault();
    let url = linkUrl.trim();
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
    setBusy("link");
    const { data, error } = await db
      .from("song_media")
      .insert({ song_id: songId, kind: "link", label: linkLabel.trim(), url, position: media.length })
      .select()
      .single();
    setBusy(null);
    if (error) return alert(error.message);
    setMedia([...media, data as SongMedia]);
    setLinkLabel("");
    setLinkUrl("");
  }

  async function addAudio(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    if (file.size > MAX_MB * 1024 * 1024) {
      return alert(`That file is ${(file.size / 1048576).toFixed(0)} MB. The limit is ${MAX_MB} MB — export it as an MP3 first, or add it as a link instead.`);
    }
    setBusy("audio");
    const safe = file.name.replace(/[^a-zA-Z0-9._-]+/g, "_");
    const path = `${songId}/${crypto.randomUUID().slice(0, 8)}-${safe}`;
    // Long cache: once a phone has played it, replays come from the phone, not Supabase.
    const { error: upErr } = await db.storage.from("audio").upload(path, file, {
      cacheControl: "31536000",
      contentType: file.type || "audio/mpeg",
    });
    if (upErr) {
      setBusy(null);
      return alert(upErr.message);
    }
    const label = audioLabel.trim() || file.name.replace(/\.[^.]+$/, "");
    const { data, error } = await db
      .from("song_media")
      .insert({ song_id: songId, kind: "audio", label, storage_path: path, position: media.length })
      .select()
      .single();
    setBusy(null);
    if (error) return alert(error.message);
    setMedia([...media, data as SongMedia]);
    setAudioLabel("");
    setFile(null);
    (e.target as HTMLFormElement).reset();
  }

  async function removeMedia(m: SongMedia) {
    if (!confirm(`Remove "${m.label || m.url}"?`)) return;
    if (m.storage_path) await db.storage.from("audio").remove([m.storage_path]);
    const { error } = await db.from("song_media").delete().eq("id", m.id);
    if (error) return alert(error.message);
    setMedia(media.filter((x) => x.id !== m.id));
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold">Links &amp; audio</h2>

      {media.length > 0 && (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
          {media.map((m) => (
            <li key={m.id} className="flex items-center gap-3 p-3">
              {m.kind === "audio" ? <PlayIcon className="size-4 shrink-0 text-accent" /> : <LinkIcon className="size-4 shrink-0 text-accent" />}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{m.label || "Untitled"}</p>
                {m.kind === "link" ? (
                  <a href={m.url!} target="_blank" rel="noopener noreferrer" className="block truncate text-xs text-muted underline">
                    {m.url}
                  </a>
                ) : (
                  <audio controls preload="none" src={audioUrl(m.storage_path!)} className="mt-1 h-8 w-full" />
                )}
              </div>
              <button onClick={() => removeMedia(m)} className="shrink-0 p-2 text-muted hover:text-danger" aria-label="Remove">
                <TrashIcon className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={addLink} className="space-y-2 rounded-2xl border border-border bg-surface p-4">
        <p className="text-sm font-semibold">Add a link</p>
        <p className="text-xs text-muted">YouTube, Spotify, Google Drive… Links don&apos;t use any of your storage.</p>
        <input className="input" placeholder="Label (e.g. Original, Live version)" value={linkLabel} onChange={(e) => setLinkLabel(e.target.value)} />
        <input className="input" placeholder="https://…" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} required inputMode="url" />
        <button className="btn btn-secondary w-full" disabled={busy !== null}>
          {busy === "link" ? "Adding…" : "Add link"}
        </button>
      </form>

      <form onSubmit={addAudio} className="space-y-2 rounded-2xl border border-border bg-surface p-4">
        <p className="text-sm font-semibold">Upload audio</p>
        <p className="text-xs text-muted">Part tracks, rehearsal recordings. MP3 works best (up to {MAX_MB} MB).</p>
        <input className="input" placeholder="Label (e.g. Alto part, Full rehearsal)" value={audioLabel} onChange={(e) => setAudioLabel(e.target.value)} />
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-surface-2 file:px-3 file:py-2 file:font-semibold"
          required
        />
        <button className="btn btn-secondary w-full" disabled={busy !== null || !file}>
          {busy === "audio" ? "Uploading…" : "Upload"}
        </button>
      </form>
    </section>
  );
}

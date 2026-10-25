"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronRight, PlusIcon, SearchIcon } from "@/components/icons";
import { browserClient } from "@/lib/supabase";

type Row = { id: string; service_date: string; title: string; setlist_songs: { count: number }[] };
type SongRow = { id: string; title: string; artist: string | null; song_key: string | null };

function fmt(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function MdDashboard() {
  const [tab, setTab] = useState<"setlists" | "songs">("setlists");
  const [setlists, setSetlists] = useState<Row[] | null>(null);
  const [songs, setSongs] = useState<SongRow[] | null>(null);
  const [showPast, setShowPast] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    const db = browserClient();
    db.from("setlists")
      .select("id, service_date, title, setlist_songs(count)")
      .order("service_date", { ascending: false })
      .then(({ data }) => setSetlists((data as Row[]) ?? []));
    db.from("songs")
      .select("id, title, artist, song_key")
      .order("title")
      .then(({ data }) => setSongs((data as SongRow[]) ?? []));
  }, []);

  const today = localToday();
  const upcoming = (setlists ?? []).filter((s) => s.service_date >= today).reverse();
  const past = (setlists ?? []).filter((s) => s.service_date < today);
  const filteredSongs = useMemo(() => {
    const t = q.toLowerCase().trim();
    return (songs ?? []).filter((s) => !t || `${s.title} ${s.artist ?? ""}`.toLowerCase().includes(t));
  }, [songs, q]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 rounded-xl bg-surface-2 p-1 text-sm font-semibold">
        {(["setlists", "songs"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-lg py-2 ${tab === t ? "bg-surface shadow-sm" : "text-muted"}`}>
            {t === "setlists" ? "Set lists" : "Songs"}
          </button>
        ))}
      </div>

      {tab === "setlists" ? (
        <>
          <Link href="/md/setlists/new" className="btn btn-primary w-full">
            <PlusIcon className="size-4" /> New set list
          </Link>
          {setlists === null ? (
            <p className="text-center text-muted">Loading…</p>
          ) : (
            <>
              <h2 className="px-1 text-xs font-bold uppercase tracking-wider text-muted">Upcoming</h2>
              <List
                rows={upcoming.map((s) => ({ id: s.id, href: `/md/setlists/${s.id}`, title: s.title, sub: `${fmt(s.service_date)} · ${s.setlist_songs[0]?.count ?? 0} songs` }))}
                empty="No upcoming set lists."
              />
              {past.length > 0 && (
                <>
                  <button onClick={() => setShowPast((v) => !v)} className="w-full py-2 text-sm font-medium text-muted">
                    {showPast ? "Hide" : "Show"} past set lists ({past.length})
                  </button>
                  {showPast && (
                    <List
                      rows={past.map((s) => ({ id: s.id, href: `/md/setlists/${s.id}`, title: s.title, sub: `${fmt(s.service_date)} · ${s.setlist_songs[0]?.count ?? 0} songs` }))}
                      empty=""
                    />
                  )}
                </>
              )}
            </>
          )}
        </>
      ) : (
        <>
          <Link href="/md/songs/new" className="btn btn-primary w-full">
            <PlusIcon className="size-4" /> New song
          </Link>
          <label className="relative block">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted" />
            <input type="search" className="input pl-10" placeholder="Search songs" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          {songs === null ? (
            <p className="text-center text-muted">Loading…</p>
          ) : (
            <List
              rows={filteredSongs.map((s) => ({ id: s.id, href: `/md/songs/${s.id}`, title: s.title, sub: [s.artist, s.song_key && `Key ${s.song_key}`].filter(Boolean).join(" · ") }))}
              empty={q ? "No songs match." : "No songs yet — add your first one."}
            />
          )}
        </>
      )}
    </div>
  );
}

function List({ rows, empty }: { rows: { id: string; href: string; title: string; sub: string }[]; empty: string }) {
  if (rows.length === 0) return empty ? <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">{empty}</p> : null;
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
      {rows.map((r) => (
        <li key={r.id}>
          <Link href={r.href} className="flex items-center gap-3 p-4 active:opacity-60">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{r.title}</p>
              {r.sub && <p className="truncate text-sm text-muted">{r.sub}</p>}
            </div>
            <ChevronRight className="size-4 text-muted" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronRight, SearchIcon } from "./icons";

export type SongSummary = { id: string; title: string; artist: string | null; song_key: string | null; lyrics: string };

function norm(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]/g, "");
}

export function SongSearch({ songs }: { songs: SongSummary[] }) {
  const [q, setQ] = useState("");
  const indexed = useMemo(
    () => songs.map((s) => ({ s, head: norm(`${s.title} ${s.artist ?? ""}`), body: norm(s.lyrics) })),
    [songs],
  );
  const query = norm(q).trim();
  const results = query
    ? indexed
        .filter((x) => x.head.includes(query) || x.body.includes(query))
        .sort((a, b) => Number(b.head.includes(query)) - Number(a.head.includes(query)))
    : indexed;

  return (
    <div className="space-y-3">
      <label className="relative block">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search titles, artists or lyrics"
          className="input pl-10"
        />
      </label>
      <p className="px-1 text-xs text-muted">
        {results.length} {results.length === 1 ? "song" : "songs"}
      </p>
      <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
        {results.map(({ s, head }) => {
          const lyricMatch = query && !head.includes(query) ? lyricSnippet(s.lyrics, query) : null;
          return (
            <li key={s.id}>
              <Link href={`/songs/${s.id}`} className="flex items-center gap-3 p-4 active:opacity-60">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{s.title}</p>
                  <p className="truncate text-sm text-muted">{lyricMatch ? `“…${lyricMatch}…”` : s.artist}</p>
                </div>
                {s.song_key && <span className="rounded-lg bg-surface-2 px-2 py-1 text-xs font-semibold">{s.song_key}</span>}
                <ChevronRight className="size-4 text-muted" />
              </Link>
            </li>
          );
        })}
        {results.length === 0 && <li className="p-6 text-center text-muted">No songs found.</li>}
      </ul>
    </div>
  );
}

function lyricSnippet(lyrics: string, query: string): string | null {
  const line = lyrics.split("\n").find((l) => norm(l).includes(query));
  return line ? line.trim() : null;
}

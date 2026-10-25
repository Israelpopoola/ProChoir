"use client";

import Link from "next/link";
import { useState } from "react";
import type { Setlist } from "@/lib/types";
import { BookIcon, ChevronDown, ChevronRight } from "./icons";
import { ShareButton } from "./ShareButton";
import { ExportSetlistButton } from "./ExportButtons";

type Props = {
  setlist: Setlist;
  dateLabel: { day: string; month: string; weekday: string };
  longDate: string;
  badge: string | null;
  defaultOpen?: boolean;
};

export function SetlistDrawer({ setlist, dateLabel, longDate, badge, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const items = setlist.setlist_songs.filter((i) => i.songs);

  return (
    <section className={`overflow-hidden rounded-2xl border bg-surface transition-shadow ${open ? "border-accent/40 shadow-lg shadow-accent/5" : "border-border"}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-4 p-4 text-left"
      >
        <div className="flex w-14 shrink-0 flex-col items-center rounded-xl bg-accent-soft py-1.5 text-accent">
          <span className="text-[11px] font-semibold uppercase leading-none">{dateLabel.month}</span>
          <span className="text-2xl font-bold leading-tight">{dateLabel.day}</span>
          <span className="text-[11px] font-medium leading-none">{dateLabel.weekday}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-base font-semibold">{setlist.title}</h2>
            {badge && (
              <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-fg">{badge}</span>
            )}
          </div>
          <p className="text-sm text-muted">
            {items.length} {items.length === 1 ? "song" : "songs"} · {longDate}
          </p>
        </div>
        <ChevronDown className={`size-5 shrink-0 text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      <div className="drawer-body" data-open={open}>
        <div>
          <div className="border-t border-border px-4 pb-4 pt-2">
            {setlist.notes && (
              <p className="my-2 whitespace-pre-wrap rounded-xl bg-surface-2 p-3 text-sm">{setlist.notes}</p>
            )}
            {items.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted">No songs added yet.</p>
            ) : (
              <ol className="divide-y divide-border">
                {items.map((item, i) => (
                  <li key={item.id}>
                    <Link
                      href={`/songs/${item.song_id}?set=${setlist.id}`}
                      className="flex items-center gap-3 py-3 active:opacity-60"
                    >
                      <span className="w-6 shrink-0 text-center text-sm font-semibold text-muted">{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{item.songs!.title}</p>
                        {(item.notes || item.songs!.artist) && (
                          <p className="truncate text-sm text-muted">{item.notes || item.songs!.artist}</p>
                        )}
                      </div>
                      {(item.song_key || item.songs!.song_key) && (
                        <span className="shrink-0 rounded-lg bg-surface-2 px-2 py-1 text-xs font-semibold">
                          {item.song_key || item.songs!.song_key}
                        </span>
                      )}
                      <ChevronRight className="size-4 shrink-0 text-muted" />
                    </Link>
                  </li>
                ))}
              </ol>
            )}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link href={`/setlists/${setlist.id}/lyrics`} className="btn btn-primary col-span-2">
                <BookIcon className="size-4" />
                All lyrics in order
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
        </div>
      </div>
    </section>
  );
}

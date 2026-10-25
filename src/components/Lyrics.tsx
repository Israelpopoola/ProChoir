"use client";

import { useSyncExternalStore } from "react";
import { parseLyrics } from "@/lib/lyrics";

const SIZES = [16, 18, 20, 23, 26, 30];
const STORAGE_KEY = "prochoir:lyric-size";

function readSize(): number {
  try {
    const v = Number(localStorage.getItem(STORAGE_KEY));
    return SIZES.includes(v) ? v : 20;
  } catch {
    return 20;
  }
}

function subscribe(cb: () => void) {
  window.addEventListener("lyric-size", cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener("lyric-size", cb);
    window.removeEventListener("storage", cb);
  };
}

/** Shared A−/A+ text size, remembered on this phone. */
export function useLyricSize() {
  const size = useSyncExternalStore(subscribe, readSize, () => 20);
  function change(dir: 1 | -1) {
    const i = Math.min(SIZES.length - 1, Math.max(0, SIZES.indexOf(size) + dir));
    try {
      localStorage.setItem(STORAGE_KEY, String(SIZES[i]));
    } catch {}
    window.dispatchEvent(new Event("lyric-size"));
  }
  return { size, change };
}

export function TextSizeControls() {
  const { change } = useLyricSize();
  return (
    <div className="flex overflow-hidden rounded-xl border border-border bg-surface">
      <button type="button" onClick={() => change(-1)} className="px-3 py-1.5 text-sm font-semibold" aria-label="Smaller text">
        A−
      </button>
      <span className="w-px bg-border" />
      <button type="button" onClick={() => change(1)} className="px-3 py-1.5 text-lg font-semibold leading-none" aria-label="Bigger text">
        A+
      </button>
    </div>
  );
}

export function Lyrics({ text }: { text: string }) {
  const { size } = useLyricSize();
  const blocks = parseLyrics(text);

  if (blocks.length === 0) {
    return <p className="text-muted">No lyrics added yet.</p>;
  }

  return (
    <div className="space-y-5" style={{ fontSize: size, lineHeight: 1.45 }}>
      {blocks.map((b, i) => (
        <div key={i}>
          {b.label && (
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-accent" style={{ fontSize: Math.max(12, size * 0.6) }}>
              {b.label}
            </p>
          )}
          {b.lines.map((l, j) => (
            <p key={j}>{l}</p>
          ))}
        </div>
      ))}
    </div>
  );
}

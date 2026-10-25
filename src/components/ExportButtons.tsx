"use client";

import { strToU8, zipSync } from "fflate";
import { useState } from "react";
import { browserClient } from "@/lib/supabase";
import { safeFileName, toPresentationText } from "@/lib/lyrics";
import { DownloadIcon } from "./icons";

function download(blob: Blob, name: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/** One song → "Title.txt" for ProPresenter / FreeShow. */
export function ExportSongButton({ title, lyrics }: { title: string; lyrics: string }) {
  return (
    <button
      type="button"
      className="btn btn-secondary"
      onClick={() =>
        download(new Blob([toPresentationText(lyrics)], { type: "text/plain;charset=utf-8" }), `${safeFileName(title)}.txt`)
      }
    >
      <DownloadIcon className="size-4" />
      Export .txt
    </button>
  );
}

/** A whole set list → zip of numbered .txt files, in order. */
export function ExportSetlistButton({
  setlistTitle,
  date,
  songIds,
  className = "btn btn-secondary",
}: {
  setlistTitle: string;
  date: string;
  songIds: string[];
  className?: string;
}) {
  const [busy, setBusy] = useState(false);

  async function run() {
    setBusy(true);
    try {
      const { data, error } = await browserClient().from("songs").select("id, title, lyrics").in("id", songIds);
      if (error) throw error;
      const byId = new Map(data.map((s) => [s.id, s]));
      const files: Record<string, Uint8Array> = {};
      songIds.forEach((id, i) => {
        const s = byId.get(id);
        if (!s) return;
        const n = String(i + 1).padStart(2, "0");
        files[`${n} - ${safeFileName(s.title)}.txt`] = strToU8(toPresentationText(s.lyrics));
      });
      const zip = zipSync(files);
      download(new Blob([zip.slice().buffer], { type: "application/zip" }), `${date} ${safeFileName(setlistTitle)}.zip`);
    } catch (e) {
      alert(`Couldn't export: ${e instanceof Error ? e.message : e}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button type="button" className={className} onClick={run} disabled={busy || songIds.length === 0}>
      <DownloadIcon className="size-4" />
      {busy ? "Preparing…" : "Export lyrics"}
    </button>
  );
}

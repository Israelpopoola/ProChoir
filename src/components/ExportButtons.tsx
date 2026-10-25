"use client";

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

/** A whole set list → zip of numbered .txt files, in order (built on the server). */
export function ExportSetlistButton({
  setlistId,
  disabled,
  className = "btn btn-secondary",
}: {
  setlistId: string;
  disabled?: boolean;
  className?: string;
}) {
  if (disabled) {
    return (
      <button type="button" className={className} disabled>
        <DownloadIcon className="size-4" />
        Export lyrics
      </button>
    );
  }
  return (
    <a href={`/api/export/${setlistId}`} download className={className}>
      <DownloadIcon className="size-4" />
      Export lyrics
    </a>
  );
}

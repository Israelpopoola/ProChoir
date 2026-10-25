"use client";

import { useState } from "react";
import { toPresentationText } from "@/lib/lyrics";
import { CopyIcon } from "./icons";

export function CopyLyricsButton({ lyrics }: { lyrics: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="btn btn-secondary"
      onClick={async () => {
        await navigator.clipboard.writeText(toPresentationText(lyrics));
        setDone(true);
        setTimeout(() => setDone(false), 2000);
      }}
    >
      <CopyIcon className="size-4" />
      {done ? "Copied" : "Copy lyrics"}
    </button>
  );
}

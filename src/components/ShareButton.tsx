"use client";

import { useState } from "react";
import { ShareIcon } from "./icons";

export function ShareButton({ path, title, className = "btn btn-secondary" }: { path: string; title: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = new URL(path, window.location.origin).toString();
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // cancelled — fall through to copy
      }
    }
    await navigator.clipboard.writeText(`${title}\n${url}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button type="button" onClick={share} className={className}>
      <ShareIcon className="size-4" />
      {copied ? "Link copied" : "Share"}
    </button>
  );
}

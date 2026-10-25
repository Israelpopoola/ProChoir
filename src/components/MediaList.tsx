import type { SongMedia } from "@/lib/types";
import { audioUrl } from "@/lib/supabase";
import { LinkIcon, PlayIcon } from "./icons";

function linkKind(url: string): { name: string; color: string } {
  const u = url.toLowerCase();
  if (u.includes("youtube.com") || u.includes("youtu.be")) return { name: "YouTube", color: "#ff0033" };
  if (u.includes("spotify.com")) return { name: "Spotify", color: "#1db954" };
  if (u.includes("music.apple.com")) return { name: "Apple Music", color: "#fa2d48" };
  if (u.includes("drive.google.com")) return { name: "Google Drive", color: "#1a73e8" };
  if (u.includes("dropbox.com")) return { name: "Dropbox", color: "#0061ff" };
  if (u.includes("soundcloud.com")) return { name: "SoundCloud", color: "#ff5500" };
  return { name: "Link", color: "var(--accent)" };
}

export function MediaList({ media }: { media: SongMedia[] }) {
  const audio = media.filter((m) => m.kind === "audio" && m.storage_path);
  const links = media.filter((m) => m.kind === "link" && m.url);
  if (audio.length === 0 && links.length === 0) return null;

  return (
    <div className="space-y-3">
      {audio.map((m) => (
        <div key={m.id} className="rounded-2xl border border-border bg-surface p-3">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <PlayIcon className="size-4 text-accent" />
            {m.label || "Audio"}
          </p>
          {/* preload="none": nothing downloads until someone presses play */}
          <audio controls preload="none" src={audioUrl(m.storage_path!)} className="w-full" />
        </div>
      ))}
      {links.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {links.map((m) => {
            const k = linkKind(m.url!);
            return (
              <a
                key={m.id}
                href={m.url!}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3 active:opacity-60"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl text-white" style={{ background: k.color }}>
                  <LinkIcon className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-medium">{m.label || k.name}</span>
                  <span className="block text-xs text-muted">{k.name}</span>
                </span>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

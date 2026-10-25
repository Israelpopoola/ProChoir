import { strToU8, zipSync } from "fflate";
import { getSetlist, getSongsByIds } from "@/lib/data";
import { safeFileName, toPresentationText } from "@/lib/lyrics";
import { isServerConfigured as isConfigured } from "@/lib/supabase";

/** Set list → zip of numbered .txt files for ProPresenter / FreeShow. */
export async function GET(_req: Request, ctx: RouteContext<"/api/export/[id]">) {
  if (!isConfigured) return new Response("Not configured", { status: 503 });
  const setlist = await getSetlist((await ctx.params).id);
  if (!setlist) return new Response("Not found", { status: 404 });

  const ids = setlist.setlist_songs.map((i) => i.song_id);
  const songs = new Map((await getSongsByIds(ids)).map((s) => [s.id, s]));
  const files: Record<string, Uint8Array> = {};
  let n = 0;
  for (const id of ids) {
    const s = songs.get(id);
    if (!s) continue;
    n++;
    files[`${String(n).padStart(2, "0")} - ${safeFileName(s.title)}.txt`] = strToU8(toPresentationText(s.lyrics));
  }

  const name = `${setlist.service_date} ${safeFileName(setlist.title)}.zip`;
  return new Response(new Blob([zipSync(files).slice().buffer]), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${name.replace(/"/g, "")}"; filename*=UTF-8''${encodeURIComponent(name)}`,
      "Cache-Control": "no-store",
    },
  });
}

import { SetupNotice } from "@/components/SetupNotice";
import { SongSearch } from "@/components/SongSearch";
import { getSongs } from "@/lib/data";
import { isServerConfigured as isConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const metadata = { title: "Songs" };

export default async function SongsPage() {
  if (!isConfigured) return <SetupNotice />;
  const songs = await getSongs();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Songs</h1>
      <SongSearch songs={songs.map(({ id, title, artist, song_key, lyrics }) => ({ id, title, artist, song_key, lyrics }))} />
    </div>
  );
}

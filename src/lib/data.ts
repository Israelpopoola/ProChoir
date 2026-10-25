import { serverClient } from "./supabase";
import type { Setlist, Song, SongMedia } from "./types";

const SETLIST_SELECT =
  "id, service_date, title, notes, setlist_songs(id, setlist_id, song_id, position, song_key, notes, songs(id, title, artist, song_key))";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function sortItems(s: Setlist): Setlist {
  s.setlist_songs = [...(s.setlist_songs ?? [])].sort((a, b) => a.position - b.position);
  return s;
}

export async function getUpcomingSetlists(today: string): Promise<Setlist[]> {
  const { data, error } = await serverClient()
    .from("setlists")
    .select(SETLIST_SELECT)
    .gte("service_date", today)
    .order("service_date", { ascending: true })
    .limit(30);
  if (error) throw error;
  return (data as unknown as Setlist[]).map(sortItems);
}

export async function getPastSetlists(today: string): Promise<Setlist[]> {
  const { data, error } = await serverClient()
    .from("setlists")
    .select(SETLIST_SELECT)
    .lt("service_date", today)
    .order("service_date", { ascending: false })
    .limit(60);
  if (error) throw error;
  return (data as unknown as Setlist[]).map(sortItems);
}

export async function getSetlist(id: string): Promise<Setlist | null> {
  if (!UUID.test(id)) return null;
  const { data, error } = await serverClient()
    .from("setlists")
    .select(SETLIST_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? sortItems(data as unknown as Setlist) : null;
}

export async function getSongs(): Promise<Song[]> {
  const { data, error } = await serverClient()
    .from("songs")
    .select("*")
    .order("title", { ascending: true });
  if (error) throw error;
  return data as Song[];
}

export async function getSongsByIds(ids: string[]): Promise<Song[]> {
  if (ids.length === 0) return [];
  const { data, error } = await serverClient().from("songs").select("*").in("id", ids);
  if (error) throw error;
  return data as Song[];
}

export async function getSong(id: string): Promise<{ song: Song; media: SongMedia[] } | null> {
  if (!UUID.test(id)) return null;
  const db = serverClient();
  const [{ data: song, error }, { data: media }] = await Promise.all([
    db.from("songs").select("*").eq("id", id).maybeSingle(),
    db.from("song_media").select("*").eq("song_id", id).order("position").order("created_at"),
  ]);
  if (error) throw error;
  if (!song) return null;
  return { song: song as Song, media: (media ?? []) as SongMedia[] };
}

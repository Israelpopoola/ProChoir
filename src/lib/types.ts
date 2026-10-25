export type Song = {
  id: string;
  title: string;
  artist: string | null;
  song_key: string | null;
  lyrics: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type SongMedia = {
  id: string;
  song_id: string;
  kind: "link" | "audio";
  label: string;
  url: string | null;
  storage_path: string | null;
  position: number;
};

export type SetlistSong = {
  id: string;
  setlist_id: string;
  song_id: string;
  position: number;
  song_key: string | null;
  notes: string | null;
  songs: Pick<Song, "id" | "title" | "artist" | "song_key"> | null;
};

export type Setlist = {
  id: string;
  service_date: string;
  title: string;
  notes: string | null;
  setlist_songs: SetlistSong[];
};

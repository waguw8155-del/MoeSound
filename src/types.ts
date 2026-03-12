export interface Track {
  id: number;
  title: string;
  artist: string;
  genre: string;
  cover_url: string;
  audio_url: string;
  created_at: string;
}

export interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
}

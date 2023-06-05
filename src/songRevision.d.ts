interface ISongRevisionJson {
  SongRevision: SongRevision;
}

interface SongRevision {
  song: Song;
  tab: Tab;
}

interface Tab {
  rendererVersion: number;
  guitarProTab: GuitarProTab;
  tracks: Tracks;
}

interface Tracks {
  Track: Track[];
}

interface Track {
  position: number;
  trackFragments: string;
  trackAudios: TrackAudios;
}

interface TrackAudios {
  TrackAudio: TrackAudio[];
}

interface TrackAudio {
  speed: number;
  mp3File: GuitarProTab;
}

interface GuitarProTab {
  attachmentUrl: string;
}

interface Song {
  title: string;
  artist: Artist;
}

interface Artist {
  name: string;
}

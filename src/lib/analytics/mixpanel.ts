import mixpanel from 'mixpanel-browser';

mixpanel.init('09282cac571bcb88db2bd0cfa8a5c5f7', {
  autocapture: false,
  record_sessions_percent: 0
});

export function trackGuitarProDownloaded(props: {
  title: string;
  artist: string;
  songId: number;
}) {
  mixpanel.track('Guitar Pro Downloaded', props);
}

export function trackMidiDownloaded(props: {
  title: string;
  artist: string;
  songId: number;
}) {
  mixpanel.track('MIDI Downloaded', props);
}

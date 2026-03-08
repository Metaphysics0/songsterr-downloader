import mixpanel from 'mixpanel-browser';

mixpanel.init('09282cac571bcb88db2bd0cfa8a5c5f7', {
  autocapture: false,
  record_sessions_percent: 0
});

interface TrackDownloadParams {
  title: string;
  artist: string;
  songId: number;
}

export function trackGuitarProDownloaded(props: TrackDownloadParams) {
  mixpanel.track('Guitar Pro Downloaded', props);
}

export function trackMidiDownloaded(props: TrackDownloadParams) {
  mixpanel.track('MIDI Downloaded', props);
}

interface TrackDownloadFailedParams extends TrackDownloadParams {
  downloadType: string;
  errorMessage: string;
}

export function trackDownloadFailed(props: TrackDownloadFailedParams) {
  mixpanel.track('Download Failed', props);
}

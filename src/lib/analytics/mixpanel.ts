import mixpanel from 'mixpanel-browser';
import { env } from '$env/dynamic/public';

const MIXPANEL_ID = env.PUBLIC_MIXPANEL_ID;

if (MIXPANEL_ID) {
  mixpanel.init(MIXPANEL_ID, {
    autocapture: false,
    record_sessions_percent: 0
  });
}

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

export function trackYouTubeVideoClicked() {
  mixpanel.track('YouTube Video Clicked');
}

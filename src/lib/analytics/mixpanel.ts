import mixpanel from 'mixpanel-browser';
import { env } from '$env/dynamic/public';
import type { SelectedSongSource } from '$lib/types';

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
  source?: SelectedSongSource;
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
  songsterrUrl?: string;
}

export function trackDownloadFailed(props: TrackDownloadFailedParams) {
  mixpanel.track('Download Failed', props);
}

export function trackYouTubeVideoClicked() {
  mixpanel.track('YouTube Video Clicked');
}

/*
 * A page can't see whether a drag ended in the bookmarks bar (it's outside the
 * page), so this records intent. `Bookmarklet Opened` is the proof it was
 * added: together they form the install -> use -> download funnel.
 */
export function trackBookmarkletDragged() {
  mixpanel.track('Bookmarklet Dragged');
}

export function trackBookmarkletOpened(props: TrackDownloadParams) {
  mixpanel.track('Bookmarklet Opened', props);
}

export function trackFretwiseAdClicked() {
  mixpanel.track('Fretwise Ad Clicked');
}

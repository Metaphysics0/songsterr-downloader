import { type SongsterrPartialMetadata } from '$lib/types';

export function extractYoutubeVideoUrlFromMetadata(
  metadata: SongsterrPartialMetadata
) {
  try {
    const { videos } = metadata;
    const mostRelevantVideo = videos.find((video) => video.feature === null);
    const videoId = mostRelevantVideo?.videoId || videos[0].videoId;
    return `https://www.youtube.com/watch?v=${videoId}`;
  } catch {
    return '';
  }
}

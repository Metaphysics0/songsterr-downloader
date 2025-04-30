import Fetcher from '$lib/utils/fetch';
import { logger } from '$lib/utils/logger';
import { getGuitarProFileTypeFromUrl, normalize } from '$lib/utils/string';
import { scraper } from '../utils/scraper.util';
import { env } from '$env/dynamic/private';

export async function getSearchResultFromSongsterrUrl(
  songsterrUrl: string
): Promise<IPartialSearchResult> {
  const doc = await scraper.getDocumentFromUrl(songsterrUrl, 'html');
  if (!doc) throw new Error('Unable to get page data from songsterr');

  return getSongsterrMetadataFromDocument(doc);
}

function getSongsterrMetadataFromDocument(doc: Document) {
  try {
    const metadataScript = doc.getElementById('state')?.childNodes[0].nodeValue;
    // @ts-ignore
    return JSON.parse(metadataScript).meta.current;
  } catch (error) {
    logger.error('error parsing metadata', error);
    throw new Error('Error reading tab data');
  }
}

export async function getDownloadLinkFromRevisions(
  songId: string | number
): Promise<string> {
  const fetcher = new Fetcher({ withBrowserLikeHeaders: true });
  const url = urlBuilder.bySongIdWithRevisions(songId);
  const revisions =
    await fetcher.fetchAndReturnJson<SongsterrRevisionsResponse>(url, {
      headers: {
        ...fetcher.browserLikeHeaders,
        Cookie: `SongsterrT=${env.TEMP_SONGSTERR_COOKIE}`
      }
    });

  const firstRevisionWithSource = revisions.find(
    (revision: any) => revision.source
  );

  return firstRevisionWithSource?.source || '';
}

export function buildFileNameFromSongName(
  songName: string,
  downloadUrl: string
): string {
  try {
    const normalizedSongName = normalize(songName);
    const fileType = getGuitarProFileTypeFromUrl(downloadUrl);
    return normalizedSongName + fileType;
  } catch (error) {
    logger.error('error creating filename from song name', error);
    return `downloaded-tab_${Date.now()}.gp5`;
  }
}

const urlBuilder = {
  bySongId(songId: string | number) {
    return `https://www.songsterr.com/a/ra/player/song/${songId}.xml`;
  },
  bySongIdWithRevisions(songId: string | number) {
    return `https://www.songsterr.com/api/meta/${songId}/revisions?translateTo=en`;
  }
};

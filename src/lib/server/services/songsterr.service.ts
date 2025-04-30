import Fetcher from '$lib/utils/fetch';
import { logger } from '$lib/utils/logger';
import { getGuitarProFileTypeFromUrl, normalize } from '$lib/utils/string';
import { scraper } from '../scraper';
import { env } from '$env/dynamic/private';

export async function getSearchResultFromSongsterrUrl(
  songsterrUrl: string
): Promise<IPartialSearchResult> {
  const doc = await scraper.getDocumentFromUrl(songsterrUrl, 'html');
  if (!doc) {
    throw new Error('Unable to get page data from songsterr');
  }

  const { songId, title, artist, source, artistId } = getMetadataFromDoc(doc);

  return {
    songId,
    artistId,
    title,
    artist,
    source
  };
}

function getMetadataFromDoc(doc: Document) {
  try {
    const metadataScript = doc.getElementById('state')?.childNodes[0].nodeValue;
    // @ts-ignore
    return JSON.parse(metadataScript).meta.current;
  } catch (error) {
    logger.error('error parsing metadata', error);
    throw new Error('Error reading tab data');
  }
}

export async function getDownloadLinkFromSongId(
  songId: string | number,
  fullUrl?: any
): Promise<string> {
  const url = urlBuilder.bySongId(songId);
  try {
    const xml = await scraper.getDocumentFromUrl(url, 'xml');
    return findGuitarProTabLinkFromXml(xml) || '';
  } catch (error) {
    if (fullUrl) {
      return attemptToGrabDownloadLinkFromSource(fullUrl.toString()) || '';
    }
  }
  return '';
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

async function attemptToGrabDownloadLinkFromSource(
  url: string
): Promise<string> {
  const { source } = await getSearchResultFromSongsterrUrl(url);
  return source || '';
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

export function getSongTitleFromDocument(doc: Document): ISelectedSongTitle {
  const title = doc.getElementsByTagName('title')[0].childNodes[0].nodeValue;
  if (!title) {
    return {
      artist: 'Unknown',
      songName: ''
    };
  }

  /* Fluffy by Chon | Songsterr Tabs -> [Fluffy, Chon] */
  const onlySongAndArtist = title.split('|')[0].trim();
  const [songName, artist] = onlySongAndArtist.split('by');

  return {
    songName,
    artist
  };
}

const urlBuilder = {
  bySongId(songId: string | number) {
    return `https://www.songsterr.com/a/ra/player/song/${songId}.xml`;
  },
  bySongIdWithRevisions(songId: string | number) {
    return `https://www.songsterr.com/api/meta/${songId}/revisions?translateTo=en`;
  }
};

function findGuitarProTabLinkFromXml(xml: Document) {
  return xml
    .getElementsByTagName('guitarProTab')[0]
    .getElementsByTagName('attachmentUrl')[0].firstChild?.nodeValue;
}

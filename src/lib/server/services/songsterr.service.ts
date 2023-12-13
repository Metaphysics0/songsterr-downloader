import { logger } from '$lib/utils/logger';
import { getGuitarProFileTypeFromUrl, normalize } from '$lib/utils/string';
import { KvService } from '../cache/kv';
import { scraper } from '../scraper';
import { BulkDownloadService } from './bulkDownload.service';

export async function getSearchResultFromSongsterrUrl(
  songsterrUrl: string,
  options?: GetSearchResultOptions
): Promise<IPartialSearchResult> {
  const doc = await scraper.getDocumentFromUrl(songsterrUrl, 'html');
  if (!doc) {
    throw new Error('Unable to get page data from songsterr');
  }

  const { songId, title, artist, source, artistId } = getMetadataFromDoc(doc);
  const bulkSongsToDownload = options?.withBulkSongsToDownload
    ? await getSongsToBulkDownload(artistId)
    : [];

  return {
    songId,
    artistId,
    title,
    artist,
    source,
    bulkSongsToDownload
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

async function attemptToGrabDownloadLinkFromSource(
  url: string
): Promise<string> {
  const { source } = await getSearchResultFromSongsterrUrl(url);
  return source || '';
}

// helpers
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
  // return '';
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
  }
};

function findGuitarProTabLinkFromXml(xml: Document) {
  return xml
    .getElementsByTagName('guitarProTab')[0]
    .getElementsByTagName('attachmentUrl')[0].firstChild?.nodeValue;
}

async function getSongsToBulkDownload(artistId: string): Promise<any[]> {
  if (!artistId) return [];

  const kvService = new KvService();

  const cachedResults = await kvService.getBulkSongsToDownload(artistId);
  if (cachedResults?.length) {
    return cachedResults;
  }

  try {
    const results = await new BulkDownloadService(
      artistId
    ).getSongIdsAndSongTitlesFromArtist();

    await kvService.setBulkSongsToDownload(artistId, results);

    return results;
  } catch (error) {
    logger.error(
      `Error getting bulk songs to download from artist id: ${artistId}`,
      error
    );
    return [];
  }
}

export interface IDownloadLinkResponse {
  downloadLink: string;
  songTitle: ISelectedSongTitle;
}

export interface GetSearchResultOptions {
  withBulkSongsToDownload?: boolean;
}

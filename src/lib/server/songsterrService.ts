import { getGuitarProFileTypeFromUrl, normalize } from '$lib/utils/string';
import { scraper } from './scraper';

export async function getSearchResultFromSongsterrUrl(
  songsterrUrl: string
): Promise<IPartialSearchResult> {
  const doc = await scraper.getDocumentFromUrl(songsterrUrl, 'html');
  const { songId, title, artist } = getMetadataFromDoc(doc);

  return {
    songId,
    title,
    artist
  };
}

export async function downloadSongFromSongId(
  songId: string
): Promise<IDownloadSongResponse> {
  const link = await getDownloadLinkFromSongId(songId);
  if (!link) throw 'Unable to find download link';
  const downloadResponse = await fetch(link);

  return {
    buffer: await downloadResponse.arrayBuffer(),
    contentType:
      downloadResponse.headers.get('Content-Type') || 'application/gp',
    downloadLink: link
  };
}

export async function getDownloadLinkFromSongId(
  songId: string
): Promise<string | undefined> {
  const url = urlBuilder.bySongId(songId);
  const xml = await scraper.getDocumentFromUrl(url, 'xml');

  return findGuitarProTabLinkFromXml(xml) || '';
}

export function buildFileNameFromSongName(
  songName: string,
  downloadUrl: string
): string {
  const normalizedSongName = normalize(songName);
  const fileType = getGuitarProFileTypeFromUrl(downloadUrl);

  return normalizedSongName + fileType;
}

// helpers
const urlBuilder = {
  bySongId(songId: string) {
    return `https://www.songsterr.com/a/ra/player/song/${songId}.xml`;
  }
};

function findGuitarProTabLinkFromXml(xml: Document) {
  return xml
    .getElementsByTagName('guitarProTab')[0]
    .getElementsByTagName('attachmentUrl')[0].firstChild?.nodeValue;
}

function getMetadataFromDoc(doc: Document): Record<string, any> {
  const metadataScript = doc.getElementById('state')?.childNodes[0].nodeValue;
  try {
    // @ts-ignore
    return JSON.parse(metadataScript).meta.current;
  } catch (error) {
    console.error('error parsing metadata', error);

    return {};
  }
}

export interface IDownloadSongResponse {
  buffer: ArrayBuffer;
  contentType: string;
  downloadLink: string;
}

export interface IDownloadLinkResponse {
  downloadLink: string;
  songTitle: ISelectedSongTitle;
}

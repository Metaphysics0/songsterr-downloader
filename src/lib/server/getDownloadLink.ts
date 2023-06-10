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

function getMetadataFromDoc(doc: Document) {
  const metadataScript = doc.getElementById('state')?.childNodes[0].nodeValue;
  try {
    // @ts-ignore
    return JSON.parse(metadataScript).meta.current;
  } catch (error) {
    console.error('error parsing metadata', error);

    return {};
  }
}

export async function getDownloadLinkFromSongId(
  songId: string
): Promise<string | undefined> {
  const url = urlBuilder.bySongId(songId);
  const xml = await scraper.getDocumentFromUrl(url, 'xml');

  return findGuitarProTabLinkFromXml(xml) || '';
}

async function getRevisionIdFromSongsterrUrl(
  songsterrUrl: string
): Promise<string> {
  const doc = await scraper.getDocumentFromUrl(songsterrUrl, 'html');
  const metadata = doc.getElementById('state')?.childNodes[0].nodeValue;
  // @ts-ignore
  const { revisionId } = JSON.parse(metadata).meta.current;
  return revisionId;
}

// helpers
export function buildFileName(url: string, downloadUrl: string): string {
  const fileName = url.substring(
    url.lastIndexOf('/') + 1,
    url.lastIndexOf('-')
  );
  const fileType = getGuitarProFileTypeFromUrl(downloadUrl);

  return fileName + fileType;
}

export function buildFileNameFromSongName(
  songName: string,
  downloadUrl: string
): string {
  const normalizedSongName = normalize(songName);
  const fileType = getGuitarProFileTypeFromUrl(downloadUrl);

  return normalizedSongName + fileType;
}

export function getRevisionIdFromDocument(doc: Document): string {
  const metadata = doc.getElementById('state')?.childNodes[0].nodeValue;
  if (!metadata) return '';
  // @ts-ignore
  try {
    const { revisionId } = JSON.parse(metadata).meta.current;
    return revisionId;
  } catch (error) {
    console.error('error getting revision ID from document');
    return '';
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
  getXmlByRevisionId(revisionId: string) {
    return `https://www.songsterr.com/a/ra/player/songrevision/${revisionId}.xml`;
  },
  bySongId(songId: string) {
    return `https://www.songsterr.com/a/ra/player/song/${songId}.xml`;
  }
};

function findGuitarProTabLinkFromXml(xml: Document) {
  return xml
    .getElementsByTagName('guitarProTab')[0]
    .getElementsByTagName('attachmentUrl')[0].firstChild?.nodeValue;
}

export interface IDownloadLinkResponse {
  downloadLink: string;
  songTitle: ISelectedSongTitle;
}

import { getGuitarProFileTypeFromUrl, normalize } from '$lib/utils/string';
import { DOMParser } from '@xmldom/xmldom';

export async function getDownloadLinkFromSongsterr(
  songsterrUrl: string
): Promise<string | undefined> {
  const revisionId = await getRevisionIdFromSongsterrUrl(songsterrUrl);
  return getDownloadLinkFromRevisionId(revisionId);
}

export async function getDownloadLinkFromRevisionId(
  revisionId: string
): Promise<string | undefined> {
  const url = urlBuilder.byRevisionId(revisionId);
  const xml = await getDocumentFromUrl(url, 'xml');

  return findGuitarProTabLinkFromXml(xml) || '';
}

export async function getDownloadLinkFromSongId(
  songId: string
): Promise<string | undefined> {
  const url = urlBuilder.bySongId(songId);
  const xml = await getDocumentFromUrl(url, 'xml');

  return findGuitarProTabLinkFromXml(xml) || '';
}

async function getRevisionIdFromSongsterrUrl(
  songsterrUrl: string
): Promise<string> {
  const doc = await getDocumentFromUrl(songsterrUrl, 'html');
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

async function getDocumentFromUrl(url: string, websiteType: 'xml' | 'html') {
  const request = await fetch(url);
  const text = await request.text();

  return new DOMParser().parseFromString(text, `text/${websiteType}`);
}

const urlBuilder = {
  byRevisionId(revisionId: string) {
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

import JSZip from 'jszip';
import { getDownloadLinkFromSongId } from './songsterrService';

export async function bulkDownloadBySongIds(songIds: string[]): Promise<any> {}

export async function downloadAllSongsFromSongIds(
  songIds: string[],
  artist: string
): Promise<any> {
  const zip = new JSZip();
  zip.folder(artist + '-tabs');

  const unresolvedDownloadLinks = songIds.map(getDownloadLinkFromSongId);

  const downloadLinks = (await Promise.all(unresolvedDownloadLinks)).filter(
    Boolean
  ) as string[];

  const unresolvedGuitarProFiles = downloadLinks.map((link) => fetch(link));
  const guitarProFiles = await Promise.all(unresolvedDownloadLinks);

  // if (!link) throw 'Unable to find download link';
  // const downloadResponse = await fetch(link);

  // const buf = await downloadResponse.arrayBuffer();
}

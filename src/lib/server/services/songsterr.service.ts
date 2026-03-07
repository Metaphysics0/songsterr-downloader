import { logger } from '$lib/server/logger';
import { getGuitarProFileTypeFromUrl, normalize } from '$lib/utils/string';
import { scraper } from '../utils/scraper.util';
import type { SongsterrPartialMetadata } from '$lib/types';

export class SongsterrService {
  async getMetadataFromTabUrl(
    tabUrl: string
  ): Promise<SongsterrPartialMetadata> {
    const doc = await scraper.getDocumentFromUrl(tabUrl, 'html');
    if (!doc) throw new Error('Unable to get page data from songsterr');

    return this.extractMetadataFromDocument(doc);
  }

  buildFileNameFromSongName(songName: string, downloadUrl: string): string {
    try {
      const normalizedSongName = normalize(songName);
      const fileType = getGuitarProFileTypeFromUrl(downloadUrl);
      return normalizedSongName + fileType;
    } catch (error) {
      logger.error({ err: error }, 'error creating filename from song name');
      return `downloaded-tab_${Date.now()}.gp5`;
    }
  }

  private extractMetadataFromDocument(doc: Document): SongsterrPartialMetadata {
    try {
      const metadataScript =
        doc.getElementById('state')?.childNodes[0].nodeValue;
      // @ts-ignore
      return JSON.parse(metadataScript).meta.current;
    } catch (error) {
      logger.error({ err: error }, 'error parsing metadata');
      throw new Error('Error reading tab data');
    }
  }
}

import { logger } from '$lib/server/logger';
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
      const normalizedSongName = this.normalizeSongName(songName);
      const fileType = this.getFileTypeFromDownloadUrl(downloadUrl);
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

  /*
   * input: "Bubble Dream (Tab book version) 231"
   * output: "bubble-dream-tab-book-version-231"
   */
  private normalizeSongName(input: string) {
    if (/[^a-zA-Z0-9\s]/.test(input)) {
      // If non-English characters are found, return the input string as is
      return input;
    }

    let normalized = input.toLowerCase();
    normalized = normalized.replace(/[^a-z0-9\s]/g, ' ');
    normalized = normalized.replace(/\s+/g, ' ');
    normalized = normalized.trim();
    normalized = normalized.replace(/\s+/g, '-');

    return normalized;
  }

  private getFileTypeFromDownloadUrl(url: string) {
    if (url.endsWith('.gp5')) return '.gp5';
    if (url.endsWith('.mid')) return '.mid';
    return '.gp';
  }
}

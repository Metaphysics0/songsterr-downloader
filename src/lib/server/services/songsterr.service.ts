import Fetcher from '$lib/server/utils/fetcher.util';
import { logger } from '$lib/utils/logger';
import { getGuitarProFileTypeFromUrl, normalize } from '$lib/utils/string';
import { scraper } from '../utils/scraper.util';
import { env } from '$env/dynamic/private';
import { SONGSTERR_BASE_URL } from '$lib/constants';
import { kebabCase } from 'lodash-es';
import {
  SongsterrPartialMetadata,
  SongsterrMetadata,
  SongsterrRevisionsResponse
} from '$lib/types';

export class SongsterrService {
  async search(searchText: string): Promise<SongsterrMetadata[]> {
    const url = this.createSearchUrl(searchText);
    const searchResponse = await this.fetcher.fetchAndReturnJson<
      SongsterrMetadata[]
    >(url);

    return searchResponse.map((metadata) => ({
      ...metadata,
      byLinkUrl: this.buildTabUrl(metadata)
    }));
  }

  async getMetadataFromTabUrl(
    tabUrl: string
  ): Promise<SongsterrPartialMetadata> {
    const doc = await scraper.getDocumentFromUrl(tabUrl, 'html');
    if (!doc) throw new Error('Unable to get page data from songsterr');

    return this.extractMetadataFromDocument(doc);
  }

  async getGuitarProDownloadLinkFromSongId(
    songId: string | number
  ): Promise<string> {
    const url = this.urlBuilder.bySongIdWithRevisions(songId);

    console.log('fetching with cookie', env.TEMP_SONGSTERR_COOKIE);

    const revisions =
      await this.fetcher.fetchAndReturnJson<SongsterrRevisionsResponse>(url, {
        headers: {
          ...this.fetcher.browserLikeHeaders,
          Cookie: `SongsterrT=${env.TEMP_SONGSTERR_COOKIE}`
        }
      });

    return revisions.find((revision) => revision.source)?.source || '';
  }

  buildFileNameFromSongName(songName: string, downloadUrl: string): string {
    try {
      const normalizedSongName = normalize(songName);
      const fileType = getGuitarProFileTypeFromUrl(downloadUrl);
      return normalizedSongName + fileType;
    } catch (error) {
      logger.error('error creating filename from song name', error);
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
      logger.error('error parsing metadata', error);
      throw new Error('Error reading tab data');
    }
  }

  private createSearchUrl(searchText: string): string {
    return `${SONGSTERR_BASE_URL}/api/songs?size=${this.MAX_SEARCH_RESULTS}&pattern=${searchText}`;
  }

  private buildTabUrl(metadata: SongsterrMetadata): string {
    const urlPrefix = `${SONGSTERR_BASE_URL}/a/wsa/`;
    const urlSuffixParts = [metadata.artist, metadata.title, 'tab'];
    const urlSuffix = kebabCase(urlSuffixParts.join(' '));

    return urlPrefix + urlSuffix + `-s${metadata.songId}`;
  }

  private readonly MAX_SEARCH_RESULTS = 50;

  private readonly urlBuilder = {
    bySongId(songId: string | number) {
      return `${SONGSTERR_BASE_URL}/a/ra/player/song/${songId}.xml`;
    },
    bySongIdWithRevisions(songId: string | number) {
      return `${SONGSTERR_BASE_URL}/api/meta/${songId}/revisions?translateTo=en`;
    }
  };

  private readonly fetcher = new Fetcher({ withBrowserLikeHeaders: true });
}

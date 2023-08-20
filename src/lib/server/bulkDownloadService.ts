import AdmZip from 'adm-zip';
import { getDownloadLinkFromSongId } from './songsterrService';
import { logger } from '$lib/utils/logger';
import { kv } from '@vercel/kv';
import { getTotalSizeOfArrayBuffers } from '$lib/utils/bytes';

export class BulkDownloadService {
  artistId: string;
  MAX_SEARCH_RESULTS = 50;
  BULK_DOWNLOAD_CACHE_KEY: string;

  constructor(artistId: string) {
    this.artistId = artistId;

    // 17625_bulk_download
    this.BULK_DOWNLOAD_CACHE_KEY = `${this.artistId}_bulk_download`;
  }

  public getZipFileOfAllTabs = async (): Promise<any> => {
    const zip = new AdmZip();

    const downloadLinksAndSongTitles = await this.getDownloadLinksFromSongIds();
    const bufferObjects = await this.getBuffersFromDownloadLinks(
      downloadLinksAndSongTitles
    );

    bufferObjects.forEach(({ songTitle, buf }) => {
      zip.addFile(
        `${songTitle}.gpx`,
        // @ts-ignore
        buf.buffer,
        `storing ${songTitle} in the zip`
      );
    });

    return zip;
  };

  private async getBuffersFromDownloadLinks(
    downloadLinksAndSongTitles: IDownloadLinkAndSongTitle[]
  ): Promise<IGuitarProBufferObject[]> {
    try {
      const cachedBuffers = await this.retrieveBuffersFromKv();
      if (cachedBuffers?.length) {
        logger.log(
          'Cache HIT',
          `retrieved buffers from ArtistId: ${this.artistId}`
        );
        return cachedBuffers;
      }
    } catch (error) {
      logger.error(
        'Cache retrieval Error',
        `Error retrieving cached buffers from ArtistId: ${this.artistId}`,
        error
      );
    }
    const buffers = await Promise.all(
      downloadLinksAndSongTitles
        .filter(this.withCompleteDownloadLink)
        .map((obj) => this.downloadLinkAndReturnBuffer(obj.downloadLink))
    );

    const arrayBufferResult = downloadLinksAndSongTitles.map((obj, idx) => ({
      songTitle: obj.songTitle,
      buf: buffers[idx]
    }));

    await this.storeBuffersInKv(arrayBufferResult);

    return arrayBufferResult;
  }

  private async downloadLinkAndReturnBuffer(link: string): Promise<Buffer> {
    const downloadResponse = await fetch(link);
    const arrayBuffer = await downloadResponse.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  private async getDownloadLinksFromSongIds(): Promise<
    IDownloadLinkAndSongTitle[]
  > {
    const songIdsAndSongTitles = await this.getSongIdsAndSongTitlesFromArtist();
    return Promise.all(
      songIdsAndSongTitles.map(async (obj) => {
        const downloadLink = await getDownloadLinkFromSongId(obj.songId);
        return {
          songTitle: obj.title,
          downloadLink
        };
      })
    );
  }

  private async getSongIdsAndSongTitlesFromArtist(): Promise<
    ISongIdAndSongTitle[]
  > {
    const url = `https://www.songsterr.com/api/artist/${this.artistId}/songs?size=${this.MAX_SEARCH_RESULTS}`;
    const response = await fetch(url);
    const results = (await response.json()) as ISearchResultByArtist[];

    return results.map((result) => ({
      songId: result.songId,
      title: result.title
    }));
  }

  private withCompleteDownloadLink(obj: IDownloadLinkAndSongTitle): boolean {
    if (!obj.downloadLink) {
      /*
        should add logging here & a printout for the UX for all songs that dont have a link
      */
      return false;
    }

    return true;
  }

  private async storeBuffersInKv(
    bufferObjects: IGuitarProBufferObject[]
  ): Promise<void> {
    try {
      logger.log(
        `Caching buffers for artistId: ${this.artistId}`
        // `Size in KB: ${getTotalSizeOfArrayBuffers(bufferObjects)}`
      );

      await kv.lpush(
        this.BULK_DOWNLOAD_CACHE_KEY,
        ...bufferObjects.map((obj) => JSON.stringify(obj))
      );
    } catch (error) {
      logger.error(
        'Cache Store Error:',
        `unable to store links for artistID: ${this.artistId} in KV: `,
        error
      );
    }
  }

  private async retrieveBuffersFromKv(): Promise<IGuitarProBufferObject[]> {
    return kv.lrange(this.BULK_DOWNLOAD_CACHE_KEY, 0, this.MAX_SEARCH_RESULTS);
  }
}

interface ISearchResultByArtist {
  hasPlayer: boolean;
  artist: string;
  artistId: number;
  title: string;
  songId: number;
  tracks: any[];
  hasChords: false;
  defaultTrack: number;
}

export interface IGuitarProBufferObject {
  songTitle: string;
  buf: Buffer;
}

interface IDownloadLinkAndSongTitle {
  downloadLink: string;
  songTitle: string;
}

interface ISongIdAndSongTitle {
  songId: number;
  title: string;
}

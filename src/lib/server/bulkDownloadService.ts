import AdmZip from 'adm-zip';
import { getDownloadLinkFromSongId } from './songsterrService';
import { logger } from '$lib/utils/logger';
import { kv } from '@vercel/kv';

export class BulkDownloadService {
  artistId: string;
  MAX_SEARCH_RESULTS = 50;
  BULK_DOWNLOAD_CACHE_KEY: string;

  constructor(artistId: string) {
    this.artistId = artistId;

    this.BULK_DOWNLOAD_CACHE_KEY = `${this.artistId}_bulk_download`;
  }

  public getZipFileOfAllTabs = async (): Promise<any> => {
    const zip = new AdmZip();

    const downloadLinksAndSongTitles = await this.getDownloadLinksFromSongIds();

    const arrayBuffers = await Promise.all(
      downloadLinksAndSongTitles
        .filter(this.withCompleteDownloadLink)
        .map((obj) => this.downloadLinkAndReturnArrayBuffer(obj.downloadLink))
    );

    /*
      Horrible pattern here, but in order for us to leverage Promise.all(),
      it returns an array of buffers that match the same index of the songTitles.
      When adding it to the zip, we do it like so.
    */
    arrayBuffers.forEach((buf, idx) => {
      const { songTitle } = downloadLinksAndSongTitles[idx];

      zip.addFile(
        `${songTitle}.gpx`,
        // @ts-ignore
        new Uint8Array(buf),
        `storing ${songTitle} in the zip`
      );
    });

    return zip;
  };

  private async downloadLinkAndReturnArrayBuffer(
    link: string
  ): Promise<ArrayBuffer> {
    const downloadResponse = await fetch(link);
    return downloadResponse.arrayBuffer();
  }

  private async getDownloadLinksFromSongIds(): Promise<
    IDownloadLinkAndSongTitle[]
  > {
    try {
      const cachedDownloadLinks = await this.retrieveLinksFromKv();
      if (cachedDownloadLinks?.length) {
        logger.log(
          'Cache HIT',
          `retrieved links from artistID: ${this.artistId}`
        );
        return cachedDownloadLinks;
      }
    } catch (error) {
      logger.error(
        'Error retrieving cache',
        `error retrieving cached links from artistId: ${this.artistId}`,
        error
      );
    }

    const songIdsAndSongTitles = await this.getSongIdsAndSongTitlesFromArtist();
    const downloadLinksAndSongTitles = await Promise.all(
      songIdsAndSongTitles.map(async (obj) => {
        const downloadLink = await getDownloadLinkFromSongId(obj.songId);
        return {
          songTitle: obj.title,
          downloadLink
        };
      })
    );

    await this.storeLinksInKv(downloadLinksAndSongTitles);

    return downloadLinksAndSongTitles;
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

  private async storeLinksInKv(
    links: IDownloadLinkAndSongTitle[]
  ): Promise<void> {
    try {
      await kv.lpush(
        this.BULK_DOWNLOAD_CACHE_KEY,
        ...links.map((link) => JSON.stringify(link))
      );
    } catch (error) {
      logger.error(
        'vercel KV',
        `unable to store links for artistID: ${this.artistId} in KV: `,
        error
      );
    }
  }

  private async retrieveLinksFromKv(): Promise<IDownloadLinkAndSongTitle[]> {
    return kv.lrange(this.BULK_DOWNLOAD_CACHE_KEY, 0, 100);
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

interface IDownloadLinkAndSongTitle {
  downloadLink: string;
  songTitle: string;
}

interface ISongIdAndSongTitle {
  songId: number;
  title: string;
}

import AdmZip from 'adm-zip';
import { MAX_SONGS_TO_BULK_DOWNLOAD } from '$env/static/private';
import { getDownloadLinkFromSongId } from './songsterr.service';
import { logger } from '$lib/utils/logger';
import Fetcher from '$lib/utils/fetch';

export class BulkDownloadService {
  artistId: string;
  constructor(artistId: string) {
    this.artistId = artistId;
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

  async getDownloadLinksFromSongIds(): Promise<IDownloadLinkAndSongTitle[]> {
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

  async getSongIdsAndSongTitlesFromArtist(): Promise<BulkSongToDownload[]> {
    const url = `https://www.songsterr.com/api/artist/${this.artistId}/songs?size=${MAX_SONGS_TO_BULK_DOWNLOAD}`;
    const results = (await new Fetcher().fetchAndReturnJson(
      url
    )) as ISearchResultByArtist[];

    return results.map((result) => ({
      songId: result.songId,
      title: result.title
    }));
  }

  private withCompleteDownloadLink(obj: IDownloadLinkAndSongTitle): boolean {
    if (!obj.downloadLink) {
      logger.warn(
        `${JSON.stringify(
          obj,
          null,
          2
        )} has an empty download link, skipping for now`
      );
      return false;
    }

    return true;
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

export interface BulkSongToDownload {
  songId: number;
  title: string;
}

import { MAX_SONGS_TO_BULK_DOWNLOAD } from '$env/static/private';
import Fetcher from '$lib/utils/fetch';
import { logger } from '$lib/utils/logger';
import { normalize } from '$lib/utils/string';
import { MailDataRequired } from '@sendgrid/mail';
import AdmZip from 'adm-zip';
import { getDownloadLinkFromSongId } from '../songsterr.service';
import {
  BulkSongToDownload,
  IDownloadLinkAndSongTitle,
  ISearchResultByArtist
} from './types';

export class BulkDownloadService {
  artistId: string;
  constructor(artistId: string) {
    this.artistId = artistId;
  }

  public getZipFileOfAllTabs = async (): Promise<AdmZip> => {
    const zip = new AdmZip();

    const downloadLinksAndSongTitles = (
      await this.getDownloadLinksFromSongIds()
    ).filter(this.withCompleteDownloadLink);

    const arrayBuffers = await Promise.all(
      downloadLinksAndSongTitles.map((obj) =>
        new Fetcher().fetchAndReturnArrayBuffer(obj.downloadLink)
      )
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
        Buffer.from(buf.buffer),
        `storing ${songTitle} in the zip`
      );
    });

    return zip;
  };

  public getZipFileAndAttachmentForEmail = async (
    artistName: string
  ): Promise<MailDataRequired['attachments']> => {
    const zip = await this.getZipFileOfAllTabs();
    const attachment = await zip.toBufferPromise();

    return [
      {
        content: Buffer.from(attachment).toString('base64'),
        filename: `${normalize(artistName)}-tabs.zip`,
        type: 'application/zip'
      }
    ];
  };

  public uploadBulkTabsToS3() {
    throw new Error('not implemented');
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
    const results = await new Fetcher().fetchAndReturnJson<
      ISearchResultByArtist[]
    >(url);

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

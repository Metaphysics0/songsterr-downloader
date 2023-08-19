import AdmZip from 'adm-zip';
import { getDownloadLinkFromSongId } from './songsterrService';

export class BulkDownloadService {
  artistId: string;
  MAX_SEARCH_RESULTS = 50;

  constructor(artistId: string) {
    this.artistId = artistId;
  }

  public getZipFileOfAllTabs = async (): Promise<any> => {
    const zip = new AdmZip();

    const { downloadLinks, songTitles } =
      await this.getDownloadLinksFromSongIds();

    const arrayBuffers = await Promise.all(
      downloadLinks.map(this.downloadLinkAndReturnArrayBuffer)
    );

    /*
      Horrible pattern here, but in order for us to leverage Promise.all(),
      it returns an array of buffers that match the same index of the songTitles.
      When adding it to the zip, we do it like so.
    */
    arrayBuffers.forEach((buf, idx) => {
      zip.addFile(
        `${songTitles[idx]}.gpx`,
        // @ts-ignore
        new Uint8Array(buf),
        `storing ${songTitles[idx]} in the zip`
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

  private async getDownloadLinksFromSongIds(): Promise<IDownloadLinksAndSongTitles> {
    const songIdsAndSongTitles = await this.getSongIdsAndSongTitlesFromArtist();
    const downloadLinks = await Promise.all(
      songIdsAndSongTitles.map((obj) => getDownloadLinkFromSongId(obj.songId))
    );

    return {
      downloadLinks,
      songTitles: songIdsAndSongTitles.map((o) => o.title)
    };
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

interface IDownloadLinksAndSongTitles {
  downloadLinks: string[];
  songTitles: string[];
}

interface ISongIdAndSongTitle {
  songId: number;
  title: string;
}

type ISongIds = string[];
type IDownloadLinks = string[];

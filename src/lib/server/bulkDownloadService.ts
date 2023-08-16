import AdmZip from 'adm-zip';

export class BulkDownloadService {
  artistId: string;

  constructor({ artistId }: { artistId: string }) {
    this.artistId = artistId;
  }

  public async getZipFileOfAllTabs(): Promise<AdmZip> {
    const zip = new AdmZip();

    const content = 'my content';
    zip.addFile(
      'test.txt',
      Buffer.from(content, 'utf8'),
      'entry comment goes here'
    );
    return zip;
  }

  private async getDownloadLinksFromSongIds(
    songIds: ISongIds
  ): Promise<IDownloadLinks> {
    return [];
  }

  private async getSongIdsFromArtist(): Promise<ISongIds> {
    return [];
  }
}

type ISongIds = string[];
type IDownloadLinks = string[];

import Fetcher from '$lib/utils/fetch';

export class ByDownloadLinkService {
  downloadLink: string;

  constructor({ downloadLink }: ByDownloadLinkParams) {
    this.downloadLink = downloadLink;
  }

  async download() {
    return new Fetcher().fetchAndReturnArrayBuffer(this.downloadLink);
  }
}

interface ByDownloadLinkParams {
  downloadLink: string;
  songTitle?: string;
  artistName?: string;
  fileExtension?: string;
}

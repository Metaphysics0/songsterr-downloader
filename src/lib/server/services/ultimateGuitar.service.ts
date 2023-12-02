import Fetcher from '$lib/utils/fetch';
import { logger } from '$lib/utils/logger';

export class UltimateGuitarService extends Fetcher {
  url: string;
  constructor(url: string) {
    super({ withRotatingUserAgent: false });
    this.url = url;
  }

  async download() {
    return this.fetchAndReturnArrayBuffer(this.downloadUrl);
  }

  get fileNameFromUrl(): string {
    try {
      const { artist, songName } = this.songMetadataFromUrl;
      return artist + '_' + songName!.replace(/ /g, '-') + '.gp5';
    } catch (error) {
      logger.error(`error building filename from UG link: ${error}`);
      return 'ultimate-guitar-downloaded.gp5';
    }
  }

  get songMetadataFromUrl() {
    return {
      artist: this.urlPathSegments.at(-2),
      songName: this.urlPathSegments.at(-1)?.split('-').slice(0, -1).join(' ')
    };
  }

  get headers() {
    return new Headers({
      accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'accept-language': 'en-US,en;q=0.9',
      'sec-ch-ua':
        '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
      'sec-fetch-dest': 'document',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': 'same-site',
      'sec-fetch-user': '?1',
      'upgrade-insecure-requests': '1',
      Referer: this.url,
      'Referrer-Policy': 'no-referrer-when-downgrade'
    });
  }

  private get downloadUrl() {
    return `https://www.ultimate-guitar.com/tab/download?id=${this.downloadIdFromUrl}&session_id=`;
  }

  private get downloadIdFromUrl(): string {
    const id = this.url.split('-').at(-1);

    if (!id) {
      throw new Error(`error getting download id from url ${this.url}`);
    }

    return id;
  }

  private get urlPathSegments(): string[] {
    return this.url.split('/');
  }
}

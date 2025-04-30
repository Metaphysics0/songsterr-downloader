import { getRandomElementFromArray } from '../../utils/array';

export default class Fetcher {
  withRotatingUserAgent: boolean;
  withBrowserLikeHeaders: boolean;

  constructor({
    withRotatingUserAgent = true,
    withBrowserLikeHeaders = true
  }: FetcherOptions = {}) {
    this.withRotatingUserAgent = withRotatingUserAgent;
    this.withBrowserLikeHeaders = withBrowserLikeHeaders;
  }

  fetch(url: string, options?: any) {
    return fetch(url, { ...this.options, ...options });
  }

  async fetchAndReturnArrayBuffer(url: string) {
    const downloadResponse = await this.fetch(url);
    const buffer = await downloadResponse.arrayBuffer();
    return {
      downloadResponse,
      buffer,
      contentType: downloadResponse?.headers?.get('Content-Type') || ''
    };
  }

  async fetchAndReturnJson<T = unknown>(
    url: string,
    options?: any
  ): Promise<T> {
    const response = await this.fetch(url, options);
    return response.json();
  }

  async fetchAndReturnText(url: string) {
    const response = await this.fetch(url);
    return response.text();
  }

  get options() {
    return {
      headers: this.headers
    };
  }

  get headers() {
    const headerObject: Record<string, any> = {};
    if (this.withRotatingUserAgent) {
      headerObject['User-Agent'] = this.randomUserAgent;
    }

    return new Headers(headerObject);
  }

  get browserLikeHeaders() {
    return {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      Accept: 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'sec-ch-ua':
        '"Google Chrome";v="121", "Not-A.Brand";v="8", "Chromium";v="121"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
      'sec-fetch-site': 'same-origin',
      'sec-fetch-mode': 'cors',
      'sec-fetch-dest': 'empty',
      Referer: 'https://www.songsterr.com/a/wsa/recent',
      Origin: 'https://www.songsterr.com',
      Connection: 'keep-alive',
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache'
    };
  }

  private get randomUserAgent() {
    return getRandomElementFromArray(this.userAgents);
  }

  userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:91.0) Gecko/20100101 Firefox/91.0',
    'Mozilla/5.0 (X11; Linux x86_64; rv:91.0) Gecko/20100101 Firefox/91.0',
    'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:91.0) Gecko/20100101 Firefox/91.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:91.0) Gecko/20100101 Firefox/91.0',
    'Mozilla/5.0 (X11; Linux x86_64; rv:91.0) Gecko/20100101 Firefox/91.0'
  ];
}

interface FetcherOptions {
  withRotatingUserAgent?: boolean;
  withBrowserLikeHeaders?: boolean;
}

import { getRandomElementFromArray } from './array';

export default class Fetcher {
  withRotatingUserAgent: boolean;
  constructor({ withRotatingUserAgent = true }: FetcherOptions = {}) {
    this.withRotatingUserAgent = withRotatingUserAgent;
  }

  fetch(url: string) {
    return fetch(url, this.options);
  }

  async fetchAndReturnArrayBuffer(url: string) {
    const downloadResponse = await this.fetch(url);
    const buffer = await downloadResponse.arrayBuffer();
    return {
      downloadResponse,
      buffer
    };
  }

  async fetchAndReturnJson(url: string) {
    const response = await this.fetch(url);
    return response.json();
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
}

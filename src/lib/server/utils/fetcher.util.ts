/*
 * Every outbound request needs a deadline. Without one a stalled upstream
 * (Songsterr rate-limiting a datacenter IP, a hung CDN connection) holds the
 * request open until the serverless function itself is killed, which surfaces
 * as FUNCTION_INVOCATION_TIMEOUT instead of a recoverable per-part failure.
 */
export const DEFAULT_FETCH_TIMEOUT_MS = 8000;

export default class Fetcher {
  withRotatingUserAgent: boolean;
  withBrowserLikeHeaders: boolean;
  timeoutMs: number;

  constructor({
    withRotatingUserAgent = true,
    withBrowserLikeHeaders = true,
    timeoutMs = DEFAULT_FETCH_TIMEOUT_MS
  }: FetcherOptions = {}) {
    this.withRotatingUserAgent = withRotatingUserAgent;
    this.withBrowserLikeHeaders = withBrowserLikeHeaders;
    this.timeoutMs = timeoutMs;
  }

  fetch(url: string, options?: any) {
    const { signal, ...rest } = options ?? {};
    return fetch(url, {
      ...this.options,
      ...rest,
      signal: signal ?? AbortSignal.timeout(this.timeoutMs)
    });
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

  /*
   * browserLikeHeaders describes an XHR from the player (cors/empty, JSON
   * Accept) and suits the CDN revision payloads. Fetching a tab page is a
   * document navigation, so it needs the navigation equivalent - a bare
   * rotating User-Agent is the shape most likely to be challenged.
   */
  get browserLikeDocumentHeaders() {
    return {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'sec-ch-ua':
        '"Google Chrome";v="121", "Not-A.Brand";v="8", "Chromium";v="121"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
      'sec-fetch-site': 'none',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-dest': 'document',
      'sec-fetch-user': '?1',
      'Upgrade-Insecure-Requests': '1',
      Connection: 'keep-alive'
    };
  }

  private get randomUserAgent() {
    const randomIndex = Math.floor(Math.random() * this.userAgents.length);
    return this.userAgents[randomIndex];
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
  timeoutMs?: number;
}

/*
 * undici rejects with the signal's reason, so AbortSignal.timeout surfaces as
 * a TimeoutError DOMException. AbortError is accepted too since older runtimes
 * report an aborted fetch that way.
 */
export function isTimeoutError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const name = (error as { name?: string }).name;
  return name === 'TimeoutError' || name === 'AbortError';
}

import Fetcher from '$lib/server/utils/fetcher.util';
import { DOMParser } from '@xmldom/xmldom';
import { logger } from '$lib/server/logger';

/*
 * Songsterr answers server-side requests from datacenter IPs with a 429/403
 * "Quick check" page. Surface that distinctly so the UI can explain it.
 */
export class SongsterrBlockedError extends Error {
  constructor(
    url: string,
    readonly status: number
  ) {
    super(`Songsterr blocked the request for ${url} (${status})`);
    this.name = 'SongsterrBlockedError';
  }
}

class Scraper {
  async getDocumentFromUrl(url: string, websiteType: 'xml' | 'html') {
    const fetcher = new Fetcher({ withRotatingUserAgent: false });
    const response = await fetcher.fetch(url, {
      headers: fetcher.browserLikeDocumentHeaders
    });

    const text = await response.text();

    if (!response.ok || !text.includes('id="state"')) {
      // Log enough to tell a bot challenge / block apart from a real outage.
      logger.error(
        {
          url,
          status: response.status,
          server: response.headers.get('server'),
          cfRay: response.headers.get('cf-ray'),
          cfMitigated: response.headers.get('cf-mitigated'),
          contentType: response.headers.get('content-type'),
          bodySnippet: text.slice(0, 500)
        },
        'unexpected response scraping songsterr'
      );
    }

    if (response.status === 429 || response.status === 403) {
      throw new SongsterrBlockedError(url, response.status);
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url} (${response.status})`);
    }

    return new DOMParser().parseFromString(text, `text/${websiteType}`);
  }
}

export const scraper = new Scraper();

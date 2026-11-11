import Fetcher from '$lib/server/utils/fetcher.util';
import { DOMParser } from '@xmldom/xmldom';
import { logger } from '$lib/server/logger';

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

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url} (${response.status})`);
    }

    return new DOMParser().parseFromString(text, `text/${websiteType}`);
  }
}

export const scraper = new Scraper();

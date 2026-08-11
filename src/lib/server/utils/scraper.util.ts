import Fetcher from '$lib/server/utils/fetcher.util';
import { DOMParser } from '@xmldom/xmldom';

class Scraper {
  async getDocumentFromUrl(url: string, websiteType: 'xml' | 'html') {
    const fetcher = new Fetcher({ withRotatingUserAgent: false });
    const response = await fetcher.fetch(url, {
      headers: fetcher.browserLikeDocumentHeaders
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url} (${response.status})`);
    }

    const text = await response.text();
    return new DOMParser().parseFromString(text, `text/${websiteType}`);
  }
}

export const scraper = new Scraper();

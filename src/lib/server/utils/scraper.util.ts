import Fetcher from '$lib/utils/fetch';
import { DOMParser } from '@xmldom/xmldom';

class Scraper {
  async getDocumentFromUrl(url: string, websiteType: 'xml' | 'html') {
    const text = await new Fetcher().fetchAndReturnText(url);
    return new DOMParser().parseFromString(text, `text/${websiteType}`);
  }
}

export const scraper = new Scraper();

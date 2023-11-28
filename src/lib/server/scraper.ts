import Fetcher from '$lib/utils/fetch';
import { DOMParser } from '@xmldom/xmldom';

class Scraper {
  async getDocumentFromUrl(url: string, websiteType: 'xml' | 'html') {
    const text = await this.fetchAndGetText(url);
    const doc = new DOMParser().parseFromString(text, `text/${websiteType}`);

    return doc;
  }

  async fetchAndGetText(url: string) {
    try {
      const request = await new Fetcher().fetch(url);
      return request.text();
    } catch (error) {
      console.error('Error fetching url from the scraper', error);
      return '';
    }
  }
}

export const scraper = new Scraper();

import { DOMParser } from '@xmldom/xmldom';
import { Parser } from 'xml2js';

class Scraper {
  async getDocumentFromUrl(url: string, websiteType: 'xml' | 'html') {
    const text = await this.fetchAndGetText(url);
    const doc = new DOMParser().parseFromString(text, `text/${websiteType}`);

    return doc;
  }

  async fetchAndGetText(url: string) {
    const request = await fetch(url);
    return request.text();
  }

  async getSelectedSongDataFromXmlString(xmlString: string) {
    try {
      return new Parser().parseStringPromise(
        xmlString
      ) as Promise<ISongRevisionJson>;
    } catch (error) {
      console.error('error parsing xml string', error);
    }
  }
}

export const scraper = new Scraper();

import { DOMParser } from '@xmldom/xmldom';
import { Parser, parseString } from 'xml2js';

class Scraper {
  async getDocumentFromUrl(url: string, websiteType: 'xml' | 'html') {
    const text = await this.fetchAndGetText(url);
    const doc = new DOMParser().parseFromString(text, `text/${websiteType}`);

    // @ts-ignore
    const v = parseString(doc);
    console.log('V', JSON.stringify(v));

    return doc;
  }

  async fetchAndGetText(url: string) {
    const request = await fetch(url);
    return request.text();
  }

  async getSelectedSongDataFromXmlString(xmlString: string) {
    console.log('XML STRING', typeof xmlString);

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

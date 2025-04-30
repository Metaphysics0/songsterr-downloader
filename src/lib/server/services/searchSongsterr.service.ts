import { SONGSTERR_BASE_URL } from '$lib/constants';
import Fetcher from '$lib/utils/fetch';
import { kebabCase } from 'lodash-es';

export class SearchSongsterrService {
  async search(searchText: string): Promise<ISearchResult[]> {
    const url = this.createSongsterrSearchUrl(searchText);
    const searchResponse = await new Fetcher().fetch(url);
    const searchResults = (await searchResponse.json()) as ISearchResult[];

    return searchResults.map((searchResult) => ({
      ...searchResult,
      byLinkUrl: this.getTabUrlFromSearchResult(searchResult)
    }));
  }

  private createSongsterrSearchUrl(searchText: string) {
    const baseUrl = `${SONGSTERR_BASE_URL}/api/songs?size=${this.MAX_SEARCH_RESULTS}&pattern=`;
    return baseUrl + searchText;
  }

  private getTabUrlFromSearchResult(searchResult: ISearchResult): string {
    const urlPrefix = SONGSTERR_BASE_URL + '/a/wsa/';
    const urlSuffixParts = [searchResult.artist, searchResult.title, 'tab'];

    const urlSuffix = kebabCase(urlSuffixParts.join(' '));

    return urlPrefix + urlSuffix + `-s${searchResult.songId}`;
  }

  private MAX_SEARCH_RESULTS = 50;
}

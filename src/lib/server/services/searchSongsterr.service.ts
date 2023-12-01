import Fetcher from '$lib/utils/fetch';

export class SearchSongsterrService {
  async search(searchText: string): Promise<ISearchResult[]> {
    const url = this.createSongsterrSearchUrl(searchText);
    const searchResponse = await new Fetcher().fetch(url);

    return searchResponse.json();
  }

  private createSongsterrSearchUrl(searchText: string) {
    const baseUrl = `https://www.songsterr.com/api/songs?size=${this.MAX_SEARCH_RESULTS}&pattern=`;
    return baseUrl + searchText;
  }

  private MAX_SEARCH_RESULTS = 50;
}

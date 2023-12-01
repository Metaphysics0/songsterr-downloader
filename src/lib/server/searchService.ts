import Fetcher from '$lib/utils/fetch';

const MAX_SEARCH_RESULTS = 50;

export async function search(searchText: string): Promise<ISearchResult[]> {
  const searchResponse = await callApi(searchText);
  return searchResponse.json();
}

async function callApi(searchText: string) {
  const url = createSongsterrSearchUrl(searchText);
  return new Fetcher().fetch(url);
}

const createSongsterrSearchUrl = (searchText: string) => {
  const baseUrl = `https://www.songsterr.com/api/songs?size=${MAX_SEARCH_RESULTS}&pattern=`;
  return baseUrl + searchText;
};

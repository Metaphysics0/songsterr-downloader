const MAX_SEARCH_RESULTS = 50;

export async function search(searchText: string): Promise<ISearchResult[]> {
  const searchResponse = await callApi(searchText);
  return searchResponse.json();
}

async function callApi(searchText: string) {
  const url = createSongsterrSearchUrl(searchText);
  return fetch(url, getFetchOptions(url));
}

const createSongsterrSearchUrl = (searchText: string) => {
  const baseUrl = `https://www.songsterr.com/api/songs?size=${MAX_SEARCH_RESULTS}&pattern=`;
  return baseUrl + searchText;
};

const getFetchOptions = (url: string): RequestInit => ({
  referrer: url,
  headers: {
    'sec-ch-ua':
      '"Google Chrome";v="113", "Chromium";v="113", "Not-A.Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"'
  },
  referrerPolicy: 'strict-origin-when-cross-origin',
  body: null,
  method: 'GET',
  mode: 'cors',
  credentials: 'omit'
});

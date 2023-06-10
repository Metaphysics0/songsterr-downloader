const MAX_SEARCH_LIMIT = 50;

export async function searchForSongsAndArtists(
  searchText: string
): Promise<ISearchResult[]> {
  const url = createSearchUrl(searchText);
  const searchResponse = await fetch(url, getFetchOptions(url));

  return searchResponse.json();
}

/*
 * Private
 */

const createSearchUrl = (searchText: string) => {
  const url = `https://www.songsterr.com/api/songs?size=${MAX_SEARCH_LIMIT}&pattern=`;
  return url + searchText;
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

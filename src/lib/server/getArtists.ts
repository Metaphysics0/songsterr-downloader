export async function searchForArtists(
	searchText: string
): Promise<ISearchResult[]> {
	const searchResponse = await search(searchText);
	return searchResponse.json();
}

/*
 * Private
 */
async function search(searchText: string) {
	const url = createSongsterrSearchUrl(searchText);
	console.log('URL TO FETCH', url);

	return fetch(url, getFetchOptions(url));
}

const createSongsterrSearchUrl = (searchText: string) => {
	const baseUrl = 'https://www.songsterr.com/api/songs?size=50&pattern=';
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

export async function searchForArtists(searchText: string) {
	const url = createSongsterrSearchUrl(searchText);

	// @ts-ignore
	const response = await fetch(url, {
		...fetchOptions,
		referrer: url
	});

	console.log('RESPONSE', JSON.stringify(response));
}

const createSongsterrSearchUrl = (searchText: string) => {
	const baseUrl = 'https://www.songsterr.com/api/songs?size=50&pattern=';
	return baseUrl + searchText;
};

const fetchOptions = {
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
};

interface ISearchResult {
	hasPlayer: boolean;
	artist: string;
	artistId: number;
	title: string;
	songId: number;
	tracks: IArtistTrack[];
	hasChords: boolean;
	defaultTrack: number;
}

interface IArtistTrack {
	tuning?: number[];
	tuningString?: string;
	instrumentId: number;
	dailyViews: number;
	views: number;
	difficulty?: string;
}

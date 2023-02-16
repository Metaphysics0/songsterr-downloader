import getSongTitleFromUrl from './getSongTitleFromUrl';

// CURRENTLY NOT WORKING
export default async function getDownloadResponseForClient(
	downloadLink: string,
	originalUrl: string
): Promise<Response | undefined> {
	const fileName = getSongTitleFromUrl(originalUrl);
	const response = await fetch(downloadLink);
	const headers = new Headers({
		'Content-Type': response.headers.get('Content-Type') ?? '',
		'Content-Length': response.headers.get('Content-Length') ?? '',
		'Content-Disposition': `attachment; filename="${fileName}"`
	});
	const body = await response.arrayBuffer();
	return new Response(body, { headers });
}

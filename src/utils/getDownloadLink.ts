import { DOMParser } from '@xmldom/xmldom';

export async function getDownloadLinkFromSongsterr(
	songsterrUrl: string
): Promise<string | undefined> {
	const revisionId = await getRevisionId(songsterrUrl);
	return getDownloadLink(revisionId);
}

async function getRevisionId(songsterrUrl: string): Promise<string> {
	const parsedHtml = await _getParsedContentsFromUrl(songsterrUrl, 'html');
	const metadata = parsedHtml.getElementById('state')?.childNodes[0].nodeValue;
	// @ts-ignore
	const { revisionId } = JSON.parse(metadata).meta.current;
	return revisionId;
}

async function getDownloadLink(
	revisionId: string
): Promise<string | undefined> {
	const xmlUrl = `https://www.songsterr.com/a/ra/player/songrevision/${revisionId}.xml`;
	const parsedXml = await _getParsedContentsFromUrl(xmlUrl, 'xml');

	const guitarProTab = parsedXml
		.getElementsByTagName('guitarProTab')[0]
		.getElementsByTagName('attachmentUrl')[0].firstChild?.nodeValue;

	return guitarProTab || '';
}

// helpers
export function buildFileName(url: string, downloadUrl: string): string {
	const fileName = url.substring(
		url.lastIndexOf('/') + 1,
		url.lastIndexOf('-')
	);
	const fileType = downloadUrl.endsWith('.gp5') ? '.gp5' : '.gp';
	return fileName + fileType;
}
async function _getParsedContentsFromUrl(
	url: string,
	websiteType: 'xml' | 'html'
) {
	const request = await fetch(url);
	const text = await request.text();

	return new DOMParser().parseFromString(text, `text/${websiteType}`);
}

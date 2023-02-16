export default function getSongTitleFromUrl(url: string): string {
	return url.substring(url.lastIndexOf('/') + 1, url.lastIndexOf('-'));
}

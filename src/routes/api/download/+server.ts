import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDownloadLinkFromSongId } from '$lib/server/getDownloadLink';

export const GET = (async ({ request }): Promise<Response> => {
	const { songId } = await request.json();
	const link = await getDownloadLinkFromSongId(songId);
	if (!link) throw 'Unable to find download link';

	const downloadResponse = await fetch(link);
	const buf = await downloadResponse.arrayBuffer();

	return json({
		file: Array.from(new Uint8Array(buf)),
		fileName: 'test file name for now',
		contentType:
			downloadResponse.headers.get('Content-Type') || 'application/gp'
	});
}) satisfies RequestHandler;

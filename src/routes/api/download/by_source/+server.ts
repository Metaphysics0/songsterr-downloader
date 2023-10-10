import { buildFileNameFromSongName } from '$lib/server/songsterrService';
import { json, type HttpError } from '@sveltejs/kit';

export const POST = async ({ request }): Promise<Response | HttpError> => {
  const { source, songTitle } = await request.json();
  const { downloadResponse, buf } = await downloadAndGetArrayBuffer(source);

  return json({
    file: Array.from(new Uint8Array(buf)),
    fileName: buildFileNameFromSongName(songTitle, source),
    contentType:
      downloadResponse.headers.get('Content-Type') || 'application/gp'
  });
};

async function downloadAndGetArrayBuffer(url: string) {
  const downloadResponse = await fetch(url);
  const buf = await downloadResponse.arrayBuffer();

  return { downloadResponse, buf };
}

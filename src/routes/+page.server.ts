import { SONGSTERR_URL_REGEX_PATTERN } from '../consts';
import {
  getDownloadLinkFromSongsterrUrl,
  buildFileName
} from '$lib/server/getDownloadLink';

import type { Actions } from './$types';

export const actions = {
  getFileResource: async ({
    request
  }): Promise<SongsterrDownloadResponse | undefined> => {
    try {
      const data = await request.formData();
      const userInput = data.get('url')?.toString();
      if (!userInput) return;

      if (!SONGSTERR_URL_REGEX_PATTERN.test(String(userInput)))
        throw 'invalid input!';

      const { downloadLink } = await getDownloadLinkFromSongsterrUrl(userInput);
      if (!downloadLink) throw 'Unable to get download link';

      const downloadResponse = await fetch(downloadLink);
      const buf = await downloadResponse.arrayBuffer();

      return {
        file: Array.from(new Uint8Array(buf)),
        fileName: buildFileName(userInput, downloadLink),
        contentType:
          downloadResponse.headers.get('Content-Type') || 'application/gp'
      };
    } catch (error) {
      console.error('error', error);
      return;
    }
  },
  getSelectedSongFromUrl: async ({
    request
  }): Promise<ISelectedSongResponse> => {
    const url = await getUrlParam(request);
    try {
      if (!isUrlValid(url)) {
        throwUrlIsInvalidError(url);
      }

      const { downloadLink, songTitle } = await getDownloadLinkFromSongsterrUrl(
        url!
      );

      return {
        downloadLink,
        songTitle
      };
    } catch (error) {
      console.error('error getting download link and song title', error);
      return {
        songTitle: { artist: '', songName: '' },
        downloadLink: ''
      };
    }
  }
} satisfies Actions;

async function getUrlParam(request: Request): Promise<string | undefined> {
  const data = await request.formData();
  return data.get('url')?.toString();
}

function isUrlValid(url: any) {
  return SONGSTERR_URL_REGEX_PATTERN.test(String(url));
}

function throwUrlIsInvalidError(url: string | undefined) {
  throw `${url} is not a valid songsterr link.`;
}
/*
 *  private
 */

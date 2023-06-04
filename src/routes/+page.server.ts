import { SONGSTERR_URL_REGEX_PATTERN } from '../consts';
import {
  getDownloadLinkFromSongsterr,
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

      const link = await getDownloadLinkFromSongsterr(userInput);
      if (!link) throw 'Unable to get download link';

      const downloadResponse = await fetch(link);
      const buf = await downloadResponse.arrayBuffer();

      return {
        file: Array.from(new Uint8Array(buf)),
        fileName: buildFileName(userInput, link),
        contentType:
          downloadResponse.headers.get('Content-Type') || 'application/gp'
      };
    } catch (error) {
      console.error('error', error);
      return;
    }
  }
} satisfies Actions;

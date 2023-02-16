import { getDownloadLinkFromSongsterr } from '../utils/getDownloadLink';
import getDownloadResponseForClient from '../utils/getDownloadResponseForClient';
import getSongTitleFromUrl from '../utils/getSongTitleFromUrl';
import type { Actions } from './$types';

export const actions = {
	getDownloadLink: async ({ request }) => {
		const data = await request.formData();
		const userInput = data.get('url');
		// @ts-ignore
		return await getDownloadLinkFromSongsterr(userInput);
	}
} satisfies Actions;

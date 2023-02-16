import { songsterrUrlRegex } from '../consts';
import { getDownloadLinkFromSongsterr } from '../utils/getDownloadLink';
import type { Actions } from './$types';

export const actions = {
	getDownloadLink: async ({ request }) => {
		try {
			const data = await request.formData();
			const userInput = data.get('url')?.toString();

			if (!userInput) return;

			if (!songsterrUrlRegex.test(String(userInput))) {
				console.error('invalid input');
				return;
			}
			return await getDownloadLinkFromSongsterr(userInput);
		} catch (error) {
			console.error('error');
			return;
		}
	}
} satisfies Actions;

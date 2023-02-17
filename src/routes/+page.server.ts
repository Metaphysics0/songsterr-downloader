import { SONGSTERR_URL_REGEX_PATTERN } from '../consts';
import { getDownloadLinkFromSongsterr } from '../utils/getDownloadLink';
import type { Actions } from './$types';

export const actions = {
	/* see how to return a blob here:
	 * https://github.com/sveltejs/kit/issues/6008#issuecomment-1227510231
	 */
	getDownloadLink: async ({ request }) => {
		try {
			const data = await request.formData();
			const userInput = data.get('url')?.toString();

			if (!userInput) return;

			if (!SONGSTERR_URL_REGEX_PATTERN.test(String(userInput))) {
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

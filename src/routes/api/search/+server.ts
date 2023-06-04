import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { searchForArtists } from '$lib/server/getArtists';

export const POST = (async ({ request }) => {
  const { searchText } = await request.json();
  if (!searchText) throw 'Input not provided!';

  const searchResults = await searchForArtists(searchText);

  return json({
    searchResults
  });
}) satisfies RequestHandler;

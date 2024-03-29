import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SearchSongsterrService } from '$lib/server/services/searchSongsterr.service';

export const POST = (async ({ request }) => {
  const { searchText } = await request.json();
  if (!searchText) throw 'Input not provided!';

  const service = new SearchSongsterrService();
  const searchResults = await service.search(searchText);

  return json({
    searchResults
  });
}) satisfies RequestHandler;

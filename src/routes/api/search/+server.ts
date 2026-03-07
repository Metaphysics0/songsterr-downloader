import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SongsterrService } from '$lib/server/services/songsterr.service';

export const POST = (async ({ request }) => {
  const { searchText } = await request.json();
  if (!searchText) throw 'Input not provided!';

  const service = new SongsterrService();
  const searchResults = await service.search(searchText);

  return json({
    searchResults
  });
}) satisfies RequestHandler;

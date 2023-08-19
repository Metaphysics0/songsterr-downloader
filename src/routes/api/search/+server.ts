import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { search } from '$lib/server/searchService';

export const POST = (async ({ request }) => {
  const { searchText } = await request.json();
  if (!searchText) throw 'Input not provided!';

  const searchResults = await search(searchText);

  return json({
    searchResults
  });
}) satisfies RequestHandler;

import { jsonWithCors } from '$lib/server/cors';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST = (async ({ request }) => {
  const params = await request.json();
  console.log('REQUEST PARAMS', JSON.stringify(params, null, 2));

  return json({ purchased: 'true' });
}) satisfies RequestHandler;

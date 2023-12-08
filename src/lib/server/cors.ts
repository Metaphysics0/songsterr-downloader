import { json } from '@sveltejs/kit';
import { PERMITTED_CORS_URL } from '$env/static/private';

export function jsonWithCors(data: any) {
  return json(data, {
    headers: {
      'Access-Control-Allow-Origin': PERMITTED_CORS_URL || ''
    }
  });
}

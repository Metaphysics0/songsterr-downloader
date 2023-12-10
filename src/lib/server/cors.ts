import { json } from '@sveltejs/kit';
import {
  CORS_PRODUCTION_ORIGIN,
  CORS_DEVELOPMENT_ORIGIN
} from '$env/static/private';

export function jsonWithCors(request: Request, response: any) {
  const allowedOrigin = checkOrigin(request);

  if (allowedOrigin) {
    return json(response, {
      headers: corsHeaders(allowedOrigin)
    });
  }

  return json(response);
}

const corsHeaders = (origin: string) => ({
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'POST',
  'Access-Control-Allow-Origin': origin
});

const checkOrigin = (request: Request) => {
  const allowedOrigins = [CORS_DEVELOPMENT_ORIGIN, CORS_PRODUCTION_ORIGIN];
  const origin = request.headers.get('Origin');

  return allowedOrigins.find((allowedOrigin) =>
    allowedOrigin.includes(String(origin))
  );
};

import type { Handle, RequestEvent } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  if (shouldSupressChromeDevToolsWarningLog(event)) {
    return new Response(null, { status: 204 });
  }

  return await resolve(event);
};

function shouldSupressChromeDevToolsWarningLog(event: RequestEvent) {
  return event.url.pathname.startsWith(
    '/.well-known/appspecific/com.chrome.devtools'
  );
}

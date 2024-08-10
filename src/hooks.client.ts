import type { HandleClientError } from '@sveltejs/kit';
import { initializeClerkClient } from 'clerk-sveltekit/client';
import { PUBLIC_CLERK_PUBLISHABLE_KEY } from '$env/static/public';

initializeClerkClient(PUBLIC_CLERK_PUBLISHABLE_KEY, {
  afterSignInUrl: '/',
  afterSignUpUrl: '/',
  signInUrl: '/',
  signUpUrl: '/'
});

export const handleError: HandleClientError = async ({ error, event }) => {
  console.error(error, event);
};

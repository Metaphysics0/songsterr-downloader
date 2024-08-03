import { CLERK_SECRET_KEY } from '$env/static/private';
import { start_prisma } from '$lib/server/prisma';
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { handleClerk } from 'clerk-sveltekit/server';

start_prisma()
  .then(() => {
    console.log('Prisma started 🟢');
  })
  .catch((e: any) => {
    console.error('🔴 Error starting prisma', e);
  });

export const handle: Handle = sequence(
  handleClerk(CLERK_SECRET_KEY, {
    debug: true,
    protectedPaths: ['/admin'],
    signInUrl: '/sign-in'
  })
);

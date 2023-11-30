import { start_prisma } from '$lib/server/prisma';

start_prisma()
  .then(() => {
    console.log('Prisma started 🟢');
  })
  .catch((e: any) => {
    console.error('🔴 Error starting prisma', e);
  });

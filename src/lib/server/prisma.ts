import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function start_prisma() {
  console.log('Starting prisma...');
  return prisma.$connect();
}

export default prisma;

import prisma from '../prisma';
import type { Prisma } from '@prisma/client';

class StoreDownloadLinkRepository {
  async store(params: Prisma.GuitarProTabDownloadLinksCreateArgs) {
    await prisma.guitarProTabDownloadLinks.create(params);
  }

  async findBySongsterrSongId(id: string) {
    return prisma.guitarProTabDownloadLinks.findFirst({
      where: {
        songsterrSongId: id
      }
    });
  }
}

export const storeDownloadLinkRepository = new StoreDownloadLinkRepository();

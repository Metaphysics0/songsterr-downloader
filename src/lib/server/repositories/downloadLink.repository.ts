import { logger } from '$lib/utils/logger';
import prisma from '../prisma';
import type { Prisma } from '@prisma/client';
import { getDownloadLinkFromSongId } from '../songsterrService';

class DownloadLinkRepository {
  async create(params: Prisma.GuitarProTabDownloadLinksCreateArgs) {
    return this.baseQuery.create(params);
  }

  async findBySongsterrSongId(id: string) {
    return this.baseQuery.findFirst({
      where: {
        songsterrSongId: id
      },
      select: {
        downloadLink: true
      }
    });
  }

  async createOrRetrieveBySongsterrId(
    id: string,
    options?: Record<string, any>
  ): Promise<string> {
    const existingDownloadLink = await this.findBySongsterrSongId(id);
    if (existingDownloadLink) {
      logger.log('retrieved download link from cache', existingDownloadLink);
      return existingDownloadLink.downloadLink;
    }

    logger.log(`Writing songsterrId: ${id} to DB`);
    return getDownloadLinkFromSongId(id, options!.byLinkUrl);
  }

  async findByDownloadLink(downloadLink: string) {
    return this.baseQuery.findFirst({
      where: {
        downloadLink
      }
    });
  }

  async createOrRetrieveByDownloadLink(
    downloadLink: string,
    songsterrSongId?: string
  ) {
    const existingDoc = await this.findByDownloadLink(downloadLink);
    if (existingDoc) {
      logger.log('succesful find of existing download link', downloadLink);
      return existingDoc;
    }

    console.log('writing to DB', downloadLink);
    return this.create({
      data: {
        downloadLink,
        songsterrSongId: String(songsterrSongId)!
      }
    });
  }

  private get baseQuery() {
    return prisma.guitarProTabDownloadLinks;
  }
}

export const downloadLinkRepository = new DownloadLinkRepository();

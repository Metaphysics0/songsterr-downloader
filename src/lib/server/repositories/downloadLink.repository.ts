import { logger } from '$lib/utils/logger';
import prisma from '../prisma';
import type { Prisma } from '@prisma/client';
import { getDownloadLinkFromSongId } from '../songsterrService';

export class DownloadLinkRepository {
  async create(params: Prisma.GuitarProTabDownloadLinksCreateArgs) {
    return this.baseQuery.create(params);
  }

  async upsertByS3DownloadLink({
    s3DownloadLink,
    songsterrDownloadLink,
    songsterrSongId
  }: {
    s3DownloadLink: string;
    songsterrDownloadLink: string;
    songsterrSongId: string;
  }) {
    return this.baseQuery.upsert({
      where: {
        s3DownloadLink
      },
      create: {
        s3DownloadLink,
        songsterrDownloadLink,
        songsterrSongId
      },
      update: {}
    });
  }

  async upsertByDownloadLink(
    songsterrDownloadLink: string,
    songsterrSongId: string
  ) {
    return this.baseQuery.upsert({
      where: {
        songsterrDownloadLink
      },
      create: {
        songsterrDownloadLink,
        songsterrSongId
      },
      update: {}
    });
  }

  async getS3DownloadLinkSongsterrSongId(id: string) {
    const response = await this.baseQuery.findFirst({
      where: {
        songsterrSongId: String(id)
      },
      select: {
        s3DownloadLink: true
      }
    });
    return response?.s3DownloadLink;
  }

  private get baseQuery() {
    return prisma.guitarProTabDownloadLinks;
  }
}

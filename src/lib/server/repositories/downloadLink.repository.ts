import prisma from '../prisma';
import type { Prisma } from '@prisma/client';

export class DownloadLinkRepository {
  async create(params: Prisma.GuitarProTabDownloadLinksCreateArgs) {
    return this.baseQuery.create(params);
  }

  async upsertByS3DownloadLink(
    s3DownloadLink: string,
    params: Prisma.GuitarProTabDownloadLinksCreateInput
  ) {
    return this.baseQuery.upsert({
      where: {
        s3DownloadLink
      },
      create: {
        ...params,
        s3DownloadLink
      },
      update: {}
    });
  }

  async upsertBySongsterrDownloadLink(
    songsterrDownloadLink: string,
    params: Prisma.GuitarProTabDownloadLinksCreateInput
  ) {
    return this.baseQuery.upsert({
      where: {
        songsterrDownloadLink
      },
      create: {
        ...params,
        songsterrDownloadLink
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

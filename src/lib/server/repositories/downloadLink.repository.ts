import prisma from '../prisma';
import type { Prisma } from '@prisma/client';
import { S3Repository } from './s3.repository';

export class DownloadLinkRepository {
  constructor(private s3Repository = new S3Repository()) {}

  async create(params: Prisma.GuitarProTabDownloadLinksCreateArgs) {
    return this.baseQuery.create(params);
  }

  async upsertBySongsterrSongId(
    songsterrSongId: string,
    params: Prisma.GuitarProTabDownloadLinksCreateInput
  ) {
    return this.baseQuery.upsert({
      where: {
        songsterrSongId
      },
      create: {
        ...params,
        songsterrSongId
      },
      update: {
        ...params
      }
    });
  }

  async getS3DownloadLinkSongsterrSongId(id: string) {
    /* Maybe To-do:
     * update this method to findOneAndUpdate({..}), and add an increment downloadCount field
     */
    const response = await this.baseQuery.findFirst({
      where: {
        songsterrSongId: String(id)
      },
      select: {
        s3DownloadLink: true
      }
    });

    return this.s3Repository.ensureCloudfrontDomain(
      response?.s3DownloadLink || ''
    );
  }

  private get baseQuery() {
    return prisma.guitarProTabDownloadLinks;
  }
}

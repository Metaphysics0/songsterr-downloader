import prisma from '$lib/server/prisma';
import { User } from '@prisma/client';
import {
  MAXIMUM_AMOUNT_OF_DOWNLOADS_FOR_LOGGED_IN_USER,
  MAXIMUM_AMOUNT_OF_DAILY_DOWNLOADS_FOR_NON_LOGGED_IN_USER
} from '$lib/constants/maximum-amount-of-downloads.constants';
import { logger } from '$lib/utils/logger';
import { MaximumAmountOfDownloadsExceededError } from '$lib/server/utils/errors/errors.util';
import { isValidIpAddress } from '$lib/server/utils/is-valid-ip-address.util';
import { isToday } from '$lib/utils/date';
import { getMappedIpAddress } from '$lib/constants/ip-address-mapping.const';

export class UserService {
  async findOrCreateUserFromIpAddress({
    ipAddress
  }: FindOrCreateUserFromIpAddressParams) {
    try {
      logger.info(
        `UserService - findOrCreateUserFromIpAddress - finding or creating user from ip address: ${ipAddress}`
      );

      const mappedIpAddress = getMappedIpAddress(ipAddress);
      if (!isValidIpAddress(mappedIpAddress)) {
        throw new Error(
          'UserService - findOrCreateUserFromIpAddress - invalid ip address provided'
        );
      }

      return prisma.user.upsert({
        where: { ipAddress: mappedIpAddress },
        update: {},
        create: { ipAddress: mappedIpAddress }
      });
    } catch (error) {
      logger.error(
        `UserService - findOrcreateUserFromIpAddress - Error finding or creating user from ip address: ${ipAddress}: ${error}`
      );
    }
  }

  async storeDownloadedSongToUserIpAddress({
    ipAddress,
    songsterrSongId
  }: StoreDownloadedSongToUserParams): Promise<void> {
    try {
      logger.info(
        `POST api/download - Storing downloaded song to user with ip address: ${ipAddress}`
      );
      const user = await this.findOrCreateUserFromIpAddress({ ipAddress });
      if (!user) {
        throw new Error(
          'UserService - storeDownloadedSongToUserIpAddress - user is undefined, unable to store song'
        );
      }

      this.ensureUserHasNotExceededMaximumAmountOfDownloads(user);

      const hasUserAlreadyDownloadedSong = user.downloadedSongs.find(
        (song) => song.songsterrSongId === songsterrSongId
      );

      if (hasUserAlreadyDownloadedSong) {
        await incrementDownloadedSongAmount({
          userId: user.id,
          songsterrSongId
        });
      } else {
        await pushDownloadedSong({ userId: user.id, songsterrSongId });
      }
    } catch (error) {
      console.error('Error in storeDownloadedSongToUser:', error);
    }
  }

  async getAmountOfDownloadsAvaialbleFromIpAddress({
    ipAddress
  }: {
    ipAddress: string;
  }): Promise<number> {
    try {
      const user = await this.findOrCreateUserFromIpAddress({ ipAddress });
      if (!user) {
        logger.info(
          `No user found for ip address: ${ipAddress}. Returning default amount of downloads`
        );
        return MAXIMUM_AMOUNT_OF_DAILY_DOWNLOADS_FOR_NON_LOGGED_IN_USER;
      }

      const today = new Date();

      const allSongsDownloadedToday = user.downloadedSongs.filter(
        (downloadedSong) => isToday(downloadedSong.createdAt, today)
      );

      if (
        allSongsDownloadedToday.length >=
        MAXIMUM_AMOUNT_OF_DAILY_DOWNLOADS_FOR_NON_LOGGED_IN_USER
      ) {
        return 0;
      }

      return (
        MAXIMUM_AMOUNT_OF_DAILY_DOWNLOADS_FOR_NON_LOGGED_IN_USER -
        allSongsDownloadedToday.length
      );
    } catch (error) {
      logger.warn(
        `UserService - getAmountOfDownloadsAvaialbleFromIpAddress failed, ${error}`
      );
      return MAXIMUM_AMOUNT_OF_DAILY_DOWNLOADS_FOR_NON_LOGGED_IN_USER;
    }
  }

  ensureUserHasNotExceededMaximumAmountOfDownloads(user: User): void {
    const uniqueDownloads = user.downloadedSongs.length;
    if (
      !user.email &&
      uniqueDownloads >=
        MAXIMUM_AMOUNT_OF_DAILY_DOWNLOADS_FOR_NON_LOGGED_IN_USER
    ) {
      throw new MaximumAmountOfDownloadsExceededError({
        message: 'You have exceeded download limit. Please create an account.',
        isUserLoggedIn: false
      });
    }

    if (uniqueDownloads >= MAXIMUM_AMOUNT_OF_DOWNLOADS_FOR_LOGGED_IN_USER) {
      throw new MaximumAmountOfDownloadsExceededError({
        message: 'Logged in user has exceeded download limit.',
        isUserLoggedIn: true
      });
    }
  }
}

async function pushDownloadedSong({
  userId,
  songsterrSongId
}: {
  userId: string;
  songsterrSongId: number;
}) {
  await prisma.user.update({
    where: { id: userId },
    data: { downloadedSongs: { push: { songsterrSongId, amount: 1 } } }
  });
}

async function incrementDownloadedSongAmount({
  userId,
  songsterrSongId
}: {
  userId: string;
  songsterrSongId: number;
}) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      downloadedSongs: {
        updateMany: {
          where: { songsterrSongId },
          data: { amount: { increment: 1 } }
        }
      }
    }
  });
}

interface StoreDownloadedSongToUserParams {
  ipAddress: string;
  songsterrSongId: number;
}

interface FindOrCreateUserFromIpAddressParams {
  ipAddress: string;
}

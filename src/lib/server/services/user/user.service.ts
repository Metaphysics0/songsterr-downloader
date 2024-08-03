import prisma from '$lib/server/prisma';
import { User } from '@prisma/client';
import {
  MAXIMUM_AMOUNT_OF_DOWNLOADS_FOR_LOGGED_IN_USER,
  MAXIMUM_AMOUNT_OF_DOWNLOADS_FOR_NON_LOGGED_IN_USER
} from '$lib/constants/maximum-amount-of-downloads.constants';
import { logger } from '$lib/utils/logger';
import { MaximumAmountOfDownloadsExceededError } from '$lib/server/utils/errors/errors.util';

export async function storeDownloadedSongToUser({
  ipAddress,
  songsterrSongId
}: StoreDownloadedSongToUserParams): Promise<void> {
  try {
    logger.info(
      `POST api/download - Storing downloaded song to user with ip address: ${ipAddress}`
    );
    const user = await prisma.user.findUnique({ where: { ipAddress } });

    if (!user) {
      await createUserFromIpAddress({ ipAddress, songsterrSongId });
      return;
    }

    const hasUserAlreadyDownloadedSong = user.downloadedSongs.find(
      (song) => song.songsterrSongId === songsterrSongId
    );

    if (hasUserAlreadyDownloadedSong) {
      await incrementDownloadedSongAmount({ userId: user.id, songsterrSongId });
    } else {
      ensureUserHasNotExceededMaximumAmountOfDownloads(user);
      await pushDownloadedSong({ userId: user.id, songsterrSongId });
    }
  } catch (error) {
    console.error('Error in storeDownloadedSongToUser:', error);
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

async function createUserFromIpAddress({
  ipAddress,
  songsterrSongId
}: StoreDownloadedSongToUserParams) {
  return prisma.user.create({
    data: {
      ipAddress,
      downloadedSongs: [{ songsterrSongId, amount: 1 }]
    }
  });
}

function ensureUserHasNotExceededMaximumAmountOfDownloads(user: User): void {
  const uniqueDownloads = user.downloadedSongs.length;
  if (
    !user.email &&
    uniqueDownloads >= MAXIMUM_AMOUNT_OF_DOWNLOADS_FOR_NON_LOGGED_IN_USER
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

interface StoreDownloadedSongToUserParams {
  ipAddress: string;
  songsterrSongId: number;
}

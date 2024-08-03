import {
  MAXIMUM_AMOUNT_OF_DOWNLOADS_FOR_LOGGED_IN_USER,
  MAXIMUM_AMOUNT_OF_DOWNLOADS_FOR_NON_LOGGED_IN_USER
} from '$lib/constants/maximum-amount-of-downloads.constants';
import prisma from '$lib/server/prisma';

export async function storeDownloadedSongToUser({
  ipAddress,
  songsterrSongId
}: {
  ipAddress: string;
  songsterrSongId: number;
}): Promise<void> {
  try {
    // Upsert the User and update the downloadedSongs in one operation
    const user = await prisma.user.upsert({
      where: { ipAddress },
      create: {
        ipAddress,
        downloadedSongs: [{ songsterrSongId, amount: 1 }]
      },
      update: {
        downloadedSongs: {
          push: { songsterrSongId, amount: 1 }
        }
      }
    });

    // Check if the song already exists and update its amount if it does
    const existingSongIndex = user.downloadedSongs.findIndex(
      (song) => song.songsterrSongId === songsterrSongId
    );

    if (existingSongIndex !== -1) {
      await prisma.user.update({
        where: { id: user.id },
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

    // Check download limits
    const uniqueDownloads = user.downloadedSongs.length;

    if (
      !user.email &&
      uniqueDownloads > MAXIMUM_AMOUNT_OF_DOWNLOADS_FOR_NON_LOGGED_IN_USER
    ) {
      throw new Error(
        'Non-logged in user has exceeded download limit. Please create an account.'
      );
    }

    if (
      user.email &&
      uniqueDownloads > MAXIMUM_AMOUNT_OF_DOWNLOADS_FOR_LOGGED_IN_USER
    ) {
      throw new Error('Logged in user has exceeded download limit.');
    }
  } catch (error) {
    console.error('Error in storeDownloadedSongToUser:', error);
  }
}

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
    // First, upsert the User
    const user = await prisma.user.upsert({
      where: { ipAddress },
      create: { ipAddress },
      update: {}
    });

    // Then, upsert the Song
    const song = await prisma.song.upsert({
      where: { songsterrSongId },
      create: { songsterrSongId },
      update: {}
    });

    // Finally, upsert the DownloadedSong
    await prisma.downloadedSong.upsert({
      where: {
        userId_songId: {
          userId: user.id,
          songId: song.id
        }
      },
      create: {
        userId: user.id,
        songId: song.id,
        amount: 1
      },
      update: {
        amount: { increment: 1 }
      }
    });

    // Check download limits
    const uniqueDownloads = await prisma.downloadedSong.count({
      where: { userId: user.id }
    });

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

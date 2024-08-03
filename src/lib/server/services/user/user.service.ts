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
    // First, try to find the user
    let user = await prisma.user.findUnique({
      where: { ipAddress }
    });

    if (!user) {
      // If user doesn't exist, create a new one with the downloaded song
      user = await prisma.user.create({
        data: {
          ipAddress,
          downloadedSongs: [{ songsterrSongId, amount: 1 }]
        }
      });
    } else {
      // If user exists, check if the song is already in their downloadedSongs
      const existingSongIndex = user.downloadedSongs.findIndex(
        (song) => song.songsterrSongId === songsterrSongId
      );

      if (existingSongIndex !== -1) {
        // If the song exists, increment its amount
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
      } else {
        // If the song doesn't exist, add it to the downloadedSongs array
        await prisma.user.update({
          where: { id: user.id },
          data: {
            downloadedSongs: {
              push: { songsterrSongId, amount: 1 }
            }
          }
        });
      }

      // Fetch the updated user data
      user = await prisma.user.findUnique({ where: { id: user.id } });
    }

    // Check download limits
    const uniqueDownloads = user!.downloadedSongs.length;

    if (
      !user!.email &&
      uniqueDownloads > MAXIMUM_AMOUNT_OF_DOWNLOADS_FOR_NON_LOGGED_IN_USER
    ) {
      throw new Error(
        'Non-logged in user has exceeded download limit. Please create an account.'
      );
    }

    if (
      user!.email &&
      uniqueDownloads > MAXIMUM_AMOUNT_OF_DOWNLOADS_FOR_LOGGED_IN_USER
    ) {
      throw new Error('Logged in user has exceeded download limit.');
    }
  } catch (error) {
    console.error('Error in storeDownloadedSongToUser:', error);
  }
}

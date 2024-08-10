import { User } from '@prisma/client';

export function sumAllUniqueDownloads(user: User): number {
  return [...new Set(user.downloadedSongs.map((song) => song.songsterrSongId))]
    .length;
}

import { isToday } from '$lib/utils/date';
import { User } from '@prisma/client';
import { sum } from 'lodash';

export function sumAllDownloadsFromToday(user: User): number {
  const today = new Date();
  const allSongsDownloadedToday = user.downloadedSongs.filter(
    (downloadedSong) => isToday(downloadedSong.createdAt, today)
  );
  return sum(allSongsDownloadedToday.map((song) => song.amount));
}

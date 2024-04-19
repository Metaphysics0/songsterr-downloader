export function getRequiredPaymentAmountForBulkTabs(
  selectedSong: ISearchResult | IPartialSearchResult
): number {
  const bulkSongsCount = selectedSong?.bulkSongsToDownload?.length || 0;
  if (!bulkSongsCount) return 0;

  if (bulkSongsCount <= 10) return 1.0;
  if (bulkSongsCount <= 20) return 2.0;
  if (bulkSongsCount <= 30) return 3.0;
  if (bulkSongsCount <= 40) return 4.0;
  if (bulkSongsCount <= 50) return 5.0;
  if (bulkSongsCount <= 60) return 6.0;
  if (bulkSongsCount <= 70) return 7.0;
  if (bulkSongsCount <= 80) return 8.0;
  if (bulkSongsCount <= 90) return 9.0;

  return 10.0;
}

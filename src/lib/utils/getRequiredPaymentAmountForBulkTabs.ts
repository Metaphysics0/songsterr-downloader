export function getRequiredPaymentAmountForBulkTabs(
  selectedSong: ISearchResult | IPartialSearchResult
): number {
  const bulkSongsCount = selectedSong?.bulkSongsToDownload?.length || 0;
  if (!bulkSongsCount) return 0;

  if (bulkSongsCount <= 10) return 1.0;
  if (bulkSongsCount <= 20) return 2.0;
  if (bulkSongsCount <= 30) return 3.0;
  if (bulkSongsCount <= 40) return 4.0;

  return 5.0;
}

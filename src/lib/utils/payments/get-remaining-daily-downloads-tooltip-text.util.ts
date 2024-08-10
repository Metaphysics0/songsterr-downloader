export function getRemainingDailyDownloadsTooltipText({
  isLoggedIn
}: {
  isLoggedIn: boolean;
}): string {
  if (isLoggedIn)
    return 'Please create an account or sign in to receive more daily downloads';

  return 'A payment is required in order to receive more daily downloads';
}

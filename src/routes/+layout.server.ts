import { MAXIMUM_AMOUNT_OF_DAILY_DOWNLOADS_FOR_NON_LOGGED_IN_USER } from '$lib/constants/maximum-amount-of-downloads.constants';
import { UserService } from '$lib/server/services/user/user.service';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
  const service = new UserService();
  const ipAddress = event.getClientAddress();
  const user = await service.findOrCreateUserFromIpAddress({ ipAddress });

  if (!user) {
    return buildResponse(
      MAXIMUM_AMOUNT_OF_DAILY_DOWNLOADS_FOR_NON_LOGGED_IN_USER
    );
  }

  return buildResponse(
    MAXIMUM_AMOUNT_OF_DAILY_DOWNLOADS_FOR_NON_LOGGED_IN_USER -
      user?.downloadedSongs?.length
  );
};

function buildResponse(amountOfDownloadsAvailable: number) {
  return {
    amountOfDownloadsAvailable
  };
}

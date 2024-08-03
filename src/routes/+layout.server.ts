import { NonLoggedInUserService } from '$lib/server/services/user/user.service';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
  const service = new NonLoggedInUserService();
  const ipAddress = event.getClientAddress();

  const amountOfDownloadsAvailable =
    await service.getAmountOfDownloadsAvaialbleFromIpAddress({ ipAddress });

  return {
    amountOfDownloadsAvailable
  };
};

import { UserService } from '$lib/server/services/user/user.service';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, ...event }) => {
  const session = locals.session || {};
  const service = new UserService();

  if (session?.userId) {
    const { amountOfDownloadsAvailable, user } =
      await service.getAmountOfDownloadsFromClerkUserId(session.userId);

    return { amountOfDownloadsAvailable, user };
  }

  return {
    amountOfDownloadsAvailable:
      await service.getAmountOfDownloadsAvaialbleFromIpAddress(
        event.getClientAddress()
      )
  };
};

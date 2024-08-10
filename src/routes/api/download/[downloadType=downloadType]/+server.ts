import { ClerkSession } from '$lib/server/clerk/types/clerk.types';
import { jsonWithCors } from '$lib/server/cors';
import { DownloadTabService } from '$lib/server/services/downloadTab.service';
import { UserService } from '$lib/server/services/user/user.service';
import { MaximumAmountOfDownloadsExceededError } from '$lib/server/utils/errors/errors.util';
import { DownloadTabType } from '$lib/types/downloadType';
import { logger } from '$lib/utils/logger';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST = (async ({ request, locals, params, ...event }) => {
  try {
    const ipAddress = event.getClientAddress();
    const session = locals.session;
    await ensureUserIsElligibleForDownload({ ipAddress, session });

    const downloadTabService = new DownloadTabService(
      params.downloadType as DownloadTabType
    );

    const { songId, ...response } = await downloadTabService.download(request);
    const userService = new UserService();

    await userService.storeDownloadedSongToUserIpAddress({
      ipAddress,
      songsterrSongId: songId
    });

    const amountOfDownloadsAvailable = session?.userId
      ? await userService.getAmountOfDownloadsFromClerkUserId(session.userId)
      : await userService.getAmountOfDownloadsAvaialbleFromIpAddress(ipAddress);

    return jsonWithCors(request, {
      ...response,
      amountOfDownloadsAvailable
    });
  } catch (error) {
    if (error instanceof MaximumAmountOfDownloadsExceededError) {
      return json({ errors: [error.message] });
    }

    logger.error(
      `POST /download/${params.downloadType} -  Unknown download failure`,
      error
    );
    return json({ errors: ['Unknown error'] });
  }
}) satisfies RequestHandler;

async function ensureUserIsElligibleForDownload({
  session,
  ipAddress
}: {
  session: ClerkSession;
  ipAddress: string;
}): Promise<void> {
  const userService = new UserService();
  const user = session.userId
    ? await userService.getUserFromClerkUserId(session.userId)
    : await userService.findOrCreateUserFromIpAddress({ ipAddress });

  if (!user) {
    throw new Error('Unable to complete download at this time');
  }

  userService.ensureUserHasNotExceededMaximumAmountOfDownloads(user);
}

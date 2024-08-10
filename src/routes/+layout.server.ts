import { MAXIMUM_AMOUNT_OF_DAILY_DOWNLOADS_FOR_NON_LOGGED_IN_USER } from '$lib/constants/maximum-amount-of-downloads.constants';
import { UserService } from '$lib/server/services/user/user.service';
import _ from 'lodash';
import type { LayoutServerLoad } from './$types';
import { IP_ADDRESS_MAPPING } from '$lib/constants/ip-address-mapping.const';

export const load: LayoutServerLoad = async (event) => {
  const service = new UserService();
  const ipAddress = event.getClientAddress();
  const mappedIpAddress = _.get(IP_ADDRESS_MAPPING, ipAddress, ipAddress);

  const user = await service.findOrCreateUserFromIpAddress({
    ipAddress: mappedIpAddress
  });

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

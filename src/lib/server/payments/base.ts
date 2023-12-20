import { getRequiredPaymentAmountForBulkTabs } from '$lib/utils/getRequiredPaymentAmountForBulkTabs';
import { logger } from '$lib/utils/logger';

export abstract class PaymentsBase {
  async handleResponse(response: any) {
    try {
      return response.json();
    } catch (err) {
      logger.log('Payment service method failed: ', err);
      const errorMessage = await response.text();
      throw new Error(errorMessage);
    }
  }

  // making an additional server request here to validate the amount
  async getRequiredPaymentAmountForBulkTabsPurchase(
    selectedSong: ISearchResult | IPartialSearchResult
  ): Promise<number> {
    try {
      const songInfoResponse = await fetch(
        `/api/song_info?artistId=${selectedSong.artistId}&withBulkSongsToDownload=true`
      );
      const { bulkSongsToDownload } = await songInfoResponse.json();

      return getRequiredPaymentAmountForBulkTabs({
        ...selectedSong,
        bulkSongsToDownload
      });
    } catch (error) {
      return getRequiredPaymentAmountForBulkTabs(selectedSong);
    }
  }
}

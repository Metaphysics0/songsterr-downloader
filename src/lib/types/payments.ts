export enum PaymentMethods {
  PAYPAL = 'paypal',
  GOOGLE_PAY = 'google_pay'
}

export interface PurchaseBulkTabsParams {
  paymentData: any;
  totalBilledAmount: string;
  purchaserEmail: string;
  artistId: number | string;
  artistName: string;
  paymentMethod: PaymentMethods;
  selectedSongToDownload?: ISearchResult | IPartialSearchResult;
}

export interface PayPalCreatePurchaseParams {
  cart: {
    selectedSong: ISearchResult | IPartialSearchResult;
  }[];
}
export interface PayPalPurchaseUnit {
  amount: {
    currency_code: 'USD';
    value: string;
  };
}

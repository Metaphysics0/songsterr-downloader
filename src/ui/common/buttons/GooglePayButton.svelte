<script lang="ts">
  import '@google-pay/button-element';

  let amount = '100.00';
  let existingPaymentMethodRequired = false;
  let buttonColor = 'default';
  let buttonType = 'buy';

  function buildPaymentRequest(): google.payments.api.PaymentDataRequest {
    return {
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: [
        {
          type: 'CARD',
          parameters: {
            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
            allowedCardNetworks: ['MASTERCARD', 'VISA'],
          },
          tokenizationSpecification: {
            type: 'PAYMENT_GATEWAY',
            parameters: {
              gateway: 'example',
              gatewayMerchantId: 'exampleGatewayMerchantId',
            },
          },
        },
      ],
      merchantInfo: {
        merchantId: '12345678901234567890',
        merchantName: 'Demo Merchant',
      },
      transactionInfo: {
        totalPriceStatus: 'FINAL',
        totalPriceLabel: 'Total',
        totalPrice: amount,
        currencyCode: 'USD',
        countryCode: 'US',
      },
    };
  }

  let paymentRequests: { [key: string]: google.payments.api.PaymentDataRequest };

  function updatePaymentRequests() {
    paymentRequests = {
      basic: buildPaymentRequest(),
      mastercard: {
        ...buildPaymentRequest(),
        allowedPaymentMethods: [
          {
            type: 'CARD',
            parameters: {
              allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
              allowedCardNetworks: ['MASTERCARD'],
            },
            tokenizationSpecification: {
              type: 'PAYMENT_GATEWAY',
              parameters: {
                gateway: 'example',
                gatewayMerchantId: 'exampleGatewayMerchantId',
              },
            },
          },
        ],
      },
      visa: {
        ...buildPaymentRequest(),
        allowedPaymentMethods: [
          {
            type: 'CARD',
            parameters: {
              allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
              allowedCardNetworks: ['VISA'],
            },
            tokenizationSpecification: {
              type: 'PAYMENT_GATEWAY',
              parameters: {
                gateway: 'example',
                gatewayMerchantId: 'exampleGatewayMerchantId',
              },
            },
          },
        ],
      },
      authorize: {
        ...buildPaymentRequest(),
        callbackIntents: ['PAYMENT_AUTHORIZATION'],
      },
      cryptogram: {
        ...buildPaymentRequest(),
        allowedPaymentMethods: [
          {
            type: 'CARD',
            parameters: {
              allowedAuthMethods: ['CRYPTOGRAM_3DS'],
              allowedCardNetworks: ['AMEX', 'VISA', 'MASTERCARD'],
            },
            tokenizationSpecification: {
              type: 'PAYMENT_GATEWAY',
              parameters: {
                gateway: 'example',
                gatewayMerchantId: 'exampleGatewayMerchantId',
              },
            },
          },
        ],
      },
      shipping: {
        ...buildPaymentRequest(),
        shippingAddressRequired: true,
        callbackIntents: ['PAYMENT_AUTHORIZATION'],
      },
    };
  }

  function onLoadPaymentData(event: { detail: any; }) {
    console.log('load payment data', event.detail);
  }

  function onError(event: { error: any; }) {
    console.error('error', event.error);
  }

  function onPaymentDataAuthorized(paymentData: google.payments.api.PaymentAuthorizationResult) {
    return {
      transactionState: 'success'
    }
  }

  function onReadyToPayChange(event: { detail: any; }) {
    console.log('ready to pay change', event.detail);
  }

  function onClick(event: any) {
    console.log('click');
  }

  function onClickPreventDefault(event: { preventDefault: () => void; }) {
    console.log('prevent default');
    event.preventDefault();
  }

  function handleAmountChange() {
    updatePaymentRequests();
  }

  updatePaymentRequests();
</script>


<div class="example">
  <div class="demo">
    <google-pay-button
    environment="TEST"
    button-type={buttonType}
    button-color={buttonColor}
    {existingPaymentMethodRequired}
    paymentRequest={paymentRequests.authorize}
    on:loadpaymentdata={onLoadPaymentData}
    on:error={onError}
    onPaymentAuthorized={onPaymentDataAuthorized} />
  </div>
</div>

<style>
  .example {
    margin: 5px;
    display: flex;
    flex-direction: row;
  }

  .example > .demo {
    flex: 1 0 0;
  }

  .example > .demo > * {
    margin: 1px;
  }
</style>
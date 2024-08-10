<script lang="ts">
  import { browser } from '$app/environment';
  import { PUBLIC_PAYPAL_CLIENT_ID } from '$env/static/public';
  import { apiService } from '$lib/utils/api-service.util';
  import { PURCHASER_EMAIL_INPUT_ID } from '$lib/constants';
  import { logger } from '$lib/utils/logger';
  import { loadScript } from '@paypal/paypal-js';
  import { toast } from '@zerodevx/svelte-toast';
  import { isEmpty } from 'lodash-es';

  export let purchaserEmail: string = '';

  export let closeModal: () => void;

  export let selectedSong: ISearchResult | IPartialSearchResult;

  loadScript({
    clientId: PUBLIC_PAYPAL_CLIENT_ID,
    disableFunding: ['credit', 'card']
  }).then((paypal) => {
    if (!paypal) return;

    // @ts-ignore
    paypal!
      .Buttons({
        style: {
          color: 'gold',
          shape: 'rect',
          label: 'pay'
        },
        onInit: (data, actions) => {
          if (!browser || !document) return;
          actions.disable();
          const emailInputField = document.getElementById(
            PURCHASER_EMAIL_INPUT_ID
          );

          if (!emailInputField) {
            logger.warn('unable to find email input, not disabling button');
            return;
          }

          emailInputField.addEventListener('input', function (event) {
            // @ts-ignore
            if (isEmpty(event.target?.value)) {
              actions.disable();
            } else {
              actions.enable();
            }
          });
        },
        onClick(data, actions) {
          const emailElement = document.getElementById(
            PURCHASER_EMAIL_INPUT_ID
          ) as HTMLInputElement;
          if (emailElement.value === '') {
            toast.push('Please enter an email!');
            return;
          }
          return;
        },
        async createOrder() {
          try {
            const orderData = await apiService.orders.create({
              cart: [
                {
                  selectedSong
                }
              ]
            });

            if (orderData.id) {
              return orderData.id;
            } else {
              const errorDetail = orderData?.details?.[0];
              const errorMessage = errorDetail
                ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
                : JSON.stringify(orderData);

              throw new Error(errorMessage);
            }
          } catch (error) {
            throw new Error(String(error));
          }
        },
        async onApprove(data, actions) {
          if (!actions?.order) throw new Error('unable to complete payment');

          try {
            const orderData = await apiService.orders[':order_id'].capture({
              orderId: data.orderID,
              selectedSong,
              purchaserEmail
            });
            // Three cases to handle:
            //   (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
            //   (2) Other non-recoverable errors -> Show a failure message
            //   (3) Successful transaction -> Show confirmation or thank you message

            const errorDetail = orderData?.details?.[0];

            if (errorDetail?.issue === 'INSTRUMENT_DECLINED') {
              logger.warn('instrument declined, restarting transaction');
              // (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
              // recoverable state, per https://developer.paypal.com/docs/checkout/standard/customize/handle-funding-failures/
              return actions.restart();
            } else if (errorDetail) {
              // (2) Other non-recoverable errors -> Show a failure message
              toast.push(`${errorDetail.description} (${orderData.debug_id})`);
            } else if (!orderData.purchase_units) {
              logger.error('no purchase units in response', orderData);
              toast.push(
                'Unable to complete transaction, no order units are present.'
              );
            } else {
              // (3) Successful transaction -> Show confirmation or thank you message
              // Or go to another URL:  actions.redirect('thank_you.html');
              const transaction =
                orderData?.purchase_units?.[0]?.payments?.captures?.[0] ||
                orderData?.purchase_units?.[0]?.payments?.authorizations?.[0];
              toast.push('Success! Check your email for the tabs.', {
                theme: {
                  '--toastColor': 'mintcream',
                  '--toastBackground': 'rgba(72,187,120,0.9)',
                  '--toastBarBackground': '#2F855A'
                },
                duration: 10000
              });

              closeModal();
            }
          } catch (error) {
            console.error(error);
            toast.push(
              `Sorry, your transaction could not be processed...<br><br>${error}`
            );
          }
        }
      })
      .render('#paypal-button-container');
  });
</script>

<div id="paypal-button-container" />

<style>
  #paypal-button-container {
    margin: 30px 0;
  }
</style>

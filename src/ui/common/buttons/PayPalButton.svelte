<script lang="ts">
  import { browser } from '$app/environment';
  import { PUBLIC_PAYPAL_SANDBOX_CLIENT_ID } from '$env/static/public';
  import { apiService } from '$lib/apiService';
  import {
    MINIMUM_DONATION_AMOUNT_FOR_BULK_DOWNLOAD,
    PURCHASER_EMAIL_INPUT_ID
  } from '$lib/constants';
  import { logger } from '$lib/utils/logger';
  import { loadScript } from '@paypal/paypal-js';
  import { isEmpty, sum } from 'lodash-es';

  export let donationAmount = MINIMUM_DONATION_AMOUNT_FOR_BULK_DOWNLOAD;
  export let purchaserEmail: string = '';

  export let artistData: {
    artistId: number;
    artistName: string;
  };

  loadScript({
    clientId: PUBLIC_PAYPAL_SANDBOX_CLIENT_ID,
    disableFunding: ['credit', 'card']
  }).then((paypal) => {
    if (!paypal) return;

    // @ts-ignore
    paypal!
      .Buttons({
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
        style: {
          color: 'gold',
          shape: 'rect',
          label: 'pay'
        },
        async createOrder(data, actions) {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: String(donationAmount)
                }
              }
            ]
          });
        },
        async onApprove(data, actions) {
          if (!actions?.order) {
            throw new Error('unable to complete payment');
          }

          const paymentData = await actions.order.capture();
          const purchaseResponse = await apiService.purchase.post({
            paymentData,
            purchaserEmail,
            totalBilledAmount: String(
              sum(paymentData.purchase_units.map((unit) => unit.amount))
            ),
            artistId: artistData.artistId,
            artistName: artistData.artistName
          });
        },
        onError(err) {
          alert('Something went wrong');
          logger.error('Something went wrong', err);
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

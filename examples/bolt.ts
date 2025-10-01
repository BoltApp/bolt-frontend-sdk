import { GetPaymentLinkResponse } from '../src'

// Frontend version - calls backend API instead of Bolt API directly
export function generatePaymentLink() {
  return fetch('/api/payment-links', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      item: {
        name: '250 Ru Dollas',
        price: 499,
        currency: 'USD',
        image_url:
          'https://eggplant-nucleo-dev.s3.us-west-2.amazonaws.com/images/ui_icon_bundle_gem1.png',
      },
      user_id: 'awesome user',
      game_id: 'awesome game',
      metadata: {
        field1: 'field1 value',
      },
    }),
  }).then(response => response.json())
}

export function getPaymentLink(
  paymentLinkId: string
): Promise<GetPaymentLinkResponse> {
  return fetch(`/api/payment-links/${paymentLinkId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(response => response.json())
}

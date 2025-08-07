// Frontend version - calls backend API instead of Bolt API directly
export function generatePaymentLink() {
  return fetch('/api/payment-links', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      item: {
        price: 5999,
        name: 'Gem Pack',
        currency: 'USD',
      },
      redirect_url: 'https://bolt.com',
      user_id: 'awesome user',
      game_id: 'awesome game',
      metadata: {
        field1: 'field1 value',
      },
    }),
  }).then(response => response.json())
}

export function getPaymentLink(paymentLinkId: string) {
  return fetch(`/api/payment-links/${paymentLinkId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(response => response.json())
}

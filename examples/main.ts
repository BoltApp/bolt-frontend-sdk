import { Charge, CheckoutResult } from '../src/index'

const SAMPLE_BOLT_CHECKOUT_LINK =
  'https://knights-of-valor-bolt.c-staging.bolt.com/g?merchant_product_id=gems-100&publishable_key=_Kq5XZXqaLiS.3TOhnz9Wmacb.9c59b297d066e94294895dd8617ad5d9d8ffc530fe1d36f8ed6d624a4f7855ae&subscription_plan_id=spl_WK3nCyNpeiK-'

document.addEventListener('DOMContentLoaded', () => {
  const checkoutButton = document.getElementById('bolt-charge-button')
  const statusDiv = document.getElementById('status')!

  const updateStatus = (
    message: string,
    type: 'info' | 'success' | 'error' = 'info'
  ) => {
    const colors = {
      info: '#e3f2fd',
      success: '#e8f5e8',
      error: '#fdeaea',
    }
    statusDiv.style.setProperty('--background-color', colors[type])
    statusDiv.innerHTML = message
  }

  checkoutButton?.addEventListener('click', async () => {
    updateStatus('Initializing checkout...', 'info')

    try {
      const result: CheckoutResult = await Charge.checkout(
        SAMPLE_BOLT_CHECKOUT_LINK
      )

      if (result.status === 'success') {
        updateStatus(
          `✅ Transaction completed successfully!<br>
           Reference: ${result.payload.reference}`,
          'success'
        )
        console.log('Transaction Successful:', result.payload)
      } else if (result.status === 'closed') {
        updateStatus('⚠️ Checkout was closed by user', 'info')
        console.log('Checkout was closed by user')
      }
    } catch (error) {
      updateStatus(`💥 Unexpected error: ${error}`, 'error')
    }
  })
})

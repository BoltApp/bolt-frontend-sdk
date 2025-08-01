import { Charge, CheckoutResult } from '../src/index'

const SAMPLE_BOLT_CHECKOUT_LINK =
  'https://santhosh.c-staging.bolt.com/o?order_token=7e1c6f2eb21b38b1a8da8362219c2fbf0381d7a45ac284ea408e4777373d2a19&publishable_key=Hf5r926t0V07.t8fzalINqixy.69510e34f8911f81c00b28848779a710b3fa595d9eab22b119f3cf1bb186b22d'

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

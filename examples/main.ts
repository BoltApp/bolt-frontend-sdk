import { Charge, CheckoutResult } from '../src/index'

const SAMPLE_BOLT_CHECKOUT_LINK =
  'https://gregs-guava-myshopify.c-staging.bolt.com/c?u=7oLxSjeYAcfTFpKsK2o43r&publishable_key=zQVb4QDUzwJD.GOxcEQV1ZNbW.bb17ba147d91e23de2647182d1381b60b281a2cd47092642a2fa214229cc43de'

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

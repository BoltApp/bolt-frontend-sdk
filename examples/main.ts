import { Charge, CheckoutResult } from '../src/index'

// Simple example showing the new discriminated union API
document.addEventListener('DOMContentLoaded', () => {
  const checkoutButton = document.getElementById('bolt-charge-button')
  const statusDiv = document.getElementById('status') || createStatusDiv()

  // Create status div if it doesn't exist
  function createStatusDiv() {
    const div = document.createElement('div')
    div.id = 'status'
    div.style.cssText = 'margin: 20px 0; padding: 10px; border-radius: 4px;'
    document.body.appendChild(div)
    return div
  }

  // Update status display
  const updateStatus = (
    message: string,
    type: 'info' | 'success' | 'error' = 'info'
  ) => {
    const colors = {
      info: '#e3f2fd',
      success: '#e8f5e8',
      error: '#fdeaea',
    }
    statusDiv.style.backgroundColor = colors[type]
    statusDiv.innerHTML = message
  }

  checkoutButton?.addEventListener('click', async () => {
    updateStatus('Initializing checkout...', 'info')

    try {
      const result: CheckoutResult = await Charge.checkout(
        'https://gregs-guava-myshopify.c-staging.bolt.com/c?u=7oLxSjeYAcfTFpKsK2o43r&publishable_key=zQVb4QDUzwJD.GOxcEQV1ZNbW.bb17ba147d91e23de2647182d1381b60b281a2cd47092642a2fa214229cc43de'
      )

      // Handle the discriminated union result
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

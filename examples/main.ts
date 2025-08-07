import { BoltSDK } from '../src/index'
import { generatePaymentLink } from './bolt'

// Initialize the Bolt SDK
BoltSDK.initialize({
  gameId: 'com.knights-of-valor.game',
  publishableKey: import.meta.env.BOLT_PUBLISHABLE_KEY,
  environment: 'Development',
})

document.addEventListener('DOMContentLoaded', () => {
  const checkoutButton = document.getElementById('bolt-charge-button')
  const resolveButton = document.getElementById('resolve-first-pending')
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
    statusDiv.style.setProperty('--status-bg', colors[type])
    statusDiv.innerHTML = message
  }

  // Set up event listeners for SDK events
  BoltSDK.on('checkout-link-succeeded', ({ session }) => {
    console.log('Event: checkout-link-succeeded', session)
    updateStatus(
      `✅ Transaction completed successfully!<br>
       Session ID: ${session.paymentLinkId}`,
      'success'
    )
  })

  BoltSDK.on('checkout-link-closed', ({ session }) => {
    console.log('Event: checkout-link-closed', session)
    updateStatus('⚠️ Checkout closed by user', 'info')
  })

  BoltSDK.on('checkout-link-failed', ({ session }) => {
    console.log('Event: checkout-link-failed', session)
    updateStatus('❌ Transaction failed', 'error')
  })

  checkoutButton?.addEventListener('click', async () => {
    updateStatus('Generating payment link...', 'info')

    try {
      const paymentLink = await generatePaymentLink()
      console.log('Generated Payment Link:', paymentLink)

      updateStatus('Opening checkout...', 'info')

      const session = await BoltSDK.gaming.openCheckout(paymentLink.link)
      console.log('Transaction Completed or Closed:', session)
    } catch (error) {
      updateStatus(`💥 Unexpected error: ${error}`, 'error')
      console.error('Checkout error:', error)
    }
  })

  resolveButton?.addEventListener('click', () => {
    const pendingSessions = BoltSDK.gaming.getPendingSessions()
    if (pendingSessions.length > 0) {
      const firstPending = pendingSessions[0]
      BoltSDK.gaming.resolveSession(firstPending.paymentLinkId, 'successful')
      updateStatus(
        `✅ Resolved pending session: ${firstPending.paymentLinkId}`,
        'success'
      )
    } else {
      updateStatus('⚠️ No pending sessions to resolve', 'info')
      console.log('No pending sessions to resolve')
    }
  })
})

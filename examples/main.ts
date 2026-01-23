import { BoltSDK } from '../src/index'
import { generatePaymentLink, getPaymentLink } from './bolt'

// Initialize the Bolt SDK
BoltSDK.initialize({
  gameId: 'com.knights-of-valor.game',
  publishableKey: import.meta.env.BOLT_PUBLISHABLE_KEY,
  environment: 'development',
})

document.addEventListener('DOMContentLoaded', () => {
  const checkoutButton = document.getElementById('bolt-charge-button')
  const resolveButton = document.getElementById('resolve-pending')
  const advertisementButton = document.getElementById('advertisement-button')
  const logDiv = document.getElementById('log')!

  const appendLog = (
    message: string,
    type: 'info' | 'success' | 'error' = 'info'
  ) => {
    const timestamp = new Date().toLocaleTimeString()
    const logEntry = document.createElement('div')
    logEntry.className = `log-entry ${type}`
    logEntry.innerHTML = `<span class="log-timestamp">[${timestamp}]</span>${message}`

    logDiv.appendChild(logEntry)
    logDiv.scrollTop = logDiv.scrollHeight
  }

  // Set up event listeners for SDK events
  BoltSDK.on('payment-link-succeeded', ({ session }) => {
    console.log('Event: payment-link-succeeded', session)
    appendLog(
      `✅ Transaction completed successfully!<br>
       Session ID: ${session.paymentLinkId}`,
      'success'
    )
  })

  BoltSDK.on('checkout-closed', ({ session }) => {
    console.log('Event: checkout-closed', session)
    if (session.status === 'abandoned') {
      appendLog('⚠️ Checkout closed by user', 'info')
    } else if (session.status === 'pending') {
      appendLog(
        `✅ User completed checkout, but status is still pending.<br>`,
        'info'
      )
    }
  })

  BoltSDK.on('payment-link-failed', ({ session }) => {
    console.log('Event: payment-link-failed', session)
    appendLog('❌ Transaction failed', 'error')
  })

  checkoutButton?.addEventListener('click', async () => {
    appendLog('Generating payment link...', 'info')

    try {
      let paymentLink = await generatePaymentLink()
      console.log('Generated Payment Link:', paymentLink)

      // Default to static payment link if server is not running
      if (!paymentLink?.link) {
        appendLog('Error generating link. Defaulting to static link.', 'error')
        paymentLink = {
          id: 'sess_01jzqtzq8w2c0t6jdhx23z3nmz',
          link: 'https://sandbox.pay.toffeepay.com/sess_01k1e48z43rd63873qf4e7vt5f',
        }
      }

      appendLog('Opening checkout...', 'info')

      const session = await BoltSDK.gaming.openCheckout(paymentLink.link)
      console.log('Transaction Completed or Closed:', session)
    } catch (error) {
      appendLog(`💥 Unexpected error: ${error}`, 'error')
      console.error('Checkout error:', error)
    }
  })

  resolveButton?.addEventListener('click', async () => {
    const pendingSessions = BoltSDK.gaming.getPendingSessions()

    if (pendingSessions.length === 0) {
      appendLog('⚠️ No pending sessions to resolve', 'info')
      console.log('No pending sessions to resolve')
      return
    }

    for (const session of pendingSessions) {
      const response = await getPaymentLink(session.paymentLinkId)

      const newSession = BoltSDK.gaming.resolveSession(response)

      if (newSession?.status === 'pending') {
        appendLog(
          `⚠️ Session ${session.paymentLinkId} is still pending`,
          'info'
        )
      } else {
        appendLog(
          `✅ Resolved pending session: ${session.paymentLinkId} to ${status}`,
          'success'
        )
      }
    }
  })

  function preloadAd() {
    return BoltSDK.gaming.preloadAd({
      onClaim: () => alert('Ad success!'),
    })
  }

  let preloadedAd: ReturnType<typeof BoltSDK.gaming.preloadAd> = undefined
  requestIdleCallback(() => {
    preloadedAd = preloadAd()
  })

  advertisementButton?.addEventListener('click', async () => {
    appendLog('Opening advertisement...', 'info')

    if (preloadedAd != null) {
      await preloadedAd.show()
      appendLog('Advertisement completed!', 'success')

      preloadedAd = preloadAd()
    }
  })
})

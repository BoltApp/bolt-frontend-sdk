import {
  BoltTransactionSuccess,
  isBoltCloseEvent,
  isBoltTransactionSuccessEvent,
} from './types/transaction'

import css from './charge.css?raw'

let activeModal: HTMLDivElement | null = null

export type CheckoutResult =
  | { status: 'success'; payload: BoltTransactionSuccess }
  | { status: 'closed' }

export const Charge = {
  checkout: (url: string): Promise<CheckoutResult> => {
    return new Promise(resolve => {
      if (activeModal) {
        activeModal.remove()
      }

      // Create modal elements
      activeModal = document.createElement('div')
      activeModal.id = 'bolt-modal-overlay'
      activeModal.innerHTML = `
        <div id="bolt-modal-container">
          <iframe src="${url}" id="bolt-iframe-modal"></iframe>
        </div>
      `
      document.body.appendChild(activeModal)
      applyModalStyles()

      // Close logic
      const closeModal = (result: CheckoutResult = { status: 'closed' }) => {
        window.removeEventListener('message', handleMessage)
        activeModal?.remove()
        activeModal = null
        resolve(result)
      }

      // Close on X button
      activeModal
        .querySelector('#bolt-modal-close')
        ?.addEventListener('click', () => closeModal())

      // Listen for transaction success
      function handleMessage(event: MessageEvent) {
        if (event.data?.type == null) {
          return
        }
        const iframeOrigin = new URL(url).origin
        if (isBoltTransactionSuccessEvent(event.data)) {
          window.postMessage({ type: 'bolt-charge-succeeded' }, iframeOrigin)
          closeModal({ status: 'success', payload: event.data?.payload })
        } else if (isBoltCloseEvent(event.data)) {
          window.postMessage({ type: 'bolt-charge-closed' }, iframeOrigin)
          closeModal({ status: 'closed' })
        }
      }
      window.addEventListener('message', handleMessage)
    })
  },
}

function applyModalStyles() {
  if (document.getElementById('bolt-iframe-styles')) {
    return // Styles already applied
  }
  const style = document.createElement('style')
  style.id = 'bolt-iframe-styles'
  style.textContent = css
  document.head.appendChild(style)
}

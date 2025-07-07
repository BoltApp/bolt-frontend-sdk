import {
  BoltTransactionSuccess,
  isBoltTransactionSuccessEvent,
} from './types/transaction'

import css from './charge.css?raw'

let activeModal: HTMLDivElement | null = null

export const Charge = {
  checkout: (url: string): Promise<BoltTransactionSuccess> => {
    return new Promise(resolve => {
      if (activeModal) {
        activeModal.remove()
      }

      // Create modal elements
      activeModal = document.createElement('div')
      activeModal.id = 'bolt-modal-overlay'
      activeModal.innerHTML = `
        <div id="bolt-modal-container">
          <button id="bolt-modal-close" aria-label="Close">×</button>
          <iframe src="${url}" id="bolt-iframe-modal"></iframe>
        </div>
      `
      document.body.appendChild(activeModal)
      applyModalStyles()

      // Close logic
      const closeModal = () => {
        window.removeEventListener('message', handleMessage)
        activeModal?.remove()
        activeModal = null
        window.postMessage({ type: 'bolt-iframe-closed' }, '*')
      }

      // Close on X button
      activeModal
        .querySelector('#bolt-modal-close')
        ?.addEventListener('click', closeModal)
      // Close on overlay click (but not modal content)
      activeModal.addEventListener('click', e => {
        if (e.target === activeModal) closeModal()
      })

      // Listen for transaction success
      function handleMessage(event: MessageEvent) {
        if (isBoltTransactionSuccessEvent(event.data)) {
          resolve(event.data.payload)
          closeModal()
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

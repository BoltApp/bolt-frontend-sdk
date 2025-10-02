import { AdOptions } from '@/types/ads'
import {
  BoltTransactionSuccess,
  isBoltCloseEvent,
  isBoltTransactionSuccessEvent,
} from '../../types/transaction'

import css from './ui.css?raw'

let activeModal: HTMLDialogElement | null = null

type PreloadedArgs = {
  options: AdOptions
  element: HTMLDialogElement
}

// Should we limit the size of this map to avoid performance issues?
// Multiple iframes can be preloaded, but only one modal can be active at a time
const preloadedArgs = new Map<string, PreloadedArgs>()

const AD_WAIT_TIME_MS = 30_000
const CHECK_TAB_POLLING_MS = 1_000

export type CheckoutResult =
  | { status: 'success'; payload: BoltTransactionSuccess }
  | { status: 'closed' }

export const GamingUI = {
  showPreload: async (id: string) => {
    const arg = preloadedArgs.get(id)
    if (!arg) {
      return
    }
    // Remove from map to avoid showing it again
    preloadedArgs.delete(id)

    if (activeModal) {
      activeModal.remove()
    }
    activeModal = arg.element
    arg.element.showModal()
    document.body.classList.add('bolt-no-scroll')

    const { timeoutMs = AD_WAIT_TIME_MS, onClaim } = arg.options

    const counter = arg.element.querySelector('#banner-counter')!
    await new Promise<void>(resolve => {
      let remainingSec = Math.ceil(timeoutMs / 1000)
      // It would be more precise to make it recursive with requestAnimationFrame and Date,
      // but this is good enough for a countdown timer.
      const interval = setInterval(() => {
        remainingSec--
        if (remainingSec > 0) {
          counter.textContent = remainingSec.toString()
        } else {
          clearInterval(interval)
          resolve()
        }
      }, 1000)
    })

    counter.remove()

    const claimRewardButton = document.createElement('button')
    claimRewardButton.id = 'claim-reward-button'
    claimRewardButton.textContent = 'Claim Reward'
    claimRewardButton.onclick = () => {
      arg.element?.remove()
      preloadedArgs.delete(id)
      activeModal = null
      document.body.classList.remove('bolt-no-scroll')

      // Wait for the modal to be fully removed before calling onClaim
      setTimeout(() => onClaim?.())
    }
    arg.element.querySelector('#bolt-ad-banner')?.appendChild(claimRewardButton)
  },

  preloadAdInIframe: (url: string, options: AdOptions = {}): string => {
    const timeoutMs = options.timeoutMs ?? AD_WAIT_TIME_MS
    const timeoutSec = Math.ceil(timeoutMs / 1_000)

    // Create modal elements
    const modal = document.createElement('dialog')
    modal.id = 'bolt-modal-container-ads'
    modal.innerHTML = `
        <div id="bolt-ad-banner">
          <div id="banner-counter">${timeoutSec}</div>
        </div>
        <iframe src="${url}" id="bolt-iframe-modal"></iframe>
    `

    // disable closing the modal by clicking outside or pressing Esc
    modal.addEventListener('cancel', event => {
      event.preventDefault()
    })

    document.body.appendChild(modal)
    applyModalStyles()

    const id = `bolt-modal-${Math.random().toString(36).slice(2)}`
    preloadedArgs.set(id, { options, element: modal })
    return id
  },

  checkoutInIframe: (url: string): Promise<CheckoutResult> => {
    return new Promise(resolve => {
      // Remove any existing active modal before showing checkout
      if (activeModal) {
        activeModal.remove()
      }

      const iframeUrl = new URL(url)
      iframeUrl.searchParams.set('window_location', window.location.toString())
      const iframeSrc = iframeUrl.toString()

      // Create modal elements
      activeModal = document.createElement('dialog')
      activeModal.id = 'bolt-modal-container'
      activeModal.innerHTML = `
        <iframe src="${iframeSrc}" allow="payment *" id="bolt-iframe-modal"></iframe>
      `
      document.body.appendChild(activeModal)
      applyModalStyles()

      activeModal.showModal()

      // Close logic
      const closeModal = (result: CheckoutResult = { status: 'closed' }) => {
        window.removeEventListener('message', handleMessage)
        activeModal?.remove()
        activeModal = null
        resolve(result)
      }

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

  checkoutInNewTab: (url: string): Promise<CheckoutResult> => {
    return new Promise(resolve => {
      const newTab = window.open(url, '_blank')
      if (!newTab) {
        resolve({ status: 'closed' })
        return
      }

      // Listen for messages from the new tab
      function handleMessage(event: MessageEvent) {
        if (event.data?.type == null) {
          return
        }
        if (isBoltTransactionSuccessEvent(event.data)) {
          clearInterval(checkClosed)
          window.removeEventListener('message', handleMessage)
          resolve({ status: 'success', payload: event.data?.payload })
        } else if (isBoltCloseEvent(event.data)) {
          clearInterval(checkClosed)
          window.removeEventListener('message', handleMessage)
          resolve({ status: 'closed' })
        }
      }
      window.addEventListener('message', handleMessage)

      // Poll to detect when the new tab is closed
      const checkClosed = setInterval(() => {
        if (newTab.closed) {
          clearInterval(checkClosed)
          window.removeEventListener('message', handleMessage)
          resolve({ status: 'closed' })
        }
      }, CHECK_TAB_POLLING_MS)
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

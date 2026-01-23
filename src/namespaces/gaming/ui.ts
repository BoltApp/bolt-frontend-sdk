import { AdOptions } from '@/types/ads'
import {
  BoltTransactionSuccess,
  isBoltCloseEvent,
  isBoltTransactionSuccessEvent,
} from '../../types/transaction'
import { createEventCoordinator } from '../../utils/event-coordinator'

import css from './ui.css?raw'

let activeModal: HTMLDialogElement | null = null

type PreloadedArgs = {
  options: AdOptions
  element: HTMLDialogElement
  createdAt: number
  start: () => void
}

// Should we limit the size of this map to avoid performance issues?
// Multiple iframes can be preloaded, but only one modal can be active at a time
const preloadedArgs = new Map<string, PreloadedArgs>()

const CHECK_TAB_POLLING_MS = 1_000
const PRELOAD_EXPIRY_MS = 5 * 60 * 1000 // 5 minutes

export type CheckoutResult =
  | { status: 'success'; payload: BoltTransactionSuccess }
  | { status: 'closed' }

// Utility functions for common operations
function generateModalId(): string {
  return `bolt-modal-${Math.random().toString(36).slice(2)}`
}

function createModal(id: string, innerHTML: string): HTMLDialogElement {
  const modal = document.createElement('dialog')
  modal.id = id
  modal.innerHTML = innerHTML
  document.body.appendChild(modal)
  applyModalStyles()

  // Disable closing the modal by clicking outside or pressing Esc
  modal.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      event.preventDefault()
    }
  })

  return modal
}

function cleanupModal(modal: HTMLDialogElement, id?: string): void {
  modal?.remove()
  if (id) {
    preloadedArgs.delete(id)
  }
  activeModal = null
  document.body.classList.remove('bolt-no-scroll')
}

function createTransactionMessageHandler(
  url: string,
  onSuccess: (payload: BoltTransactionSuccess) => void,
  onClose: () => void
) {
  const coordinator = createEventCoordinator({
    origin: new URL(url).origin,
  })

  return {
    coordinator,
    setupListeners: () => {
      // Note: These events are not standard bolt events, so we handle them differently
      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type == null) {
          return
        }
        if (isBoltTransactionSuccessEvent(event.data)) {
          coordinator.postMessage('bolt-charge-succeeded' as any)
          onSuccess(event.data.payload)
        } else if (isBoltCloseEvent(event.data)) {
          coordinator.postMessage('bolt-charge-closed' as any)
          onClose()
        }
      }

      window.addEventListener('message', handleMessage)
      return () => {
        window.removeEventListener('message', handleMessage)
        coordinator.destroy()
      }
    },
  }
}

export const GamingUI = {
  /**
   * Removes expired preloaded ads from memory to prevent memory leaks.
   * Called automatically during preloading, but can be called manually as needed.
   */
  cleanupExpired: () => {
    const now = Date.now()
    const expiredKeys: string[] = []

    preloadedArgs.forEach((args, id) => {
      if (now - args.createdAt > PRELOAD_EXPIRY_MS) {
        args.element.remove()
        expiredKeys.push(id)
      }
    })

    expiredKeys.forEach(id => preloadedArgs.delete(id))
  },

  /**
   * Cleans up all preloaded ads and active modals.
   * Call this when your application is shutting down or navigating away.
   */
  cleanup: () => {
    preloadedArgs.forEach(args => {
      args.element.remove()
    })
    preloadedArgs.clear()

    if (activeModal) {
      activeModal.remove()
      activeModal = null
    }

    document.body.classList.remove('bolt-no-scroll')

    // Remove injected styles
    const styleElement = document.getElementById('bolt-iframe-styles')
    if (styleElement) {
      styleElement.remove()
    }
  },

  showPreload: async (id: string) => {
    const arg = preloadedArgs.get(id)
    if (!arg) {
      throw new Error(`Preloaded ad with id '${id}' not found or already used`)
    }
    // Remove from map to avoid showing it again
    preloadedArgs.delete(id)

    if (activeModal) {
      activeModal.remove()
    }

    activeModal = arg.element
    arg.element.showModal()
    arg.start()
    document.body.classList.add('bolt-no-scroll')
  },

  preloadAdInIframe: (adLink: string, options: AdOptions) => {
    const id = generateModalId()
    const modal = createModal(
      'bolt-modal-container-ads',
      `
      <iframe src="${adLink}" id="bolt-iframe-modal"></iframe>
      `
    )
    function getIframe() {
      return modal.querySelector('#bolt-iframe-modal') as HTMLIFrameElement
    }

    const iframeCoordinator = createEventCoordinator({
      postTarget: getIframe(),
      origin: new URL(adLink).origin,
    })

    // Ensure the iframe is loaded before sending messages
    // After a certain timeout, the ad provider may not respond. Do not show iframe.
    const pageLoadedPromise = iframeCoordinator.waitForEvent(
      'bolt-gaming-page-loaded'
    )

    async function start() {
      const boltRewardPromise = pageLoadedPromise.then(() => {
        iframeCoordinator.postMessage('bolt-gaming-start-ads')
        return iframeCoordinator.waitForEvent('bolt-gaming-issue-reward')
      })

      const toffeeRewardPromise =
        iframeCoordinator.waitForEvent('toffee_redeem')

      Promise.race([boltRewardPromise, toffeeRewardPromise]).then(event => {
        console.log('Received bolt-gaming-issue-reward event:', event)
        cleanupModal(modal, id)
        iframeCoordinator.destroy()

        // Wait for the modal to be fully removed before calling onClaim
        setTimeout(() => options.onClaim?.())
      })
    }

    preloadedArgs.set(id, {
      options,
      element: modal,
      createdAt: Date.now(),
      start,
    })
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

      activeModal = createModal(
        'bolt-modal-container',
        `
        <iframe src="${iframeSrc}" allow="payment *" id="bolt-iframe-modal"></iframe>
        `
      )

      activeModal.showModal()

      // Close logic
      const closeModal = (result: CheckoutResult = { status: 'closed' }) => {
        cleanup()
        cleanupModal(activeModal!)
        resolve(result)
      }

      // Listen for transaction success
      const messageHandler = createTransactionMessageHandler(
        url,
        payload => closeModal({ status: 'success', payload }),
        () => closeModal({ status: 'closed' })
      )
      const cleanup = messageHandler.setupListeners()
    })
  },

  checkoutInNewTab: (url: string): Promise<CheckoutResult> => {
    return new Promise(resolve => {
      const newTab = window.open(url, '_blank')
      if (!newTab) {
        resolve({ status: 'closed' })
        return
      }

      let messageCleanup: (() => void) | null = null

      const cleanup = () => {
        clearInterval(checkClosed)
        messageCleanup?.()
      }

      // Listen for messages from the new tab
      const messageHandler = createTransactionMessageHandler(
        url,
        payload => {
          cleanup()
          resolve({ status: 'success', payload })
        },
        () => {
          cleanup()
          resolve({ status: 'closed' })
        }
      )
      messageCleanup = messageHandler.setupListeners()

      // Poll to detect when the new tab is closed
      const checkClosed = setInterval(() => {
        if (newTab.closed) {
          cleanup()
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

import {
  BoltTransactionSuccess,
  isBoltTransactionSuccessEvent,
} from './types/transaction'

let activeIframe: HTMLIFrameElement | null = null

export const Charge = {
  checkout: (url: string): Promise<BoltTransactionSuccess> => {
    return new Promise(resolve => {
      if (activeIframe) {
        activeIframe.remove()
      }

      activeIframe = document.createElement('iframe')
      activeIframe.src = url
      activeIframe.id = 'bolt-iframe-fullscreen'

      document.body.appendChild(activeIframe)

      applyStyles()

      const handleMessage = (event: MessageEvent) => {
        if (isBoltTransactionSuccessEvent(event.data)) {
          resolve(event.data.payload)
          window.removeEventListener('message', handleMessage)
          activeIframe?.remove()
          activeIframe = null
        }
      }

      window.addEventListener('message', handleMessage)
    })
  },
}

function applyStyles() {
  if (document.getElementById('bolt-iframe-styles')) {
    return // Styles already applied
  }
  const style = document.createElement('style')
  style.id = 'bolt-iframe-styles'
  style.textContent = `
    #bolt-iframe-fullscreen {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: none;
      z-index: 9999;
    }
  `
  document.head.appendChild(style)
}

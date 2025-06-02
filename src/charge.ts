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
      activeIframe.style.width = '100%'
      activeIframe.style.height = '100%'
      activeIframe.style.border = 'none'

      document.body.appendChild(activeIframe)

      const handleMessage = (event: MessageEvent) => {
        if (isBoltTransactionSuccessEvent(event)) {
          resolve(event.data)
          window.removeEventListener('message', handleMessage)
          activeIframe?.remove()
          activeIframe = null
        }
      }

      window.addEventListener('message', handleMessage)
    })
  },
}

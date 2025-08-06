import { BoltConfig } from '../../config'
import { EventEmitter } from '../../utils/event-emitter'
import { logger } from '../../utils/logger'
import { PaymentLinkSessions } from './sessions'
import { PaymentLinkSession, PaymentLinkStatus } from './types'
import { UrlUtils } from '../../utils/url'
import { UserUtils } from '../user/utils'
import { BoltAction } from '../../types/actions'
import { GamingUI } from './ui'

type OpenCheckoutOptions = {
  target?: 'iframe' | 'newTab' // Default: 'iframe'
}

export interface GamingNamespace {
  openCheckout: (
    checkoutLink: string,
    options?: OpenCheckoutOptions
  ) => Promise<PaymentLinkSession | undefined>
  getPendingSessions: () => PaymentLinkSession[]
  resolveSession: (
    paymentLinkId: string,
    status?: PaymentLinkStatus
  ) => PaymentLinkSession | undefined
}

export function createGamingNamespace(
  eventEmitter: EventEmitter<BoltAction>,
  getConfig: () => BoltConfig
): GamingNamespace {
  return {
    async openCheckout(
      checkoutLink: string,
      options: OpenCheckoutOptions = { target: 'iframe' }
    ): Promise<PaymentLinkSession | undefined> {
      try {
        if (!checkoutLink) {
          logger.error('Checkout link cannot be null or empty')
          return
        }

        const boltUser = UserUtils.getUserData()
        const url = UrlUtils.buildCheckoutLink(
          checkoutLink,
          getConfig(),
          boltUser
        )

        const paymentLinkId = url.searchParams.get('payment_link_id')
        if (!paymentLinkId) {
          logger.error('Failed to extract payment_link_id from checkout link')
          return
        }

        const session = PaymentLinkSessions.updateOrCreate({
          paymentLinkId,
          paymentLinkUrl: url.toString(),
          status: 'pending',
        })
        if (!session) {
          logger.error('Failed to create payment link session')
          return
        }

        logger.info(`Opening checkout link: ${session.paymentLinkUrl}`)
        eventEmitter.emit('checkout-link-open', { session })

        const checkoutPromise =
          options.target === 'newTab'
            ? GamingUI.checkoutInNewTab(session.paymentLinkUrl)
            : GamingUI.checkoutInIframe(session.paymentLinkUrl)

        return checkoutPromise.then(result => {
          if (result.status === 'closed') {
            session.update({ status: 'abandoned' })
          }
          eventEmitter.emit('checkout-link-closed', { session })
          return session
        })
      } catch (ex) {
        logger.error(`Failed to open checkout link '${checkoutLink}': ${ex}`)
        throw ex
      }
    },

    getPendingSessions(): PaymentLinkSession[] {
      return PaymentLinkSessions.getAllByStatus('pending')
    },

    resolveSession(
      paymentLinkId: string,
      status: PaymentLinkStatus = 'successful'
    ): PaymentLinkSession | undefined {
      const session = PaymentLinkSessions.getById(paymentLinkId)
      if (session) {
        session.update({ status })
        if (status === 'successful') {
          eventEmitter.emit('checkout-link-succeeded', { session })
        } else {
          eventEmitter.emit('checkout-link-failed', { session })
        }
      } else {
        logger.error(
          `Failed to resolve payment link session. Session not found for id: ${paymentLinkId}`
        )
      }
      return session
    },
  }
}

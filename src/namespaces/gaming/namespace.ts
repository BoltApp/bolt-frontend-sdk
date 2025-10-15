import { BoltConfig } from '../../config'
import { EventEmitter } from '../../utils/event-emitter'
import { logger } from '../../utils/logger'
import { PaymentLinkSessions } from './sessions'
import type { PaymentLinkSession, PaymentLinkStatus } from './types'
import { UrlUtils } from '../../utils/url'
import { UserUtils } from '../user/utils'
import { BoltAction } from '../../types/actions'
import { GamingUI } from './ui'
import type { GetPaymentLinkResponse } from '@/types/endpoints'
import { AdOptions } from '@/types/ads'

type OpenCheckoutOptions = {
  target?: 'iframe' | 'newTab' // Default: 'iframe'
}

type OpenAdResult =
  | { status: 'success'; data: { adLink: string } }
  | { status: 'error'; error: string }

type PreloadedAd = {
  show: () => Promise<void>
}

export interface GamingNamespace {
  openCheckout: (
    checkoutLink: string,
    options?: OpenCheckoutOptions
  ) => Promise<PaymentLinkSession | undefined>
  preloadAd: (adLink: string, options?: AdOptions) => PreloadedAd | undefined
  openAd: (adLink: string, options?: AdOptions) => Promise<OpenAdResult>
  getPendingSessions: () => PaymentLinkSession[]
  resolveSession: (
    response: GetPaymentLinkResponse
  ) => PaymentLinkSession | undefined
  cleanup: () => void
  cleanupExpired: () => void
}

export function createGamingNamespace(
  eventEmitter: EventEmitter<BoltAction>,
  getConfig: () => BoltConfig
): GamingNamespace {
  return {
    cleanup: GamingUI.cleanup,
    cleanupExpired: GamingUI.cleanupExpired,

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
        eventEmitter.emit('checkout-opened', { session })

        const checkoutPromise =
          options.target === 'newTab'
            ? GamingUI.checkoutInNewTab(session.paymentLinkUrl)
            : GamingUI.checkoutInIframe(session.paymentLinkUrl)

        return checkoutPromise.then(result => {
          if (result.status === 'closed') {
            session.update({ status: 'abandoned' })
          }
          eventEmitter.emit('checkout-closed', { session })
          return session
        })
      } catch (ex) {
        logger.error(`Failed to open checkout link '${checkoutLink}': ${ex}`)
        throw ex
      }
    },

    preloadAd,

    openAd: async (adLink, options = { type: 'timed' }) => {
      try {
        const preloadedAd = preloadAd(adLink, options)
        if (!preloadedAd) {
          return { status: 'error', error: 'Failed to preload ad' }
        }

        await preloadedAd.show()
        return { status: 'success', data: { adLink } }
      } catch (ex) {
        logger.error(`Failed to open advertisement link '${adLink}': ${ex}`)
        return { status: 'error', error: String(ex) }
      }
    },

    getPendingSessions() {
      return PaymentLinkSessions.getAllByStatus('pending')
    },

    resolveSession(response) {
      const session = PaymentLinkSessions.getById(response.payment_link.id)
      const newStatus = sessionStatusFromTransaction(response.transaction)
      if (session) {
        if (session.status !== newStatus) {
          session.update({ status: newStatus })
        }
        if (newStatus === 'successful') {
          eventEmitter.emit('payment-link-succeeded', { session })
        } else if (newStatus === 'abandoned' || newStatus === 'expired') {
          eventEmitter.emit('payment-link-failed', { session })
        }
      } else {
        logger.error(
          `Failed to resolve payment link session. Session not found for id: ${response.payment_link.id}`
        )
      }
      return session
    },
  }

  function preloadAd(
    adLink: string,
    options: AdOptions = { type: 'timed' }
  ): PreloadedAd | undefined {
    try {
      if (!adLink) {
        logger.error('Advertisement link cannot be null or empty')
        return undefined
      }

      logger.info(`Opening ad link: ${adLink}`)
      eventEmitter.emit('ad-opened', { adLink })

      let id: string
      switch (options.type) {
        case 'timed':
          id = GamingUI.preloadTimedAdInIframe(adLink, options)
          break
        case 'untimed':
          id = GamingUI.preloadUntimedAdInIframe(adLink, options)
          break
        default:
          throw new Error(`Unsupported ad type: ${options.type}`)
      }

      eventEmitter.emit('ad-completed', { adLink })
      logger.info(`Ad completed: ${adLink}`)

      return {
        show: async () => {
          await GamingUI.showPreload(id)
        },
      }
    } catch (ex) {
      logger.error(`Failed to open advertisement link '${adLink}': ${ex}`)
      throw ex
    }
  }
}

function sessionStatusFromTransaction(
  transaction?: GetPaymentLinkResponse['transaction']
): PaymentLinkStatus {
  if (!transaction) return 'pending'
  switch (transaction.status) {
    case 'authorized':
    case 'completed':
      return 'successful'
    case 'canceled':
      return 'abandoned'
    case 'failed':
    case 'rejectedReversible':
    case 'rejectedIrreversible':
      return 'expired'
    default:
      return 'pending'
  }
}

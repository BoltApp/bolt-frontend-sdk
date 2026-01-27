import type { GetPaymentLinkResponse } from '@/types/endpoints'
import { AdOptions, PreloadedAd } from '@/types/ads'
import { DeviceUtils } from '@/utils/device'

import { BoltConfig } from '../../config'
import { EventEmitter } from '../../utils/event-emitter'
import { logger } from '../../utils/logger'
import { PaymentLinkSessions } from './sessions'
import { UrlUtils } from '../../utils/url'
import { UserUtils } from '../user/utils'
import { BoltAction } from '../../types/actions'

import type { PaymentLinkSession, PaymentLinkStatus } from './types'
import { GamingUI } from './ui'

type OpenCheckoutOptions = {
  target?: 'iframe' | 'newTab' // Default: 'iframe'
}

type OpenAdResult =
  | { status: 'success'; data: { adLink: string } }
  | { status: 'error'; error: string }

export interface GamingNamespace {
  openCheckout: (
    checkoutLink: string,
    options?: OpenCheckoutOptions
  ) => Promise<PaymentLinkSession | undefined>
  preloadAd: (options?: AdOptions) => PreloadedAd | undefined
  openAd: (options?: AdOptions) => Promise<OpenAdResult>
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

    openAd: async (options = {}) => {
      const config = getConfig()
      const adLink = config.getAdUrl()

      try {
        const preloadedAd = preloadAd(options)
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
      const session = PaymentLinkSessions.getById(
        response?.payment_link_properties?.id
      )
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
          `Failed to resolve payment link session. Session not found for id: ${response.payment_link_properties.id}`
        )
      }
      return session
    },
  }

  function preloadAd(options: AdOptions = {}): PreloadedAd | undefined {
    const config = getConfig()
    const adLink = config.getAdUrl()
    const queryParams = new URLSearchParams({
      publishable_key: config.publishableKey,
      client_device_id: DeviceUtils.getDeviceId(),
    })
    const adUrl = `${adLink}?${queryParams.toString()}`

    try {
      logger.info(`Opening ad link: ${adUrl}`)
      eventEmitter.emit('ad-opened', { adLink })

      const id = GamingUI.preloadAdInIframe(adUrl, options)

      eventEmitter.emit('ad-completed', { adLink })
      logger.info(`Ad completed: ${adUrl}`)

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

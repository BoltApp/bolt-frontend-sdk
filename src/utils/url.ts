import { BoltConfig } from '@/config'
import { BoltUser } from '@/namespaces/user/types'

/**
 * Utility class for URL operations
 */
export const UrlUtils = {
  buildCheckoutLink(baseUrl: string, config: BoltConfig, boltUser: BoltUser) {
    const url = new URL(baseUrl)

    for (const [key, value] of Object.entries(boltUser)) {
      url.searchParams.set(key, value)
    }

    // Add game id and publishable key
    if (!url.searchParams.has('game_id')) {
      url.searchParams.set('game_id', config.gameId)
    }

    if (!url.searchParams.has('publishable_key')) {
      url.searchParams.set('publishable_key', config.publishableKey)
    }

    if (!url.searchParams.has('payment_link_id')) {
      if (baseUrl.includes('sess_')) {
        const sessionId = baseUrl.split('sess_')[1]
        url.searchParams.set('payment_link_id', sessionId)
      }
    }

    return url
  },
}

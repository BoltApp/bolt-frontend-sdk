import { BoltConfig } from '@/config'
import { BoltUser } from '@/namespaces/user/types'

/**
 * Utility class for URL operations
 */
export const UrlUtils = {
  buildCheckoutLink(baseUrl: string, config: BoltConfig, boltUser: BoltUser) {
    const url = new URL(baseUrl)
    const params = new URLSearchParams(url.search)

    for (const [key, value] of Object.entries(boltUser)) {
      params.set(key, value)
    }

    // Add game id and publishable key
    if (!params.has('game_id')) {
      params.set('game_id', config.gameId)
    }

    if (!params.has('publishable_key')) {
      params.set('publishable_key', config.publishableKey)
    }

    return url
  },
}

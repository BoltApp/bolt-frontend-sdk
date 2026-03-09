import type { AdMetadata } from '@/namespaces/gaming/types'

export type AdOptions = {
  timeoutMs?: number
  onClaim?: () => void
}

export type PreloadedAd = {
  show: (metadata?: AdMetadata) => Promise<void>
}

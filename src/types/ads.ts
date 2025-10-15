export type AdOptions = {
  type: 'untimed' | 'timed'
  timeoutMs?: number
  onClaim?: () => void
}

export type PreloadedAd = {
  show: () => Promise<void>
}

export type AdOptions = {
  timeoutMs?: number
  onClaim?: () => void
}

export type PreloadedAd = {
  show: () => Promise<void>
}

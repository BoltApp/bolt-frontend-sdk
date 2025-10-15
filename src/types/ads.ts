export type AdOptions = {
  type: 'untimed' | 'timed'
  timeoutMs?: number
  onClaim?: () => void
}

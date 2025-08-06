import { PaymentLinkSession } from '../namespaces/gaming/types'

export type BoltAction =
  | { type: 'checkout-link-open'; payload: { session: PaymentLinkSession } }
  | { type: 'checkout-link-closed'; payload: { session: PaymentLinkSession } }
  | {
      type: 'checkout-link-succeeded'
      payload: { session: PaymentLinkSession }
    }
  | { type: 'checkout-link-failed'; payload: { session: PaymentLinkSession } }

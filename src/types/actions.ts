import { PaymentLinkSession } from '../namespaces/gaming/types'

export type BoltAction =
  | { type: 'checkout-opened'; payload: { session: PaymentLinkSession } }
  | { type: 'checkout-closed'; payload: { session: PaymentLinkSession } }
  | {
      type: 'payment-link-succeeded'
      payload: { session: PaymentLinkSession }
    }
  | { type: 'payment-link-failed'; payload: { session: PaymentLinkSession } }

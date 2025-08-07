import { PaymentLinkSession } from '../namespaces/gaming/types'

export type BoltAction =
  | { type: 'payment-link-open'; payload: { session: PaymentLinkSession } }
  | { type: 'payment-link-closed'; payload: { session: PaymentLinkSession } }
  | {
      type: 'payment-link-succeeded'
      payload: { session: PaymentLinkSession }
    }
  | { type: 'payment-link-failed'; payload: { session: PaymentLinkSession } }

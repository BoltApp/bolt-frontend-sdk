import { createBoltSDK } from './bolt'

export { type BoltSDKType } from './bolt'

export type {
  PaymentLinkSession,
  PaymentLinkStatus,
} from './namespaces/gaming/types'
export type { BoltUser } from './namespaces/user/types'
export type { BoltTransactionWebhook } from './types/transaction-webhook'
export type {
  GetPaymentLinkRequest,
  GetPaymentLinkResponse,
  CreatePaymentLinkRequest,
  CreatePaymentLinkResponse,
} from './types/endpoints'

export const BoltSDK = createBoltSDK()

import { createBoltSDK } from './bolt'

export { type BoltSDKType } from './bolt'

export type {
  PaymentLinkSession,
  PaymentLinkStatus,
  GetPaymentLinkResponse,
} from './namespaces/gaming/types'
export type { BoltUser } from './namespaces/user/types'

export const BoltSDK = createBoltSDK()

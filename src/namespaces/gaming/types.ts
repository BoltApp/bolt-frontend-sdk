// Payment Link Session Management
export type PaymentLinkStatus =
  | 'pending'
  | 'successful'
  | 'expired'
  | 'abandoned'

export interface PaymentLinkSession {
  paymentLinkId: string
  paymentLinkUrl: string
  status: PaymentLinkStatus
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
}

export interface PaymentLinkSessionArgs {
  paymentLinkId: string
  paymentLinkUrl: string
  status?: PaymentLinkStatus
  createdAt?: Date
  updatedAt?: Date
}

export interface PaymentLinkTable {
  [id: string]: PaymentLinkSession
}

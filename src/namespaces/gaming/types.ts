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

export type AdPlacement =
  | 'main_menu'
  | 'shop'
  | 'game_over'
  | 'level_complete'
  | 'other'

export interface AdMetadata {
  placement?: AdPlacement
  [key: string]: string | number | boolean | undefined
}

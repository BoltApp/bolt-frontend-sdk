export interface GetPaymentLinkRequest {
  id: string
  item: {
    price: number
    name: string
    currency: string
  }
  redirect_url: string
  user_id: string
  game_id: string
  metadata: string
}

export interface GetPaymentLinkResponse {
  payment_link: GetPaymentLinkRequest
  transaction?: {
    reference: string
    status:
      | 'pending'
      | 'authorized'
      | 'completed'
      | 'canceled'
      | 'failed'
      | 'rejectedReversible'
      | 'rejectedIrreversible'
  }
}

export interface CreatePaymentLinkRequest {
  item: {
    price: number
    name: string
    currency: string
  }
  redirect_url: string
  user_id: string
  game_id: string
  metadata: Record<string, any>
}

export interface CreatePaymentLinkResponse {
  id: string
  link: string
}

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

export type BoltTransactionSuccess = {
  reference: string
}

export type BoltTransactionSuccessEventData = {
  type: 'bolt-bce-transaction-success'
  payload: BoltTransactionSuccess
}

export function isBoltTransactionSuccessEvent(
  data: any
): data is BoltTransactionSuccessEventData {
  return (
    data.type === 'bolt-bce-transaction-success' &&
    typeof data.payload?.reference === 'string'
  )
}

export function isBoltCloseEvent(
  data: any
): data is { type: 'bolt-bce-close-checkout' } {
  return data.type === 'bolt-bce-close-checkout'
}

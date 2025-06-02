export type BoltTransactionSuccess = {
  reference: string
}

export type BoltTransactionSuccessEventData = {
  type: 'bolt-bce-transaction-success'
  payload: BoltTransactionSuccess
}

export function isBoltTransactionSuccessEvent(
  data: unknown
): data is BoltTransactionSuccessEventData {
  const event = data as { type?: unknown; payload?: { reference?: unknown } }
  return (
    typeof event?.type === 'string' &&
    event.type === 'bolt-bce-transaction-success' &&
    typeof event?.payload?.reference === 'string'
  )
}

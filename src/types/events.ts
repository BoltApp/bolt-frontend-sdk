/* eslint-disable @typescript-eslint/no-empty-object-type */
export interface BoltEventPayload {
  'bolt-gaming-page-loaded': {
    page: string
  }
  'bolt-gaming-issue-reward': {}
  'bolt-gaming-start-ads': {}
  toffee_redeem: {}
}

// Bolt Event System Types
export type BoltEventType = keyof BoltEventPayload

export interface BoltEventMessage<T extends BoltEventType = BoltEventType> {
  type: T
  payload?: BoltEventPayload[T]
  id: string
  timestamp: number
}

export type BoltEventHandler<T extends BoltEventType = BoltEventType> = (
  event: BoltEventMessage<T>
) => void

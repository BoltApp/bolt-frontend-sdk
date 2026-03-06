import { BoltConfig } from './config'
import { EventEmitter } from './utils/event-emitter'
import { InitArgs } from './types/config'
import { BoltAction } from './types/actions'
import {
  createGamingNamespace,
  type GamingNamespace,
} from './namespaces/gaming/namespace'
import {
  createUserNamespace,
  type UserNamespace,
} from './namespaces/user/namespace'

/**
 * Main implementation of the Bolt Frontend SDK
 */
export type BoltSDKType = {
  initialize: (initArgs?: InitArgs) => Promise<void>
  on: <T extends BoltAction['type']>(
    eventName: T,
    listener: (data: Extract<BoltAction, { type: T }>['payload']) => void
  ) => () => void
  user: UserNamespace
  gaming: GamingNamespace
  readonly debug: {
    version: string
  }
}

export function createBoltSDK(): BoltSDKType {
  const eventEmitter = new EventEmitter<BoltAction>()
  let config: BoltConfig

  return {
    async initialize(initArgs?: InitArgs) {
      config = new BoltConfig(initArgs)
    },

    on(eventName: BoltAction['type'], listener: (data: any) => void) {
      return eventEmitter.on(eventName, listener)
    },

    get debug() {
      return { version: __SDK_VERSION__ }
    },
    user: createUserNamespace(),
    gaming: createGamingNamespace(eventEmitter, () => config),
  }
}

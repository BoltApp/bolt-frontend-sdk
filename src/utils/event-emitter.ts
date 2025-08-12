export interface Action {
  type: string
  payload?: any
}

export type PayloadOf<E extends Action, Type extends E['type']> = Extract<
  E,
  { type: Type }
>['payload']
export type CallbackOf<E extends Action, Type extends E['type']> = (
  payload: PayloadOf<E, Type>
) => void

export class EventEmitter<E extends Action> {
  events = new Map<E['type'], CallbackOf<E, any>[]>()
  previousEmits = new Map<E['type'], PayloadOf<E, any>>()

  waitForNext(eventName: E['type']) {
    return new Promise<PayloadOf<E, E['type']>>(resolve => {
      this.once(eventName, resolve)
    })
  }

  on<EventName extends E['type']>(
    eventName: EventName,
    listener: CallbackOf<E, EventName>,
    { replayLast = false } = {}
  ) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, [])
    }

    this.events.get(eventName)!.push(listener)

    if (replayLast && this.previousEmits.has(eventName)) {
      listener(this.previousEmits.get(eventName))
    }

    return () => {
      this.removeListener(eventName, listener)
    }
  }

  once<EventName extends E['type']>(
    eventName: EventName,
    listener: CallbackOf<E, EventName>,
    options?: { replayLast?: boolean }
  ) {
    const unsubscribe = this.on(
      eventName,
      function once(...args) {
        unsubscribe()
        listener(...args)
      },
      options
    )

    return unsubscribe
  }

  removeListener<EventName extends E['type']>(
    eventName: EventName,
    listener: CallbackOf<E, EventName>
  ) {
    if (!this.events.has(eventName)) {
      return
    }

    const listeners = this.events.get(eventName) ?? []
    const index = listeners.findIndex(l => l === listener)
    listeners.splice(index, 1)
  }

  emit<EventName extends E['type']>(
    eventName: EventName,
    payload: PayloadOf<E, EventName>
  ) {
    this.previousEmits.set(eventName, payload)

    const listeners = this.events.get(eventName) ?? []
    for (const listener of listeners.slice()) {
      listener(payload)
    }
  }

  clear() {
    this.events.clear()
    this.previousEmits.clear()
  }
}

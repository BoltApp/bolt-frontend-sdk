import type {
  BoltEventType,
  BoltEventMessage,
  BoltEventHandler,
} from '../types/events'

// Generate unique message IDs
let messageIdCounter = 0
function generateMessageId(): string {
  return `bolt-event-${Date.now()}-${++messageIdCounter}`
}

/**
 * Check if an event type matches bolt-* pattern
 */
function isBoltEvent(type: string): type is BoltEventType {
  // Note: Temporarily include toffee_ prefix for Vizor compatibility
  // https://boltpay.slack.com/archives/C094S2DDYCC/p1759839046751399
  return type.startsWith('bolt-') || type.startsWith('toffee_')
}

type EventCoordinator = {
  postMessage: <T extends BoltEventType>(type: T, payload?: any) => void
  addEventListener: <T extends BoltEventType>(
    type: T,
    handler: BoltEventHandler<T>
  ) => () => void
  removeEventListener: <T extends BoltEventType>(
    type: T,
    handler: BoltEventHandler<T>
  ) => void
  waitForEvent: <T extends BoltEventType>(
    type: T
  ) => Promise<BoltEventMessage<T>>
  getProcessedCount(): number
  destroy(): void
}

/**
 * Create an event coordinator instance
 */
export function createEventCoordinator(options?: {
  listenerTarget?: Window | HTMLIFrameElement
  postTarget?: Window | HTMLIFrameElement
  origin?: string
}): EventCoordinator {
  const {
    listenerTarget = window,
    postTarget = window,
    origin = '*',
  } = options || {}

  const processedMessageIds = new Set<string>()

  // Event listeners registry
  const eventListeners = new Map<BoltEventType, Set<BoltEventHandler>>()

  // Window listener cleanup function
  let windowListenerCleanup: (() => void) | null = null

  // Get the appropriate window object for listening
  const getListenerTarget = (): Window => {
    if (listenerTarget instanceof HTMLIFrameElement) {
      return listenerTarget.contentWindow || window
    }
    return listenerTarget as Window
  }

  // Get the appropriate window object for posting messages
  const getPostTarget = (): Window => {
    if (postTarget instanceof HTMLIFrameElement) {
      return postTarget.contentWindow || window
    }
    return postTarget as Window
  }

  /**
   * Ensure window listener is set up when we have active listeners
   */
  function ensureWindowListener(): void {
    if (windowListenerCleanup) return

    const listenerTarget = getListenerTarget()

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = event.data

        // Check if this is a bolt event message
        if (
          data &&
          typeof data === 'object' &&
          data.type &&
          isBoltEvent(data.type)
        ) {
          const message = data as BoltEventMessage

          // Process the message through our internal system
          processMessage(message)
        }
      } catch (error) {
        console.warn('Error processing window message:', error)
      }
    }

    listenerTarget.addEventListener('message', handleMessage)

    windowListenerCleanup = () => {
      listenerTarget.removeEventListener('message', handleMessage)
    }
  }

  /**
   * Clean up window listener when no more listeners are active
   */
  function cleanupWindowListenerIfNeeded(): void {
    const hasActiveListeners = Array.from(eventListeners.values()).some(
      set => set.size > 0
    )

    if (!hasActiveListeners && windowListenerCleanup) {
      windowListenerCleanup()
      windowListenerCleanup = null
    }
  }

  function processMessage(message: BoltEventMessage): void {
    // Skip if already processed
    if (processedMessageIds.has(message.id)) {
      return
    }

    // Mark as processed
    processedMessageIds.add(message.id)

    // Get listeners for this event type
    const listeners = eventListeners.get(message.type)
    if (listeners) {
      listeners.forEach(handler => {
        try {
          handler(message)
        } catch (error) {
          console.error(
            `Error in bolt event handler for ${message.type}:`,
            error
          )
        }
      })
    }
  }

  /**
   * Add event listener for bolt events
   */
  function addEventListener<T extends BoltEventType>(
    type: T,
    handler: BoltEventHandler<T>
  ): () => void {
    if (!eventListeners.has(type)) {
      eventListeners.set(type, new Set())
    }

    const listeners = eventListeners.get(type)!
    listeners.add(handler as BoltEventHandler)

    // Ensure window listener is active
    ensureWindowListener()

    // Return unsubscribe function
    return () => {
      listeners.delete(handler as BoltEventHandler)
      if (listeners.size === 0) {
        eventListeners.delete(type)
      }

      // Clean up window listener if no more active listeners
      cleanupWindowListenerIfNeeded()
    }
  }

  /**
   * Remove event listener
   */
  function removeEventListener<T extends BoltEventType>(
    type: T,
    handler: BoltEventHandler<T>
  ): void {
    const listeners = eventListeners.get(type)
    if (listeners) {
      listeners.delete(handler as BoltEventHandler)
      if (listeners.size === 0) {
        eventListeners.delete(type)
      }

      // Clean up window listener if no more active listeners
      cleanupWindowListenerIfNeeded()
    }
  }

  /**
   * Post a bolt event message
   */
  function postMessage<T extends BoltEventType>(type: T, payload?: any): void {
    const message: BoltEventMessage<T> = {
      type,
      payload,
      id: generateMessageId(),
      timestamp: Date.now(),
    }

    const postTarget = getPostTarget()
    postTarget.postMessage(message, origin)
  }

  /**
   * Wait for a specific event type to occur once
   * Returns a Promise that resolves with the event data when the event is first received
   */
  function waitForEvent<T extends BoltEventType>(
    type: T
  ): Promise<BoltEventMessage<T>> {
    return new Promise(resolve => {
      const unsubscribe = addEventListener(type, event => {
        unsubscribe()
        resolve(event)
      })
    })
  }

  /**
   * Get processed message count (for debugging)
   */
  function getProcessedCount(): number {
    return processedMessageIds.size
  }

  /**
   * Clean up all listeners and state
   */
  function destroy(): void {
    // Clean up window listener
    if (windowListenerCleanup) {
      windowListenerCleanup()
      windowListenerCleanup = null
    }

    // Clear all event listeners
    eventListeners.clear()

    // Clear processed messages
    processedMessageIds.clear()
  }

  return {
    postMessage,
    addEventListener,
    removeEventListener,
    waitForEvent,
    getProcessedCount,
    destroy,
  }
}

/**
 * Default event coordinator instance for the current window
 */
export const eventCoordinator = createEventCoordinator()

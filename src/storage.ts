export const StorageService = {
  setObject<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value))
  },

  getObject<T>(key: string, defaultValue: T | null = null): T | null {
    const item = localStorage.getItem(key)
    if (!item) {
      return defaultValue
    }
    try {
      return JSON.parse(item)
    } catch {
      return defaultValue
    }
  },
}

export const STORAGE_KEYS = {
  USER_DATA: 'bolt_user_data',
  PAYMENT_SESSION_HISTORY: 'bolt_payment_session_history',
}

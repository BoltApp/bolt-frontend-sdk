export const DeviceUtils = {
  getDeviceLocale(): string {
    return navigator.language || 'en-US'
  },

  getDeviceCountry(): string {
    // Extract country from locale or use default
    const locale = navigator.language
    return locale.includes('-') ? locale.split('-')[1] : 'US'
  },

  getDeviceId(): string {
    // Generate or retrieve a persistent device ID
    let deviceId = localStorage.getItem('bolt_device_id')
    if (!deviceId) {
      const arr = new Uint8Array(16)
      window.crypto.getRandomValues(arr)
      deviceId = Array.from(arr)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
      localStorage.setItem('bolt_device_id', deviceId)
    }
    return deviceId
  },
}

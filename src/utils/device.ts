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
      deviceId = 'device_' + Math.random().toString(36).substr(2, 16)
      localStorage.setItem('bolt_device_id', deviceId)
    }
    return deviceId
  },
}

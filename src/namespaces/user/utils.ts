import { StorageService, STORAGE_KEYS } from '../../storage'
import { BoltUser } from './types'
import { DeviceUtils } from '../../utils/device'
import { logger } from '../../utils/logger'

export const UserUtils = {
  getUserData: () => {
    const locale = DeviceUtils.getDeviceLocale()
    const country = DeviceUtils.getDeviceCountry()
    const deviceId = DeviceUtils.getDeviceId()

    try {
      const user = StorageService.getObject<BoltUser>(STORAGE_KEYS.USER_DATA)

      // Create new user object if user data is not found or is invalid
      if (
        !user ||
        user.deviceId !== deviceId ||
        user.locale !== locale ||
        user.country !== country
      ) {
        const now = new Date()
        const email = user?.email || ''
        const newUser: BoltUser = {
          email,
          locale,
          country,
          deviceId,
          createdAt: now,
          updatedAt: now,
        }
        StorageService.setObject(STORAGE_KEYS.USER_DATA, newUser)
        return newUser
      }

      StorageService.setObject(STORAGE_KEYS.USER_DATA, user)
      return user
    } catch (ex) {
      logger.error(`Failed to initialize user data: ${ex}`)
      const newUser: BoltUser = {
        email: '',
        locale,
        country,
        deviceId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      StorageService.setObject(STORAGE_KEYS.USER_DATA, newUser)
      return newUser
    }
  },

  setBoltUserData(email?: string, locale?: string, country?: string): BoltUser {
    const user = this.getUserData()

    // TODO - provide type validation safety for all fields
    if (email != null) user.email = email
    if (locale != null) user.locale = locale
    if (country != null) user.country = country

    StorageService.setObject(STORAGE_KEYS.USER_DATA, user)
    return user
  },
}

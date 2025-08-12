import { UserUtils } from './utils'

export interface UserNamespace {
  getData: () => ReturnType<typeof UserUtils.getUserData>
  setData: (email?: string, locale?: string, country?: string) => void
}

export function createUserNamespace(): UserNamespace {
  return {
    getData: () => UserUtils.getUserData(),
    setData: (email?: string, locale?: string, country?: string) =>
      UserUtils.setBoltUserData(email, locale, country),
  }
}

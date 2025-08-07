export const logger = {
  info: (message: string) => {
    console.log(`[BoltSDK] ${message}`)
  },
  error: (message: string) => {
    console.error(`[BoltSDK] ${message}`)
  },
}

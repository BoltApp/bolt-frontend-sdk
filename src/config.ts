import { Environment, InitArgs } from './types/config'

/**
 * Configuration class for Bolt SDK settings
 */
export class BoltConfig {
  public gameId: string
  public publishableKey: string
  public environment: Environment

  constructor(initArgs: InitArgs = {}) {
    this.gameId = initArgs.gameId ?? 'com.bolt.typescript.test'
    this.publishableKey = initArgs.publishableKey ?? 'found_in.bolt.dashboard'
    this.environment = initArgs.environment ?? 'production'
  }

  public getEnvironmentDisplayName(): string {
    switch (this.environment) {
      case 'development':
        return 'Development'
      case 'staging':
        return 'Staging'
      case 'sandbox':
        return 'Sandbox'
      case 'production':
        return 'Production'
      default:
        return 'Unknown'
    }
  }

  public isProduction(): boolean {
    return this.environment === 'production'
  }

  public isDevelopment(): boolean {
    return this.environment === 'development'
  }

  public isStaging(): boolean {
    return this.environment === 'staging'
  }

  public getAdUrl(): string {
    switch (this.environment) {
      case 'development':
      case 'staging':
        return 'https://play.staging-bolt.com'
      case 'sandbox':
        return 'https://play.sandbox-bolt.com'
      case 'production':
      default:
        return 'https://play.bolt.com'
    }
  }
}

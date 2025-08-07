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
    this.environment = initArgs.environment ?? 'Development'
  }

  public getEnvironmentDisplayName(): string {
    switch (this.environment) {
      case 'Development':
        return 'Development'
      case 'Staging':
        return 'Staging'
      case 'Production':
        return 'Production'
      default:
        return 'Unknown'
    }
  }

  public isProduction(): boolean {
    return this.environment === 'Production'
  }

  public isDevelopment(): boolean {
    return this.environment === 'Development'
  }

  public isStaging(): boolean {
    return this.environment === 'Staging'
  }
}

export interface InitArgs {
  gameId?: string
  publishableKey?: string
  environment?: Environment
}

export type Environment = 'development' | 'staging' | 'sandbox' | 'production'

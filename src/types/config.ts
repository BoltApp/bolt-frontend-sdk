export interface InitArgs {
  gameId?: string
  publishableKey?: string
  environment?: Environment
}

export type Environment = 'Development' | 'Staging' | 'Production'

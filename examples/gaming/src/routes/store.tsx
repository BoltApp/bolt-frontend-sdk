import { createRoute } from '@tanstack/react-router'
import { MicroTransactionStore } from '../pages/MicroTransactionStore'
import { rootRoute } from './root'

function Store() {
  return <MicroTransactionStore />
}

export const microTransactionStoreRoute = createRoute({
  component: Store,
  path: '/store',
  getParentRoute: () => rootRoute,
})

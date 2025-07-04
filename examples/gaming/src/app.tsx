import './app.css'
import { homeRoute } from './routes/home'
import { rootRoute } from './routes/root'
import { microTransactionStoreRoute } from './routes/store'
import { createRouter, RouterProvider } from '@tanstack/react-router'

const routeTree = rootRoute.addChildren([homeRoute, microTransactionStoreRoute])

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
})

export function App() {
  return <RouterProvider router={router} />
}

import { createRoute, Link } from '@tanstack/react-router'
import { rootRoute } from './root'

function Home() {
  return (
    <div className="index-page">
      <div className="app-header">
        <h1>Gaming App Demo</h1>
        <p>Gaming Experience</p>
      </div>

      <div className="app-content">
        <div className="demo-card">
          <h2>🪙 Coins Store</h2>
          <p>Browse and purchase coin packages</p>
          <Link to="/store" className="demo-button">
            Buy Coins
          </Link>
        </div>
      </div>

      <footer className="app-footer"></footer>
    </div>
  )
}

export const homeRoute = createRoute({
  path: '/',
  component: Home,
  getParentRoute: () => rootRoute,
})

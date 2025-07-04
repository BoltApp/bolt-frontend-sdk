import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

export const rootRoute = createRootRoute({
  component: () => (
    <>
      <div className="app-container">
        <nav className="app-nav">
          <div className="nav-brand">
            <Link to="/" className="nav-brand-link">
              🎮 Game Brand
            </Link>
          </div>
          <div className="nav-links">
            <Link
              to="/store"
              className="nav-link"
              activeProps={{ className: 'active' }}
            >
              Coin Store
            </Link>
          </div>
        </nav>
        <main className="app-main">
          <Outlet />
        </main>
      </div>
      <TanStackRouterDevtools />
    </>
  ),
})

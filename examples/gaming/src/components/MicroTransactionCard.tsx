import className from 'classnames'
import type { CoinPackage } from '../pages/types'

const formatCoins = (coins: number) => {
  return new Intl.NumberFormat('en-US').format(coins)
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)
}

interface MicroTransactionCardProps {
  package: CoinPackage
  selected: boolean
  onClick: (pkg: CoinPackage) => void
}

export function MicroTransactionCard({
  package: pkg,
  selected,
  onClick,
}: MicroTransactionCardProps) {
  return (
    <div
      className={className('coin-package', {
        popular: pkg.popular,
        selected: selected,
      })}
      onClick={() => onClick(pkg)}
    >
      <img className="product-image" src={pkg.imageUrl} alt={pkg.name} />

      {pkg.popular && (
        <div className="popular-badge">
          <span>Most Popular</span>
        </div>
      )}

      {pkg.savings && <div className="savings-badge">{pkg.savings}</div>}

      <div className="coin-package-header">
        <h3>{pkg.name}</h3>
        <div className="coins-display">
          <strong>{formatCoins(pkg.coins + (pkg.bonus ?? 0))} Coins</strong>
          {pkg.bonus && (
            <div className="bonus-amount">
              {`+${formatCoins(pkg.bonus)} Bonus`}
            </div>
          )}
        </div>
      </div>

      <div className="coin-package-content">
        <div className="price-display">
          <div className="price-label">Price:</div>
          <div className="price-value">{formatPrice(pkg.price)}</div>
        </div>
      </div>
    </div>
  )
}

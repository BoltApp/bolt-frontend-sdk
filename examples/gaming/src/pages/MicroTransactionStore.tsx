import { useState } from 'preact/hooks'
import './MicroTransactionStore.css'
import type { CoinPackage } from './types'
import { coinPackages } from './packages'
import { MicroTransactionCard } from '../components/MicroTransactionCard'

import { Charge } from '@boltpay/index'

export function MicroTransactionStore() {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)

  const handlePackageClick = async (pkg: CoinPackage) => {
    console.log('Package clicked:', {
      id: pkg.id,
      name: pkg.name,
      coins: pkg.coins,
      price: pkg.price,
      totalCoins: pkg.coins + (pkg.bonus || 0),
    })
    setSelectedPackage(pkg.id)

    const transaction = await Charge.checkout(pkg.bceLink)

    console.log('Purchase completed for:', pkg.name, transaction.reference)
    setSelectedPackage(null)
  }
  return (
    <div className="coin-store">
      <div className="coin-store-header">
        <h1>Buy Coins</h1>
        <p>Power up your gameplay with coin packages</p>
      </div>

      <div className="coin-packages-grid">
        {coinPackages.map(pkg => (
          <MicroTransactionCard
            key={pkg.id}
            package={pkg}
            selected={selectedPackage === pkg.id}
            onClick={handlePackageClick}
          />
        ))}
      </div>

      <div className="coin-store-footer">
        <p>
          <span className="secure-icon">🔒</span>
          Secure payment powered by industry-standard encryption
        </p>
      </div>
    </div>
  )
}

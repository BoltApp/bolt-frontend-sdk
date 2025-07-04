import type { CoinPackage } from './types'
import GameCoins from '../assets/game-coins.png'

const BCE_LINK =
  'https://gregs-guava-myshopify.c-staging.bolt.com/c?u=7oLxSjeYAcfTFpKsK2o43r&publishable_key=zQVb4QDUzwJD.GOxcEQV1ZNbW.bb17ba147d91e23de2647182d1381b60b281a2cd47092642a2fa214229cc43de'

export const coinPackages: CoinPackage[] = [
  {
    id: 'starter',
    name: 'Starter Pack',
    coins: 100,
    price: 0.99,
    imageUrl: GameCoins,
    bceLink: BCE_LINK,
  },
  {
    id: 'bronze',
    name: 'Bronze Pack',
    coins: 500,
    price: 4.99,
    imageUrl: GameCoins,
    bceLink: BCE_LINK,
  },
  {
    id: 'silver',
    name: 'Silver Pack',
    coins: 1200,
    price: 9.99,
    bonus: 200,
    imageUrl: GameCoins,
    bceLink: BCE_LINK,
  },
  {
    id: 'gold',
    name: 'Gold Pack',
    coins: 2500,
    price: 19.99,
    bonus: 500,
    popular: true,
    imageUrl: GameCoins,
    bceLink: BCE_LINK,
  },
  {
    id: 'platinum',
    name: 'Platinum Pack',
    coins: 5500,
    price: 39.99,
    bonus: 1500,
    savings: '25% OFF',
    imageUrl: GameCoins,
    bceLink: BCE_LINK,
  },
  {
    id: 'diamond',
    name: 'Diamond Pack',
    coins: 12000,
    price: 79.99,
    bonus: 4000,
    savings: '33% OFF',
    imageUrl: GameCoins,
    bceLink: BCE_LINK,
  },
  {
    id: 'ultimate',
    name: 'Ultimate Pack',
    coins: 25000,
    price: 149.99,
    bonus: 10000,
    savings: '40% OFF',
    imageUrl: GameCoins,
    bceLink: BCE_LINK,
  },
  {
    id: 'mega',
    name: 'Mega Pack',
    coins: 50000,
    price: 249.99,
    bonus: 25000,
    savings: '50% OFF',
    imageUrl: GameCoins,
    bceLink: BCE_LINK,
  },
]

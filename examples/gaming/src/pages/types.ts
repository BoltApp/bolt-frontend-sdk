export interface CoinPackage {
  id: string
  name: string
  coins: number
  price: number
  bonus?: number
  imageUrl: string
  bceLink: string // BCE link for the package
  popular?: boolean
  savings?: string
}

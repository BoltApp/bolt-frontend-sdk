import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// STAGING: Knights of Valor
const BOLT_API_KEY =
  '9166cb911581e5c9ba46e9866054a2352d445e468b902bf473400e4a33d3144f'
const BOLT_PUBLISHABLE_KEY =
  '_Kq5XZXqaLiS.3TOhnz9Wmacb.9c59b297d066e94294895dd8617ad5d9d8ffc530fe1d36f8ed6d624a4f7855ae'

app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, '../testbed')))

app.post('/api/payment-links', async (req, res) => {
  try {
    const response = await fetch(
      'https://api-staging.bolt.com/v1/gaming/payment_links',
      {
        method: 'POST',
        headers: {
          'x-api-key': BOLT_API_KEY,
          'x-publishable-key': BOLT_PUBLISHABLE_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          item: {
            price: req.body.item.price,
            name: req.body.item.name,
            currency: req.body.item.currency,
          },
          redirect_url: req.body.redirect_url,
          user_id: req.body.user_id,
          game_id: req.body.game_id,
          metadata: req.body.metadata,
        }),
      }
    )

    const paymentLink = await response.json()

    if (!response.ok) {
      return res.status(response.status).json(paymentLink)
    }

    res.json(paymentLink)
  } catch (error) {
    console.error('Error generating payment link:', error)
    res.status(500).json({ error: 'Failed to generate payment link' })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

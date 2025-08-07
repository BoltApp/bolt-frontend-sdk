import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import 'dotenv/config'
import { config } from 'dotenv'

config({ path: '.env.local' })

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// STAGING: Knights of Valor
const BOLT_API_KEY = process.env.BOLT_API_KEY
const BOLT_PUBLISHABLE_KEY = process.env.BOLT_PUBLISHABLE_KEY

app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, '../testbed')))

app.post('/api/payment-links', async (req, res) => {
  try {
    const response = await fetch(
      `${process.env.BOLT_API_URL}/v1/payment-links`,
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

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
const PORT = process.env.SERVER_PORT || 3001

// STAGING: Knights of Valor
const BOLT_API_KEY = process.env.BOLT_API_KEY
const BOLT_PUBLISHABLE_KEY = process.env.BOLT_PUBLISHABLE_KEY
const BOLT_API_URL = process.env.BOLT_API_URL

if (!BOLT_PUBLISHABLE_KEY) {
  throw new Error('BOLT_PUBLISHABLE_KEY environment variable is not set')
}
if (!BOLT_API_KEY) {
  throw new Error('BOLT_API_KEY environment variable is not set')
}
if (!BOLT_API_URL) {
  throw new Error('BOLT_API_URL environment variable is not set')
}

app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, '../testbed')))

const HEADERS = {
  'x-api-key': BOLT_API_KEY,
  'x-publishable-key': BOLT_PUBLISHABLE_KEY,
  'Content-Type': 'application/json',
}

app.get('/api/payment-links/:id', async (req, res) => {
  const paymentLinkId = req.params.id
  console.log(`Fetching payment link with ID: ${paymentLinkId}`)
  try {
    const response = await fetch(
      `${BOLT_API_URL}/v1/gaming/payment_links/${paymentLinkId}`,
      {
        method: 'GET',
        headers: HEADERS,
      }
    )
    const paymentLink = await response.json()
    if (!response.ok) {
      return res.status(response.status).json(paymentLink)
    }
    res.json(paymentLink)
  } catch (error) {
    console.error('Error fetching payment link:', error)
    res.status(500).json({ error: 'Failed to fetch payment link' })
  }
})

app.post('/api/payment-links', async (req, res) => {
  try {
    const response = await fetch(`${BOLT_API_URL}/v1/gaming/payment_links`, {
      method: 'POST',
      headers: HEADERS,
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
    })

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

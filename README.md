# Bolt JavaScript SDK

<img src="https://github.com/BoltApp/bolt-gameserver-sample/blob/main/public/banner-javascript.png?raw=true" />

## What is this?

Native JavaScript/TypeScript support support for Bolt Web Payments. A programmatic way to for out-of-app purchases and subscriptions.

We also support other platforms:

<table>
  <tr>
    <td align="center" width="150" bgcolor="#f7df1e">
      <img src="https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png" width="60" height="60" alt="JavaScript"/><br>
      <div style="color: black">
      <b>JavaScript</b><br>
      <i>This Repo</i>
      </div>
    </td>
    <td align="center" width="150">
      <img src="https://cdn.sanity.io/images/fuvbjjlp/production/bd6440647fa19b1863cd025fa45f8dad98d33181-2000x2000.png" width="60" height="60" alt="Unity"/><br>
      <b>Unity</b><br>
      <a href="https://github.com/BoltApp/bolt-unity-sdk">Unity SDK</a>
    </td>
    <td align="center" width="150">
      <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRUf3R8LFTgqC_8mooGEx7Fpas9kHu8OUxhLA&s" width="60" height="60" alt="Unreal"/><br>
      <b>Unreal Engine</b><br>
      <a href="https://github.com/BoltApp/bolt-unreal-engine-sdk">Unreal SDK</a>
    </td>
  </tr>
  <tr>
    <td align="center" width="150">
      <img src="https://developer.apple.com/assets/elements/icons/swift/swift-64x64.png" width="60" height="60" alt="iOS"/><br>
      <b>iOS</b><br>
      Coming Soon 🚧
    </td>
    <td align="center" width="150">
      <img src="https://avatars.githubusercontent.com/u/32689599?s=200&v=4" width="60" height="60" alt="Android"/><br>
      <b>Android</b><br>
      Coming Soon 🚧
    </td>
    <td align="center" width="150">
      <!-- filler -->
    </td>
  </tr>
</table>

<br>

<div align="center">

[![Discord](https://img.shields.io/badge/Discord-Have%20A%20Request%3F-7289DA?style=for-the-badge&logo=discord&logoColor=white&logoWidth=60)](https://discord.gg/BSUp9qjtnc)

### Chat with us on Discord for help and inquiries!

</div>

## 📚 Documentation

For documentation and API reference visit our [quick start guide](https://bolt-gaming-docs.vercel.app/guide/checkout-quickstart.html).

## 💰 Why Bolt

Only with Bolt you get **2.1% + $0.30 on all transactions**. That's 10x better than traditional app stores which take 30% of your revenue! That's the fair and transparent pricing you get with using Bolt.

<p style="font-size:12px;font-style:italic;opacity:85%">
<strong>Disclaimer:</strong> Fees are subject to change but will continue to remain highly competitive. See <a href="https://www.bolt.com/pricing">bolt.com/pricing</a> for up to date rates and visit  <a href="https://www.bolt.com/end-user-terms">bolt.com/end-user-terms</a> for end user terms and conditions.
</p>

## 🛠️ Prerequisites

You need 3 things to get started:

1. **Existing Web App:** You will need a web application (React, Vue, Angular, or vanilla JavaScript)
2. **Backend Server:** You will need to bring your own backend server (any language)
3. **Bolt Merchant Account:** Dashboard access to manage your gaming store ([signup](https://merchant.bolt.com/onboarding/get-started/gaming) or [login](https://merchant.bolt.com/))

## 📦 Installation

### Step 1: Install the JavaScript SDK

The SDK can be installed with either [npm](https://www.npmjs.com/), [pnpm](https://pnpm.io/), [bun](https://bun.sh/) or [yarn](https://classic.yarnpkg.com/en/) package managers.

#### NPM

```bash
npm install @boltpay/bolt-js
```

#### PNPM

```bash
pnpm install @boltpay/bolt-js
```

#### Bun

```bash
bun install @boltpay/bolt-js
```

#### Yarn

```bash
yarn add @boltpay/bolt-js
```

#### Optional: Run the SDK locally

The SDK comes with an sample webpage with a basic form of all the different integrations. With your package manager of choice just install and run dev to see it in your browser.

```bash
npm install
npm run dev
```

### Step 2: Add code to your game

There is a sample integration in the `examples/` folder.

- [**main.ts**](./examples/main.ts): will showcase how to initialize the client and open links

### Step 3: Continue with Backend Integration

You will need to bring your own backend server to complete integration.

- [**Quick Start**](https://bolt-gaming-docs.vercel.app/guide/checkout-quickstart.html): View our quickstart guide to get the API running
- [**Example Server**](https://github.com/BoltApp/bolt-gameserver-sample): We also have a sample server in NodeJS for your reference during implementation

#### TypeScript Types

For TypeScript projects, the SDK provides full type definitions:

```ts
import { Charge, BoltTransactionSuccess } from '@boltpay/bolt-js'

// Transaction result type
interface BoltTransactionSuccess {
  reference: string // Unique transaction reference
}
```

#### Framework Integration Examples

##### React

```tsx
import { Charge } from '@boltpay/bolt-js'
import { useState } from 'react'

function CheckoutButton({ checkoutUrl }: { checkoutUrl: string }) {
  const [loading, setLoading] = useState(false)

  const handlePayment = async () => {
    setLoading(true)
    const transaction = await Charge.checkout(checkoutUrl)
    console.log('Payment completed:', transaction.reference)
    // Redirect to success page or update UI
    setLoading(false)
  }

  return (
    <button onClick={handlePayment} disabled={loading}>
      {loading ? 'Processing...' : 'Pay with Bolt'}
    </button>
  )
}
```

##### Vue.js

```vue
<template>
  <button @click="handlePayment" :disabled="loading">
    {{ loading ? 'Processing...' : 'Pay with Bolt' }}
  </button>
</template>

<script setup>
import { ref } from 'vue'
import { Charge } from '@boltpay/bolt-js'

const props = defineProps(['checkoutUrl'])
const loading = ref(false)

const handlePayment = async () => {
  loading.value = true
  const transaction = await Charge.checkout(props.checkoutUrl)
  console.log('Payment completed:', transaction.reference)
  loading.value = false
}
</script>
```

#### Advertisement Integration

The SDK also provides support for displaying advertisements to users:

```ts
import { BoltSDK } from '@boltpay/bolt-js'

// Open an advertisement with an optional callback when claimed
BoltSDK.gaming.openAd('https://your-ad-link.com', {
  onClaim: () => {
    console.log('Ad reward claimed!')
    // Update game state or provide rewards
  },
})
```

#### React Example with Advertisements

```tsx
import { BoltSDK } from '@boltpay/bolt-js'

function AdButton({ adLink }: { adLink: string }) {
  const handleAdDisplay = async () => {
    await BoltSDK.gaming.openAd(adLink, {
      onClaim: () => {
        // Handle reward claim
        console.log('Reward claimed!')
      },
    })
  }

  return <button onClick={handleAdDisplay}>Watch Ad</button>
}
```

#### Vue Example with Advertisements

```vue
<template>
  <button @click="handleAdDisplay" :disabled="loading">
    {{ loading ? 'Loading...' : 'Watch Ad' }}
  </button>
</template>

<script setup>
import { ref } from 'vue'
import { BoltSDK } from '@boltpay/bolt-js'

const props = defineProps(['adLink'])
const loading = ref(false)

const handleAdDisplay = async () => {
  loading.value = true
  try {
    await BoltSDK.gaming.openAd(props.adLink, {
      onClaim: () => {
        // Handle reward claim
        console.log('Reward claimed!')
      },
    })
  } finally {
    loading.value = false
  }
}
</script>
```

## Need help?

<div class="discord-link">
    Got questions, roadmap suggestions, or requesting new SDKs?
    <br>
    <a href="https://discord.gg/BSUp9qjtnc" 
    target="_blank" class="discord-link-anchor">
      <span class="discord-text mr-2">Get help and chat with 
      us about anything on Discord</span>
      <span class="discord-icon-wrapper">
        <img src="https://cdn.prod.website-files.com/6257adef93867e50d84d30e2/66e3d80db9971f10a9757c99_Symbol.svg"
        alt="Discord" class="discord-icon" 
        width="16px">
      </span>
    </a>
  </div>

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

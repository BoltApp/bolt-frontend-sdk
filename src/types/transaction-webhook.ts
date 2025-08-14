import { GetPaymentLinkRequest } from './endpoints'

type Amount = {
  amount: number
  currency: string
  currency_symbol: string
}

type Address = {
  id: string
  street_address1: string
  locality: string
  region: string
  region_code: string
  postal_code: string
  country_code: string
  country: string
  name: string
  first_name: string
  last_name: string
  phone_number: string
  email_address: string
  priority: string
}

type CartItem = {
  reference: string
  name: string
  total_amount: Amount
  unit_price: Amount
  tax_amount: Amount
  quantity: number
  properties: Array<{
    name: string
    value: string
    display: null
  }>
  image_url: string
  taxable: boolean
  type: string
  description: string
}

export interface BoltSubscriptionWebhook {
  type: 'subscription_created'
  object: 'subscription'
  data: {
    internal_id: number
    id: string
    created_at: string
    updated_at: string
    merchant_name: string
    consumer_id: number
    email: string
    quantity: number
    price: number
    currency: string
    status: string
    payment_method: {
      card_last_4: string
      card_network: string
    }
    plan: {
      internal_id: number
      id: string
      name: string
      sku: string
      created_at: string
      updated_at: string
      frequency: number
      product_id: string
      product_internal_id: number
      frequency_unit: string
    }
  }
}

export interface BoltTransactionWebhook {
  // credit = refund
  type:
    | 'pending'
    | 'auth'
    | 'capture'
    | 'credit'
    | 'payment'
    | 'failed_payments'
  object: 'transaction'

  data: {
    id: string
    type: 'cc_payment' | 'cc_credit'
    processor: string
    date: number
    // refund creates new reference
    reference: string
    status: 'pending' | 'authorized' | 'failed' | 'completed'

    // not present during "credit" (refund)
    from_user?: {
      id: string
      first_name: string
      last_name: string
      phones: Array<{
        number: string
        country_code: string
      }>
      emails: Array<{
        address: string
      }>
    }
    // not present during "credit" (refund)
    from_credit_card?: {
      id: string
      last4: string
      bin: string
      expiration: number
      network: string
      display_network: string
      token_type: string
      status: string
      billing_address: Address
    }
    amount: Amount
    order: {
      cart: {
        order_reference: string
        display_id: string
        total_amount: Amount
        tax_amount: Amount
        items: CartItem[]
        metadata: {
          tipserCheckoutID: string
          tipserSessionID: string
        }
        subtotal_amount: Amount
        discount_amount: Amount
        billing_address: Address
      }
    }
    // not present during "credit" (refund)
    authorization?: {
      auth: string
      avs_response: string
      cvv_response: string
      external_transaction_id: string
      reason: string
      status: string
    }
    captures:
      | {
          id: string
          status: 'succeeded' | 'failed'
          amount: Amount
        }[]
      | null
    refund_transactions: any[]
    refund_type?: 'single_refund'
    total_refund_amount?: Amount
    requested_refund_amount?: Amount
    risk_signals: {
      ip_address: string
      time_on_site: string
      http_headers: {
        accept: string
        accept_encoding: string
        accept_language: string
        connection: string
        host: string
        referer: string
        user_agent: string
      }
    }
    capture_type: string
    payment_link: GetPaymentLinkRequest
  }
}

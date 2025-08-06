import { STORAGE_KEYS, StorageService } from '../../storage'
import {
  PaymentLinkTable,
  PaymentLinkSession,
  PaymentLinkStatus,
  PaymentLinkSessionArgs,
} from './types'

export const PaymentLinkSessions = {
  getPaymentLinkSessionHistory(): PaymentLinkTable {
    return StorageService.getObject<PaymentLinkTable>(
      STORAGE_KEYS.PAYMENT_SESSION_HISTORY,
      {}
    )!
  },

  store(session: PaymentLinkSessionClass) {
    if (!session.isValid()) {
      return undefined
    }

    const table = this.getPaymentLinkSessionHistory()
    table[session.paymentLinkId] = session

    StorageService.setObject(STORAGE_KEYS.PAYMENT_SESSION_HISTORY, table)
  },

  getById(paymentLinkId: string): PaymentLinkSessionClass | undefined {
    const paymentLinkSessions = this.getPaymentLinkSessionHistory()
    const data = paymentLinkSessions[paymentLinkId]
    if (!data) {
      return undefined
    }
    return new PaymentLinkSessionClass(data)
  },

  getAllByStatus(status: PaymentLinkStatus): PaymentLinkSession[] {
    const paymentLinkSessions = this.getPaymentLinkSessionHistory()
    return Object.values(paymentLinkSessions).filter(p => p.status === status)
  },

  updateOrCreate(
    args: PaymentLinkSessionArgs
  ): PaymentLinkSessionClass | undefined {
    const instance =
      this.getById(args.paymentLinkId)?.update(args) ??
      new PaymentLinkSessionClass(args).save()
    return instance.isValid() ? instance : undefined
  },
}

export class PaymentLinkSessionClass {
  paymentLinkId: string
  paymentLinkUrl: string
  status: PaymentLinkStatus
  createdAt: Date
  updatedAt: Date
  completedAt?: Date

  constructor(args: PaymentLinkSessionArgs) {
    this.paymentLinkId = args.paymentLinkId
    this.paymentLinkUrl = args.paymentLinkUrl
    this.status = args.status ?? 'pending'
    this.createdAt = args.createdAt ?? new Date()
    this.updatedAt = args.updatedAt ?? new Date()
  }

  save(): PaymentLinkSessionClass {
    this.updatedAt = new Date()

    if (this.status === 'successful') {
      this.completedAt = new Date()
    }

    PaymentLinkSessions.store(this)
    return this
  }

  update(args: Partial<PaymentLinkSessionArgs> = {}): PaymentLinkSessionClass {
    Object.assign(this, args)
    return this.save()
  }

  isValid(): boolean {
    return Boolean(this.paymentLinkId && this.paymentLinkUrl)
  }
}

// Clapper — Asaas Payment Queries

import { asaasRequest } from './client'

export interface AsaasPayment {
  id: string
  customer: string
  subscription: string
  billingType: string
  value: number
  netValue: number
  status: string
  dueDate: string
  paymentDate: string | null
  invoiceUrl: string | null
  bankSlipUrl: string | null
  pixQrCodeUrl?: string | null
  pixCopiaECola?: string | null
  description: string
}

interface AsaasPaymentList {
  data: AsaasPayment[]
  totalCount: number
  hasMore: boolean
}

export async function getSubscriptionPayments(
  subscriptionId: string,
  offset = 0,
  limit = 10
): Promise<AsaasPaymentList> {
  return asaasRequest<AsaasPaymentList>(
    `/payments?subscription=${subscriptionId}&offset=${offset}&limit=${limit}`
  )
}

export async function getPayment(paymentId: string): Promise<AsaasPayment> {
  return asaasRequest<AsaasPayment>(`/payments/${paymentId}`)
}

export async function getPaymentPixQrCode(
  paymentId: string
): Promise<{ encodedImage: string; payload: string; expirationDate: string }> {
  return asaasRequest(`/payments/${paymentId}/pixQrCode`)
}

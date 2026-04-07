// Clapper — Asaas Customer Management

import { asaasRequest } from './client'

export interface AsaasCustomer {
  id: string
  name: string
  email: string
  cpfCnpj: string
  phone?: string
  company?: string
}

interface CreateCustomerInput {
  name: string
  email: string
  cpfCnpj: string
  phone?: string
  company?: string
}

export async function createCustomer(input: CreateCustomerInput): Promise<AsaasCustomer> {
  return asaasRequest<AsaasCustomer>('/customers', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function getCustomer(customerId: string): Promise<AsaasCustomer> {
  return asaasRequest<AsaasCustomer>(`/customers/${customerId}`)
}

export async function updateCustomer(
  customerId: string,
  data: Partial<CreateCustomerInput>
): Promise<AsaasCustomer> {
  return asaasRequest<AsaasCustomer>(`/customers/${customerId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

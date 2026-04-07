// Clapper — Asaas API Client

const ASAAS_BASE_URL = process.env.ASAAS_API_URL || 'https://sandbox.asaas.com/api/v3'

function getApiKey(): string {
  const key = process.env.ASAAS_API_KEY
  if (!key) {
    throw new Error('ASAAS_API_KEY não configurada')
  }
  return key
}

export interface AsaasError {
  errors: Array<{
    code: string
    description: string
  }>
}

export async function asaasRequest<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${ASAAS_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      access_token: getApiKey(),
      ...options.headers,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    const errorData = data as AsaasError
    const message = errorData.errors?.map((e) => e.description).join(', ') || 'Erro na API Asaas'
    throw new Error(`Asaas: ${message}`)
  }

  return data as T
}

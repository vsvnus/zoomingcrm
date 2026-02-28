import { z, ZodError } from 'zod'

export function validateInput<T>(schema: z.ZodType<T>, data: unknown): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof ZodError) {
      const messages = error.issues.map(e => e.message).join(', ')
      throw new Error(`Dados inválidos: ${messages}`)
    }
    throw error
  }
}

export * from './schemas'

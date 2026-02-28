import { logger } from './logger'

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function safeAction<T>(
  fn: () => Promise<T>,
  errorMessage = 'Ocorreu um erro inesperado'
): Promise<ActionResult<T>> {
  try {
    const data = await fn()
    return { success: true, data }
  } catch (error) {
    const message = error instanceof Error ? error.message : errorMessage
    logger.error(errorMessage, error)
    return { success: false, error: message }
  }
}

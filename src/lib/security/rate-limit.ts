/**
 * Rate Limiter em memória com sliding window.
 * Leve, sem dependências externas, com limpeza automática de entries expiradas.
 */

interface RateLimitEntry {
  timestamps: number[]
}

interface RateLimiterOptions {
  /** Número máximo de requisições permitidas na janela */
  limit: number
  /** Janela de tempo em segundos */
  windowSeconds: number
}

interface RateLimitResult {
  success: boolean
  /** Segundos até poder tentar novamente (apenas quando bloqueado) */
  retryAfter: number
  /** Requisições restantes na janela atual */
  remaining: number
}

const store = new Map<string, RateLimitEntry>()

// Limpeza automática a cada 60 segundos para evitar memory leak
let cleanupInterval: ReturnType<typeof setInterval> | null = null

function ensureCleanup() {
  if (cleanupInterval) return
  cleanupInterval = setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store) {
      // Remover timestamps antigos
      entry.timestamps = entry.timestamps.filter((ts) => now - ts < 120_000)
      // Remover entry se vazia
      if (entry.timestamps.length === 0) {
        store.delete(key)
      }
    }
  }, 60_000)
  // Permitir que o processo termine sem aguardar o interval
  if (cleanupInterval && typeof cleanupInterval === 'object' && 'unref' in cleanupInterval) {
    cleanupInterval.unref()
  }
}

/**
 * Verifica rate limit para uma chave (IP ou userId).
 *
 * @param key - Identificador único (userId, IP, etc.)
 * @param options - Configurações de limite
 * @returns Resultado indicando se a requisição é permitida
 */
export function checkRateLimit(
  key: string,
  options: RateLimiterOptions
): RateLimitResult {
  ensureCleanup()

  const now = Date.now()
  const windowMs = options.windowSeconds * 1000

  let entry = store.get(key)
  if (!entry) {
    entry = { timestamps: [] }
    store.set(key, entry)
  }

  // Remover timestamps fora da janela
  entry.timestamps = entry.timestamps.filter((ts) => now - ts < windowMs)

  if (entry.timestamps.length >= options.limit) {
    // Calcular quando o timestamp mais antigo na janela expira
    const oldestInWindow = entry.timestamps[0]
    const retryAfterMs = windowMs - (now - oldestInWindow)
    const retryAfter = Math.ceil(retryAfterMs / 1000)

    return {
      success: false,
      retryAfter,
      remaining: 0,
    }
  }

  // Permitir e registrar
  entry.timestamps.push(now)

  return {
    success: true,
    retryAfter: 0,
    remaining: options.limit - entry.timestamps.length,
  }
}

/**
 * Extrai o identificador do request para rate limiting.
 * Prioriza userId (se autenticado), senão usa IP.
 */
export function getRequestIdentifier(
  req: Request,
  userId?: string | null
): string {
  if (userId) return `user:${userId}`

  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown'
  return `ip:${ip}`
}

/**
 * Extrai o IP do request.
 */
export function getRequestIP(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() || 'unknown'
}

/**
 * Cria uma Response 429 padronizada.
 */
export function rateLimitResponse(retryAfter: number): Response {
  return new Response(
    JSON.stringify({
      error: 'Too Many Requests',
      message: 'Limite de requisições excedido. Tente novamente em breve.',
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfter),
      },
    }
  )
}

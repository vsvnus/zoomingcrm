import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  typedRoutes: true,
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            // TODO: Remover 'unsafe-inline' do script-src implementando nonce-based CSP
            // via middleware do Next.js (next-safe headers ou custom middleware com nonce).
            // 'strict-dynamic' permite que scripts inline confiáveis carreguem outros scripts
            // (ex: qrcodejs via cdnjs.cloudflare.com na impressão de etiquetas).
            "script-src 'self' 'unsafe-inline' 'strict-dynamic' https://cdnjs.cloudflare.com",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: blob: https://*.supabase.co https://*.supabase.in",
            "font-src 'self'",
            "connect-src 'self' https://*.supabase.co https://*.supabase.in wss://*.supabase.co https://api.openai.com",
            "frame-src 'self' https://player.vimeo.com https://www.youtube.com",
            "frame-ancestors 'none'",
            "object-src 'none'",
            "base-uri 'self'",
            "upgrade-insecure-requests",
          ].join('; '),
        },
      ],
    },
  ],
}

export default nextConfig

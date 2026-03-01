import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/validations.spec.ts'],
    exclude: ['tests/auth.spec.ts', 'tests/org-isolation.spec.ts', 'tests/public-proposal.spec.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})

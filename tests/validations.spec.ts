import { describe, it, expect, beforeAll } from 'vitest'

// NOTE: This test requires vitest to be installed
// npm install -D vitest

describe('Validation Schemas', () => {
  // Dynamic import to handle potential Zod v4 differences
  let schemas: any

  beforeAll(async () => {
    schemas = await import('../src/lib/validations/schemas')
  })

  describe('createProjectSchema', () => {
    it('accepts valid project data', () => {
      const result = schemas.createProjectSchema.safeParse({
        title: 'Test Project',
        client_id: 'abc123',
        description: 'A test project',
      })
      expect(result.success).toBe(true)
    })

    it('rejects empty title', () => {
      const result = schemas.createProjectSchema.safeParse({
        title: '',
        client_id: 'abc123',
      })
      expect(result.success).toBe(false)
    })

    it('rejects missing client_id', () => {
      const result = schemas.createProjectSchema.safeParse({
        title: 'Test Project',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('createClientSchema', () => {
    it('accepts valid client data', () => {
      const result = schemas.createClientSchema.safeParse({
        name: 'Test Client',
        email: 'test@example.com',
        phone: '11999999999',
      })
      expect(result.success).toBe(true)
    })

    it('rejects empty name', () => {
      const result = schemas.createClientSchema.safeParse({
        name: '',
      })
      expect(result.success).toBe(false)
    })

    it('rejects invalid email', () => {
      const result = schemas.createClientSchema.safeParse({
        name: 'Test',
        email: 'not-an-email',
      })
      expect(result.success).toBe(false)
    })

    it('accepts client with only name', () => {
      const result = schemas.createClientSchema.safeParse({
        name: 'Test Client',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('signInSchema', () => {
    it('accepts valid credentials', () => {
      const result = schemas.signInSchema.safeParse({
        email: 'user@example.com',
        password: 'password123',
      })
      expect(result.success).toBe(true)
    })

    it('rejects short password', () => {
      const result = schemas.signInSchema.safeParse({
        email: 'user@example.com',
        password: '12345',
      })
      expect(result.success).toBe(false)
    })

    it('rejects invalid email', () => {
      const result = schemas.signInSchema.safeParse({
        email: 'invalid',
        password: 'password123',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('transactionSchema', () => {
    it('accepts valid transaction', () => {
      const result = schemas.transactionSchema.safeParse({
        type: 'INCOME',
        category: 'CLIENT_PAYMENT',
        description: 'Payment from client',
        amount: 1000,
      })
      expect(result.success).toBe(true)
    })

    it('rejects negative amount', () => {
      const result = schemas.transactionSchema.safeParse({
        type: 'INCOME',
        category: 'CLIENT_PAYMENT',
        description: 'Payment',
        amount: -100,
      })
      expect(result.success).toBe(false)
    })

    it('rejects invalid type', () => {
      const result = schemas.transactionSchema.safeParse({
        type: 'INVALID_TYPE',
        category: 'CLIENT_PAYMENT',
        description: 'Payment',
        amount: 1000,
      })
      expect(result.success).toBe(false)
    })
  })

  describe('dateSchema', () => {
    it('accepts valid date format', () => {
      const result = schemas.dateSchema.safeParse('2024-01-15')
      expect(result.success).toBe(true)
    })

    it('rejects invalid date format', () => {
      const result = schemas.dateSchema.safeParse('15/01/2024')
      expect(result.success).toBe(false)
    })

    it('rejects empty string', () => {
      const result = schemas.dateSchema.safeParse('')
      expect(result.success).toBe(false)
    })
  })

  describe('proposalItemSchema', () => {
    it('accepts valid proposal item', () => {
      const result = schemas.proposalItemSchema.safeParse({
        description: 'Video editing',
        quantity: 2,
        unit_price: 500,
      })
      expect(result.success).toBe(true)
    })

    it('rejects zero quantity', () => {
      const result = schemas.proposalItemSchema.safeParse({
        description: 'Video editing',
        quantity: 0,
        unit_price: 500,
      })
      expect(result.success).toBe(false)
    })
  })

  describe('bookingSchema', () => {
    it('accepts valid booking', () => {
      const result = schemas.bookingSchema.safeParse({
        projectId: 'proj123',
        equipmentId: 'eq456',
        startDate: '2024-03-01',
        endDate: '2024-03-05',
      })
      expect(result.success).toBe(true)
    })

    it('rejects missing projectId', () => {
      const result = schemas.bookingSchema.safeParse({
        equipmentId: 'eq456',
        startDate: '2024-03-01',
        endDate: '2024-03-05',
      })
      expect(result.success).toBe(false)
    })
  })
})

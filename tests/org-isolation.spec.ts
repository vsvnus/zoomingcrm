import { test, expect } from '@playwright/test'

test.describe('Organization Isolation', () => {
  test('search API requires authentication', async ({ request }) => {
    const response = await request.get('/api/search?q=test')
    expect(response.status()).toBe(401)
  })

  test('dashboard requires authentication', async ({ page }) => {
    await page.goto('/projects')
    await expect(page).toHaveURL(/.*login/)
  })

  test('proposals page requires authentication', async ({ page }) => {
    await page.goto('/proposals')
    await expect(page).toHaveURL(/.*login/)
  })

  test('financeiro page requires authentication', async ({ page }) => {
    await page.goto('/financeiro')
    await expect(page).toHaveURL(/.*login/)
  })
})

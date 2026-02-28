import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('redirects to /login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/.*login/)
  })

  test('redirects to /dashboard when authenticated and accessing /login', async ({ page }) => {
    // This test requires a valid test user
    // Skip if no test credentials available
    const testEmail = process.env.TEST_USER_EMAIL
    const testPassword = process.env.TEST_USER_PASSWORD
    if (!testEmail || !testPassword) {
      test.skip()
      return
    }

    await page.goto('/login')
    await page.fill('input[type="email"]', testEmail)
    await page.fill('input[type="password"]', testPassword)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/.*dashboard/)
  })

  test('login page loads correctly', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('search API returns 401 without auth', async ({ request }) => {
    const response = await request.get('/api/search?q=test')
    expect(response.status()).toBe(401)
  })
})

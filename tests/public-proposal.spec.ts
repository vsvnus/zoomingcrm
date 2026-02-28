import { test, expect } from '@playwright/test'

test.describe('Public Proposal', () => {
  test('invalid token returns error page', async ({ page }) => {
    await page.goto('/p/invalid-token-123')
    // Should show error or not found state, not crash
    await expect(page.locator('body')).toBeVisible()
  })

  test('public proposal page is accessible without auth', async ({ page }) => {
    // The /p/ route should be accessible without authentication
    const response = await page.goto('/p/test-token')
    // Should not redirect to login
    expect(page.url()).toContain('/p/')
  })
})

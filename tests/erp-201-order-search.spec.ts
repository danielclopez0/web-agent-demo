import { test, expect } from '@playwright/test'

test('ERP-201 — search narrows orders by vendor / PO # / description', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('Corporate Email').fill('service.user@democorp.example')
  await page.getByLabel('Password').fill('anything-works')
  await page.getByTestId('sign-in-btn').click()
  await expect(page.getByRole('heading', { name: 'Purchase Orders' })).toBeVisible()

  const rows = page.locator('tbody tr')
  const search = page.getByTestId('order-search')

  await search.fill('Vertex')
  await expect(rows).toHaveCount(2)
  await expect(page.getByTestId('order-row-PO-2026-001')).toBeVisible()
  await expect(page.getByTestId('order-row-PO-2026-005')).toBeVisible()
  await expect(page.getByTestId('order-row-PO-2026-002')).not.toBeVisible()

  await search.fill('003')
  await expect(rows).toHaveCount(1)
  await expect(page.getByTestId('order-row-PO-2026-003')).toBeVisible()
  await expect(page.getByTestId('order-row-PO-2026-001')).not.toBeVisible()

  await search.fill('')
  await expect(rows).toHaveCount(8)
  await expect(page.getByTestId('order-row-PO-2026-001')).toBeVisible()
  await expect(page.getByTestId('order-row-PO-2026-008')).toBeVisible()
})

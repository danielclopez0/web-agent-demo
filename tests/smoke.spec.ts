import { test, expect } from '@playwright/test'
import { existsSync } from 'node:fs'

test('login → filter orders → export CSV → submit new order', async ({ page }) => {
  // Login
  await page.goto('/')
  await page.getByLabel('Corporate Email').fill('john.smith@acme-corp.com')
  await page.getByLabel('Password').fill('Acme2024!')
  await page.getByTestId('sign-in-btn').click()

  // Orders page loads with seed data
  await expect(page.getByRole('heading', { name: 'Purchase Orders' })).toBeVisible()
  await expect(page.getByText('PO-2026-001')).toBeVisible()

  // Filter works
  await page.getByRole('button', { name: 'Approved', exact: true }).click()
  await expect(page.getByText('PO-2026-001')).toBeVisible()
  await expect(page.getByText('PO-2026-003')).not.toBeVisible()

  // CSV export downloads a file
  const downloadPromise = page.waitForEvent('download')
  await page.getByTestId('export-csv-btn').click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toMatch(/^orders-.+\.csv$/)
  const path = `/tmp/web-agent-demo-test-${Date.now()}.csv`
  await download.saveAs(path)
  expect(existsSync(path)).toBe(true)

  // New order submission
  await page.getByRole('button', { name: 'New Order' }).click()
  await page.getByLabel('Description').fill('Test ergonomic chairs')
  await page.getByLabel('Amount (USD)').fill('1234')
  await page.getByTestId('submit-order-btn').click()
  await expect(page.getByTestId('new-order-success')).toBeVisible()
  await expect(page.getByText('Test ergonomic chairs')).toBeVisible()
})

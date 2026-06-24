import { test, expect } from '@playwright/test'
import { existsSync } from 'node:fs'

test('login → filter orders → export CSV → submit new order', async ({ page }) => {
  // Login
  await page.goto('/')
  await page.getByLabel('Corporate Email').fill('service.user@democorp.example')
  await page.getByLabel('Password').fill('anything-works')
  await page.getByTestId('sign-in-btn').click()

  // Orders page loads with seed data and survives reload via the demo session
  await expect(page.getByRole('heading', { name: 'Purchase Orders' })).toBeVisible()
  await page.reload()
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

test('reset demo URL clears stale ERP and TestTrack state once', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('Corporate Email').fill('service.user@democorp.example')
  await page.getByLabel('Password').fill('anything-works')
  await page.getByTestId('sign-in-btn').click()
  await expect(page.getByRole('heading', { name: 'Purchase Orders' })).toBeVisible()
  await page.evaluate(() => {
    localStorage.setItem('testtrack:overrides:v1', JSON.stringify({ 'ERP-201': { status: 'Done', automated: true } }))
  })

  await page.goto('/?resetDemo=1')
  await expect(page.getByTestId('login-form')).toBeVisible()
  await expect(page).toHaveURL('/')
  await expect(page.evaluate(() => localStorage.getItem('testtrack:overrides:v1'))).resolves.toBeNull()

  await page.getByLabel('Password').fill('anything-works')
  await page.getByTestId('sign-in-btn').click()
  await expect(page.getByRole('heading', { name: 'Purchase Orders' })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Purchase Orders' })).toBeVisible()
})

test('TestTrack reset URL clears stale ticket overrides', async ({ page }) => {
  await page.goto('/qa.html')
  await page.evaluate(() => {
    localStorage.setItem(
      'democorp:user',
      JSON.stringify({
        email: 'service.user@democorp.example',
        name: 'DemoCorp Service User',
        role: 'Procurement Automation',
      }),
    )
    localStorage.setItem('testtrack:overrides:v1', JSON.stringify({ 'ERP-201': { status: 'Done', automated: true } }))
  })

  await page.goto('/qa.html?resetDemo=1')
  await expect(page).toHaveURL('/qa.html')
  await expect(page.getByTestId('case-card-ERP-201')).toBeVisible()
  await expect(page.evaluate(() => localStorage.getItem('testtrack:overrides:v1'))).resolves.toBeNull()
  await expect(page.evaluate(() => localStorage.getItem('democorp:user'))).resolves.not.toBeNull()
  await expect(page.evaluate(() => window.testtrack.get('ERP-201'))).resolves.toMatchObject({
    status: 'To Do',
    automated: false,
  })
})

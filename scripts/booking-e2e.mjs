import { chromium } from 'playwright'

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:5173'
const EMAIL = process.env.E2E_EMAIL || 'customer1@laundrygo.com'
const PASSWORD = process.env.E2E_PASSWORD || 'pass123'

const waitForApp = async (page) => {
  const response = await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' })
  if (!response?.ok()) {
    throw new Error(`App did not load: ${response?.status()} ${response?.statusText()}`)
  }
}

const firstVisible = async (locator) => {
  const count = await locator.count()
  for (let index = 0; index < count; index += 1) {
    const item = locator.nth(index)
    if (await item.isVisible()) return item
  }
  throw new Error('No visible matching element found')
}

const main = async () => {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } })
  const apiEvents = []
  let createOrderPayload = null

  page.on('console', (message) => {
    if (['error', 'warning'].includes(message.type())) {
      apiEvents.push({ type: `console:${message.type()}`, text: message.text() })
    }
  })

  page.on('response', async (response) => {
    const url = response.url()
    if (!url.includes('/api/v1/')) return
    const event = { status: response.status(), url }
    const isOrderCreateResponse =
      response.request().method() === 'POST' &&
      (url.endsWith('/api/v1/orders') || url.endsWith('/api/v1/cart/orders'))

    if (isOrderCreateResponse || (url.includes('/api/v1/orders') && response.request().method() === 'POST')) {
      try {
        event.body = await response.json()
        if (isOrderCreateResponse) createOrderPayload = event.body
      } catch {
        event.body = null
      }
    }
    apiEvents.push(event)
  })

  try {
    await waitForApp(page)
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })

    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' })
    await page.locator('input[type="email"]').fill(EMAIL)
    await page.locator('input[type="password"]').fill(PASSWORD)
    await Promise.all([
      page.waitForURL(/\/all-shops(?:\/)?$/, { timeout: 15000 }),
      page.locator('form button[type="submit"]').click(),
    ])

    await page.goto(`${BASE_URL}/all-shops/1`, { waitUntil: 'networkidle' })
    await page.locator('.detail-service-row').first().waitFor({ timeout: 20000 })
    const plusButton = await firstVisible(page.locator('.detail-qty-btn.plus'))
    await plusButton.click()

    await page.locator('.detail-order-cta').click()
    await page.waitForURL(/\/all-shops\/1\/schedule/, { timeout: 15000 })
    await page.waitForLoadState('networkidle')

    if ((await page.locator('.address-box').count()) === 0) {
      await page.locator('.pican-link-btn').click()
      await page.locator('input').nth(0).fill('E2E Customer')
      await page.locator('input').nth(1).fill('0900000999')
      await page.locator('input').nth(2).fill('123 Playwright Street')
      await page.locator('input').nth(3).fill('District 1')
      await page.locator('input').nth(4).fill('Ho Chi Minh City')
      await page.locator('.add-address-actions .pican-secondary-btn').click()
      await page.locator('.address-box').first().waitFor({ timeout: 15000 })
    }

    await page.locator('.address-box').first().click()
    await page.locator('.slot-chip.active').first().waitFor({ timeout: 20000 })
    await page.waitForFunction(() => document.querySelectorAll('.slot-chip.active').length >= 2, null, { timeout: 20000 })
    await page.locator('.confirm-btn').waitFor({ timeout: 20000 })
    await page.locator('.pay-card').nth(2).click()

    const disabled = await page.locator('.confirm-btn').isDisabled()
    if (disabled) {
      throw new Error('Confirm button is still disabled before submit')
    }

    await Promise.all([
      page.waitForURL(/\/all-shops\/1\/confirm/, { timeout: 30000 }),
      page.locator('.confirm-btn').click(),
    ])

    await page.locator('.confirm-order-badge').waitFor({ timeout: 15000 })
    const badgeText = await page.locator('.confirm-order-badge').innerText()
    const orderCode = createOrderPayload?.data?.orderCode || badgeText.match(/LG-\d+/)?.[0] || null
    const orderId = createOrderPayload?.data?.orderId || null

    if (!orderCode && !orderId) {
      throw new Error(`Order created but order id/code was not found. Badge: ${badgeText}`)
    }

    const trackDetailPromise = page.waitForResponse(
      (response) => response.request().method() === 'GET' && /\/api\/v1\/orders\/\d+$/.test(response.url()),
      { timeout: 15000 },
    ).catch(() => null)

    await page.locator('.confirm-btn-primary').click()
    await page.waitForURL(/\/all-shops\/1\/track/, { timeout: 15000 })
    await page.waitForLoadState('networkidle')
    const trackDetailResponse = await trackDetailPromise

    console.log(JSON.stringify({
      success: true,
      baseUrl: BASE_URL,
      email: EMAIL,
      orderCode,
      orderId,
      trackDetailStatus: trackDetailResponse?.status() || null,
      finalUrl: page.url(),
      apiEvents: apiEvents.filter((event) => event.url?.includes('/api/v1/orders') || event.url?.includes('/api/v1/cart/orders')),
    }, null, 2))
  } catch (error) {
    await page.screenshot({ path: 'playwright-booking-failure.png', fullPage: true })
    console.error(JSON.stringify({
      success: false,
      error: error?.message || String(error),
      url: page.url(),
      apiEvents,
      screenshot: 'playwright-booking-failure.png',
    }, null, 2))
    process.exitCode = 1
  } finally {
    await browser.close()
  }
}

main()

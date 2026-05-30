import { chromium } from 'playwright'
import { writeFileSync } from 'fs'

const errors = []
const browser = await chromium.launch()
const page = await browser.newPage()
page.on('pageerror', (e) => errors.push({ type: 'pageerror', message: e.message, stack: e.stack }))
page.on('console', (m) => {
  if (m.type() === 'error') errors.push({ type: 'console', text: m.text() })
})

try {
  await page.goto('http://localhost:3001/', { waitUntil: 'networkidle', timeout: 30000 })
} catch (e) {
  errors.push({ type: 'goto', message: String(e) })
}

await page.waitForTimeout(3000)
const hasError = await page.locator('.error-boundary').count()
const title = await page.title()

writeFileSync(
  'check-result.json',
  JSON.stringify({ url: page.url(), title, hasErrorBoundary: hasError > 0, errors }, null, 2)
)
await browser.close()

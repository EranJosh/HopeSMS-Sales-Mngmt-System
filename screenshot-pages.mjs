import puppeteer from 'puppeteer'
import { existsSync, mkdirSync, readdirSync } from 'fs'
import { join } from 'path'

const dir = './temporary screenshots'
if (!existsSync(dir)) mkdirSync(dir)

function nextN(label) {
  const existing = readdirSync(dir).filter(f => f.endsWith('.png'))
  const nums = existing.map(f => parseInt(f.match(/^screenshot-(\d+)/)?.[1] ?? '0')).filter(Boolean)
  const next = nums.length ? Math.max(...nums) + 1 : 1
  return join(dir, `screenshot-${next}-${label}.png`)
}

const browser = await puppeteer.launch({
  executablePath: 'C:/Users/Josh/.cache/puppeteer/chrome/win64-127.0.6533.88/chrome-win64/chrome.exe',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
  headless: true,
})

const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 860 })

async function shot(label, delay = 800) {
  await new Promise(r => setTimeout(r, delay))
  const path = nextN(label)
  await page.screenshot({ path, fullPage: false })
  console.log(`Saved: ${path}`)
  return path
}

// Login
await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' })
await shot('01-login')

await page.type('input[type="email"]', 'jcesperanza@neu.edu.ph')
await page.type('input[type="password"]', 'jcesperanza@neu.edu.ph')
await page.click('button[type="submit"]')
await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {})
await new Promise(r => setTimeout(r, 2500))
await shot('02-dashboard')

const pages = [
  ['/sales',              '03-sales-list',    2000],
  ['/lookups/customers',  '04-customers',     1500],
  ['/lookups/employees',  '05-employees',     1500],
  ['/lookups/products',   '06-products',      1500],
  ['/lookups/prices',     '07-prices',        1500],
  ['/reports',            '08-reports',       2500],
  ['/admin',              '09-admin',         1500],
  ['/deleted-items',      '10-deleted',       1500],
]

for (const [url, label, wait] of pages) {
  await page.goto(`http://localhost:5173${url}`, { waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {})
  await shot(label, wait)
}

// Sales detail
await page.goto('http://localhost:5173/sales', { waitUntil: 'networkidle2' }).catch(() => {})
await new Promise(r => setTimeout(r, 2000))
const firstRow = await page.$('tbody tr')
if (firstRow) {
  await firstRow.click()
  await new Promise(r => setTimeout(r, 2000))
  await shot('11-sales-detail')
}

await browser.close()
console.log('Done.')

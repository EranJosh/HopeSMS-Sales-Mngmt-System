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
  args: ['--no-sandbox'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 860 })
// Login
await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' })
await page.type('input[type="email"]', 'jcesperanza@neu.edu.ph')
await page.type('input[type="password"]', 'jcesperanza@neu.edu.ph')
await page.click('button[type="submit"]')
await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {})
// Dashboard
await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle2' })
await new Promise(r => setTimeout(r, 3200))
await page.screenshot({ path: nextN('dash') }); console.log('dashboard')
// Sales list
await page.goto('http://localhost:5173/sales', { waitUntil: 'networkidle2' })
await new Promise(r => setTimeout(r, 2200))
await page.screenshot({ path: nextN('sales') }); console.log('sales')
// Sales detail
const rows = await page.$$('tbody tr')
if (rows[1]) { await rows[1].click(); await new Promise(r => setTimeout(r, 2000)) }
await page.screenshot({ path: nextN('detail') }); console.log('detail')
// Reports
await page.goto('http://localhost:5173/reports', { waitUntil: 'networkidle2' })
await new Promise(r => setTimeout(r, 2500))
await page.screenshot({ path: nextN('reports') }); console.log('reports')
// Admin
await page.goto('http://localhost:5173/admin', { waitUntil: 'networkidle2' })
await new Promise(r => setTimeout(r, 1800))
await page.screenshot({ path: nextN('admin') }); console.log('admin')
// Customers
await page.goto('http://localhost:5173/lookups/customers', { waitUntil: 'networkidle2' })
await new Promise(r => setTimeout(r, 1800))
await page.screenshot({ path: nextN('customers') }); console.log('customers')
// Deleted Items
await page.goto('http://localhost:5173/deleted-items', { waitUntil: 'networkidle2' })
await new Promise(r => setTimeout(r, 1800))
await page.screenshot({ path: nextN('deleted') }); console.log('deleted')
await browser.close()
console.log('Done.')

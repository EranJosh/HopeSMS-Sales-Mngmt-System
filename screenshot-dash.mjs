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
await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' })
await page.type('input[type="email"]', 'jcesperanza@neu.edu.ph')
await page.type('input[type="password"]', 'jcesperanza@neu.edu.ph')
await page.click('button[type="submit"]')
await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {})
await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle2' })
await new Promise(r => setTimeout(r, 3500))
const p1 = nextN('dashboard')
await page.screenshot({ path: p1 }); console.log(p1)
await browser.close()
